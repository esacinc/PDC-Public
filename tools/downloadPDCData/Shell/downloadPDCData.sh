#!/bin/bash
# PDC-3986: Create a script to organize the downloaded files into folder structure
# This is a sample bash script to batch download PDC data files to your local computer
# Works on Linux/macOS shells (and Windows via WSL/Git Bash)
# Uses only native shell + curl
#
# Save as downloadPDCData.sh and make executable:
#   chmod +x downloadPDCData.sh
#
# Usage:
#   ./downloadPDCData.sh -f <PDC File manifest .csv/.tsv>
#
# Notes:
# - Signed URLs in the PDC manifest expire after 7 days. If links stop working,
#   please re-export a fresh manifest from the portal.
# - To manage system resources and egress, the PDC applies a per-file download
#   limit across a 24-hour period. Repeatedly requesting the same file in a short
#   time window may result in a temporary 24-hour access restriction for that IP.
#   If a file is skipped, simply rerun the script later to pick it up.

set -euo pipefail

# ---------------- CONFIGURATION (adjust as needed) ----------------

# Pause between individual file downloads (seconds)
PER_FILE_SLEEP_SEC=2

# Simple rate limiting to avoid hitting server-side limits too quickly:
# Maximum number of download attempts per time window
RATE_LIMIT=10           # max requests per window
WINDOW_SEC=600          # window length in seconds (10 minutes)
SAFETY_SEC=3            # small buffer after window reset

# curl settings
CURL_RETRY=5            # number of retries for transient errors
CURL_RETRY_DELAY=2      # delay between retries (seconds)
CURL_USER_AGENT="pdc-download-script/1.0"

# -----------------------------------------------------------------

helpFunction() {
  echo ""
  echo "Usage: $0 -f <Name of the manifest file downloaded from PDC in CSV/TSV format>"
  exit 1
}

# Delete double quotes from a field
parseValue() {
  local index="$1"
  shift
  local arr=("$@")
  local name="${arr[$index]}"
  # Strip any double quotes
  name=$(echo "$name" | sed 's/\"//g')
  echo "$name"
}

# ----- Simple rate-window tracking state -----
WINDOW_START=$(date +%s)
IN_WINDOW=0

maybe_wait_for_window() {
  local now elapsed wait_for
  now=$(date +%s)
  elapsed=$((now - WINDOW_START))

  # If the current time window has expired, reset counters
  if (( elapsed >= WINDOW_SEC )); then
    WINDOW_START="$now"
    IN_WINDOW=0
    return
  fi

  # If we reached the limit within the current window, sleep until the window resets
  if (( IN_WINDOW >= RATE_LIMIT )); then
    wait_for=$((WINDOW_SEC - elapsed + SAFETY_SEC))
    echo "[PAUSE] Reached ${IN_WINDOW}/${RATE_LIMIT} downloads in ${elapsed}s. Sleeping ${wait_for}s to respect rate limits..."
    sleep "$wait_for"
    WINDOW_START=$(date +%s)
    IN_WINDOW=0
  fi
}

# Download and reorganize files into folder structure
downloadOrganize() {
  IFS=$DELIMITER
  while read -r -a array; do
    # Extract fields by index (0-based)
    # Header layout (CSV/TSV from PDC):
    # 0 File ID
    # 1 File Name
    # 2 Run Metadata ID           -> folder
    # 3 Protocol
    # 4 Study Name
    # 5 PDC Study ID              -> pdcStudyId
    # 6 PDC Study Version         -> studyVersion
    # 7 Study ID
    # 8 Project Name
    # 9 Data Category             -> dataCategory
    # 10 File Type                -> fileType
    # 11 Access
    # 12 File Size (in bytes)
    # 13 Md5sum
    # 14 Downloadable (Yes/No)
    # 15 File Download Link       -> url

    unset name folder pdcStudyId studyVersion dataCategory fileType url urlLink

    for index in "${!array[@]}"; do
      case "$index" in
        1)  name=$(parseValue "$index" "${array[@]}") ;;
        2)  folder=$(parseValue "$index" "${array[@]}") ;;
        5)  pdcStudyId=$(parseValue "$index" "${array[@]}") ;;   # FIXED
        6)  studyVersion=$(parseValue "$index" "${array[@]}") ;; # FIXED
        9)  dataCategory=$(parseValue "$index" "${array[@]}") ;; # FIXED
        10) fileType=$(parseValue "$index" "${array[@]}") ;;     # FIXED
        15)
          url=$(parseValue "$index" "${array[@]}")
          # strip any trailing CR
          urlLink=$(echo -n "${url%$'\r'}")
          ;;
      esac
    done

    # Skip header row or malformed rows
    if [[ "$name" == "File Name" ]] || [[ -z "${urlLink:-}" ]]; then
      continue
    fi

    # Expected structure:
    # PDC Study ID / PDC Study Version / Data category / (Run Metadata ID or none) / File Type / File
    if [[ "$folder" == "null" ]] || [[ -z "$folder" ]]; then
      folderName="$pdcStudyId/$studyVersion/$dataCategory/$fileType/"
    else
      folderName="$pdcStudyId/$studyVersion/$dataCategory/$folder/$fileType/"
    fi

    filePath="${folderName}${name}"

    # If file already exists and is non-empty, skip download
    if [[ -f "$filePath" ]] && [[ -s "$filePath" ]]; then
      echo "[HAVE] $filePath"
      continue
    fi

    # Only proceed if URL looks valid
    if [[ ! "$urlLink" =~ ^https?:// ]]; then
      echo "[SKIP] $name -> invalid URL: $urlLink"
      continue
    fi

    # Rate-window management
    maybe_wait_for_window

    tmpfile="${name}.part"

    echo "[GET ] $name"
    # Download to a temporary file, with retries, and only move if successful & non-empty
    if curl -L --fail --retry "$CURL_RETRY" --retry-delay "$CURL_RETRY_DELAY" \
             -A "$CURL_USER_AGENT" \
             -C - "$urlLink" -o "$tmpfile"; then

      if [[ -s "$tmpfile" ]]; then
        mkdir -p "$folderName"
        mv "$tmpfile" "$filePath"
        echo "[SAVED] $filePath"
      else
        echo "[SKIP] $name -> empty file after download, not saving."
        rm -f "$tmpfile"
      fi
    else
      echo "[SKIP] $name -> download failed, not saving partial file."
      rm -f "$tmpfile"
    fi

    # Count this attempt (success or not) for rate limiting
    IN_WINDOW=$((IN_WINDOW + 1))

    # Gentle per-file pacing
    sleep "$PER_FILE_SLEEP_SEC"

  done < "$filename"
}

# Reorganize already-downloaded files into folder structure (no downloading)
reorganizeFiles() {
  dir="${PWD}"
  arrVar=()

  # capture files in current directory
  for file in $(ls -1); do
    if [ -f "$file" ]; then
      arrVar+=("$file")
    fi
  done

  IFS=$DELIMITER
  while read -r -a array; do
    unset name folder pdcStudyId studyVersion dataCategory fileType

    for index in "${!array[@]}"; do
      case "$index" in
        1)  name=$(parseValue "$index" "${array[@]}") ;;
        2)  folder=$(parseValue "$index" "${array[@]}") ;;
        5)  pdcStudyId=$(parseValue "$index" "${array[@]}") ;;   # FIXED
        6)  studyVersion=$(parseValue "$index" "${array[@]}") ;; # FIXED
        9)  dataCategory=$(parseValue "$index" "${array[@]}") ;; # FIXED
        10) fileType=$(parseValue "$index" "${array[@]}") ;;     # FIXED
      esac
    done

    # Skip header row or malformed rows
    if [[ "$name" == "File Name" ]] || [[ -z "${name:-}" ]]; then
      continue
    fi

    # Build destination
    if [[ "$folder" == "null" ]] || [[ -z "$folder" ]]; then
      folderName="$pdcStudyId/$studyVersion/$dataCategory/$fileType/"
    else
      folderName="$pdcStudyId/$studyVersion/$dataCategory/$folder/$fileType/"
    fi

    filePath="${folderName}${name}"

    if [[ -f "$filePath" ]] && [[ -s "$filePath" ]]; then
      echo "$name is already reorganized. Skipping further action.."
    else
      if [[ " ${arrVar[*]} " =~ " $name " ]]; then
        echo "Moving $name -> $folderName"
        mkdir -p "$folderName"
        mv "$name" "$folderName"
      fi
    fi

  done < "$filename"
}

# ----- Parse CLI -----
filename=""

while getopts ":f:" opt; do
  case "$opt" in
    f) filename="$OPTARG" ;;
    ?) helpFunction ;;
  esac
done

if [ -z "$filename" ]; then
  echo "Manifest file parameter (-f) is required."
  helpFunction
fi

if [ ! -f "$filename" ]; then
  echo "File '$filename' does not exist."
  exit 1
fi

# Determine delimiter by extension
if [[ "$filename" =~ \.csv$|\.CSV$ ]]; then
  DELIMITER=$','
elif [[ "$filename" =~ \.tsv$|\.TSV$ ]]; then
  DELIMITER=$'\t'
else
  echo -e "Input file has an unsupported extension.\nFile must be CSV (.csv) or TSV (.tsv)."
  exit 1
fi

# ----- Menu -----
echo "> Please enter 1 for downloading and reorganizing files"
echo "> Please enter 2 for reorganizing downloaded files"
echo "> Please enter 3 for exit"
read -rp "> Choose an option: " yn

case "$yn" in
  1) downloadOrganize ;;
  2) reorganizeFiles ;;
  3) exit 0 ;;
  *) echo "Please enter a valid option." ;;
esac

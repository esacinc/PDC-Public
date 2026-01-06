# -*- coding: utf-8 -*-
"""
downloadPDCData.py

Sample Python script to batch-download PDC data files to a local machine
based on a PDC File Manifest (TSV or CSV).

Usage:
    python downloadPDCData.py <PDC File manifest>

The script will:
  - Download files listed in the manifest
  - Organize them into a folder hierarchy by Study, Version, Category, etc.
  - Skip files that are already present and non-empty
  - Add light pacing and retries to help avoid download interruptions
  - Allow you to rerun the script to pick up any files that were missed
"""

# Notes:
# - Signed URLs in the PDC manifest expire after 7 days. If links stop working,
#   please re-export a fresh manifest from the portal.
# - To manage system resources and egress, the PDC applies a per-file download
#   limit across a 24-hour period. Repeatedly requesting the same file in a short
#   time window may result in a temporary 24-hour access restriction for that IP.
#   If a file is skipped, simply rerun the script later to pick it up.


import sys
import csv
import os
import shutil
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

print("downloadPDCData: public version (with basic retry and pacing)")

# -------------------------------------------------------------------
# CONFIGURATION (you can adjust these defaults as needed)
# -------------------------------------------------------------------

# Pause between individual file downloads (seconds)
PER_FILE_SLEEP_SEC = 2

# Basic rate limiting to help avoid server-side rate limits:
# Maximum number of download attempts per time window
RATE_LIMIT = 10          # max requests per window
WINDOW_SEC = 600          # window length in seconds (10 minutes)
SAFETY_SEC = 3            # small buffer after window reset

# HTTP request settings
TIMEOUT_SEC = 60          # per-request timeout
CHUNK_SIZE = 1024 * 256   # download chunk size (bytes)

# Retry settings for transient network/server errors
RETRY_TOTAL = 5
RETRY_BACKOFF = 1.5       # seconds, exponential backoff factor
RETRY_STATUS_LIST = (429, 500, 502, 503, 504)

# -------------------------------------------------------------------


def make_session():
    """
    Create a requests.Session with basic retry behavior.
    """
    session = requests.Session()
    retries = Retry(
        total=RETRY_TOTAL,
        backoff_factor=RETRY_BACKOFF,
        status_forcelist=RETRY_STATUS_LIST,
        allowed_methods=frozenset(["GET", "HEAD"])
    )
    session.mount("https://", HTTPAdapter(max_retries=retries))
    # Simple User-Agent so server logs can distinguish this client
    session.headers.update({"User-Agent": "pdc-download-script/1.0"})
    return session


def safe_download(session, url, dst_path):
    """
    Download a single file to dst_path using streaming.
    Returns True on success, False if the file was not downloaded.
    """
    filename = os.path.basename(dst_path)
    try:
        resp = session.get(url, stream=True, timeout=TIMEOUT_SEC)

        if resp.status_code != 200:
            print(f"[SKIP] {filename} -> HTTP {resp.status_code} (no file downloaded)")
            return False

        # Avoid writing empty responses
        clen = resp.headers.get("Content-Length")
        if clen is not None and clen.isdigit() and int(clen) == 0:
            print(f"[SKIP] {filename} -> empty Content-Length")
            return False

        with open(dst_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=CHUNK_SIZE):
                if chunk:
                    f.write(chunk)

        return True

    except requests.RequestException as e:
        print(f"[ERR ] {filename} -> {e}")
        return False


def ensure_folder(path):
    """
    Create the folder if it does not exist.
    """
    os.makedirs(path, exist_ok=True)


def build_folder_path(row):
    """
    Build the destination folder path and file name from a manifest row.
    Expected manifest columns:
        - File Name
        - Run Metadata ID
        - PDC Study ID
        - PDC Study Version
        - Data Category
        - File Type
    """
    fname = row["File Name"].strip()
    folder = (row["Run Metadata ID"] or "").strip()
    pdc_study_id = row["PDC Study ID"].strip()
    study_version = row["PDC Study Version"].strip()
    data_category = row["Data Category"].strip()
    file_type = row["File Type"].strip()

    # Folder structure:
    # PDC Study ID / Study Version / Data Category / [Run Metadata ID] / File Type
    if folder == "" or folder.lower() == "null":
        folder_name = os.path.join(pdc_study_id, study_version, data_category, file_type)
    else:
        folder_name = os.path.join(pdc_study_id, study_version, data_category, folder, file_type)

    folder_path = os.path.join(os.getcwd(), folder_name)
    return folder_path, fname


# --- Simple rate-window tracking state ---
window_start = time.time()
in_window = 0


def maybe_wait_for_window():
    """
    Enforce a simple rate limit: up to RATE_LIMIT download attempts per WINDOW_SEC.
    If the limit is reached before the window ends, pause until the window resets.
    """
    global window_start, in_window
    elapsed = time.time() - window_start

    # If the current time window has expired, reset counters
    if elapsed >= WINDOW_SEC:
        window_start = time.time()
        in_window = 0
        return

    # If we reached the limit within the current window, sleep until the window resets
    if in_window >= RATE_LIMIT:
        wait_for = WINDOW_SEC - elapsed + SAFETY_SEC
        print(
            f"[PAUSE] Reached {in_window}/{RATE_LIMIT} downloads in "
            f"{int(elapsed)}s. Sleeping {int(wait_for)}s to respect rate limits..."
        )
        time.sleep(wait_for)
        window_start = time.time()
        in_window = 0


def downloadOrganize(file_name, delimiter):
    """
    Download and organize files based on the provided manifest.
    """
    global in_window
    session = make_session()

    with open(file_name, newline="") as f:
        reader = csv.DictReader(f, delimiter=delimiter)

        for row in reader:
            folder_path, fname = build_folder_path(row)
            url_link = row["File Download Link"].strip()

            ensure_folder(folder_path)
            dst_path = os.path.join(folder_path, fname)

            # Skip if file already exists and is non-empty
            if os.path.isfile(dst_path) and os.path.getsize(dst_path) > 0:
                print(f"[HAVE] {dst_path}")
                continue

            # Rate-window management
            maybe_wait_for_window()

            print(f"[GET ] {fname}")
            ok = safe_download(session, url_link, dst_path)
            in_window += 1  # count this attempt (success or not)

            if not ok:
                # Clean up any zero-byte placeholder, if created
                if os.path.exists(dst_path) and os.path.getsize(dst_path) == 0:
                    os.remove(dst_path)
                # Short backoff before next attempt
                time.sleep(2)
            else:
                # Gentle per-file pacing to avoid bursts
                time.sleep(PER_FILE_SLEEP_SEC)


def organizeFolders(file_name, delimiter):
    """
    Reorganize already-downloaded files into the expected folder hierarchy
    based on the manifest. Does not download anything new.
    """
    with open(file_name, newline="") as f:
        reader = csv.DictReader(f, delimiter=delimiter)

        for row in reader:
            folder_path, fname = build_folder_path(row)
            dst_path = os.path.join(folder_path, fname)

            if os.path.isfile(dst_path) and os.path.getsize(dst_path) > 0:
                print(f"[HAVE] {dst_path}")
                continue

            if os.path.isfile(fname):
                ensure_folder(folder_path)
                print(f"[MOVE] {fname} -> {folder_path}")
                shutil.move(fname, folder_path)


def main():
    if len(sys.argv) > 1:
        file_name = sys.argv[1]

        if os.path.isfile(file_name):
            # Determine delimiter from file extension
            if file_name.lower().endswith(".csv"):
                delimiter = ","
            elif file_name.lower().endswith(".tsv"):
                delimiter = "\t"
            else:
                sys.exit("Input file must be a .tsv or .csv PDC File Manifest")

            user_input = input(
                "> Enter 1 to download and organize files\n"
                "> Enter 2 to organize already downloaded files\n"
                "> Enter 3 to exit\n"
                "> Your choice: "
            ).strip()

            if user_input == "1":
                downloadOrganize(file_name, delimiter)
            elif user_input == "2":
                organizeFolders(file_name, delimiter)
            elif user_input == "3":
                return
            else:
                print("Please enter a valid option (1, 2, or 3).")
        else:
            print(f"File '{file_name}' does not exist in the current directory.")
    else:
        print("Usage: python downloadPDCData.py <PDC File manifest (.tsv or .csv)>")


if __name__ == "__main__":
    main()

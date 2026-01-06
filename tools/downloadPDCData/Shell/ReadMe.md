
This is a sample Bash script to batch download PDC data files to your local computer and/or reorganize them into the following folder structure:

`PDC Study ID / PDC Study Version / Data Category / Run Metadata ID / File Type / File`

The script:

- Uses the PDC **file manifest** (CSV/TSV) as input  
- Downloads each file via `curl`  
- Organizes files into a logical directory structure using manifest metadata  
- Skips files that are already present and non-empty  
- Uses temporary files to avoid saving incomplete downloads  
- Includes light **pacing and retry logic** to help avoid download interruptions  
- Can be **re-run** to pick up any files that were skipped during previous runs

> **Note:**
> - Signed URLs in the manifest expire after **7 days**. If links stop working, re-export the manifest from the PDC portal.  
> - To manage system resources, the PDC applies a **per-file download limit across a 24-hour period**. Repeatedly requesting the same file may result in a temporary 24-hour restriction for that IP.

**Usage:**

- Create a folder and copy the shell script to the folder.  
- Save this script as `downloadPDCData.sh` in your local directory.  
- Ensure the script has execute permission:

```bash
chmod +x downloadPDCData.sh
````

* Execute the script, providing the downloaded PDC file manifest as a command-line parameter:

```bash
./downloadPDCData.sh -f <PDC_file_manifest.csv_or.tsv>
```

**Example:**

```bash
./downloadPDCData.sh -f PDC_file_manifest_07262021_111634.csv
```

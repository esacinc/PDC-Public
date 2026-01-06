This is a sample Python script to batch download PDC data files to your local computer and/or reorganize them into the following folder structure:

`PDC Study ID / PDC Study Version / Data Category / Run Metadata ID / File Type / File`

The script:

- Uses the PDC **file manifest** (CSV/TSV) as input  
- Downloads each file listed in the manifest  
- Organizes files into a logical directory structure using manifest metadata  
- Skips files that are already present and non-empty  
- Includes light **retry and pacing logic** to help avoid download interruptions  
- Can be **re-run** to pick up any files that were skipped during previous runs

> **Note:**
> - Signed URLs in the manifest expire after **7 days**. If links stop working, re-export the manifest from the PDC portal.  
> - To manage system resources, the PDC applies a **per-file download limit across a 24-hour period**. Repeatedly requesting the same file may result in a temporary 24-hour restriction for that IP.

**Usage:**

- Create a folder and copy the Python script to the folder.  
- Save this script as `downloadPDCData.py` in your local directory.  
- Install the required Python libraries listed in `requirements.txt`.  
- Execute the script, providing the downloaded PDC file manifest as a command-line parameter.

```bash
python3 downloadPDCData.py <PDC_file_manifest.csv_or.tsv>
````

**Example:**

```bash
python3 downloadPDCData.py PDC_file_manifest_07262021_111634.csv
```


#### Download and Organize files

The scripts available from this page allow users to programmatically download and/or organize files into a folder structure.

##### Description

The Python and shell scripts available from this page provide a convenient way to download and organize files into a predefined folder structure using the metadata provided in the file manifest.

On the PDC website, once you identify the files of interest, click **“Export File Manifest”**.

The manifest will contain a download URL for each selected file on a separate row along with other metadata.  
**These URLs will expire after 7 days (168 hours) from the time the manifest was generated.** You may revisit the PDC portal to generate a new file manifest.

To protect system resources and manage egress, the PDC also applies a **per-file download limit across a 24-hour period**. Repeatedly requesting the same file within a short time window may result in a temporary 24-hour access restriction for that IP. If this happens, simply rerun the script the next day or avoid repeatedly testing the same file.

The scripts take the file manifest as input and provide the option to either:

- **Download and organize** files into a folder structure, or  
- **Only organize** previously downloaded files.

By default, all downloaded files will be placed in the current folder without any particular folder structure. The PDC manifest file provides all relevant metadata if you wish to organize them into a folder structure. This is especially useful when analyzing large datasets, such as labeling experiments.

The following metadata elements in the PDC file manifest can be used to organize files:

- PDC Study ID, e.g., `PDC000319`  
- PDC Study Version, e.g., `1`  
- Data Category, e.g., `Processed Mass Spectra`  
- Run Metadata ID, e.g., `AML Gilteritinib TimeCourse - Phosphoproteome-1`  
- File Type, e.g., `Open Standard`  
- File Name, e.g., `PTRC_exp12_plex_01_P_f06.mzML.gz`  

You may use this information to create a folder structure and move the downloaded files into the desired locations, for example:

`PDC Study ID / PDC Study Version / Data Category / Run Metadata ID / File Type / File`

After running the script, the files will be organized into a folder structure similar to:

```text
PDC000319
 `-- 1
     |-- Other Metadata
     |   `-- Document
     |-- Peptide Spectral Matches
     |   |-- AML Gilteritinib TimeCourse - Phosphoproteome-1
     |   |   |-- Open Standard
     |   |   `-- Text
     |   |-- AML Gilteritinib TimeCourse - Phosphoproteome-2
     |   |   |-- Open Standard
     |   |   `-- Text
     |   `-- AML Gilteritinib TimeCourse - Phosphoproteome-3
     |       |-- Open Standard
     |       `-- Text
     |-- Processed Mass Spectra
     |   |-- AML Gilteritinib TimeCourse - Phosphoproteome-1
     |   |   `-- Open Standard
     |   |-- AML Gilteritinib TimeCourse - Phosphoproteome-2
     |   |   `-- Open Standard
     |   `-- AML Gilteritinib TimeCourse - Phosphoproteome-3
     |       `-- Open Standard
     |-- Protein Assembly
     |   `-- Text
     |-- Quality Metrics
     |   |-- Text
     |   `-- Web
     `-- Raw Mass Spectra
         |-- AML Gilteritinib TimeCourse - Phosphoproteome-1
         |   `-- Proprietary
         |-- AML Gilteritinib TimeCourse - Phosphoproteome-2
         |   `-- Proprietary
         `-- AML Gilteritinib TimeCourse - Phosphoproteome-3
             `-- Proprietary
````

These sample scripts are provided to help you get started; you can modify them according to your requirements.

##### Download Best Practices

To minimize interruptions and avoid hitting infrastructure protections:

* Download in **smaller batches** instead of a single very large manifest.
* Avoid repeatedly requesting the **same file** within a short period.
* If some files fail or are skipped, simply **rerun the script later** — already-downloaded files will be detected and skipped.
* Prefer **processed data** when possible and download raw files only when needed, as raw data can be very large.


##### Help

Contact **[PDCHelpDesk@mail.nih.gov](mailto:PDCHelpDesk@mail.nih.gov)** for common problems or issues.

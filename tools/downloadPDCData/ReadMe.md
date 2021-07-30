#### Download and Organize files:
The scripts available from this page allows the users to programmatically download and/or organize the files into a folder structure.
##### Description
The python and shell scripts available from this page provide a convenient way to download and organize the files into a predefined folder structure using the metadata provided in the file manifest.
 
On the PDC website, once you identify the files of interest, click ‘**Export File Manifest**’. The manifest will contain a download URL for each selected file on a separate row along with other metadata. **These URLs will expire after 7 days (168 hours) from the time the manifest was generated**. You may revisit the PDC portal to generate a new file manifest. 
 
The scripts take the file manifest as input and provide the option to either download and organize or simply organize the previously downloaded files.
By default, all downloaded files will be placed in the current folder without any particular folder structure. The PDC manifest file provides all relevant metadata if you wish to organize them into a folder structure. This is especially useful when analyzing large datasets with labelling experiments.
The following metadata data available in PDC file manifest can be used to organize the files:
PDC Study ID, e.g., PDC000319
PDC Study Version, e.g., 1
Data Category, e.g., Processed Mass Spectra
Run Metadata ID, e.g., AML Gilteritinib TimeCourse - Phosphoproteome-1
File Type, e.g., Open Standard
File, e.g., PTRC_exp12_plex_01_P_f06.mzML.gz
 
You may use this information to create a folder structure and move the downloaded files into the desired location.
e.g. PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/File
 
After running the script, the files will be organized in to a folder structure
```
PDC000319
`-- 1
|-- Other Metadata
|   `-- Document
|-- Peptide Spectral Matches
|   |-- AML Gilteritinib TimeCourse -  Phosphoproteome-1
|   |   |-- Open Standard
|   |   `-- Text
|   |-- AML Gilteritinib TimeCourse -  Phosphoproteome-2
|   |   |-- Open Standard
|   |   `-- Text
|   `-- AML Gilteritinib TimeCourse -  Phosphoproteome-3
|   	|-- Open Standard
|   	`-- Text
|-- Processed Mass Spectra
|   |-- AML Gilteritinib TimeCourse -  Phosphoproteome-1
|   |   `-- Open Standard
|   |-- AML Gilteritinib TimeCourse -  Phosphoproteome-2
|   |   `-- Open Standard
|   `-- AML Gilteritinib TimeCourse -  Phosphoproteome-3
|   	`-- Open Standard
|-- Protein Assembly
|   `-- Text
|-- Quality Metrics
|   |-- Text
|   `-- Web
`-- Raw Mass Spectra
    |-- AML Gilteritinib TimeCourse -  Phosphoproteome-1
    |   `-- Proprietary
    |-- AML Gilteritinib TimeCourse -  Phosphoproteome-2
    |   `-- Proprietary
    `-- AML Gilteritinib TimeCourse -  Phosphoproteome-3
        `-- Proprietary
```

These sample scripts are provided only to help you get started, you can modify according to your requirements.

##### Getting Started:
###### Dependencies:
Python script: Download the required Python libraries mentioned in the requirements.txt file.

##### Installation and Execution:
**Python script:** 
- Create a folder and copy the Python script to the folder.
- Save this script as ```downloadPDCData.py``` in your local directory
- Download the required python libraries mentioned in the requirements.txt file.
- Execute the script: 
Provide downloaded PDC File manifest as a command line parameter
Usage: ``` python3 downloadPDCData.py <PDC File manifest.csv>``` 
Eg: ``` python3 downloadPDCData.py PDC_file_manifest_07262021_111634.csv ```

**Shell script:**
- Create a folder and copy the Shell script to the folder.
- Save this script as ```downloadPDCData.sh``` in your local directory
- Execute the script: 
    Provide downloaded PDC File manifest as a command line parameter
    Usage: ``` ./downloadPDCData.sh -f <PDC File manifest>```
    Eg:  ``` ./downloadPDCData.sh PDC_file_manifest_07262021_111634.csv```

##### Help
Contact PDCHelpDesk@mail.nih.gov for common problems or issues.
 


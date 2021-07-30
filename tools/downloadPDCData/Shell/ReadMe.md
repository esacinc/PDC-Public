This is a sample Bash script to batch download PDC data files in to your local computer and/or 
reorganize them into the following folder structure:
PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/

- Create a folder and copy the Shell script to the folder.
- Save this script as ```downloadPDCData.sh``` in your local directory
- Execute the script: 
    Provide downloaded PDC File manifest as a command line parameter
    Usage: ``` ./downloadPDCData.sh -f <PDC File manifest>```
    Eg:  ``` ./downloadPDCData.sh -f PDC_file_manifest_07262021_111634.csv```
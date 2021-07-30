This is a sample Python script to batch download PDC data files in to your local computer and/or 
reorganize them into the following folder structure:
PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/

- Create a folder and copy the Python script to the folder.
- Save this script as ```downloadPDCData.py``` in your local directory
- Download the required python libraries mentioned in the requirements.txt file.
- Execute the script: 
Provide downloaded PDC File manifest as a command line parameter
Usage: ``` python3 downloadPDCData.py <PDC File manifest.csv>``` 
Eg: ``` python3 downloadPDCData.py PDC_file_manifest_07262021_111634.csv ```
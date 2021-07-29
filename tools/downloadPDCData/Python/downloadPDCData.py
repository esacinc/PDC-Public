#This is a sample Python script to batch download PDC data files in to your local computer
#Save this script as downloadPDCData.py in your local directory
#Provide downloaded PDC File manifest as a command line parameter
#Ex:  python3 downloadPDCData.py <PDC File manifest>
#Users may improvise using awk, sed and rewrite in perl, python, etc.

import sys
import csv
import os, shutil
import requests

def downloadOrganize(file_name):
    with open(file_name) as f:
        reader = csv.DictReader(f) # read rows into a dictionary format
        for row in reader: # read a row as {column1: value1, column2: value2,...}
            fname=row['File Name']
            folder=row['Run Metadata ID']
            pdc_study_id=row['PDC Study ID']
            study_version=row['PDC Study Version']
            data_category=row['Data Category']
            file_type=row['File Type']
            url_link=row['File Download Link']
            #Expected file structure: PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/File
            if folder == "" or folder == 'null':
                folder_name = os.path.join(pdc_study_id, study_version, data_category, file_type)
            else:
                folder_name = os.path.join(pdc_study_id, study_version, data_category, folder, file_type)
            #Download file
            url = requests.get(url_link)
            folder_path = os.path.join(os.getcwd(), folder_name)
            if (os.path.isfile(os.path.join(folder_path, fname))):
                print(fname + " already exists. Skipping download..")
            else: 
                print("Downloading "+fname)
                open(fname, 'wb').write(url.content)
                #Move file to destination
                if not (os.path.exists(folder_path)):
                    os.makedirs(folder_path)
                shutil.move(fname,folder_path)

def organizeFolders(file_name):
    with open(file_name) as f:
        reader = csv.DictReader(f) # read rows into a dictionary format
        for row in reader: # read a row as {column1: value1, column2: value2,...}
            fname=row['File Name']
            folder=row['Run Metadata ID']
            pdc_study_id=row['PDC Study ID']
            study_version=row['PDC Study Version']
            data_category=row['Data Category']
            file_type=row['File Type']
            #Expected file structure: PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/File
            if folder == "" or folder == 'null':
                folder_name = os.path.join(pdc_study_id, study_version, data_category, file_type)
            else:
                folder_name = os.path.join(pdc_study_id, study_version, data_category, folder, file_type)
            #Move file to destination
            folder_path = os.path.join(os.getcwd(), folder_name)
            if os.path.isfile(os.path.join(folder_path, fname)):
                print(fname + " is already reorganized. Skipping further action..")
            else:
                #Move file to destination
                if os.path.isfile(fname) and not (os.path.exists(folder_path)):
                    os.makedirs(folder_path)
                if os.path.isfile(fname):
                    print("Moving "+fname)
                    shutil.move(fname,folder_path) 

def main():
    if sys.argv and len(sys.argv) > 1:
        file_name = sys.argv[1]
        if os.path.isfile(file_name):
            user_input = input("> Please enter 1 for downloading and reorganizing files\n> Please enter 2 for reorganizing downloaded files\n> Please enter 3 to exit\n> Enter your option: ")
            if user_input == "1":
                downloadOrganize(file_name)  
            elif user_input == "2":
                organizeFolders(file_name)
            elif user_input == "3":
                exit
            else:
                print("Please enter a valid option")
        else:
            print("File '"+ file_name + "' does not exist in the current directory.")
    else:
        print("Please enter a file name.\nUsage: python3 downloadPDCData.py <PDC File manifest>")

if __name__ == "__main__":
    main()
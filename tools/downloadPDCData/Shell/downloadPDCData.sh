
#PDC-3986: Create a script to organize the downloaded files into folder structure
#!/bin/bash
#This is a sample bash script to batch download PDC data files in to your local computer
#This works on most linux machines
#The script uses only the native shell functionalities and wget
#Save this script as downloadPDCData.sh in your local directory and set executable permissions
#Provide downloaded PDC File manifest as a command line parameter
#Ex:  ./downloadPDCData.sh -f <PDC File manifest>
#Users may improvise using awk, sed and rewrite in perl, python, etc.
helpFunction() {
  echo ""
    echo  "Usage: $0 -f <Name of the manifest file downloaded from PDC in CSV format>"
    exit  1 # Exit script after printing help
}
#Delete double quotes from string
parseValue() {
    local index="$1"   # Save first argument in a variable
    shift              # Shift all arguments to the left (original $1 gets lost)
    local arr=("$@")
    name="${arr[$index]}" 
    name=$(echo $name | sed "s/\"//g")
    echo $name
}  
#Download and Reorgaize files into folder structure
downloadOrganize() {
	IFS=$DELIMITER #split the input csv file based on comma separator and read into an array
    while read -r -a array
    do
        for index in "${!array[@]}"; do
            #echo $index
            if [[ "$index" == 1 ]]; then
                name=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 2 ]]; then
                folder=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 4 ]]; then
                pdcStudyId=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 5 ]]; then
                studyVersion=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 9 ]]; then
                dataCategory=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 10 ]]; then
                fileType=$(parseValue "$index" "${array[@]}")
            fi
            #Extracting file URL from Column 15
            if [[ "$index" == 15 ]]; then
                url=$(parseValue "$index" "${array[@]}")
                #Used for removing carriage return %0D characters from URL
                urlLink=$(echo -n "${url%$'\r'}")
                #Expected directory structure: #Expected file structure: PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/File
                if [ "$folder" == "null" ]
                then
                    folderName=$pdcStudyId/$studyVersion/$dataCategory/$fileType/
                else
                    folderName=$pdcStudyId/$studyVersion/$dataCategory/$folder/$fileType/
                fi
                filePath=$folderName$name
                basepath=${BASEDIR}$name
                #Download file and move to destination folder
                if [[ -f "$filePath" ]] || [[ -f "$basepath" ]]; then
                    echo "$name already exists. Skipping download.."
                else
                    if [[ "$url" =~ ^http.*|^https ]]; then
                        wget -c "${urlLink}" -O $name
                        mkdir -p $folderName
                        mv "$name" "$folderName"/
                    fi
                fi
            fi
        done
    done < $filename
}
#Reorganize files into folder structure
reorganizeFiles(){
    dir=${PWD}
    arrVar=()
    for file in $(ls $dir)
    do
        if [ -f $file ]
        then
            arrVar+=($file)
        fi
    done
    IFS=$DELIMITER #split the input file based on predetermined delimiter and read into an array
    while read -r -a array
    do
        for index in "${!array[@]}"; do
            #echo $index
            if [[ "$index" == 1 ]]; then
                name=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 2 ]]; then
                folder=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 4 ]]; then
                pdcStudyId=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 5 ]]; then
                studyVersion=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 9 ]]; then
                dataCategory=$(parseValue "$index" "${array[@]}")
            fi
            if [[ "$index" == 10 ]]; then
                fileType=$(parseValue "$index" "${array[@]}")
                #Expected directory structure: #Expected file structure: PDC Study ID/ PDC Study Version/Data category/Run Metadata ID/File Type/File
                if [ "$folder" == "null" ]
                then
                    folderName=$pdcStudyId/$studyVersion/$dataCategory/$fileType/
                else
                    folderName=$pdcStudyId/$studyVersion/$dataCategory/$folder/$fileType/
                fi
                filePath=$folderName$name
                if [[ -f "$filePath" ]]; then
                    echo "$name is already reorganized. Skipping further action.."
                else
                    if [[ " ${arrVar[@]} " =~ " $name " ]]; then
                        echo "Moving $name"
                        mkdir -p $folderName
                        mv "$name" "$folderName"/
                    fi
                fi
            fi
        done
    done < $filename
}
#File checks
while getopts ":f:" opt
do
        case "$opt" in
        f ) filename="$OPTARG" ;;
        ? ) helpFunction ;; # Print helpFunction in case input file name is non-existent
        esac
done # Print helpFunction in case input filename is empty
if [ -z "$filename" ]
then
    echo "Some or all of the parameters are empty";
    helpFunction
fi

#Get the delimiter for the input manifest file
if [[ "$filename" =~ \.csv|\.CSV ]]; then
    DELIMITER=$','

elif [[ "$filename" =~ \.tsv|\.TSV ]]; then
    DELIMITER=$'\t'
else
    echo -e "Input file has an unsupported extension.\nFile must be in CSV (.csv) or TSV (.tsv) format."
    exit
fi

#Command Prompt
read -rep "> Please enter 1 for downloading and reorganizing files`echo $'\n> '`Please enter 2 for reorganizing downloaded files`echo $'\n> '`Please enter 3 for exit`echo $'\n> '`Choose an option: " yn
case $yn in
    [1]* ) downloadOrganize exit;;
    [2]* ) reorganizeFiles exit;;
    [3]* ) exit;;
    * ) echo "Please enter a valid option.";;
esac

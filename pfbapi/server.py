from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from flask_jsonpify import jsonify
from pfb import reader, writer
from pfb.importers import tsv
import os
import sys
import json
import csv
import shutil
import random
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import requests
import urllib
import urllib
from urllib.parse import quote

app = Flask(__name__)
api = Api(app)

CORS(app)
ACCESS_KEY = os.getenv('S3_WRITE_ACCESS_KEY')
SECRET_KEY = os.getenv('S3_WRITE_SECRET_KEY')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

#PDC-3419: Add PFB option to File Manifest download
#PDC-3489: Change PFB to post to Firecloud rather than download
@app.route("/", methods=['POST'])
def generatePFBFile():
    response = request.data
    response = response.decode("utf-8") 
    response = json.loads(response)
    fileManifestDetails = response.pop()
    fileName = fileManifestDetails['fileManifestName']
    if (os.getenv('IS_DOCKER')):
        tsvFolder = app.root_path
    else:
        tsvFolder = os.getenv('PFB_FILE_PATH')
    #Directory name with random number
    randomNumber = random.getrandbits(64)
    dirName = "PDC_file_" + str(randomNumber)
    tsvPath = os.path.join(tsvFolder, dirName)
    if os.path.exists(tsvPath):
        shutil.rmtree(tsvPath, ignore_errors=True)
    if not os.path.exists(tsvPath):
        os.makedirs(tsvPath)
    #Create a TSV File using data from the client
    with open(tsvPath + '/file.tsv', 'w') as output_file:
        dw = csv.DictWriter(output_file, sorted(response[0].keys()), delimiter='\t')
        dw.writeheader()
        dw.writerows(response)
    #Generate PFB file using PFB library
    r = reader.PFBReader(app.root_path + "/pdc_schema.avro")
    r = r.__enter__()
    endAvro = tsvPath + "/" + fileName + ".avro"
    w = writer.PFBWriter(endAvro)
    w.__enter__()
    w.copy_schema(r)
    program = "TestProgram"
    project = "TestProgram"
    w.write(tsv._from_tsv(w.metadata, tsvPath, program, project))
    print("**Done with writing PFB**")
    #PFB generation - Command Line
    #pfbCommand = 'pfb from -o {}/{}.avro tsv -s /path-to-schema-file/pdc_schema.avro --program DEV --project test {}'.format(tsvPath, fileName, tsvPath)
    #os.system(pfbCommand)
    #UPLOAD the PFB file to S3 bucket
    s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
    uploadsuccessful =  'false'
    try:
        s3.upload_file(endAvro, S3_BUCKET_NAME, fileName + ".avro")
        print("Upload Successful")
        uploadsuccessful = 'true'
    except FileNotFoundError:
        print("The file was not found")
    except NoCredentialsError:
        print("Credentials not available")
    #GENERATE SIGNED URL
    terraServerUrl = ""
    if (uploadsuccessful == 'true'):
        try:
            response = s3.generate_presigned_url('get_object',
                                                        Params={'Bucket': S3_BUCKET_NAME,
                                                                'Key': fileName + ".avro"},
                                                        ExpiresIn=864000)
            #print(response)
            #Generate TERRA SERVER Url
            #Encode the S3 - PFB Url
            result = urllib.parse.quote(response, safe='')
            terraServerUrl = 'https://app.terra.bio/#import-data?format=PFB&url=' + result
            print(terraServerUrl)
        except ClientError as e:
            print(e)
    return jsonify(terraServerUrl)

@app.route('/download/<path:dirName>/<path:fileName>', methods=['GET', 'POST'])
def downloadPFBFile(dirName, fileName):
    if (os.getenv('IS_DOCKER')):
        tsvFolder = app.root_path
    else:
        tsvFolder = os.getenv('PFB_FILE_PATH')
    tsvPath = os.path.join(tsvFolder, dirName)
    print(tsvPath)
    return send_from_directory(directory=tsvPath, filename=fileName)

@app.route('/generateSignedUrl/<path:dirName>/<path:fileName>', methods=['GET', 'POST'])
def generateSignedurl(dirName, fileName):
    s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
    uploadsuccessful =  'false'
    if (os.getenv('IS_DOCKER')):
        tsvFolder = app.root_path
    else:
        tsvFolder = os.getenv('PFB_FILE_PATH')
    tsvPath = os.path.join(tsvFolder, dirName)
    endAvro = tsvPath + "/" + fileName + ".avro"
    try:
        s3.upload_file(endAvro, S3_BUCKET_NAME, fileName + ".avro")
        print("Upload Successful")
        uploadsuccessful = 'true'
    except FileNotFoundError:
        print("The file was not found")
    except NoCredentialsError:
        print("Credentials not available")
    #GENERATE SIGNED URL
    terraServerUrl = ""
    if (uploadsuccessful == 'true'):
        try:
            response = s3.generate_presigned_url('get_object',
                                                        Params={'Bucket': S3_BUCKET_NAME,
                                                                'Key': fileName + ".avro"},
                                                        ExpiresIn=864000)
            #print(response)
            #Generate TERRA SERVER Url
            #Encode the S3 - PFB Url
            result = urllib.parse.quote(response, safe='')
            terraServerUrl = 'https://app.terra.bio/#import-data?format=PFB&url=' + result
            print(terraServerUrl)
        except ClientError as e:
            print(e)
    return jsonify(terraServerUrl)

if __name__ == '__main__':
   #app.run(port=3002)
   app.run(host='0.0.0.0')
#!/bin/bash
sudo rm -rf /var/www/html/dataDownloadDocumentation.json
sudo cp -r /home/ec2-user/PDC_Build/pdc/data-download-folder/dataDownloadDocumentation.json /var/www/html

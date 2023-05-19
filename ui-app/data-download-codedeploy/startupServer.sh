#!/bin/bash
sudo rm -rf /var/www/html/dataDownloadDocumentation.json
sudo cp -r /home/ec2-user/PDC_Build/pdc/data-download-folder/data-folder/dataDownloadDocumentation.json /var/www/html
sudo cp /home/ec2-user/PDC_Build/pdc/data-download-folder/UI_Screen_Shot_1.png  /var/www/html/pdc/assets
sudo cp /home/ec2-user/PDC_Build/pdc/data-download-folder/UI_Screen_Shot_2.png  /var/www/html/pdc/assets
sudo cp /home/ec2-user/PDC_Build/pdc/data-download-folder/UI_Screen_Shot_3.png  /var/www/html/pdc/assets
sudo cp /home/ec2-user/PDC_Build/pdc/data-download-folder/data-download-1.png  /var/www/html/pdc/assets
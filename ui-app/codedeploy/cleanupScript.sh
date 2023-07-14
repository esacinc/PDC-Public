#!/bin/bash
sudo rm -rf /home/ec2-user/PDC_Build/pdc/dist/*
sudo rm -rf /home/ec2-user/PDC_Build/pdc/documentation/*
sudo rm -rf /home/ec2-user/PDC_Build/pdc/data-download-archival-folder/*
mkdir -p /home/ec2-user/PDC_Build/pdc/data-download-archival-folder
sudo cp /var/www/html/dataDownloadDocumentation.json /home/ec2-user/PDC_Build/pdc/data-download-archival-folder
sudo cp /var/www/html/pdc/assets/UI_Screen_Shot_1.png  /home/ec2-user/PDC_Build/pdc/data-download-archival-folder
sudo cp /var/www/html/pdc/assets/UI_Screen_Shot_2.png  /home/ec2-user/PDC_Build/pdc/data-download-archival-folder
sudo cp /var/www/html/pdc/assets/UI_Screen_Shot_3.png  /home/ec2-user/PDC_Build/pdc/data-download-archival-folder
sudo cp /var/www/html/pdc/assets/data-download-1.png  /home/ec2-user/PDC_Build/pdc/data-download-archival-folder
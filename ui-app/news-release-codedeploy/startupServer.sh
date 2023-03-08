#!/bin/bash
sudo rm -rf /var/www/html/pdc/assets/data-folder/news.json
sudo rm -rf /var/www/html/pdc/assets/data-folder/release.json
sudo cp -r /home/ec2-user/PDC_Build/pdc/news-releases-folder/news.json /var/www/html/pdc/assets/data-folder
sudo cp -r /home/ec2-user/PDC_Build/pdc/news-releases-folder/release.json /var/www/html/pdc/assets/data-folder
#!/bin/bash
sudo rm -rf /var/www/html/pdc/*
sudo cp -r /home/ec2-user/PDC_Build/pdc/dist/* /var/www/html/pdc/
sudo rm -rf /var/www/html/data-dictionary
sudo cp -r /home/ec2-user/PDC_Build/pdc/documentation/dev /var/www/html/data-dictionary
sudo cp -r /home/ec2-user/PDC_Build/pdc/documentation/dev/publicapi-documentation /var/www/html/data-dictionary/
sudo cp /home/ec2-user/PDC_Build/pdc/documentation/dev/apidocumentation.html /var/www/html/data-dictionary/
sudo cp /home/ec2-user/PDC_Build/pdc/documentation/dev/styles/main.css /var/www/html/data-dictionary/styles/
#!/bin/bash
sudo rm -rf /var/www/html/pdc/assets/data-folder/*
sudo cp -r /home/ec2-user/PDC_Build/pdc/data-folder/* /var/www/html/pdc/assets/data-folder

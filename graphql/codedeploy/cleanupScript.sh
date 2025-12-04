#!/bin/bash
source ~/.bash_profile
pm2 stop 'GraphQL API' 
pm2 delete 'GraphQL API'
sudo rm -rf /home/ec2-user/PDC_Build/graphql/*

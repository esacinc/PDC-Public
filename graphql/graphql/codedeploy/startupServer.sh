#!/bin/bash
cd ~/PDC_Build/graphql
npm install
pm2 start --name "GraphQL API" npm -- start
pm2 save
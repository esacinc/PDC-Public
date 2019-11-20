This is an Apollo GraphQL (node.js express) Server. It contains a sample GraphQL schema and data models. It is connected to a mysql database via ssh and performs sample records creation and queries. It serves a GraphiQL UI where GraphQL queries can be entered and results displayed.

## Getting started

Install node.js (current version).

Open up a new session (window):
git clone https://github.com/esacinc/PDC/tree/master/graphql.git
cd [whereTheProjectIsCloned]
npm install
npm start

Run test queries using graphiql:
open http://localhost:3000/graphiql using a browser. you can paste the queries (one at a time) on the left side of the page and hit the play button (cmd-return) to see the results on the right side.

The main entry point of the server is server.js. For schemas, models and resolvers, look under the pdc folder 

The database info is configured in /pdc/config/dbconfig.js

Authentication via Google Sign-in is NOT required by default. 

To turn on authentication follow the following steps before starting the server (npm start): 

1) Rename /server.js to serverNoAuth.js
2) Rename /serverAuth.js to server.js
 
You need to set up a postman environment to test with authentication. See https://wiki.esacinc.com/display/PDC/Postman+Usage for instructions.







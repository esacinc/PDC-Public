This project is the for the user interface for the PDC Data Browser. It is developed using AngularJS 6.

To build the ui: "ng build --base-href=/pdc/"

To install the ui: "npm install"

To run the ui locally: "npm start". The app will run on port 9090 (this was done so that the app will not interfer with other apps created using Angular CLI running on port 4200 by default)

To view the UI in browser go to: http://localhost:9090/PDC

The user interface calls the PDC GraphQL APIs to retrieve all data that is presented to the user so for the UI to work you must also have a working GraphQL API with access to data to display.

# Updated instructions for running ui-app in local:

Install node: 

The following version of node works without conflicts for PDC ui-app, you can also  try the latest version as required:

https://nodejs.org/download/release/v14.5.0/

After installation, run 

**node -v**: Should return 14.5.0

**npm -v**: Should return 6.14.5

##### For running ui-app:
Navigate to PDC -> ui-app 

Run **npm install**

Run **npm start**

If there's a compilation error with node-sass, please add the following package under 'dependencies' section of package.json and rerun npm install, npm start: 

**"node-sass": "^4.14.0"**

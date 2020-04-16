This project is the for the user interface for the PDC Data Browser. It is developed using AngularJS 6.

To build the ui: "ng build --base-href=/pdc/"

To install the ui: "npm install"

To run the ui locally: "npm start". The app will run on port 9090 (this was done so that the app will not interfer with other apps created using Angular CLI running on port 4200 by default)

To view the UI in browser go to: http://localhost:9090/PDC

The user interface calls the PDC GraphQL APIs to retrieve all data that is presented to the user so for the UI to work you must also have a working GraphQL API with access to data to display.

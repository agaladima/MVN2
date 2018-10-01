# MVN2
This app takes a csv file that should have the following headers:
  - batch_num, date_userID_created, snn, gender, first_name, last_name, lic_num, birthdate, points_strike, dl_class
Once the csv file is submitted, you can navigate to the 'MySQL Data' tab to view the table data that was imported from MySql.
On the 'MySQL' tab, you can use the checkboxes to select data that will be pushed to Firestore.

Be sure you have the latest version of node and npm.
After you download, navigate to the project in you console and run 'npm start'
  You will want to make sure you have changed the Firebase credentials to your own. You can do this by changing the serviceAccountKey.json file.
When the app is up and running on port 3000, start by initializing a database by selecting the 'Initiate Database' tab.
  After this, you can upload your file and test out the app.

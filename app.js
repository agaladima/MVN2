'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const uploads = multer({ dest: './upload'});
const admin = require('firebase-admin');
const functions = require('firebase-functions');
let serviceAccount = require('./serviceAccountKey.json');
const settings = {/* your settings... */ timestampsInSnapshots: true};

//create connection
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
});

//connect
db.connect((err) => {
	if(err){
		console.log(err);
	}
	console.log('MySql connected...');
});

const app = express();
const fs = require('fs');
const csv = require('fast-csv');
const upload = require('express-fileupload');
app.use(upload());

//initialize firebase
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

let fdb = admin.firestore();
fdb.settings(settings);


//app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.set('view engine', 'pug');

//Create DB
app.get('/createdb', (req, res) => {
	let sql = 'CREATE DATABASE IF NOT EXISTS nodemysql';
	db.query(sql, (err, result) => {
		if(err) {
			console.log(err);
		}
		console.log(result);
		res.redirect('/');
	});
	
});

var citiesRef = fdb.collection('users');
var observer = citiesRef.onSnapshot(docSnapshot => {
  console.log(`Received doc snapshot: ${docSnapshot.size}`);
  // ...
  var d =[];
  docSnapshot.forEach(doc => {
  	d.push(doc.data());
  });
  console.log(d);
}, err => {
  console.log(`Encountered error: ${err}`);
});

observer();

// GET home route
app.get('/', (req, res, next) => {
	//create table header
	let tableHeader = 'CREATE TABLE IF NOT EXISTS nodemysql.firebaseSent('
			+'batch_num INT,'
			+'date_userID_created DATE,'
			+'ssn VARCHAR(255), '
			+'gender VARCHAR(255),'
			+'first_name VARCHAR(255),'
			+'last_name VARCHAR(255),'
			+'lic_num VARCHAR(255),'
			+'birthdate DATE,'
			+'points_strike INT,'
			+'dl_class VARCHAR(255))';
	//create table and add mysql header
	db.query(tableHeader, (err, result) => {
		if(err) {
			console.log(err);
		}
	});
	res.render('index', {title: 'Home'});
});
	

var modelData;
var i;
//post home route
app.post('/', (req, res, next) => {
	console.log(req.files.importFile);
	if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let importFile = req.files.importFile;
  
  // Use the mv() method to place the file somewhere on your server
  importFile.mv('./upload/newfile.csv', function(err) {
    if (err){
    	return res.status(500).send(err);
    }
    res.redirect('/data');
  });
});

//get drop database route
app.get('/drop', (req, res, next) => {
	//drop old table
  let drop = `DROP TABLE nodemysql.userData`;
	db.query(drop, (err, result) => {
		if(err){
			console.log('Database wasn\'t dropped. Error: '+err);
		} else {
			console.log(result);
		}
	});
	res.redirect('/');
});

//post drop database route
app.post('/drop', (req, res, next) => {
	res.redirect('/');
});

// GET data route
app.get('/data', (req, res, next) => {
	//create table header
	let tableHeader = 'CREATE TABLE IF NOT EXISTS nodemysql.userData('
			+'batch_num INT,'
			+'date_userID_created DATE,'
			+'ssn VARCHAR(255), '
			+'gender VARCHAR(255),'
			+'first_name VARCHAR(255),'
			+'last_name VARCHAR(255),'
			+'lic_num VARCHAR(255),'
			+'birthdate DATE,'
			+'points_strike INT,'
			+'dl_class VARCHAR(255))';
	//create table and add mysql header
	db.query(tableHeader, (err, result) => {
		if(err) {
			console.log(err);
		}
	});
	//add data to table
	let load = `LOAD DATA LOCAL INFILE './upload/newfile.csv'`
	+` INTO TABLE nodemysql.userData`
	+` FIELDS TERMINATED BY ','`
	+` ENCLOSED BY '"'`
	+` LINES TERMINATED BY '\n'`
	+` IGNORE 1 ROWS`;

	db.query(load, (err, result) => {
		if(err) {
			console.log(err);
		} else {
			console.log(result);
		}
	});
	db.query('ALTER TABLE nodemysql.userData ORDER BY date_userID_created ASC', (err, result) => {
		if(err) {
			console.log(err);
		}
	});
	res.redirect('/table');
});

//post data route
app.post('/data', (req, res) => {
	return res.redirect('/table');
});

//get table route
app.get('/table', (req, res) => {
	//get data from mysql
	db.query('SELECT * FROM nodemysql.userData', (err, result) => {
		if(err) {
			console.log(err);
		} else{
			return res.render('data', {
				title: 'Table Page',
				allDatas: result,
			});
		}
	});
});

//data post route
app.post('/table', (req, res) => {
	console.log('body data: '+req.body.checkedItem);
	let checkedArray = req.body.checkedItem;
	let checkedObj;
	console.log(checkedArray);
	//search checkedItem array that is passed and retrieve the data from mysql
	for (let i = 0; i < checkedArray.length; i++) {
		let queryParam = 'SELECT * FROM nodemysql.userData WHERE batch_num = '+checkedArray[i];
		db.query(queryParam, (err,result) => {
			if(err){
				console.log(err);
			} else {
				checkedObj = result;

				//prepare firestore input data format
				let fbInput = {
					batch_num: checkedObj[0].batch_num,
					date_userID_created: checkedObj[0].date_userID_created,
					ssn: checkedObj[0].ssn,
					gender: checkedObj[0].gender,
					first_name: checkedObj[0].first_name,
					last_name: checkedObj[0].last_name,
					lic_num: checkedObj[0].lic_num,
					birthdate: checkedObj[0].birthdate,
					points_strike: checkedObj[0].points_strike,
					dl_class: checkedObj[0].dl_class
				};

				//send data to firestore
				let MVNDatabase = fdb.collection('users').doc(checkedArray[i]);
				let MVNCollection = MVNDatabase.set(fbInput);
			}
		});

		//INSERT into stored firebase table
		let insertQuery = 'INSERT INTO nodemysql.firebaseSent SELECT * FROM nodemysql.userData WHERE batch_num = '+checkedArray[i];
		db.query(insertQuery, (err, result) => {
			if(err){
				console.log(err);
			} else {
				console.log('Info added to the sent to firebase table');
			}
		});
	}
	return res.redirect('/datatwo');
});

app.get('/datatwo', (req, res) => {
	let queryParams = 'SELECT * FROM nodemysql.firebaseSent';
	//get data from mysql
	db.query(queryParams, (err, result) => {
		if(err) {
			console.log(err);
		} else{
			return res.render('datatwo', {
				title: 'Pushed to Firebase',
				allDatas: result
			});
		}
	});
});

app.post('/datatwo', (req, res) => {
	return res.render('datatwo');
});

//catch 404 and forward to error handler
app.use(function(req, res, next){
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: 'Oops! Looks like something went wrong. Make sure that you have imported data and that you have selected data to push to firebase.',
    error: {}
  });
});


app.listen(3000, () => {
	console.log('The app is running on local host:3000!');
});
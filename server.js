'use strict';
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
//const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------
app.get('/home',listofhouses);
app.get('/house_name/characters',getcharactersNames);
app.post('/my-characters',addCharToDB);
app.get('/my-characters',getCharFromDB);
app.get('/characters/:character_id',getCharDetails);
app.put('/characters/:character_id',updateChar);
app.delete('/characters/:character_id',deleteChar);


// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------
function listofhouses(req,res){
  res.render('home.ejs');
}
function getcharactersNames(req,res){
  let url ='http://hp-api.herokuapp.com/api/characters';
  let charArr=[];
  superagent.get(url).then(data=>{
    data.body.forEach(element=>{
      charArr.push(new Character(element));
    });
    res.render('fav-char.ejs',{result:data.body});

  }).catch(error => console.log('error',error));
}

function Character(data){
  this.image=data.image;
  this.name=data.name;
  this.patronus=data.patronus;
  this.alive=data.alive;
}
function addCharToDB(req,res){
  let query='INSERT INTO house (image,name,patronus,alive) VALUES($1,$2,$3,$4);';
  let values = [req.body.image,req.body.name,req.body.patronus,req.body.alive];
  client.query(query,values).then(()=>{
    res.redirect('/my-characters');
  }).catch(error => console.log('error',error));
}
function getCharFromDB(req,res){
  let query='SELECT * FROM house;';
  client.query(query).then(data=>{
    res.render('saved-char',{result:data.rows});
  }).catch(error => console.log('error',error));
}
function getCharDetails(req,res){
  let query = 'SELECT * FROM house WHERE id = $1;';
  let value = [req.params.character_id];
  client.query(query,value).then(data=>{
    res.render('char-details',{result:data.rows[0]});
  });
}
function updateChar(req,res){
  let query = 'UPDATE house SET name=$1,patronus=$2 WHERE id=$3;';
  let value = [req.body.name,req.body.patronus,req.params.character_id];
  client.query(query,value).then(()=>{
    res.redirect('/my-characters');
  }).catch(error => console.log('error',error));
}

function deleteChar(req,res){
  let query = 'DELETE FROM house WHERE id = $1;';
  let value=[req.params.character_id];
  client.query(query,value).then(()=>{
    res.redirect('/my-characters');
  });
}

// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------



//Express Runtime
client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));




'use strict';

require('dotenv').config();
const express = require('express');
// const superagent = require('superagent');

const server = express();
const pg = require('pg');
const superagent = require('superagent')
const PORT = process.env.PORT || 3000;
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }
});

server.set('view engine','ejs');

server.use(express.static(__dirname + '/public'));

server.use(express.urlencoded({extended:true}));


server.get('/',homerout)
server.get('/searches/new',searchPage)
server.post('/searches',searchSubmit)
server.post('/add',addBook)





function Book (data){
  this.title =data.volumeInfo.title;
  this.image_url = (data.volumeInfo.imageLinks)?data.volumeInfo.imageLinks.thumbnail:'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = (data.volumeInfo.industryIdentifiers)?`${data.volumeInfo.industryIdentifiers[0].type} : ${data.volumeInfo.industryIdentifiers[0].identifier}`:'The ISBN not available for this book ' ;
  this.author =(data.volumeInfo.authors) ? data.volumeInfo.authors.join(',') : 'Unkown';
  this.description =data.volumeInfo.description || 'The description is not available for this book';
  this.categories=(data.volumeInfo.categories) ? data.volumeInfo.categories.join(',') : 'Unkown';
}

function homerout(req,res){

  let SQL = `SELECT * FROM books;`;
  client.query(SQL)
    .then(result=>{
      res.render('pages/index',{ arr:result.rows});
    })
  res.render('pages/index');

}
function searchPage(req,res){

  res.render('pages/searches/new');
}
function searchSubmit(req,res){

  let searchText = req.body.text;
  let searchType = req.body.searchType;

  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${searchText}`)
    .then(data =>{
      let booksData = data.body.items;
      let arrBookOBJ = booksData.map(val=>{
        return new Book(val);
      })
      res.render('pages/searches/show',{booksArr:arrBookOBJ});


    })
}
function addBook(req,res){
  let bookData = req.body;
  console.log(bookData);
  let SQL = `INSERT INTO books (title,author,isbn,image_url,description,categories) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`
  let safeValues = [bookData.title,bookData.authors,bookData.isbn,bookData.image_url,bookData.description,bookData.categories]
  console.log(safeValues);
  client.query(SQL,safeValues)
    .then(val=>{
      res.render('pages/books/show.ejs',{bookObject:val.rows[0]})

    })
}






client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })




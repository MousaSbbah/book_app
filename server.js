'use strict';

require('dotenv').config();
const express = require('express');
const methodOverride = require('method-override');
const server = express();
const pg = require('pg');
const superagent = require('superagent')
const PORT = process.env.PORT || 3000;
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

server.set('view engine','ejs');
server.use(express.static(__dirname + '/public'));
server.use(methodOverride('_method'));
server.use(express.urlencoded({extended:true}));


server.get('/',homerout)
server.get('/searches/new',searchPage)
server.post('/searches',searchSubmit)
server.post('/add',addBook)
server.get('/details/:bookID',getDetail)
server.put('/updateDetails/:bookID',updateHandler)
server.delete('/deleteBook/:bookID',deleteBookHandler)





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
      let arr = result.rows;
      console.log(result.rows)
      res.render('pages/index',{ booksArray:arr});
    })
    .catch(err=>{
      res.render('pages/error')
    })

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
    .catch(err=>{
      res.render('pages/error')
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
      res.redirect(`/details/${val.rows[0].id}`)

    })
    .catch(err=>{
      res.render('pages/error')
    })
}

function getDetail(req,res){
  let bookID = req.params.bookID;
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let safeValue = [bookID]
  client.query(SQL,safeValue)
    .then(result=>{
      console.log(result.rows);
      res.render('pages/books/show',{bookObject:result.rows[0]})
    })
    .catch(err=>{
      res.render('pages/error')
    })
}

function deleteBookHandler (req,res){
  let bookID = req.params.bookID;
  let SQL = `DELETE FROM books WHERE id=${bookID};`;
  // let safeValue = [bookID]
  client.query(SQL)
    .then(()=>{
      res.redirect('/');
    }
    )}



function updateHandler (req,res){
  let bookData = req.body;
  console.log(bookData);
  let SQL = `UPDATE books SET title=$1,author=$2,isbn=$3,description=$4,categories=$5 WHERE id=$6 ;`
  let safeValues = [bookData.title,bookData.authors,bookData.isbn,bookData.description,bookData.categories,req.params.bookID];
  console.log(safeValues);
  client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/details/${req.params.bookID}`)
    })
    .catch(err=>{
      res.render('pages/error')
    })

}





server.get('*',(req,res)=>{
  res.render('pages/error')
})

client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })




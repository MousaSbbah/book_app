'use strict';

require('dotenv').config();
const express = require('express');
// const superagent = require('superagent');

const server = express();
const superagent = require('superagent')
const PORT = process.env.PORT || 3000;
server.set('view engine','ejs');

server.use(express.static(__dirname + '/public'));

server.use(express.urlencoded({extended:true}));
server.get('/',(req,res)=>{
  res.render('pages/index');
})
server.get('/searches/new',(req,res)=>{
  res.render('pages/searches/new');
})

server.post('/searches',(req,res)=>{
  let searchText = req.body.text;
  let searchType = req.body.searchType;

  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=in${searchType}:${searchText}`)
    .then(data =>{
      let booksData = data.body.items;
      let arrBookOBJ = booksData.map(val=>{
        return new Book(val);
      })
      console.log(arrBookOBJ);
      res.render('pages/searches/show',{booksArr:arrBookOBJ});


    })

})

function Book (data){
  this.title =data.volumeInfo.title;
  if(data.volumeInfo.imageLinks){
    this.imgURL =data.volumeInfo.imageLinks.thumbnail;
  }else{
    this.imgURL ='https://i.imgur.com/J5LVHEL.jpg';
  }
  this.authorNames =data.volumeInfo.authors || ['Unkown'];
  this.description =data.volumeInfo.description || 'The description is not available for this book';
}






server.listen(PORT,()=>{
  console.log('listen' , PORT);
})



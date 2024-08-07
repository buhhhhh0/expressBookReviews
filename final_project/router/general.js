const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const public_users = express.Router();

// Get the book list available in the shop using Promises
public_users.get('/books-promise', function (req, res) {
  axios.get('http://localhost:5000/')
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error fetching books', error });
    });
});


// Get book details based on ISBN using Promises
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error fetching book details', error });
    });
});



// Get book details based on Author using Promises
public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;
  axios.get(`http://localhost:5000/author/${author}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error fetching books by author', error });
    });
});


// Get book details based on Title using Promises
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error fetching books by title', error });
    });
});


module.exports.general = public_users;
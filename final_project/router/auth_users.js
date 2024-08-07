const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Initialize session
regd_users.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Create and sign a JWT
  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });

  // Save the token in the session
  req.session.token = token;

  return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (books[isbn]) {
      books[isbn].reviews = books[isbn].reviews || [];
      const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === decoded.username);

      if (existingReviewIndex > -1) {
        books[isbn].reviews[existingReviewIndex].review = review;
        return res.status(200).json({ message: "Review updated successfully" });
      } else {
        books[isbn].reviews.push({ username: decoded.username, review });
        return res.status(200).json({ message: "Review added successfully" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (books[isbn]) {
      books[isbn].reviews = books[isbn].reviews || [];
      const reviewCountBefore = books[isbn].reviews.length;
      books[isbn].reviews = books[isbn].reviews.filter(r => r.username !== decoded.username);
      const reviewCountAfter = books[isbn].reviews.length;

      if (reviewCountBefore > reviewCountAfter) {
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(404).json({ message: "Review not found" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

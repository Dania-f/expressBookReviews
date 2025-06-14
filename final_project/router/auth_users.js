const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return !users.some((user) => user.username === username);
};

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
const user = users.find(user => user.username === username && user.password === password);
return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      { username: username },
      'access', // secret key
      { expiresIn: '1h' }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review added/updated for book with ISBN ${isbn}`,
    reviews: books[isbn].reviews
  });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const bookReviews = books[isbn].reviews;
  
    if (bookReviews[username]) {
      delete bookReviews[username];
      return res.status(200).json({
        message: `Review deleted for book with ISBN ${isbn}`,
        reviews: bookReviews
      });
    } else {
      return res.status(404).json({ message: "Review by this user not found" });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

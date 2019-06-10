const mongoose = require('mongoose');
const users = require("./models/users");
const posts = require("./models/posts");
const comments = require("./models/comments");
require('dotenv').config();

// Connect to mongo
const mongoUrl = process.env.DB_URL;

mongoose.connect(mongoUrl, {useNewUrlParser: true});

mongoose.connection.on('error', error => {
    console.log(error);
})
mongoose.connection.on('connected', function () {    
    console.log('MongoDB connected!');  
});   

const db = {
  users,
  posts,
  comments
}

export { db as default }

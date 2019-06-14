const mongoose = require('mongoose');
const ballots = require("./models/ballots");
const elections = require("./models/elections");
const users = require("./models/users");
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
  ballots,
  elections
}

export { db as default }

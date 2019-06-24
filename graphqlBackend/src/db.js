const mongoose = require('mongoose');
const ballots = require("./models/ballots");
const commitments = require("./models/commitment");
const openings = require("./models/opening");
const elections = require("./models/elections");
const twoStageElections = require("./models/twoStageElection");
const users = require("./models/users");
require('dotenv').config();

// Connect to mongo
let url = "";
if(process.env.NODE_ENV === "test") {
  url = process.env.TEST_DB_URL;
  console.log("Connecting to testing DB");
}
else url = process.env.DB_URL
const mongoUrl = url;

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
  commitments,
  openings,
  elections,
  twoStageElections
}

export { db as default }
import {cleanDB} from './util'
require('dotenv').config();
const mongoose = require('mongoose');
const ballots = require("../src/models/ballots");
const elections = require("../src/models/elections");
const users = require("../src/models/users");
const mutationTests = require('./mutation.test');

const db = {
  users,
  ballots,
  elections
};

describe("GraphQL test", () => {
  before(done => {
    const mongoUrl = process.env.TEST_DB_URL;
    if(typeof mongoUrl !== 'string') throw new Error("Missing DB URL")

    mongoose.connect(mongoUrl, {useNewUrlParser: true});
    mongoose.connection.once('connected', function () {    
      console.log('MongoDB connected!');
      done();
    });
  })

  after(done => {
    cleanDB(db);
    done();
  })

  describe('Mutation tests', mutationTests(db));
})
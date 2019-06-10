const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	id: {
		type: String,
		required: [true, 'Id is required.']
	},
  name: {
	  type: String,
	  required: [true, 'Name is required.']
  },
  pwdHash: {
    type: String,
    required: [true, 'Password is required.']
  }
});

// Creating a table within database with the defined schema
const users = mongoose.model('users', UserSchema);

// Exporting table for querying and mutating
module.exports = users
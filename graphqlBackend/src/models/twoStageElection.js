const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const TwoStageElectionSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Title is required.']
	},
  body: {
	  type: String,
	  required: [true, 'Body is required.']
  },
  choices: {
    type: [String],
    required: [true]
  },
  creator: {
    type: ObjectId,
    required: [true]
  },
  state: {
    type: String,
    required: [true]
  },
  voters: {
    type: [ObjectId],
    required: [true]
  },
  voted: {
    type: [ObjectId],
    required: [true]
  }
});

const twoStageElections = mongoose.model('twoStageElections', TwoStageElectionSchema);

module.exports = twoStageElections;
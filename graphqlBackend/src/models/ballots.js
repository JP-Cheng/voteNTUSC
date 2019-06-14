const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const BallotSchema = new Schema({
	election: {
		type: ObjectId,
		required: [true, 'Election is required.']
  },
  choice: {
    type: Number,
    required: [true]
  }
});

const ballots = mongoose.model('ballots', BallotSchema);

module.exports = ballots
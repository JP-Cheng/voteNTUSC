const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CommitmentSchema = new Schema({
	election: {
		type: ObjectId,
		required: [true, 'Election is required.']
  },
  commitment: {
    type: String,
    required: [true]
  }
});

const commitments = mongoose.model('commitments', CommitmentSchema);

module.exports = commitments
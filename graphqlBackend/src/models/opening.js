const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const OpeningSchema = new Schema({
	election: {
		type: ObjectId,
		required: [true, 'Election is required.']
  },
  hashedChoice: {
    type: String,
    required: [true]
  },
  hashedSecret: {
    type: String,
    required: [true]
  }
});

const openings = mongoose.model('openings', OpeningSchema);

module.exports = openings;
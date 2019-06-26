const User = {
  id(parent, args, {}, info) {
    if(!parent._id) throw new Error("UserResolver Error: _id Not Found");
    return parent._id;
  },
  async createdGeneralElections(parent, args, { db }, info) {
    let _simpleElections = await db.elections.find({creator: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err});
    let _twoStageElections = await db.twoStageElections.find({creator: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
    _simpleElections = _simpleElections.map(_election => ({
      type: "simpleElection",
      simpleElection: _election.toObject()
    }))
    _twoStageElections = _twoStageElections.map(_election => ({
      type: "twoStageElection",
      twoStageElection: _election.toObject()
    }));
    return _simpleElections.concat(_twoStageElections);
  },
  async votableGeneralElections(parent, args, { db }, info) {
    let _simpleElections = await db.elections.find({voters: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err});
    let _twoStageElections = await db.twoStageElections.find({voters: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err});
    _simpleElections = _simpleElections.map(_election => ({
      type: "simpleElection",
      simpleElection: _election.toObject()
    }))
    _twoStageElections = _twoStageElections.map(_election => ({
      type: "twoStageElection",
      twoStageElection: _election.toObject()
    }));
    return _simpleElections.concat(_twoStageElections);
  },
  async votedGeneralElections(parent, args, { db }, info) {
    let _simpleElections = await db.elections.find({voted: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err});
    let _twoStageElections = await db.twoStageElections.find({voted: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err});
    _simpleElections = _simpleElections.map(_election => ({
      type: "simpleElection",
      simpleElection: _election.toObject()
    }))
    _twoStageElections = _twoStageElections.map(_election => ({
      type: "twoStageElection",
      twoStageElection: _election.toObject()
    }));
    return _simpleElections.concat(_twoStageElections);
  },
  async createdElections(parent, args, { db }, info) {
    return await db.elections.find({creator: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async voteableElections(parent, args, { db }, info) {
    return await db.elections.find({voters: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async votedElections(parent, args, { db }, info) {
    return await db.elections.find({voted: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async createdTwoStageElections(parent, args, { db }, info) {
    return await db.twoStageElections.find({creator: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async voteableTwoStageElections(parent, args, { db }, info) {
    return await db.twoStageElections.find({voters: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async votedTwoStageElections(parent, args, { db }, info) {
    return await db.twoStageElections.find({voted: parent._id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  }
}

export { User as default }

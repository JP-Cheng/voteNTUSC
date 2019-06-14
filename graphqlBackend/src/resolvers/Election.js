const Election = {
  id(parent, args, {}, info) {
    if(!parent._id) throw new Error("ElectionResolver Error: _id Not Found");
    return parent._id
  },
  async creator(parent, args, { db }, info) {
    return await db.users.findById(parent.creator)
    .then(_user => {
      if(!_user) throw new Error("ElectionResolver Error: creator Not Found")
      else return _user;
    })
    .catch(err => {throw err})
  },
  async ballots(parent, args, { db }, info) {
    return await db.ballots.find({election: parent._id})
    .then(_ballots => _ballots)
    .catch(err => {throw err})
  },
  async voters(parent, args, { db }, info) {
    return await db.elections.findById(parent._id).populate({path: 'voters', model: "users"})
    .then(_elections => {
      if(_elections.voters.length === 0) throw new Error("Voters of Election:", parent._id, "Not Found!");
      else return _elections.voters;
    })
    .catch(err => {throw err})
  },
  async voted(parent, args, { db }, info) {
    return await db.elections.findById(parent._id).populate({path: 'voted', model: 'users'})
    .then(_election => {
      if(!_election.voted) throw new Error("Voted users of Election:", parent._id, "Not Found!");
      else return _election.voted;
    })
    .catch(err => {throw err})
  }
}

export { Election as default }

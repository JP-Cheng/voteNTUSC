const User = {
  id(parent, args, {}, info) {
    if(!parent._id) throw new Error("UserResolver Error: _id Not Found");
    return parent._id;
  },
  async createdElections(parent, args, { db }, info) {
    return await db.elections.find({creator: parent.id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async voteableElections(parent, args, { db }, info) {
    return await db.elections.find({voters: parent.id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  },
  async votedElections(parent, args, { db }, info) {
    return await db.elections.find({voted: parent.id})
    .then(_elections => _elections)
    .catch(err => {throw err})
  }
}

export { User as default }

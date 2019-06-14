import { findUser } from './util'

const Query = {
  async users(parent, args, { db }, info) {
    const _str = new RegExp(args.query, 'i');
    console.log("Looking for users:", _str);
    // Exec case insensitive LIKE query
    let result = await db.users.find({ $or: [{name: _str}, {email: _str}]})
    .then(docs => docs)
    .catch(err => {throw err;});
    if(result) {
      result = await result.map(user => {
        user.pwdHash = null;
        return user;
      })
    }
    return result;
  },
  async elections(parent, args, { db }, info) {
    const _str = new RegExp(args.query, 'i');
    console.log("Looking for Elections:", _str);
    if (!args.query) {
      // return all elections
      return await db.elections.find({})
      .then(docs => {return docs;})
      .catch(err => {throw err});
    }
    // Exec case insensitive LIKE query
    return await db.elections.find({ $or: [{title: _str}, {body: _str}]})
    .then(docs => {return docs;})
    .catch(err => {throw err});
  },
  async election(parent, args, { db }, info) {
    console.log("Looking for Election:", args.electionId);
    // Exec case insensitive LIKE query
    return await db.elections.findById(args.electionId)
    .then(doc => {return doc;})
    .catch(err => {throw err});
  },
  async ballots(parent, args, { db }, info) {
    return await db.ballots.find({election: args.electionId})
    .then(docs => docs)
    .catch(err => {throw err});
  },
  async ballot(parent, args, { db }, info) {
    return await db.ballots.findById(args.ballotId)
    .then(doc => doc)
    .catch(err => {throw err});
  },
  async me(parent, args, { me, db, req }) {
    if(!me) throw new Error("QueryMe Error: Not Login");
    
    console.log("Querying me...", me._id);
    let user = await findUser(db, me._id);
    user = user.toObject();
    delete user.pwdHash;
    return user;
  }
}

export { Query as default }

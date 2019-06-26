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
  async user(parent, args, { db }, info) {
    console.log(args.uid);
    return await db.users.findById(args.uid)
    .then(user => {
      if(!user) throw new Error("QueryUser Error: uid Not Found");
      let _user = user.toObject();
      delete _user.pwdHash;
      return _user;
    })
    .catch(err => {throw err;});
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
  async twoStageElections(parent, args, { db }, info) {
    const _str = new RegExp(args.query, 'i');
    console.log("Looking for TwoStageElections:", _str);
    if (!args.query) {
      // return all elections
      return await db.twoStageElections.find({})
      .then(docs => {return docs;})
      .catch(err => {throw err});
    }
    // Exec case insensitive LIKE query
    return await db.twoStageElections.find({ $or: [{title: _str}, {body: _str}]})
    .then(docs => {return docs;})
    .catch(err => {throw err});
  },
  async twoStageElection(parent, args, { db }, info) {
    // Exec case insensitive LIKE query
    return await db.twoStageElections.findById(args.query)
    .then(doc => doc)
    .catch(err => {throw err});
  },
  async allElections(parent, args, { db }, info) {
    const _str = new RegExp(args.query, 'i');
    console.log("Looking for TwoStageElections:", _str);
    let _twoStageElections, _simpleElections;
    if (!args.query) {
      // return all elections
      _twoStageElections = await db.twoStageElections.find({})
      .then(docs => {return docs;})
      .catch(err => {throw err});
      _simpleElections = await db.elections.find({})
      .then(docs => {return docs;})
      .catch(err => {throw err});

    }
    else {
      // Exec case insensitive LIKE query
      _twoStageElections = await db.twoStageElections.find({ $or: [{title: _str}, {body: _str}]})
      .then(docs => {return docs;})
      .catch(err => {throw err});
      _simpleElections = await db.elections.find({ $or: [{title: _str}, {body: _str}]})
      .then(docs => {return docs;})
      .catch(err => {throw err});
    }
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
  async commitments(parent, args, { db }, info) {
    return await db.commitments.find({election: args.electionId})
    .then(docs => docs)
    .catch(err => {throw err});
  },
  async commitment(parent, args, { db }, info) {
    return await db.commitments.findById(args.commitmentId)
    .then(doc => doc)
    .catch(err => {throw err});
  },
  async openings(parent, args, { db }, info) {
    return await db.openings.find({election: args.electionId})
    .then(docs => docs)
    .catch(err => {throw err});
  },
  async opening(parent, args, { db }, info) {
    return await db.openings.findById(args.openingId)
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

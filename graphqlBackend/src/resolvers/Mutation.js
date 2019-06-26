import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUser, findElection, findTwoStageElection, _deleteBallot, _deleteCommitment, _deleteOpening, _deleteElection, _deleteTwoStageElection } from './util'
import { myHash } from '../lib'

require('dotenv').config();

const Mutation = {
  async createUser(parent, args, { db }, info) {
    let user = {
      email: args.email,
      name: args.name,
      pwdHash: null
    };
    await db.users.findOne({email: args.email})
    .then(userResponse => {
      if(userResponse) throw new Error('CreateUser Error: Email Taken');
    }).catch(err => {
      throw err;
    })
    await bcrypt.hash(args.pwd, 10).then(_pwdHash => {
      user.pwdHash = _pwdHash;
    }).catch(err => hashErrHandler(err));

    const newUser = db.users(user);
    await newUser.save()
    .then(_ => {console.log("User created:", user)})
    .catch(err => {throw err});
    delete user.pwdHash;
    return { ...user, _id: newUser._id };
  },
  async deleteUser(parent, args, { me, db, pubsub, req }, info) {
    if(!me) throw new Error("DeleteUser Error: Not Login");
    const deletedUser = await db.users.findByIdAndDelete(me._id)
    .then(_user => {
      if(!_user) throw new Error("DeleteUser Error: User Not Found");
      else return _user;
    })
    .catch(err => {throw err});
    // Delete user elections
    const deletedUserElections = await db.elections.find({creator: me._id})
    deletedUserElections.map(election => _deleteElection(election._id, db, pubsub));
    
    deletedUser.pwdHash = null;
    return deletedUser;
  },
  async updateUser(parent, args, { me, db }, info) {
    if(!me) throw new Error("UpdateUser Error: Not Login");
    const { name, email, pwd } = args
    const user = await findUser(db, me._id);

    if (typeof name === 'string') {
      user.name = name
    }

    user.email = await new Promise(resolve => {
      if(typeof email === 'string') {
        db.users.findOne({email: email}, (err, found) => {
          if(err) errHandler(err);
          else if(found) throw new Error("Email taken.");
          else resolve(email);
        });
      }
      else resolve(user.email);
    });

    user.pwdHash = await new Promise(resolve => {
      if(typeof pwd !== 'string') {
        resolve(user.pwdHash);
      }
      bcrypt.hash(pwd, 10, (err, _newHash) => {
        if(err) hashErrHandler(err);
        else resolve(_newHash);
      })
    })

    console.log("Updating user:", user);
    await user.save();
    user.pwdHash = null;
    return user;
  },
  async createGeneralElection(parent, args, { me, db, pubsub, req }, info) {
    console.log("Creating Election...")
    if(!me) throw new Error("CreateGeneralElection Error: Not Login");
    if(args.data.voters.length === 0) throw new Error("CreateGeneralElection Error: No Voters");
    if(args.data.type !== "simpleElection" && args.data.type !== "twoStageElection") throw new Error("CreateGeneralElection Error: Invalid Type");
    
    const simple = args.data.type === "simpleElection";
    
    if(simple) {
      await db.elections.findOne({title: args.data.title})
      .then(_election => {
        if(_election) throw new Error("CreateElection Error: Title Already Exist");
      })
      .catch(err => {throw err});
    }
    else {
      await db.twoStageElections.findOne({title: args.data.title})
      .then(_election => {
        if(_election) throw new Error("CreateTwoStageElection Error: Title Already Exist");
      })
      .catch(err => {throw err});
    }

    const creator = await findUser(db, me._id);
    let newElection;
    if(simple) {
      delete args.data.type;
      newElection = db.elections({ ...args.data, creator: creator._id, voted: [] });
    }
    else {
      delete args.data.type;
      args.data.state = args.data.open?"COMMIT":"CLOSE";
      delete args.data.open;
      newElection = db.twoStageElections({ ...args.data, creator: creator._id, voted: [] });
    }
    
    let election = await newElection.save().then(_ => {
      console.log("Election created", newElection.toObject());
      return newElection.toObject(); 
    })
    .catch(err => {throw err;});

    election.creator = creator.toObject();
    if(simple){
      pubsub.publish('election', {
        elections: {
          mutation: 'CREATED',
          electionId: election._id,
          data: election
        }
      })
      return {type: "simpleElection", simpleElection: election};
    }
    else {
      pubsub.publish('twoStageElection', {
        twoStageElections: {
          mutation: 'CREATED',
          electionId: election._id,
          data: election
        }
      })
      return {type: "twoStageElection", twoStageElection: election};
    }
  },
  async createElection(parent, args, { me, db, pubsub, req }, info) {
    console.log("Creating Election...")
    if(!me) throw new Error("CreateElection Error: Not Login");
    if(args.data.voters.length === 0) throw new Error("CreateElection Error: No Voters");
    
    await db.elections.findOne({title: args.data.title})
    .then(_election => {
      if(_election) throw new Error("CreateElection Error: Title Already Exist");
    })
    .catch(err => {throw err});

    const creator = await findUser(db, me._id);
    const newElection = db.elections({ ...args.data, creator: creator._id, voted: [] });
    
    let election = await newElection.save().then(_ => {
      console.log("Election created", newElection.toObject());
      return newElection.toObject(); 
    })
    .catch(err => {throw err;});

    election.creator = creator.toObject();
    pubsub.publish('election', {
      elections: {
        mutation: 'CREATED',
        electionId: election._id,
        data: election
      }
    })
    
    return election;
  },
  async deleteElection(parent, args, { me, db, pubsub }, info) {
    if(!me) throw new Error("DeleteElection Error: Not Login")
    return await db.elections.findById(args.id)
    .then(found => {
      if(!found) throw new Error("DeleteElection Error: Election Not Found");
      if(me._id !== found.creator.toString()) throw new Error("DeleteElection Error: Not Creator")
      return _deleteElection(args.id, db, pubsub);
    })
    .catch(err => {throw err});
  },
  async updateElection(parent, args, { me, db, pubsub }, info) {
    const { id } = args

    let election = await findElection(db, id);
    if(!me) throw new Error("UpdateElection Error: Not Login");
    if(election.creator.toString() !== me._id) throw new Error("UpdateElection Error: Not Creator");
    
    election.open = !election.open;

    await election.save();
    pubsub.publish('election', {
      elections: {
        mutation: 'UPDATED',
        electionId: election._id,
        data: election.toObject()
      }
    })
    return election.toObject();
  },
  async createTwoStageElection(parent, args, { me, db, pubsub, req }, info) {
    console.log("Creating Election...")
    if(!me) throw new Error("CreateTwoStageElection Error: Not Login");
    if(args.data.voters.length === 0) throw new Error("CreateTwoStageElection Error: No Voters");
    if(args.data.state === "OPEN") throw new Error("CreateTwoStageElection Error: Invalid State");
    
    await db.twoStageElections.findOne({title: args.data.title})
    .then(_election => {
      if(_election) throw new Error("CreateTwoStageElection Error: Title Already Exist");
    })
    .catch(err => {throw err});

    const creator = await findUser(db, me._id);
    const newElection = db.twoStageElections({ ...args.data, creator: creator._id, voted: [] });
    
    let election = await newElection.save().then(_ => {
      console.log("TwoStageElection created", newElection.toObject());
      return newElection.toObject(); 
    })
    .catch(err => {throw err;});

    election.creator = creator.toObject();
    
    pubsub.publish('twoStageElection', {
      twoStageElections: {
        mutation: 'CREATED',
        electionId: election._id,
        data: election
      }
    })
    
    return election;
  },
  async deleteTwoStageElection(parent, args, { me, db, pubsub }, info) {
    if(!me) throw new Error("DeleteTwoStageElection Error: Not Login")
    return await db.twoStageElections.findById(args.id)
    .then(found => {
      if(!found) throw new Error("DeleteTwoStageElection Error: Election Not Found");
      if(me._id !== found.creator.toString()) throw new Error("DeleteTwoStageElection Error: Not Creator")
      return _deleteTwoStageElection(args.id, db, pubsub);
    })
    .catch(err => {throw err});
  },
  async updateTwoStageElection(parent, args, { me, db, pubsub }, info) {
    const { id } = args;
    let election = await findTwoStageElection(db, id);
    let state = election.state;
    if(!me) throw new Error("UpdateTwoStageElection Error: Not Login");
    if(election.creator.toString() !== me._id) throw new Error("UpdateTwoStageElection Error: Not Creator");
    if(state === "END") throw new Error("UpdateTwoStageElection Error: Election Already Ended");

    if(state === "CLOSE") election.state = "COMMIT";
    else if(state === "COMMIT") election.state = "OPEN";
    else if(state === "OPEN") election.state = "END";
    await election.save();
    
    pubsub.publish('twoStageElection', {
      elections: {
        mutation: 'UPDATED',
        electionId: election._id,
        data: election.toObject()
      }
    })
    
    return election.toObject();
  },
  async createBallot(parent, args, { me, db, pubsub, req }, info) {
    if(!me) throw new Error("Create Ballot Error: Not Login");
    await findUser(db, me._id);

    const { electionId, choice } = args.data;
    const election = await findElection(db, electionId);

    if (!election.open) {
      throw new Error('CreateBallot Error: Election Not Open');
    }
    if(election.voters.findIndex(_voters => _voters.toString() === me._id) === -1) {
      throw new Error('CreateBallot Error: User Not In Voters');
    }
    if(election.voted.findIndex(_Voted => _Voted.toString() === me._id) !== -1) {
      throw new Error('CreateBallot Error: User Already Voted');
    }

    const newBallot = db.ballots({election: election._id, choice: choice});
    await newBallot.save()
    .catch(err => {throw err});
    
    election.voted.push(me._id);
    election.markModified('voted');
    await election.save()
    .catch(err => {throw err});
    pubsub.publish(`ballot ${election._id}`, {
      ballots: {
        mutation: 'CREATED',
        data: newBallot.toObject()
      }
    })
    pubsub.publish('election', {
      elections: {
        mutation: 'UPDATED',
        electionId: election._id,
        data: election.toObject()
      }
    })

    return newBallot.toObject();
  },
  async createCommitment(parent, args, { me, db, pubsub, req }, info) {
    if(!me) throw new Error("Create Commitment Error: Not Login");
    await findUser(db, me._id);

    const { twoStageElectionId, commitment } = args.data;
    const election = await findTwoStageElection(db, twoStageElectionId);

    if (election.state !== "COMMIT") {
      throw new Error('CreateCommitment Error: Not In Commit State');
    }
    if(election.voters.findIndex(_voters => _voters.toString() === me._id) === -1) {
      throw new Error('CreateCommitment Error: User Not In Voters');
    }
    if(election.voted.findIndex(_Voted => _Voted.toString() === me._id) !== -1) {
      throw new Error('CreateCommitment Error: User Already Committed');
    }
    await db.commitments.find({election: twoStageElectionId, commitment: commitment})
    .then(_commitment => {
      if(_commitment.length > 0) throw new Error("CreateCommitment Error: Same Commitment");
    })
    .catch(err => {throw err});

    const newCommitment = db.commitments({election: election._id, commitment: commitment});
    await newCommitment.save()
    .catch(err => {throw err});
    
    election.voted.push(me._id);
    election.markModified('voted');
    await election.save()
    .catch(err => {throw err});
    
    pubsub.publish(`commitment ${election._id}`, {
      commitments: {
        mutation: 'CREATED',
        data: newCommitment.toObject()
      }
    })
    pubsub.publish('election', {
      elections: {
        mutation: 'UPDATED',
        electionId: election._id,
        data: election.toObject()
      }
    })

    return newCommitment.toObject();
  },
  async createOpening(parent, args, { me, db, pubsub, req }, info) {
    if(me) throw new Error("Create Opening Error: Not Logout");

    const { twoStageElectionId, hashedSecret, choice } = args.data;
    const election = await findTwoStageElection(db, twoStageElectionId);

    if (election.state !== "OPEN") {
      throw new Error('CreateOpening Error: Election Not In Open State');
    }

    const hashedChoice = myHash(choice.toString());
    const commitment = myHash(`${hashedSecret}${hashedChoice}`);
    if(!hashedChoice || !commitment) throw new Error("CreateOpening Error: Empty Hash Value");
    await db.openings.find({election: election._id, hashedChoice: hashedChoice, hashedSecret: hashedSecret})
    .then(found => {
      if(found.length > 0) throw new Error("CreateOpening Error: Same Opening Found");
    })
    .catch(err => {throw err});
    await db.commitments.find({election: election._id, commitment: commitment})
    .then(found => {
      if(found.length === 0) throw new Error("CreateOpening Error: No Matching Commitment");
    })
    .catch(err => {throw err});

    const newOpening = db.openings({election: election._id, hashedChoice: hashedChoice, hashedSecret: hashedSecret});
    await newOpening.save()
    .catch(err => {throw err});
    const newBallot = db.ballots({election: election._id, choice: choice});
    await newBallot.save()
    .catch(err => {throw err});

    pubsub.publish(`opening ${election._id}`, {
      openings: {
        mutation: 'CREATED',
        data: newOpening.toObject()
      }
    })
    pubsub.publish(`ballot ${election._id}`, {
      openings: {
        mutation: 'CREATED',
        data: newBallot.toObject()
      }
    })
    pubsub.publish('election', {
      elections: {
        mutation: 'UPDATED',
        electionId: election._id,
        data: election.toObject()
      }
    })

    return newOpening.toObject();
  },
  async login(parent, args, { db, pubsub, req}, info) {
    const user = await db.users.findOne({email: args.email})
    .then(_user => {
      if(!_user) throw new Error("Login Error: Invalid email");
      else return _user;
    })
    .catch(err => {throw err});
    await bcrypt.compare(args.pwd, user.pwdHash)
    .then(same => {
      if(!same) throw new Error("Login Error: Invalid password");
      console.log("User logged in:", user.name);
      user.pwdHash = null;
    })
    .catch(err => {throw err});
    const token = await jwt.sign(user.toObject(), process.env.JWT_SECRET, { expiresIn: '1d'});
    return {token: token};
  }
}

export { Mutation as default }

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUser, findElection, _deleteBallot, _deleteElection } from './util'

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
  async createElection(parent, args, { me, db, pubsub, req }, info) {
    console.log("Creating Election...")
    if(!me) throw new Error("CreateElection Error: Not Login");
    
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
  deleteElection(parent, args, { db, pubsub }, info) {
    return _deleteElection(args.id, db, pubsub);
  },
  async updateElection(parent, args, { me, db, pubsub }, info) {
    const { id, data } = args
    const { title, body, open, voters } = data;

    let election = await findElection(db, id);
    if(election.creator.toString() !== me._id) throw new Error("UpdateElection Error: Not Creator");
    if(election.voted.length !== 0) throw new Error("UpdateElection Error: Election Already Started")

    if (typeof title === 'string') {
      await db.elections.findOne({title: title})
      .then(_election => {
        if(_election) throw new Error("UpdateElection Error: Title Already Exist")
      })
      .catch(err => {throw err});

      election.title = title;
    }

    if (typeof body === 'string') {
      election.body = body;
    }

    if (typeof open === 'boolean') {
      election.open = open;
    }

    if(Array.isArray(voters)) {
      election.voters = voters;
    }

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
  async createBallot(parent, args, { me, db, pubsub, req }, info) {
    if(!me) throw new Error("Create Ballot Error: Not Login");
    await findUser(db, me._id);

    const { electionId, choice } = args.data;
    const election = await findElection(db, electionId);

    if (!election.open) {
      throw new Error('CreateBallot Error: Election Not Open');
    }
    if(election.voted.findIndex(_Voted => _Voted.toString() === me._id) !== -1) {
      throw new Error('CreateBallot Error: User Already Voted');
    }

    const newBallot = db.ballots({election: election._id, choice: choice});
    await newBallot.save()
    .catch(err => {throw err});
    election.voted.push(me._id);
    await election.save()
    .catch(err => {throw err});
    pubsub.publish(`ballot ${election._id}`, {
      ballots: {
        mutation: 'CREATED',
        data: newBallot.toObject()
      }
    })

    return newBallot.toObject();
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

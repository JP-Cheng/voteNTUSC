import {assert, expect} from 'chai'
import { request, GraphQLClient } from 'graphql-request'
import bcrypt from 'bcrypt'
import { cleanUsers, cleanElections, cleanBallots, cleanDB, getHash } from './util'
require('dotenv').config();
const endpoint = process.env.TEST_ENDPOINT;

const mutations = {
  register: `
    mutation createUser($name: String!, $email: String!, $pwd: String!) {
      createUser(name: $name, email: $email, pwd: $pwd) {
        id name email
      }
    }
  `,
  deleteUser: `
    mutation {
      deleteUser {
        id name email
      }
    }
  `,
  updateUser: `
    mutation updateUser($name: String, $email: String, $pwd: String) {
      updateUser(name: $name, email: $email, pwd: $pwd) {
        id name email
      }
    }
  `,
  createElection: `
    mutation createElection($title: String!, $body: String!, $open: Boolean!, $voters: [ID!]!) {
      createElection(data: {title: $title, body: $body, open: $open, voters: $voters}) {
        id title body open 
        creator {
          id name
        } 
        ballots {
          id
        } 
        voters {
          id
        }
        voted {
          id
        }
      }
    }
  `,
  deleteElection: `
    mutation deleteElection($id: ID!) {
      deleteElection(id: $id) 
    }
  `,
  updateElection: `
    mutation updateElection($id: ID!, $title: String, $body: String, $open: Boolean, $voters: [ID!]) {
      updateElection(id: $id, data: {title: $title, body: $body, open: $open, voters: $voters}) {
        id title body open
        creator {
          id
        }
        ballots {
          id
        }
        voters {
          id
        }
        voted {
          id
        }
      }
    }
  `,
  createBallot: `
    mutation createBallot($electionId: ID!, $choice: Int!) {
      createBallot(data: {electionId: $electionId, choice: $choice}) {
        id 
        choice 
        election {
          id
        }
      }
    }
  `,
  login: `
    mutation login($email: String!, $pwd: String!) {
      login(email: $email, pwd: $pwd) {
        token
      }
    }
  `
}

// returns a function with tests
const mutationTests = db => () => {
  describe('User mutation tests', () => {
    beforeEach(() => {
      cleanUsers(db);
    })

    after(() => {
      cleanUsers(db);
    })

    it('Create user should update DB', async () => {
      const user = {name: "Tom", email: "tom@example.com", pwd: "passTom"};
      await request(endpoint, mutations.register, user)
      .then(data => {
        // data -> { createUser: {id: ..., name: ...}}
        assert.isObject(data.createUser);
        assert.isString(data.createUser.id);
        assert.strictEqual(data.createUser.name, user.name);
        assert.strictEqual(data.createUser.email, user.email);
      })
      const dbHash = await db.users.find({name: user.name, email: user.email})
      .then(found => {
        assert.lengthOf(found, 1);
        return found[0].pwdHash;
      });
      
      await bcrypt.compare(user.pwd, dbHash)
      .then( same => {
        assert.isTrue(same);
      })
    })

    it('Login should return non empty token', async () => {
      const user = {name: "Tom", email: "tom@example.com", pwd: "passTom"};
      await request(endpoint, mutations.register, user)
      .then(data => {
        assert.isObject(data.createUser);
        return;
      })
  
      await request(process.env.TEST_ENDPOINT, mutations.login, {email: user.email, pwd: user.pwd})
      .then(data => {
        // data -> {login: {token: ... } }
        assert.isObject(data.login);
        assert.isString(data.login.token);
        assert.isAbove(data.login.token.length, 0);
      })
    })

    it('Delete user should check login', done => {
      request(endpoint, mutations.deleteUser)
      .then(data => {assert.isUndefined(data)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Login");
        done();
      })
    })

    it('Delete user should update DB', async () => {
      const user = {name: "Tom", email: "tom@example.com", pwd: "passTom"};
      const createData = await request(endpoint, mutations.register, user)
      .then(data => {
        assert.isObject(data.createUser);
        return data.createUser; // {id: ..., name: ..., ... }
      })
  
      const token = await request(endpoint, mutations.login, {email: user.email, pwd: user.pwd})
      .then(data => {
        assert.isString(data.login.token);
        return data.login.token
      })
  
      const client = new GraphQLClient(endpoint, {
        headers: {
          'x-token': token
        }
      });

      await client.request(mutations.deleteUser)
      .then(data => {
        assert.isObject(data.deleteUser);
        assert.strictEqual(data.deleteUser.id, createData.id);
        assert.strictEqual(data.deleteUser.name, createData.name);
        assert.strictEqual(data.deleteUser.email, createData.email);
      })
      // Check DB data
      await db.users.findById(createData.id)
      .then(found => {
        assert.isNull(found);
      })
    })
  
    it('UpdateUser should check login', done => {
      request(endpoint, mutations.updateUser, {name: "test"})
      .then(data => {assert.isUndefined(data)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Login");
        done();
      })
    })

    it('UpdateUser should update DB', async () => {
      const user = {name: "Tom", email: "tom@example.com", pwd: "passTom"};
      const oldUserId = await request(endpoint, mutations.register, user)
      .then(data => {
        assert.isObject(data.createUser);
        return data.createUser.id; // {id: ..., name: ..., ... }
      })
  
      const token = await request(endpoint, mutations.login, {email: user.email, pwd: user.pwd})
      .then(data => {
        assert.isString(data.login.token);
        return data.login.token
      })
  
      const client = new GraphQLClient(endpoint, {
        headers: {
          'x-token': token
        }
      });

      const newUser = {name: "Amy", email: "amy@example.com", pwd: "passAmy"};
      await client.request(mutations.updateUser, newUser)
      .then(data => {
        assert.isObject(data.updateUser);
        assert.strictEqual(data.updateUser.name, newUser.name);
        assert.strictEqual(data.updateUser.email, newUser.email);
        assert.strictEqual(data.updateUser.id, oldUserId);
      })
      // Check new password
      await request(endpoint, mutations.login, {email: newUser.email, pwd: newUser.pwd})
      .then(data => {
        assert.isString(data.login.token);
      })
      // Check DB data
      await db.users.findById(oldUserId)
      .then(user => {
        assert.isObject(user.toObject());
        assert.strictEqual(user.name, newUser.name);
        assert.strictEqual(user.email, newUser.email);
      })
    })
  })

  describe('Election mutation tests', () => {
    let _users = [
      {name: "Bob", email: "bob@example.com", pwd: "passBob"},
      {name: "Alice", email: "alice@example.com", pwd: "passAlice"}
    ];

    before(async () => {
      const hashes = await Promise.all(_users.map(user => getHash(user.pwd)))
      .then(hashes => hashes);
      const newUsers = _users.map((user, idx) => db.users({name: user.name, email: user.email, pwdHash: hashes[idx]}));
      await Promise.all(newUsers.map(newUser => newUser.save()));
      _users = await Promise.all(_users.map(async user => {
        const id = await db.users.findOne({email: user.email})
        .then(_user => _user._id.toString());
        const token = await request(endpoint, mutations.login, {email: user.email, pwd: user.pwd})
        .then(data => data.login.token);
        return {...user, id: id, token: token};
      }));
    })

    after(() => {
      cleanDB(db);
    })

    beforeEach(() => {
      cleanElections(db);
    })

    it('CreateElection should check login state', async () => {
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id)}
      await request(endpoint, mutations.createElection, newElection)
      .then(result => {assert.isUndefined(result)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Login");
      });
    })

    it('CreateElection should update DB', async () => {
      await db.elections.find({})
      .then(docs => {assert.lengthOf(docs, 0, "Election DB should be empty")});
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => {
        assert.isObject(data);
        assert.isObject(data.createElection);
        assert.isAbove(data.createElection.id.length, 1);
        expect(data.createElection).to.deep.include({title: newElection.title, body: newElection.body, open: newElection.open});
        expect(data.createElection.voters.map(voter => voter.id)).to.have.members(newElection.voters);
        assert.strictEqual(data.createElection.creator.id, _users[0].id);
        assert.lengthOf(data.createElection.ballots, 0);
        assert.lengthOf(data.createElection.voted, 0);
        return data.createElection.id;
      })
      await db.elections.findById(electionId)
      .then(found => {
        assert.isObject(found);
        expect(found).to.deep.include({title: newElection.title, body: newElection.body, open: newElection.open});
        expect(found.voters.map(voter => voter.toString())).to.have.members(newElection.voters);
        assert.lengthOf(found.voted, 0);
        assert.strictEqual(found.creator.toString(), _users[0].id);
      })
    })

    it('CreateElection should check unique title', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      
      await client.request(mutations.createElection, newElection)
      .then(res => res);
      await client.request(mutations.createElection, newElection)
      .then(res => assert.isUndefined(res))
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Title Already Exist");
      });
    })

    it('DeleteElection should check creator', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);
      const client2 = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[1].token}
      });
      await client2.request(mutations.deleteElection, {id: electionId})
      .then(res => assert.isUndefined(res))
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Creator");
      })
    })

    it('DeleteElection should check election existence', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      await client.request(mutations.deleteElection, {id: _users[0].id})
      .then(res => assert.isUndefined(res))
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Found");
      })
    })

    it('DeleteElection should update DB', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);
      await client.request(mutations.deleteElection, {id: electionId})
      .then(res => {
        assert.isObject(res);
        assert.strictEqual(res.deleteElection.toString(), electionId.toString());
      });
      await db.elections.findById(electionId)
      .then(found => {assert.isNull(found)});
    })

    it('UpdateElection should check creator', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);
      const client2 = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[1].token}
      });
      await client2.request(mutations.updateElection, {id: electionId, title: "HaHa"})
      .then(res => assert.isUndefined(res))
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Creator");
      })
    })

    it('UpdateElection should check election existence', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      await client.request(mutations.updateElection, {id: _users[0].id})
      .then(res => assert.isUndefined(res))
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Found");
      })
    })

    it('UpdateElection should check election not started except close', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
     
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);
      
      const found = await db.elections.findById(electionId)
      .then(found => {
        found.voted.push(_users[1].id) // Fake Ballot
        found.markModified('voted');
        return found;
      })
      await found.save();
      
      await client.request(mutations.updateElection, {id: electionId, title: "HaHa"})
      .then(res => {console.log(res); assert.isUndefined(res)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Started");
      })
      
      await client.request(mutations.updateElection, {id: electionId, open: false})
      .then(res => {assert.isNotNull(res)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err);
      })
    })

    it('UpdateElection should check unique title', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);
      await client.request(mutations.createElection, {...newElection, title: "HaHa"})
      .then(res => res);
      
      await client.request(mutations.updateElection, {id: electionId, title: "HaHa"})
      .then(res => assert.isUndefined(res))
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Title Already Exist");
      });
    })

    it('UpdateElection should update DB', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);

      await client.request(mutations.updateElection, {id: electionId, title: "HaHa", body: "LaLa", open: false, voters: [_users[1].id]})
      .then(res => {
        assert.isObject(res);
        assert.isObject(res.updateElection);
        assert.strictEqual(res.updateElection.title, "HaHa");
        assert.strictEqual(res.updateElection.body, "LaLa");
        assert.isFalse(res.updateElection.open);
        expect(res.updateElection.voters.map(voter => voter.id.toString())).to.have.members([_users[1].id.toString()])
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err)
      });

      await db.elections.findById(electionId)
      .then(found => {
        assert.isNotNull(found);
        assert.strictEqual(found.title, "HaHa");
        assert.strictEqual(found.body, "LaLa");
        assert.isFalse(found.open);
        expect(found.voters.map(id => id.toString())).to.have.members([_users[1].id.toString()]);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err);
      });
    })

    it('updateElection should close for started election', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      const newElection = {title: "Test election", body: "Hello world", open: true, voters: _users.map(user => user.id.toString())}
      
      const electionId = await client.request(mutations.createElection, newElection)
      .then(data => data.createElection.id);
      
      await db.elections.findById(electionId)
      .then(found => {
        found.voted.push(_users[1].id) // Fake Ballot
        found.markModified('voted');
        found.save();
      })

      await client.request(mutations.updateElection, {id: electionId, open: false})
      .then(res => {
        assert.isObject(res);
        assert.isObject(res.updateElection);
        assert.isFalse(res.updateElection.open);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err);
      });

      await db.elections.findById(electionId)
      .then(found => {
        assert.isNotNull(found);
        assert.isFalse(found.open);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err);
      });
    })


  })

  describe('Ballot mutation tests', () => {
    let _users = [
      {name: "Bob", email: "bob@example.com", pwd: "passBob"},
      {name: "Alice", email: "alice@example.com", pwd: "passAlice"}
    ];

    let _elections = [
      {title: "Open election", body: "Hello world", open: true},
      {title: "Closed election", body: "Hello world", open: false},
      {title: "User1 election", body: "Hello world", open: true}
    ]


    before(async () => {
      const hashes = await Promise.all(_users.map(user => getHash(user.pwd)))
      .then(hashes => hashes);
      const newUsers = _users.map((user, idx) => db.users({name: user.name, email: user.email, pwdHash: hashes[idx]}));
      
      await Promise.all(newUsers.map(newUser => newUser.save()));
      _users = await Promise.all(_users.map(async user => {
        const id = await db.users.findOne({email: user.email})
        .then(_user => _user._id);
        const token = await request(endpoint, mutations.login, {email: user.email, pwd: user.pwd})
        .then(data => data.login.token);
        return {...user, id: id, token: token};
      }));
      
      _elections[0].voters = _users.map(user => user.id.toString());
      _elections[1].voters = _users.map(user => user.id.toString());
      _elections[2].voters = [_users[1].id];
      _elections = _elections.map(election => { return {...election, creator: _users[0].id, voted: []}; });
      const newElections = _elections.map(election => db.elections(election));
      await Promise.all(newElections.map(newElection => {newElection.save()}));
      _elections = _elections.map((election, idx) => { return { ...election, id: newElections[idx]._id}; });
    })

    after(() => {
      cleanDB(db);
    })

    beforeEach(async () => {
      await cleanBallots(db);
      
      const found = await db.elections.find({})
      .then(found => {
        return found.filter(election => election.voted.length > 0)
      })

      await Promise.all(found.map(election => {
        election.voted = [];
        election.markModified('voted');
        return election.save();
      }))
    })

    it('CreateBallot should check login', async () => {
      await request(endpoint, mutations.createBallot, {electionId: _elections[0].id, choice: 1})
      .then(res => {assert.isNull(res)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Login");
      })
    })

    it('CreateBallot should check election exist', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      await client.request(mutations.createBallot, {electionId: _users[0].id, choice: 1})
      .then(res => {assert.isNull(res)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Found");
      })
    })

    it('CreateBallot should check election open', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      await client.request(mutations.createBallot, {electionId: _elections[1].id, choice: 1})
      .then(res => {assert.isNull(res)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not Open");
      })
    })

    it('CreateBallot should check user in voters list', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      await client.request(mutations.createBallot, {electionId: _elections[2].id, choice: 1})
      .then(res => { assert.isNull(res)})
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Not In Voters");
      })
    })

    it('CreateBallot should update DB', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      
      const ballotId = await client.request(mutations.createBallot, {electionId: _elections[0].id, choice: 1})
      .then(res => { 
        assert.isObject(res);
        assert.isObject(res.createBallot);
        assert.isAbove(res.createBallot.id.toString().length, 1);
        assert.strictEqual(res.createBallot.choice, 1);
        assert.isObject(res.createBallot.election)
        assert.strictEqual(res.createBallot.election.id.toString(), _elections[0].id.toString());
        return res.createBallot.id;
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isNull(err);
      })

      await db.ballots.findById(ballotId)
      .then(found => {
        assert.isNotNull(found);
        assert.strictEqual(found.election.toString(), _elections[0].id.toString());
        assert.strictEqual(found.choice, 1);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isNull(err);
      })
    })

    it('CreateBallot should update voted list', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });
      
      await db.elections.findById(_elections[0].id)
      .then(found => {
        assert.isNotNull(found);
        assert.lengthOf(found.voted, 0)
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isNull(err);
      })

      await client.request(mutations.createBallot, {electionId: _elections[0].id, choice: 1})
      .then(res => { 
        assert.isNotNull(res);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isNull(err);
      })

      await db.elections.findById(_elections[0].id)
      .then(found => {
        assert.isNotNull(found);
        assert.lengthOf(found.voted, 1);
        assert.strictEqual(found.voted[0].toString(), _users[0].id.toString());
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isNull(err);
      });
    })

    it('CreateBallot should check user not voted', async () => {
      const client = new GraphQLClient(endpoint, {
        headers: {'x-token': _users[0].token}
      });

      await db.elections.findById(_elections[0].id)
      .then(found => {
        assert.lengthOf(found.voted, 0);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err);
      })

      await client.request(mutations.createBallot, {electionId: _elections[0].id, choice: 1})
      .then(res => {
        assert.isObject(res);
        assert.isObject(res.createBallot);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isUndefined(err);
      })

      await client.request(mutations.createBallot, {electionId: _elections[0].id, choice: 2})
      .then(res => {
        assert.isNull(res);
      })
      .catch(err => {
        if(err.name === "AssertionError") throw err;
        assert.isObject(err.response);
        expect(err.response.errors[0].message).to.have.string("Already Voted");
      })
    })

  })
}

module.exports = mutationTests;
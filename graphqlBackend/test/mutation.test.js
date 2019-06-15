import {assert} from 'chai'
import { request, GraphQLClient } from 'graphql-request'
import { cleanUsers } from './util'
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
  describe('User related tests', () => {
    beforeEach(() => {
      cleanUsers(db);
    })

    after(() => {
      cleanUsers(db);
    })

    it('Create user should return info', done => {
      const user = {name: "Tom", email: "tom@example.com", pwd: "passTom"};
      request(endpoint, mutations.register, user)
      .then(data => {
        // data -> { createUser: {id: ..., name: ...}}
        assert.isObject(data.createUser);
        assert.isString(data.createUser.id);
        assert.strictEqual(data.createUser.name, user.name);
        assert.strictEqual(data.createUser.email, user.email);
        done();
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
        assert.isObject(err.response)
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
        assert.isObject(err.response);
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

}

module.exports = mutationTests;
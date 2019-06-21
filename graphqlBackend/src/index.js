import { GraphQLServer, PubSub } from 'graphql-yoga'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import db from './db'
import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation'
import Subscription from './resolvers/Subscription'
import User from './resolvers/User'
import Election from './resolvers/Election'
import Ballot from './resolvers/Ballot'

const pubsub = new PubSub()
require('dotenv').config();

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers: {
    Query,
    Mutation,
    Subscription,
    User,
    Election,
    Ballot
  },
  context: async req => {
    let token = null;
    if(req && req.request && req.request.headers) {
      token = req.request.headers["x-token"];
    }
    let me = null;
    if (token) {
      try {
        me = await jwt.verify(token, process.env.JWT_SECRET)
      }
      catch {
        me = null;
      }
    }
    return {
      me,
      db,
      pubsub,
      req: req.request
    }
  }
})

let corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true // <-- REQUIRED backend setting
};

server.express.use(cors(corsOptions));

server.start({ cors: {credentials: true, origin: false}, port: process.env.PORT | 4000 }, () => {
  console.log(`The server is up on port ${process.env.PORT | 4000}!`)
})
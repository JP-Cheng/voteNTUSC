import { GraphQLServer, PubSub } from 'graphql-yoga'
import mongoose from 'mongoose'
import session from 'express-session'
import cors from 'cors'
import db from './db'
import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation'
import Subscription from './resolvers/Subscription'
import User from './resolvers/User'
import Election from './resolvers/Election'
import Ballot from './resolvers/Ballot'

const MongoStorage = require('connect-mongo')(session);
const pubsub = new PubSub()

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
  context: req => ({
    db,
    pubsub,
    req: req.request
  })
})

let corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true // <-- REQUIRED backend setting
};

server.express.use(cors(corsOptions));
server.express.use(session({
    store: new MongoStorage({mongooseConnection: mongoose.connection}),
    secret: `this_is_my_secret_for_this_express-session`,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60*60*1000 }
}))

server.start({ cors: {credentials: true, origin: false}, port: process.env.PORT | 4000 }, () => {
  console.log(`The server is up on port ${process.env.PORT | 4000}!`)
})

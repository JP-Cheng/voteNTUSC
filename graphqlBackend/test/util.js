import bcrypt from 'bcrypt'

const cleanUsers = db => {
  db.users.deleteMany({}).exec();
}

const cleanBallots = db => {
  db.ballots.deleteMany({}).exec();
}

const cleanElections = db => {
  db.elections.find({}).deleteMany({}).exec();
}

const cleanDB = db => {
  cleanUsers(db);
  cleanBallots(db);
  cleanElections(db);
}

const getHash = async data => {
  return await bcrypt.hash(data, 10)
  .then(hashed => hashed)
  .catch(err => {throw err});
}

export {cleanDB, cleanUsers, cleanBallots, cleanElections, getHash};
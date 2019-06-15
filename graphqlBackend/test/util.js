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

export {cleanDB, cleanUsers, cleanBallots, cleanElections};
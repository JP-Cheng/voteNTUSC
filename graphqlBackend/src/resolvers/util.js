const findUser = async (db, id) => {
  if(!id) throw new Error("FindUser Error: ID Is Missing");
  return await db.users.findById(id)
  .then(userResponse => {
    if(!userResponse) throw new Error('User not found');
    else return userResponse;
  }).catch(err => {throw err});
};

const findElection = async (db, id) => {
  if(!id) throw new Error("FindElection Error: ID Is Missing");
  return await db.elections.findById(id)
  .then(_election => {
    if(!_election) throw new Error('Election not found');
    else return _election;
  })
  .catch(err => {throw err});
}

const _deleteBallot = async (id, db, pubsub=null) => {
  if(!id) throw new Error("DeleteBallot Error: ID Is Missing");
  const deletedBallot = await db.ballots.findByIdAndDelete(id)
  .then(_ballot => {
    if(!_ballot) throw new Error("DeleteBallot Error: Ballot Not Found");
    else return _ballot;
  })
  .catch(err => {throw err;});
  if(pubsub){
    pubsub.publish(`ballot of ${deletedBallot.election}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedBallot
      }
    })
  }
  return deletedBallot;
}

const _deleteElection = async (id, db, pubsub) => {
  if(!id) throw new Error("DeleteElection Error: ID Is Missing");
  const election = await db.elections.findByIdAndDelete(id)
  .then(_election => {
    if(!_election) throw new Error("Election not found.");
    else return _election;
  })
  .catch(err => {throw err});
  const electionBallots = await db.ballots.find({election: election.id})
  .then(ballots => ballots)
  .catch(err => {throw err});
  await electionBallots.map(ballot => _deleteBallot(ballot._id, db));

  pubsub.publish('election', {
    elections: {
      mutation: 'DELETED',
      electionId: id,
      data: null
    }
  })

  return id;
}

export { findUser, findElection, _deleteBallot, _deleteElection };
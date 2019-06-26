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
    if(!_election) throw new Error('FindElection Error: Election Not Found');
    else return _election;
  })
  .catch(err => {throw err});
}

const findTwoStageElection = async (db, id) => {
  if(!id) throw new Error("FindTwoStageElection Error: ID Is Missing");
  return await db.twoStageElections.findById(id)
  .then(_election => {
    if(!_election) throw new Error('FindTwoStageElection Error: Election Not Found');
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

  return deletedBallot;
}

const _deleteCommitment = async (id, db, pubsub=null) => {
  if(!id) throw new Error("DeleteCommitment Error: ID Is Missing");
  const deletedCommitment = await db.commitments.findByIdAndDelete(id)
  .then(_commitment => {
    if(!_commitment) throw new Error("DeleteCommitment Error: Commitment Not Found");
    else return _commitment;
  })
  .catch(err => {throw err;});

  return deletedCommitment;
}

const _deleteOpening = async (id, db, pubsub=null) => {
  if(!id) throw new Error("DeleteOpening Error: ID Is Missing");
  const deletedOpening = await db.openings.findByIdAndDelete(id)
  .then(_opening => {
    if(!_opening) throw new Error("DeleteOpening Error: Opening Not Found");
    else return _opening;
  })
  .catch(err => {throw err;});
  
  return deletedOpening;
}

const _deleteElection = async (id, db, pubsub) => {
  await db.elections.findByIdAndDelete(id)
  .then(_election => {
    if(!_election) throw new Error("DeleteElection Error: Election not found.");
    else return _election;
  })
  .catch(err => {throw err});
  const electionBallots = await db.ballots.find({election: id})
  .then(ballots => ballots)
  .catch(err => {throw err});
  await electionBallots.map(ballot => _deleteBallot(ballot._id, db));

  pubsub.publish('allElections', {
    allElections: {
      mutation: 'DELETED',
      type: "simpleElection",
      electionId: id,
      simpleElection: null
    }
  })

  pubsub.publish(`election ${id}`, {
    election: {
      mutation: 'DELETED',
    }
  })

  return id;
}

const _deleteTwoStageElection = async (id, db, pubsub) => {
  await db.twoStageElections.findByIdAndDelete(id)
  .then(_election => {
    if(!_election) throw new Error("DeleteTwoStageElection Error: Election not found.");
    else return _election;
  })
  .catch(err => {throw err});
  
  const electionBallots = await db.ballots.find({election: id})
  .then(ballots => ballots)
  .catch(err => {throw err});
  await electionBallots.map(ballot => _deleteBallot(ballot._id, db));

  const electionCommitments = await db.commitments.find({election: id})
  .then(commitments => commitments)
  .catch(err => {throw err});
  await electionCommitments.map(commitment => _deleteCommitment(commitment._id, db));

  const electionOpenings = await db.openings.find({election: id})
  .then(openings => openings)
  .catch(err => {throw err});
  await electionOpenings.map(opening => _deleteOpening(opening._id, db));

  
  pubsub.publish('allElections', {
    allElections: {
      mutation: 'DELETED',
      type: "twoStageElection",
      electionId: id
    }
  })

  pubsub.publish(`twoStageElection ${id}`, {
    twoStageElection: {
      mutation: 'DELETED'
    }
  })
  
  return id;
}

export { findUser, findElection, findTwoStageElection, _deleteBallot, _deleteCommitment, _deleteOpening, _deleteElection, _deleteTwoStageElection };
const Commitment = {
  id(parent, args, {}, info) {
    if(!parent._id) throw new Error("CommitmentResolver Error: _id Not Found");
    return parent._id;
  },
  async election(parent, args, { db }, info) {
    if(!parent.election) throw new Error("CommitmentResolver Error: electionId Not Found");
    return await db.twoStageElections.findById(parent.election)
    .then(election => {
      if(!election) throw new Error("CommitmentResolver Error: twoStageElection Not Found");
      else return election.toObject();
    })
    .catch(err => {throw err});
  }
}

export { Commitment as default }
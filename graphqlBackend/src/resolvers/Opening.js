const Opening = {
  id(parent, args, {}, info) {
    if(!parent._id) throw new Error("OpeningResolver Error: _id Not Found");
    return parent._id;
  },
  async election(parent, args, { db }, info) {
    if(!parent.election) throw new Error("OpeningResolver Error: electionId Not Found");
    return await db.twoStageElections.findById(parent.election)
    .then(election => {
      if(!election) throw new Error("OpeningResolver Error: twoStageElection Not Found");
      else return election;
    })
    .catch(err => {throw err});
  }
}

export { Opening as default }

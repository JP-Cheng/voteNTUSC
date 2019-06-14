const Ballot = {
  id(parent, args, {}, info) {
    if(!parent._id) throw new Error("BallotResolver Error: _id Not Found");
    return parent._id;
  }
}

export { Ballot as default }

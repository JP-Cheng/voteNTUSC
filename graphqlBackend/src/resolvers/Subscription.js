const Subscription = {
  election: {
    async subscribe(parent, { electionId }, { db, pubsub }, info) {
      await db.elections.findById(electionId)
      .then(election => {
        if(!election) throw new Error("SubscribeElection Error: Election Not Found");
        else return election;
      })
      .catch(err => {throw err});
      return pubsub.asyncIterator(`election ${electionId}`)
    }
  },
  twoStageElection: {
    async subscribe(parent, { electionId }, { db, pubsub }, info) {
      await db.twoStageElections.findById(electionId)
      .then(election => {
        if(!election) throw new Error("SubscribeTwoStageElection Error: Election Not Found");
        else return election;
      })
      .catch(err => {throw err});
      return pubsub.asyncIterator(`twoStageElection ${electionId}`)
    }
  },
  allElections: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('allElections')
    }
  }
}

export { Subscription as default }
const Subscription = {
  ballots: {
    async subscribe(parent, { electionId }, { db, pubsub }, info) {
      await db.elections.findById(electionId)
      .then(election => {
          if(!election) throw new Error("election not found")
      })
      .catch(err => {throw err;});

      return pubsub.asyncIterator(`ballot ${electionId}`)
    }
  },
  elections: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('election')
    }
  }
}

export { Subscription as default }

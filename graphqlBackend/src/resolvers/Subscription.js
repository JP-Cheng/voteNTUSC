const Subscription = {
  ballots: {
    async subscribe(parent, { electionId }, { db, pubsub }, info) {
      const election = await db.elections.findById(electionId)
      .then(election => election )
      .catch(err => {throw err});

      if(!election) {
        await db.twoStageElections.findById(electionId)
        .then(election => {
          if(!election) throw new Error("BallotsSbscription Error: Election Not Found");
        })
        .catch(err => {throw err});
      }

      return pubsub.asyncIterator(`ballot ${electionId}`)
    }
  },
  commitments: {
    async subscribe(parent, { electionId }, { db, pubsub }, info) {
      await db.elections.findById(electionId)
      .then(election => {
          if(!election) throw new Error("election not found")
      })
      .catch(err => {throw err});

      return pubsub.asyncIterator(`commitment ${electionId}`)
    }
  },
  openings: {
    async subscribe(parent, { electionId }, { db, pubsub }, info) {
      await db.elections.findById(electionId)
      .then(election => {
          if(!election) throw new Error("election not found")
      })
      .catch(err => {throw err});

      return pubsub.asyncIterator(`opening ${electionId}`)
    }
  },
  elections: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('election')
    }
  },
  twoStageElections: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('twoStageElection')
    }
  }
}

export { Subscription as default }

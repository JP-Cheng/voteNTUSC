const Subscription = {
  comment: {
    async subscribe(parent, { postId }, { db, pubsub }, info) {
      await db.posts.findOne({_id: postId, published: true})
      .then(post => {
          if(!post) throw new Error("Post not found");
      })
      .catch(err => {throw err;});

      return pubsub.asyncIterator(`comment ${postId}`)
    }
  },
  post: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('post')
    }
  }
}

export { Subscription as default }

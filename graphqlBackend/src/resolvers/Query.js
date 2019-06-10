const Query = {
  async users(parent, args, { db }, info) {
    const _str = new RegExp(args.query, 'i');
    console.log("Looking for users:", _str);
    // Exec case insensitive LIKE query
    let result = await db.users.find({name: _str})
    .then(docs => docs)
    .catch(err => {throw err;});
    if(result) {
      result = await result.map(user => {
        user.pwdHash = null;
        return user;
      })
    }
    return result;
  },
  async posts(parent, args, { db }, info) {
    const _str = new RegExp(args.query, 'i');
    console.log("Looking for posts:", _str);
    if (!args.query) {
      // return all posts
      return await db.posts.find({})
      .then(docs => {return docs;})
      .catch(err => {throw err});
    }
    // Exec case insensitive LIKE query
    return await db.posts.find({ $or: [{title: _str}, {body: _str}]})
    .then(docs => {return docs;})
    .catch(err => {throw err});
  },
  async comments(parent, args, { db }, info) {
    return await db.comments.find({})
    .then(docs => docs)
    .catch(err => {throw err});
  },
  async me(parent, args, { db, req }) {
    console.log("Querying me...", req.session.uid);
    if(typeof req.session.uid === 'undefined') return null;
    const user = await db.users.findById(req.session.uid)
    .then(_user => {
      if(!_user) throw new Error("Query me error, No user found.");
      else return _user;
    })
    .catch(err => {throw err;});
    user.pwdHash = null;
    return user;
  },
  post() {  // Not sure what is this
    return {
      id: '092',
      title: 'GraphQL 101',
      body: '',
      published: false
    }
  }
}

export { Query as default }

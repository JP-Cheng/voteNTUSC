const errHandler = err => console.error("DB error! [", err.name, ']', err.message);

const Post = {
  async author(parent, args, { db }, info) {
    return await db.users.findById(parent.author, (err, _author) => {
      if(err) errHandler(err);
      else return _author;
    });
  },
  async comments(parent, args, { db }, info) {
    return await db.comments.find({post: parent.id}, (err, _comments) => {
        if(err) errHandler(err);
        else return _comments;
    });
  }
}

export { Post as default }

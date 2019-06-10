const errHandler = err => console.error("DB error! [", err.name, ']', err.message);

const User = {
  async posts(parent, args, { db }, info) {
    return await db.posts.find({author: parent.id}, (err, _posts) => {
        if(err) errHandler(err);
        else return _posts;
    });
  },
  async comments(parent, args, { db }, info) {
    return await db.comments.find({author: parent.id}, (err, _comments) => {
        if(err) errHandler(err);
        else return _comments;
    });
  }
}

export { User as default }

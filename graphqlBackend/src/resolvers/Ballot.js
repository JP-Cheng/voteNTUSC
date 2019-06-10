const errHandler = err => console.error("DB error! [", err.name, ']', err.message);

const Comment = {
  async author(parent, args, { db }, info) {
    return await db.users.findById(parent.author, (err, _author) => {
        if(err) errHandler(err);
        else return _author;
    });
  },
  async post(parent, args, { db }, info) {
    return await db.posts.findById(parent.post, (err, _posts) => {
        if(err) errHandler(err);
        else return _posts;
    });
  }
}

export { Comment as default }

import bcrypt from 'bcrypt'

/*********
 * Utils *
 *********/
const findUser = async (db, id) => {
  return await db.users.findById(id)
  .then(userResponse => {
    if(!userResponse) throw new Error('User not found');
    else return userResponse;
  }).catch(err => {throw err;});
}

const findPost = async (db, id) => {
  return await db.posts.findById(id)
  .then(postResponse => {
    if(!postResponse) throw new Error('Post not found');
    else return postResponse;
  })
  .catch(err => {throw err;});
}

const _deleteComment = async (id, db, pubsub=null) => {
  const deletedComment = await db.comments.findByIdAndDelete(id)
  .then(_comment => {
    if(!_comment) throw new Error("Comment not found.");
    else return _comment;
  })
  .catch(err => {throw err;});
  if(pubsub){
    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment
      }
    })
  }
  return deletedComment
}

const _deletePost = async (id, db, pubsub) => {
  const post = await db.posts.findByIdAndDelete(id)
  .then(_post => {
    if(!_post) throw new Error("Post not found.");
    else return _post;
  })
  .catch(err => {throw err;});
  post.comments.map(comment => _deleteComment(comment._id, db));
  if (post.published) {
    pubsub.publish('post', {
      post: {
        mutation: 'DELETED',
        data: post
      }
    })
  }
  return post
}

/*************
 * Mutations *
 *************/

const Mutation = {
  async createUser(parent, args, { db }, info) {
    const user = {
      ...args.data,
      posts: [],
      comments: []
    };
    const pwd = user.pwd;
    delete user.pwd;
    await db.users.findOne({email: args.data.email})
    .then(userResponse => {
      if(userResponse) throw new Error('Email taken!');
    }).catch(err => {
      throw err;
    })
    await bcrypt.hash(pwd, 10).then(_pwdHash => {
      user.pwdHash = _pwdHash;
    }).catch(err => hashErrHandler(err));

    const newUser = db.users(user);
    await newUser.save()
    .then(_ => {console.log("User created:", user);})
    .catch(err => {throw err});
    return {...user, pwdHash: null};
  },
  async deleteUser(parent, args, { db, pubsub, req }, info) {
    if(typeof req.session.uid !== 'string') throw new Error("Not login error.");
    const deletedUser = await db.users.findOneAndDelete({_id: req.session.uid})
    .then(_user => {
      if(!_user) throw new Error("User not found.");
      else return _user;
    })
    .catch(err => {throw err});
    // Delete user comments
    await Promise.all(deletedUser.comments.map(comment => _deleteComment(comment._id, db)));
    // Delete user posts
    deletedUser.posts.map(post => _deletePost(post._id, db, pubsub));
    // Logout
    req.session.destroy();
    deletedUser.pwdHash = null;
    return deletedUser;
  },
  async updateUser(parent, args, { db }, info) {
    const { id, data } = args
    const user = await findUser(db, id);

    if (typeof data.name === 'string') {
      user.name = data.name
    }

    user.email = await new Promise(resolve => {
      if(typeof data.email === 'string') {
        db.users.findOne({email: data.email}, (err, found) => {
          if(err) errHandler(err);
          else if(found) throw new Error("Email taken.");
          else resolve(data.email);
        });
      }
      else resolve(user.email);
    });

    user.pwdHash = await new Promise(resolve => {
      if(typeof data.pwd !== 'string') {
        resolve(user.pwdHash);
      }
      bcrypt.hash(data.pwd, 10, (err, _newHash) => {
        if(err) hashErrHandler(err);
        else resolve(_newHash);
      })
    })

    if (typeof data.age !== 'undefined') {
      user.age = data.age
    }
    console.log("Updating user:", user);
    await user.save();
    user.pwdHash = null;
    return user;
  },
  async createPost(parent, args, { db, pubsub, req }, info) {
    console.log("Creating post...")
    if(!req.session.uid) return null;
    const author = await findUser(db, req.session.uid);
    const newPost = db.posts({ ...args.data, author: author._id, likes: [] });
    const post = await newPost.save().then(_ => {
      console.log("Post created", newPost);
      return newPost; 
    })
    .catch(err => {throw err;});
    author.posts.push(post._id);
    await author.save()
    .catch(err => {throw err;});
    post.author = author;
    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post
        }
      })
    }

    return post
  },
  deletePost(parent, args, { db, pubsub }, info) {
    return _deletePost(args.id, db, pubsub);
  },
  async updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const post = await findPost(db, id);
    const originalPost = { ...post };

    if (typeof data.title === 'string') {
      post.title = data.title
    }

    if (typeof data.body === 'string') {
      post.body = data.body
    }

    if (typeof data.published === 'boolean') {
      post.published = data.published

      if (originalPost.published && !post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost
          }
        })
      } else if (!originalPost.published && post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post
          }
        })
      }
    } else if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      })
    }
    await post.save();
    return post
  },
  async createComment(parent, args, { db, pubsub, req }, info) {
    if(typeof req.session.uid !== 'string') throw new Error("Not login error");
    await findUser(db, req.session.uid);
    const post = await findPost(db, args.data.post);

    if (!post.published) {
      throw new Error('Post is not publish!');
    }

    const newComment = db.comments(args.data);
    await newComment.save(err => {
      if(err) errHandler(err);
      else console.log("Comment created:", newComment);
    })
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: newComment
      }
    })

    return newComment;
  },
  deleteComment(parent, args, { db, pubsub }, info) {
    return _deleteComment(args.id, db, pubsub);
  },
  async updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const comment = await db.comments.findById(id, (err, found) => {
      if(err) errHandler(err);
      else if(!found) throw new Error("Comment not found.");
      else return found;
    });

    if (typeof data.text === 'string') {
      comment.text = data.text
    }
    await comment.save();
    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment
      }
    })
    return comment
  },
  async login(parent, args, { db, pubsub, req}, info) {
    const user = await db.users.findOne({email: args.email})
    .then(_user => {
      if(!_user) throw new Error("Invalid email");
      else return _user;
    })
    .catch(err => {throw err});
    return await bcrypt.compare(args.pwd, user.pwdHash)
    .then(same => {
      if(!same) throw new Error("Invalid password!");
      req.session.uid = user._id;
      console.log("User logged in:", user.name);
      user.pwdHash = null;
      return user;
    })
    .catch(err => err);
  },
  logout(parent, args, { req }, info) {
    const isLogin = typeof req.session.uid !== 'undefined';
    if(isLogin) {
      console.log("User logged out", req.session.uid); 
      req.session.uid = null;
      req.session.destroy();
    }
    return isLogin;
  },
  async like(parent, args, { db, pubsub, req }, info) {
    if(!req.session.uid) return false;
    const post = await db.posts.findById(args.postId)
    .then(_post => {
      if(!_post) throw new Error("No post found!");
      else return _post;
    })
    .catch(err => {throw err;});
    const likedIdx = await post.likes.findIndex(_uid => String(_uid) === String(req.session.uid));
    if(likedIdx !== -1) post.likes.splice(likedIdx, 1);
    else post.likes.push(req.session.uid);
    await post.save()
    .catch(err => {throw err;});
    if(post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      })
    }
    return true;
  }
}

export { Mutation as default }

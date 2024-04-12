const PostModel = require('../models/PostModel');
const CommentModel = require('../models/CommentModel');
const UserModel = require('../models/CommentModel');


//PRE-ENLISTMENT
exports.createPreEnlistPost = (req, res) => {
  const newPost = new PostModel({
    ...req.body,
    username: req.user.username,
    profilePicture: req.user.profilePicture
  });
  newPost
    .save()
    .then(() => res.redirect("/pre-enlist"))
    .catch((err) => res.status(400).send("Unable to save to database"));
};

exports.getPreEnlistPosts = (req, res) => {
  PostModel.find({ postTag: "Pre-Enlistment" })
    .then((posts) => res.render("pre-enlist", { posts: posts, user: req.user }))
    .catch((err) => res.status(500).send("Error getting posts"));
};

//ENLISTMENT
exports.createEnlistPost = (req, res) => {
  const newPost = new PostModel({
    ...req.body,
    username: req.user.username,
    profilePicture: req.user.profilePicture
  });
  newPost
    .save()
    .then(() => res.redirect("/enlistment"))
    .catch((err) => res.status(400).send("Unable to save to database"));
};

exports.getEnlistPosts = (req, res) => {
  PostModel.find({ postTag: "Enlistment" })
    .then((posts) => res.render("enlistment", { posts: posts, user: req.user }))
    .catch((err) => res.status(500).send("Error getting posts"));
};

//STUDENT CONCERNS
exports.createConcernPost = (req, res) => {
  const newPost = new PostModel({
    ...req.body,
    username: req.user.username,
    profilePicture: req.user.profilePicture
  });
  newPost
    .save()
    .then(() => res.redirect("/student-concerns"))
    .catch((err) => res.status(400).send("Unable to save to database"));
};

exports.getConcernPosts = (req, res) => {
  PostModel.find({ postTag: "Student Concerns" })
    .then((posts) => res.render("student-concerns", { posts: posts, user: req.user }))
    .catch((err) => res.status(500).send("Error getting posts"));
};

// Get Search
exports.searchPosts = (req, res) => {
  const searchTerm = req.query.search; // Assuming the search term is sent as a query parameter

  if (!searchTerm) {
    return res.status(400).send('Search term is missing');
  }

  PostModel.find({ postTitle: { $regex: searchTerm, $options: 'i' } })
    .then((posts) => {
      res.render("search", { posts: posts, searchTerm: searchTerm, user: req.user });
    })
    .catch((err) => {
      console.error('Error searching posts:', err);
      res.status(500).send("Error searching posts");
    });
};

// View Specific Post
exports.getPostById = (req, res) => {
  PostModel.findById(req.params.id)
      .populate({
          path: 'comments',
          options: { sort: { 'createdAt': -1 } } // Sort comments by creation date in descending order
      })
      .then(post => {
          const userIsAuthor = req.user && req.user.username === post.username;
          const comments = post.comments.map(comment => ({
              ...comment._doc,
              userIsAuthor: req.user && req.user.username === comment.username
          }));
          res.render("post", { post: {...post._doc, comments}, user: req.user, userIsAuthor });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send("Error getting post");
      });
};

// Add Comments
exports.addComment = (req, res) => {
  // Create a new Comment
  const newComment = new CommentModel({
    username: req.user.username,
    profilePicture: req.user.profilePicture,
    text: req.body.text, // Make sure req.body.text is defined
  });

  newComment
    .save()
    .then((comment) => {
      // Find the Post by ID and add the Comment's ObjectId to the Post's comments array
      return PostModel.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: comment._id } },
        { new: true },
      );
    })
    .then((post) => {
      // Send the updated Post and the new Comment's ID as the response
      res.json({ post: post, commentId: newComment._id });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error adding comment");
    });
};

// EDIT POST
exports.getEditPost = (req, res) => {
  PostModel.findById(req.params.id)
      .then(post => {
          if (post.username === req.user.username) {
              res.render('edit-post', { post: post });
          } else {
              res.redirect('/');
          }
      })
      .catch(err => res.status(500).send("Error getting post"));
};

exports.postEditPost = (req, res) => {
  const { postTitle, postContent } = req.body;
  PostModel.findById(req.params.id)
      .then(post => {
          if (post.username === req.user.username) {
              return PostModel.findByIdAndUpdate(req.params.id, { postTitle, postContent });
          } else {
              res.redirect('/');
          }
      })
      .then(() => res.redirect(`/post/${req.params.id}`))
      .catch(err => res.status(500).send("Error updating post"));
};

// DELETE POST
exports.deletePost = (req, res) => {
  UserModel.findById(req.user._id)
    .then(user => {
      if (user.role === 'admin') {
        return PostModel.findByIdAndDelete(req.params.id);
      } else {
        return PostModel.findById(req.params.id)
          .then(post => {
            if (post.username === req.user.username) {
              return PostModel.findByIdAndDelete(req.params.id);
            } else {
              res.redirect('/');
            }
          });
      }
    })
    .then(() => res.redirect('/'))
    .catch(err => res.status(500).send("Error deleting post"));
};

// EDIT COMMENT
exports.getEditComment = (req, res) => {
  CommentModel.findById(req.params.commentId)
      .then(comment => {
          if (comment.username === req.user.username) {
              res.render('edit-comment', { comment: comment, postId: req.params.postId, commentId: req.params.commentId });
          } else {
              res.redirect(`/post/${req.params.postId}`);
          }
      })
      .catch(err => res.status(500).send("Error getting comment"));
};

exports.postEditComment = (req, res) => {
  const { text } = req.body;
  CommentModel.findById(req.params.commentId)
      .then(comment => {
          if (comment.username === req.user.username) {
              return CommentModel.findByIdAndUpdate(req.params.commentId, { text });
          } else {
              res.redirect(`/post/${req.params.postId}`);
          }
      })
      .then(() => res.redirect(`/post/${req.params.postId}`))
      .catch(err => res.status(500).send("Error updating comment"));
};

// DELETE COMMENT
exports.deleteComment = (req, res) => {
  CommentModel.findById(req.params.commentId)
      .then(comment => {
          if (comment.username === req.user.username) {
              return CommentModel.findByIdAndDelete(req.params.commentId);
          } else {
              res.status(403).send("You do not have permission to delete this comment");
          }
      })
      .then(() => {
          return PostModel.updateOne(
            { _id: req.params.postId },
            { $pull: { comments: req.params.commentId } }
          );
      })
      .then(() => res.redirect(`/post/${req.params.postId}`))
      .catch(err => {
          console.error(err);
          res.status(500).send("Error deleting comment");
      });
};

//  GET USER'S CREATED POST & COMMENTS FOR PROFILE PAGE
exports.getUserPostsAndComments = (req, res) => {
  const username = req.user.username;

  // Fetch user's posts
  PostModel.find({ username })
      .populate('comments')
      .then(userPosts => {

          CommentModel.find({ username })
              .then(userComments => {
                  res.render('profile', { userPosts, userComments, user: req.user });
              })
              .catch(err => {
                  console.error('Error fetching user comments:', err);
                  res.status(500).send('Error fetching user comments');
              });
      })
      .catch(err => {
          console.error('Error fetching user posts:', err);
          res.status(500).send('Error fetching user posts');
      });
};

//  UPVOTE / DOWNVOTE
exports.vote = async (req, res) => {
  try {
    const { id, type } = req.body;
    const userId = req.user.id; // Assuming you have a user object attached to the request

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already voted on this post
    const existingVoteIndex = post.votes.findIndex(vote => vote.user.toString() === userId);
    if (existingVoteIndex !== -1) {
      // If user has already voted, remove the existing vote
      if (type === 'downvote' && post.votes[existingVoteIndex].type === 'upvote') {
        // If user wants to downvote and has already upvoted, decrement upvotes
        post.upvotes--;
      } else if (type === 'upvote' && post.votes[existingVoteIndex].type === 'downvote') {
        // If user wants to upvote and has already downvoted, decrement downvotes
        post.downvotes--;
      }
      post.votes.splice(existingVoteIndex, 1); // Remove the existing vote
    } else {
      // If user has not voted yet, add the new vote
      if (type === 'upvote') {
        post.upvotes++;
      } else if (type === 'downvote') {
        post.downvotes++;
      } else {
        return res.status(400).json({ error: 'Invalid vote type' });
      }
      // Save the user's vote
      post.votes.push({ user: userId, type });
    }

    await post.save();

    res.json({ message: 'Vote counted successfully', upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const Post = require("../models/postModel");
const User = require("../models/userModel");
const { createNotification } = require("./notificationController");
//Create a new post
// exports.createPost = async (req, res) => {
//   const { description, type } = req.body;

//   const imageURL = req.file ? req.file.filename : "";

//   const { book, rating } = req.body;

//   try {
//     const newPostData = {
//       userId: req.user.id,
//       type,
//       imageURL,
//       description,
//     };

//     if (book) {
//       newPostData.book = book;
//     }

//     if (rating) {
//       newPostData.rating = rating;
//     }

//     const newPost = new Post(newPostData);

//     const savedPost = await newPost.save();

//     const postingUser = await User.findById(req.user.id).select('name followers');
//     //const userFollowers = await User.findById(req.user.id).select('followers');
//     const userName = postingUser.name;
//     const followersIds = postingUser.followers;

//     for (const followerId of followersIds) {
//       try {
//         await createNotification(req.user.id, followerId, 'new_post', `${userName} has posted a new post`);
//         console.log(`Notification sent to followerId: ${followerId}`);
//       } catch (notificationError) {
//         console.error(`Failed to send notification to followerId: ${followerId}`, notificationError);
//       }
//     }

//     // const notifications = followersIds.map(followerId =>
//     //   createNotification(req.user.id, followerId, 'new_post', 'A user you follow has posted a new post')
//     // );
//     // await Promise.all(notifications);

//     res.status(201).json(savedPost);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

exports.createPost = async (req, res) => {
  const { description, type, book, rating } = req.body;
  const imageURL = req.file ? req.file.filename : "";

  try {
    // Debugging: Log the user information
    console.log("Authenticated user:", req.user);

    // Ensure req.user.id is available
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User not authenticated" });
    }
    const newPostData = {
      userId: req.user.id,
      type,
      imageURL,
      description,
    };

    if (book) {
      newPostData.book = book;
    }

    if (rating) {
      newPostData.rating = rating;
    }

    const newPost = new Post(newPostData);
    const savedPost = await newPost.save();

    // Add the post ID to the user's posts array
    const postingUser = await User.findById(req.user.id).select(
      "name followers posts"
    );
    postingUser.posts.push(savedPost._id);
    await postingUser.save();

    const userName = postingUser.name;
    const followersIds = postingUser.followers;

    for (const followerId of followersIds) {
      try {
        await createNotification(
          req.user.id,
          followerId,
          "new_post",
          `${userName} has posted a new post`
        );
        console.log(`Notification sent to followerId: ${followerId}`);
      } catch (notificationError) {
        console.error(
          `Failed to send notification to followerId: ${followerId}`,
          notificationError
        );
      }
    }

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get ALl posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate(["likes", "userId", "comments"])
      .populate({
        path: "comments",
        populate: { path: "userId" },
      });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get 20 posts for page (pagination)
exports.getTwentyPostForPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(["likes", "userId", "comments"])
      .populate({
        path: "comments",
        populate: { path: "userId" },
      });

   // number of posts
    const totalPosts = await Post.countDocuments();

    // number of pages
    const totalPages = Math.ceil(totalPosts / limit);
    res.status(200).json({
      posts,
      totalPages,
      currentPage: page,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// get certain post by id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate([
      { path: "comments", populate: [{ path: "userId" }] },
      "likes",
      "userId",
    ]);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id }).populate([
      { path: "comments", populate: [{ path: "userId" }] },
      "likes",
      "userId",
    ]);
    if (!posts) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updatePost = async (req, res) => {
  try {
    const { description } = req.body;
    let photo = "";
    if (req.file != undefined) {
      photo = req.file.filename;
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { description, photo },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update a post
exports.updatePost = async (req, res) => {
  const { userId, description, type, book, rating } = req.body;
  const imageURL = req.file ? req.file.filename : "";

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { userId, description, type, imageURL, book, rating },
      { new: true }
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes.includes(req.params.userId)) {
      post.likes.push(req.params.userId);
      await post.save();

      // Fetch the user's details
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      console.log("Sender ID:", req.params.userId);
      console.log("Receiver ID (Post Owner):", post.userId);

      // await createNotification(req.params.userId, post.userId, 'like', `${user.name} liked your post`);

      if (req.params.userId !== post.userId.toString()) {
        await createNotification(
          req.params.userId,
          post.userId,
          "like",
          `${user.name} liked your post`
        );
      }
      res.status(200).json({ message: "Post liked" });
    } else {
      res.status(400).json({ message: "User already liked this post" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// dislike a post
// exports.dislikePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     post.likes = post.likes.filter((userId) => userId !== req.params.userId);
//     await post.save();
//     res.status(200).json({ message: "Post disliked" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.dislikePost = async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already disliked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: "User has not liked this post" });
    }

    // Filter out the user ID from the likes array
    post.likes = post.likes.filter((id) => id.toString() !== userId);

    // Save the updated post
    await post.save();

    // Respond with a success message
    res.status(200).json({ message: "Post disliked successfully" });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ message: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Add the post to the user's posts array if it's not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const savingUser = await User.findById(userId);
    if (!savingUser) return res.status(404).json({ message: "User not found" });
    // await createNotification(userId, post.userId, 'save', `${savingUser.name} saved your post`);
    if (userId !== post.userId.toString()) {
      await createNotification(
        userId,
        post.userId,
        "save",
        `${savingUser.name} saved your post`
      );
    }
    res
      .status(200)
      .json({ message: "Post added to user's posts.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unSavePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required." });
    }

    // Remove the post from the user's favorite posts array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "Post removed from favorites.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//get 20 posts for page (pagination)
exports.getTwentyPostForPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      // .skip(skip)
      .limit(limit * page)
      .populate(["likes", "userId", "comments"])
      .populate({
        path: "comments",
        populate: { path: "userId" },
      });

    // number of posts
    const totalPosts = await Post.countDocuments();

    // number of pages
    const totalPages = Math.ceil(totalPosts / limit);
    res.status(200).json({
      posts,
      totalPages,
      currentPage: page,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

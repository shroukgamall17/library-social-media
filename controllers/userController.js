const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let { promisify } = require("util");

const User = require("../models/userModel");

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { createNotification } = require("./notificationController");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate(["favouriteBooks", "posts"])
      .sort({ createdAt: -1 })
      .select(["-password", "-confirmPassword"]);
    res.status(201).json({
      message: "Successfully fetched all the users",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const registerNewUser = async (req, res) => {
//   try {
//     const files = req.file;
//     let photo = '';

//     if (files) {
//       photo = files.filename;
//     }

//     const { name, email, password, confirmPassword,role } = req.body;
//       // Ensure all required fields are provided
//   if (!name || !email || !password || !confirmPassword ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//     const oldUser = await userModel.findOne({ email });
//     if (oldUser) {
//       return res.status(409).json("email already exist");
//     }
//     // Check if password and confirmPassword match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const createUser = await userModel.create({
//       name,
//       email,
//       photo,
//       role,
//       confirmPassword: hashedPassword,
//       password: hashedPassword,
//     });

//     res.status(200).json(createUser);
//   } catch (err) {
//     res.status(409).json({ message: err.message });
//   }
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ msg: "Please enter email and password" });
//   }
//   const user = await userModel.findOne({ email: email });
//   if (!user) {
//     return res.status(400).json({ msg: "invalid email" });
//   }
//   let isValid = await bcrypt.compare(password, user.password);
//   if (!isValid) {
//     return res.status(400).json({ msg: "Invalid Password" });
//   }
//   //Create JWT
//   let token = jwt.sign(
//     { data: { email: user.email, id: user._id } },
//     process.env.SECRET_KEY
//   );
//   res.json({ message: "success", token: token });
// };

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findByIdAndDelete(id);
    if (!data) {
      return res.status(404).json("Id Not Found");
    }
    res.status(200).json("User Deleted Successfully");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log(req.params);
    const singleUser = await User.findById(id)
      .select(["-password", "-confirmPassword"])
      .populate([
        "favouriteBooks",
        "savedPosts",
        "posts",
        "followers",
        "following",
        // {
        //   path: "followers",
        //   select: "-password -confirmPassword", // Select the fields you want to exclude or include
        // },
        // {
        //   path: "following",
        //   select: "-password -confirmPassword", // Select the fields you want to exclude or include
        // },
      ]);
    res.json(singleUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const searchByName = async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.find({ name: name }).select([
      "-password",
      "-confirmPassword",
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },

      { new: true }
    ).select(["-password", "-confirmPassword"]);

    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const downToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true }
    ).select(["-password", "-confirmPassword"]);

    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const filterWithUser = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).count();

    res.status(201).json({
      message: "Successfully fetched all the users",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    let photo = "";
    if (req.file != undefined) {
      photo = req.file.filename;
    }
    //const { name, phone, government } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      id,
      { photo },
      { new: true }
    );
    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const followUser = async (req, res) => {
  try {
    const { userId, followUserId } = req.params;

    // Check if user is trying to follow themselves
    if (userId === followUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    // Find the user who is being followed
    const followUser = await User.findById(followUserId);
    if (!followUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the user who is following
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (user.following.includes(followUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add the followed user to the following list
    user.following.push(followUserId);
    await user.save();

    // Add the follower to the followed user's followers list
    followUser.followers.push(userId);
    await followUser.save();
    await createNotification(
      userId,
      followUserId,
      "follow",
      `${user.name} followed you`
    );
    res.status(200).json({ message: "Followed user successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  const { userId, unfollowUserId } = req.params;

  if (!userId || !unfollowUserId) {
    return res.status(400).send("User IDs are required.");
  }

  try {
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowUserId);

    if (!user || !unfollowUser) {
      return res.status(404).send("User not found.");
    }
    user.following = user.following.filter(
      (id) => id.toString() !== unfollowUserId
    );
    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await unfollowUser.save();

    res.status(200).send("Unfollowed successfully.");
  } catch (err) {
    res.status(500).send("Server error.");
  }
};
const profile = async (req, res) => {
  try {
    console.log("hello");
    const { token } = req.cookies;
    if (!token) return res.status(404).json(null);
    let {
      data: { id },
    } = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    const user = await User.findById(id).populate([
      "favouriteBooks",
      "savedPosts",
      "following",
      "followers",
    ]);
    res.status(200).json(user);
  } catch (error) {
    console.log("profile", error);
    res.status(400).json({ error: error.message });
  }
};

//UPDATE profile
const updateProfile = async (req, res) => {
  try {
    // req.body.id = "667d600241acf2834993cacb";
    const userId = req.user.id;
    console.log(userId);
    const { bio } = req.body;
    console.log(req.files);

    let updateData = { bio };

    if (req.files) {
      if (req.files.photo) {
        updateData.photo = `/userImages/${req.files.photo[0].filename}`;
      }
      if (req.files.cover) {
        updateData.cover = `/userImages/${req.files.cover[0].filename}`;
      }
    }
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    console.log(updateData);

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateName = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log(name, userId);
    user.name = name;
    await user.save();

    res.json({ msg: "Name updated successfully", user });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId)
      .select("+password")
      .select("+confirmPassword");
    // console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(user.password);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    console.log(error.message, "ENd");
  }
};

const whoToFollow = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Assuming you have the current user ID available in the request object
    const currentUser = await User.findById(currentUserId).select("following");

    const users = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } } }, // Exclude the current user
      { $match: { _id: { $nin: currentUser.following } } }, // Exclude users the current user is following
      { $sample: { size: 6 } }, // Randomly select 10 users
    ]);

    res.status(200).json({
      message: "Successfully fetched users to follow",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  getAllUsers,
  whoToFollow,
  getSingleUser,
  deleteUser,
  updateUser,
  searchByName,
  upToAdmin,
  downToUser,
  filterWithUser,
  updateUserPhoto,
  followUser,
  unfollowUser,
  profile,
  updateProfile,
  updateName,
  changePassword,
};

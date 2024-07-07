const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const request = require("request");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json("email already exist");
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });
    const token = jwt.sign(
      {
        data: {
          email: newUser.email,
          id: newUser._id,
          name: newUser.name,
          role: newUser.role,
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: "10h" }
    );
    res.cookie("token", token, { httpOnly: true }).status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials", error: error });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter email and password" });
    }
    const user = await User.findOne({ email })
      .select("+password")
      .populate([
        "favouriteBooks",
        "savedPosts",
        "posts",
        "followers",
        "following",
      ]);
    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    user.loginTimestamps.push(new Date());
    await user.save();

    const token = jwt.sign(
      {
        data: {
          email: user.email,
          id: user._id,
          name: user.name,
          role: user.role,
        },
      },
      process.env.SECRET_KEY,

      { expiresIn: "12h" }
    );
    res.cookie("token", token, { httpOnly: true }).status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid credentials", error });
  }
};
exports.logout = async (req, res) => {
  res.clearCookie("token").status(200).json({
    message: "Logged out successfully",
  });
};
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ msg: "there is no user with that email " });
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://localhost:5173/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(400)
      .json({ message: "There was an error sending the email. Try again!" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.json({ message: "Token is invalid or expired" });
    }

    if (req.body.password === req.body.confirmPassword) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
    const token = jwt.sign(
      {
        data: { email: user.email, id: user._id, name: user.name },
      },
      process.env.SECRET_KEY
    );
    res.cookie("token", token, { httpOnly: true }).status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials", error });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    console.log(user.password);
    console.log(req.body.currentPassword, req.body.password);

    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return res.status(400).json({ message: "password incorrect" });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    console.log("No");
    res.status(400).json({ error });
  }
};
exports.googleAuth = async (req, res, next) => {
  const { access_token } = req.body;
  const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;

  request(url, async (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const { email, name, picture } = JSON.parse(body);
      console.log(JSON.parse(body));
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, name, photo: picture });
      }
      console.log(user);
      const token = jwt.sign(
        {
          data: {
            email: user.email,
            id: user._id,
            name: user.name,
            role: user.role,
          },
        },
        process.env.SECRET_KEY,
        { expiresIn: "12h" }
      );
      res.cookie("token", token, { httpOnly: true }).status(200).json({ user });
    } else {
      res.status(response.statusCode).json({ error: body });
    }
  });
};
exports.auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) return res.status(404).json({ message: "please login" });
    let { data } = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    req.user = { ...data };

    req.user.role = data.role;
    next();
  } catch (error) {
    res.status(400).json({ error });
  }
};
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to view this resource" });
    }
    next();
  };

exports.getLoginStatistics = async () => {
  try {
    const users = await User.find({}, "loginTimestamps");

    const loginsPerDay = Array(7).fill(0);

    users.forEach((user) => {
      user.loginTimestamps.forEach((timestamp) => {
        const dayOfWeek = timestamp.getDay();
        loginsPerDay[dayOfWeek]++;
      });
    });

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const loginStatistics = daysOfWeek.map((day, index) => ({
      day,
      count: loginsPerDay[index],
    }));

    return loginStatistics;
  } catch (error) {
    console.error("Error retrieving login statistics:", error);
  }
};

exports.getRegistrationStatistics = async () => {
  try {
    const users = await User.find({}, "createdAt");

    const registrationsPerDay = Array(7).fill(0);

    users.forEach((user) => {
      const dayOfWeek = user.createdAt.getDay();
      registrationsPerDay[dayOfWeek]++;
    });

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const registrationStatistics = daysOfWeek.map((day, index) => ({
      day,
      count: registrationsPerDay[index],
    }));

    return registrationStatistics;
  } catch (error) {
    console.error("Error retrieving registration statistics:", error);
  }
};

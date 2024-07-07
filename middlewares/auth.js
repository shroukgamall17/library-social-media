const jwt = require("jsonwebtoken");
function auth(req, res, next) {
  let token = req.headers.cookie.slice(6);
  console.log(token);
  if (!token) {
    return res.json({ message: "Please login" });
  }
  try {
    let decode = jwt.verify(token, process.env.SECRET_KEY);
    req.body.userId = decode.data.id;
    console.log(req.body);
    next();
  } catch (error) {
    res.json({ message: error });
  }
}
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to view this resource" });
    }
    next();
  };
}
//module.exports = { auth, restrictTo };

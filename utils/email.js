const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log("hello");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER,
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: "booknet209@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  const res = await transporter.sendMail(mailOptions);
  console.log("res", res);
};
module.exports = sendEmail;

require("dotenv").config(); // Ensure .env is loaded

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `Smart Farmer Portal <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(` Email sent to ${to}: ${info.response}`);
  } catch (err) {
    console.error(" Email send error:", err.message);
  }
};

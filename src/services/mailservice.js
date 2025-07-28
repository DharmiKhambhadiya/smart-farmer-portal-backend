const nodemailer = require("nodemailer");

exports.sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });
};

exports.sendResetPasswordEmail = async (email, rawToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
  const html = `<h3>Reset Password</h3><p>Click below (valid for 5 minutes):</p><a href="${resetLink}">${resetLink}</a>`;
  await this.sendMail(email, "Reset Password", html);
};

const nodemailer = require("nodemailer");

exports.sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
    throw error;
  }

  const mailOptions = {
    from: `"Smart Farmer Portal" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Email sent successfully:", info.messageId);
  return info;
};

exports.sendResetPasswordEmail = async (email, rawToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
  const html = `<h3>Reset Password</h3><p>Click below (valid for 5 minutes):</p><a href="${resetLink}">${resetLink}</a>`;
  await this.sendMail(email, "Reset Password", html);
};

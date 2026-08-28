const nodemailer = require("nodemailer");

async function mailSender(email, username, token) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GOOGLE_MAIL,
      pass: process.env.GOOGLE_PASS,
    },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 60000,
  });

  const mailOptions = {
    from: `"Tennistix" ${process.env.GOOGLE_MAIL}`,
    to: email,
    subject: "Password reset - forgotten password",
    text: `Hello ${username},
    
We received a reset password request for your Tennistix account.
    
Click on this link to reset your password : ${process.env.URL_WEBSITE}/reset-password/${token} !
    
This link will work only for the next 10 minutes !`,
  };

  try {
    const send = await transporter.sendMail(mailOptions);
    return send;
  } catch (error) {
    console.log(error);
    throw new Error("Failed : email did not sent");
  }
}

module.exports = mailSender;
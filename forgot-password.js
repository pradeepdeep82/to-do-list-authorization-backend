import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { getUserByName } from "./loginPage.js";
import express from "express";
import jwt from 'jsonwebtoken';
import { app, JWT_SECRET } from "./index.js";
import dotenv from "dotenv";
dotenv.config();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;


const router=express.Router();

router.post("/login/forgot-password", async (req, res) => {
  try {


    const { username } = req.body;
    // check if this username exist in database
    const userFromDB = await getUserByName(username);



    if (userFromDB[0] === undefined) {
      res.status(400).send({ message: "User is not Registered", statusCode: 400 });
    } else {
      const secret = JWT_SECRET + userFromDB[0].hashedPassword;
      const payload = {
        email: userFromDB[0].username,
        id: userFromDB[0]._id
      };
      const token = jwt.sign(payload, secret, { expiresIn: '15m' });
      const link = `http://localhost:3000/reset-password/${userFromDB[0].username}/${token}`;
      // const link = `https://gmail-clone-pradeep.netlify.app/reset-password/${userFromDB[0].username}/${token}`;
     
    var nodemailer = require('nodemailer');
    const { google } = require("googleapis");
    const OAuth2 = google.auth.OAuth2;

    const createTransporter = async () => {
      const oauth2Client = new OAuth2(
        process.env.Your_client_id,
        process.env.Your_client_secret,
        "https://developers.google.com/oauthplayground"
      );
    
      oauth2Client.setCredentials({
        refresh_token: process.env.Refresh_token
      });
    

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(");
        }
        resolve(token);
      });
    });

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: "OAuth2",
    user: process.env.Email,
    accessToken,
    clientId: process.env.Your_client_id,
    clientSecret: process.env.Your_client_secret,
    refreshToken: process.env.Refresh_token,
    tls: {
      rejectUnauthorized: false
    }
  }
});
return transporter
};

const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};
sendEmail({
  from: process.env.Email,
  to: payload.email,
  subject: 'Reset Password',
  html: `<p>Hi, please click the below link to reset password for your to-do-list app</p>
        <a href=${link} target="_blank">Click here to change the password</a>
        <strong>This reset password link will be valid for 15 minutes from the time it was sent</strong>`
});
res.status(200).send({ link: link, statusCode: 200, message: "Password reset link sended to the given mail id" });
// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });

//       res.status(200).send({ link: link, statusCode: 200, message: "Password reset link sended to the given mail id" });
    }

  } catch (error) {

    console.log(error.message);
    res.send(error.message);
  }
});

export const forgotPasswordRouter= router;
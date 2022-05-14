import jwt from "jsonwebtoken";
import { getUserByName } from "./loginPage.js";
import express from "express";
import bcrypt from "bcrypt";
import { app, JWT_SECRET, createConnection } from "./index.js";

const router =express.Router();

router.post("/reset-password/:username/:token", async (req, res, next) => {
  const { username, token } = req.params;
  // res.send(req.params);
  const { password, confirmPassword } = req.body;
  const userFromDB = await getUserByName(username);

  const secret = JWT_SECRET + userFromDB[0].hashedPassword;
  try {
    jwt.verify(token, secret);
    //  res.send("verified");
    async function generatePassword(password) {
      const no_of_rounds = 10;
      const salt = await bcrypt.genSalt(no_of_rounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    }

    if (password === confirmPassword) {
      const hashedPassword = await generatePassword(password);
      const pattern = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?]).+$"
      );
      if (password.length < 8) {
        res.status(400).send({ message: "Password is too short", statusCode: 400 });
      } else if (pattern.test(password)) {
        const client = await createConnection();
        const user = await client
          .db("gmail-clone")
          .collection("users")
          .updateOne({ username: username }, { $set: { password: password, hashedPassword: hashedPassword } });

        res.status(200).send({ password: password, hashedPassword: hashedPassword, message: "Password has been changed successfully", statusCode: 200 });
        console.log(user);
        return user;
      } else {
        res.status(400).send({
          message: "Given password is weak, please give strong password with one lower case, one uppercase, one numeric value and atleast one special character",
          statusCode: 400
        });
      }
    } else {
      res.status(400).send({ message: "Enter same password", statusCode: 400 });
    }
  } catch (error) {
    console.log(error.message);
    res.send({ errorMessage: error.message, message: "Password Reset link has been expired", statusCode: 402 });
  }
});

export const resetPasswordRouter=router;
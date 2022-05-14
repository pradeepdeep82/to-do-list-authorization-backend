import { createRequire } from "module";
import { MongoClient } from "mongodb";
const require = createRequire(import.meta.url);
import cors from "cors";
import { loginRouter } from "./loginPage.js";
import {signupRouter} from "./signupPage.js";
import {forgotPasswordRouter} from "./forgot-password.js";
import {resetPasswordRouter} from "./reset-password.js"
import { request } from "http";
import { response } from "express";
import { allTaskRouter } from "./allTask.js";

const express = require("express");
export const app = express();

const PORT = process.env.PORT || 4000;

// const MONGO_URL = "mongodb://localhost";
const MONGO_URL=process.env.MONGO_URL;
export async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("MongoDB connected");
  return client;
}

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
  response.send("Hello world.....");
});

app.listen(PORT, ()=>{
  console.log("App is started with PORT "+PORT);
})

export const JWT_SECRET=process.env.JWT_SECRET;

app.use("/", loginRouter);
app.use("/", signupRouter);
app.use("/", forgotPasswordRouter);
app.use("/", resetPasswordRouter);
app.use("/", allTaskRouter);
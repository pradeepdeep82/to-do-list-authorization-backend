import express from "express";
import { auth } from "./auth.js";
import { app, createConnection } from "./index";

const router=express.Router()

router.post("/allTask", auth, async (request, response) => {
  try {
    const { task, username } = request.body;
    const client = await createConnection();
    const taskData = await client
      .db("to-do-list")
      .collection("users")
      .updateOne({ username: username }, { $push: { task: { task: task, isCompleted: false } } });
    response.status(200).send({ newTask: taskData, statusCode: 200, message: "New Task have been addded" });
    return taskData;
  } catch (err) {
    console.log(err);
  }
});
router.get("/allTask", auth, async (request, response) => {
  try {
    const { username } = request.headers;
    const client = await createConnection();
    const data = await client.db("to-do-list")
      .collection("users")
      .find({ username: username })
      .toArray();
    const task = data[0].task;
    response.status(200).send({ statusCode: 200, task: task });
  } catch (err) {
    console.log(err.message);
  }
});
router.put("/allTask", auth, async (request, response) => {
  try {
    const { index, username } = request.headers;
    const client = await createConnection();
    await client
      .db("to-do-list")
      .collection("users")
      .updateOne({ username: username }, { $unset: { ["task." + index]: 1 } });

    await client
      .db("to-do-list")
      .collection("users")
      .updateOne({ username: username }, { $pull: { "task": null } });

    const data = await client
      .db("to-do-list")
      .collection("users")
      .find({ username: username })
      .toArray();

    const task = data[0].task;
    response.status(200).send({ message: "task deleted successfully", task: task });
  } catch (err) {
    console.log(err.message);
  }
});
router.put("/toggletask", auth, async (request, response) => {
  try {
    const { username, index } = request.headers;
    const client = await createConnection();
    const data = await client
      .db("to-do-list")
      .collection("users")
      .find({ username: username })
      .toArray();

    const isCompleted = data[0].task[index].isCompleted;

    await client
      .db("to-do-list")
      .collection("users")
      .updateOne({ username: username }, { $set: { [`task.${index}.isCompleted`]: isCompleted ? false : true } });



    const task = data[0].task;
    response.status(200).send({ message: "task updated successfully", task: task, isCompleted: isCompleted });
  } catch (err) {
    console.log(err.message);
  }
});

export const allTaskRouter=router;
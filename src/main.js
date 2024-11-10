import express, { json } from "express";
import { connectMongo, hashPassword, verifyPassword } from "../api/db.js";

const [db, client] = await connectMongo();

const coll = db.collection("users");

const app = express();

const PORT = 3000;

app.get("/", async (req, res) => {
  try {
    const data = await coll.find().toArray();
    res.json(data);
    await client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/post", (req, res) => {
  try {
    const form = req.body.addUserForm;

    const enrollmentNo = form.addUser_enroll;
    const email = form.addUser_email;
    const pw = form.addUser_pw;
  } catch (e) {}
  req.send("Post Request");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

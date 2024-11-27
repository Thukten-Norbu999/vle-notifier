import express, { json } from "express";
import { ObjectId } from "mongodb";
import {
  connectMongo,
  hashPassword,
  verifyPassword,
  encrypt,
} from "../api/db.js";
import cors from "cors";
import dotenv from "dotenv";
import { scrape } from "../api/get.js";
dotenv.config();

const PASSPHRASE = process.env.PASSPHRASE || "nigga_please_stop";

const client = await connectMongo();

const db = client.db("notifier");

const userColl = db.collection("users");
const courseColl = db.collection("courses");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/users", async (req, res) => {
  try {
    const data = await userColl.find().toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/addUser", async (req, res) => {
  try {
    const { username, enrollmentNumber, email, password, sendMail } = req.body;

    // Check if user already exists in the database
    const existingUser = await userColl.findOne({ enrollNo: enrollmentNumber });
    if (existingUser) {
      return res.status(409).send({ message: "User Already Exists" });
    }
    const pwd = await hashPassword(password);
    const srpPwd = encrypt(password, PASSPHRASE);
    // Insert new user
    await userColl.insertOne({
      name: username,
      enrollNo: enrollmentNumber,
      email: email,
      pw: pwd, // Ensure hashPassword is defined for password encryption
      scrpPwd: srpPwd,
      sendMail: sendMail,
    });
    console.log("User Added", new Date());

    res.status(201).send({ message: "User Added Successfully" });
  } catch (error) {
    console.error("Error adding user:", error);
    res
      .status(500)
      .send({ message: "An error occurred while adding the user." });
  }
});

app.get("/api/courses", async (req, res) => {
  try {
    const data = await courseColl.find().toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/user/:enrollNo", async (req, res) => {
  const enrollNo = req.params.enrollNo;
  const data = await userColl.findOne({ enrollNo: enrollNo });

  if (!data) {
    console.log(enrollNo, "not found");
    res.json({ message: "Not found" });
  } else {
    console.log(enrollNo, "found");
    res.json(data);
  }
});

app.delete("/api/user/:enrollNo", async (req, res) => {
  const enrollNo = req.params.enrollNo;

  try {
    const data = await userColl.deleteOne({ enrollNo: enrollNo });
    if (data.deletedCount !== 0) {
      res.json({ message: "Deleted Succesfully" });
    } else {
      res.json({ message: "Unsuccessful" });
    }
  } catch (err) {
    console.log("Error: ", err);
  }

  console.log("Delete User Log ----", new Date());
});
app.get("/api/user/delete/:enrollNo", async (req, res) => {
  const enrollNo = req.params.enrollNo;

  try {
    const data = await userColl.deleteOne({ enrollNo: enrollNo });
    if (data.deletedCount !== 0) {
      res.json({ message: "Deleted Succesfully" });
    } else {
      res.json({ message: "Unsuccessful" });
    }
  } catch (err) {
    console.log("Error: ", err);
  }

  console.log("Delete User Log ----", new Date());
});


app.get("/api/user/:enrollNo", async (req, res) => {});

app.put("/api/user/edit/:enrollNo", async (req, res) => {
  const enrollNo = req.params.enrollNo;
  const data = await userColl.findOne({ enrollNo: enrollNo });
  
  try {
    const data = await userColl.findOne({ enrollNo: enrollNo });
    if (!data) {
      res.json({ message: "User Not found" });
    } else {
      console.log('User is found')
      if (!req.body) {
        console.log('NotFOUND')
        return res.status(400).json({ message: "Request body is missing" });
        
    }
      const { email, pw, sendMail } = req.body;
      if(email && pw && pw.length>=8 && sendMail){
        const hpw = await hashPassword(pw);
        const srpPw = encrypt(pw, PASSPHRASE);
        await userColl.updateOne(
          { enrollNo: enrollNo },
          { $set: { email: email, pw: hpw, scrpPwd: srpPw, sendMail: sendMail } }
        );
        res.json({messgae:'Updated Successfully'})
        console.log('Updated Successfully ----', new Date())
      }
      else{
        console.log('INVALID DATA')
      }
      
    }
  } catch (e) {
    console.log("Error:", e);
  }

  res.json();
});

app.get("/api/getData", async (req, res) => {
  scrape();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

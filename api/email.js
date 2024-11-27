import nodemailer from "nodemailer";
import { connectMongo } from "./db.js";

const client = await connectMongo();
const db = client.db("notifier");
const userColl = db.collection("users");

import dotenv from "dotenv";
dotenv.config();

function getDaysLeft(date) {
  if (date === new Date()) {
    return 0;
  } else {
    let difference = new Date(date).getTime() - new Date().getTime();

    const msInDay = 24 * 60 * 60 * 1000;
    const msInHour = 60 * 60 * 1000;

    const totalDays = difference / msInDay;

    // Extract full days and the remaining fractional part
    const fullDays = Math.floor(totalDays);

    return fullDays + 1;
  }
}
const results = await userColl
  .aggregate([
    {
      $unwind: "$courses",
    },
    {
      $unwind: "$courses.assignments",
    },
    {
      $match: {
        $and: [
          { "courses.assignments.stat": { $ne: "submitted" } },
          { "courses.assignments.due": { $ne: "No due date" } },
        ],
      },
    },
    {
      $group: {
        _id: "$enrollNo",
        assignments: {
          $push: {
            courseName: "$courses.courseName",
            assignment: "$courses.assignments",
          },
        },
      },
    },
    {
      $project: {
        enrollNo: `$_id`,
        assignments: 1,
        _id: 0,
      },
    },
  ])
  .toArray();

const EMAIL = process.env.EMAIL;
const PWD = process.env.EMAIL_PWD;
const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 587,
  auth: {
      user: "feroxtech.mailservices@yahoo.com", // Replace with your email
      pass: "Gcit@2024" // Replace with your App Password
  },
  debug: true,
  logger:true
  
});

const mailOptions = {
  from: "feroxtech.mailservices@yahoo.com",
  to: 'thuktennorbu33@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.'
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
      console.error('Error sending email:', err);
  } else {
      console.log('Email sent:', info.response);
  }
});

function main() {
  results.forEach((itm) => {
    const user = userColl.find({ enroll: itm.enrollNo });
    const msg = `${user.name} You have `;
    const htmlMsg = `<h3>${user.name} You have</h3>`;
    itm.assignments.forEach((ass) => {
      const due = new Date(ass.assignment.due);

      if (getDaysLeft(due) < 0 && getDaysLeft(due) > -10) {
      }
      console.log();
    });
    console.log(itm.enrollNo);
  });
}



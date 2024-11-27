import puppeteer from "puppeteer";

import { connectMongo, decrypt } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const PASSPHRASE = process.env.PASSPHRASE;

const client = await connectMongo();

const db = client.db("notifier");

const userColl = db.collection("users");
const courseColl = db.collection("courses");
const assignColl = db.collection("assignment");

// Initializing the browser and page
async function init() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://vle.gcit.edu.bt/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  console.log(page.url());

  return { browser, page };
}

// Function to get the courses
async function getCourse(page) {
  const dummyL = 'a[href*="https://vle.gcit.edu.bt/course/view.php?id="]';
  await page.waitForSelector(dummyL);

  const cLink = await page.$$(dummyL);
  let list = [];

  for (let it of cLink) {
    let link = await it.evaluate((el) => el.href),
      courseName = await it.evaluate((el) => el.innerText);

    const check = await courseColl.findOne({ courseLink: link });
    if (!list.includes(link) && !courseName.includes("\n")) {
      list.push({
        courseLink: link,
        courseName: courseName,
      });
    }
    
    if (!check) {
      await courseColl.insertOne({ courseName: courseName, courseLink: link });
    }
  }
  return list;
}

//Get assignment by taking page and course link as parameter
async function getAssignment(page, link, cname) {
  const dummyforAssign =
    "a[href*='https://vle.gcit.edu.bt/mod/assign/view.php?id=']";
  await page.goto(link);

  const list = [];
  const alist = await page.$$(dummyforAssign);
  for (let it of alist) {
    let asslink = await it.evaluate((el) => el.href);
    let title = await it.evaluate((el) => el.innerText);
    const check = await assignColl.findOne({ assLink: asslink });
    if (!check) {
      await assignColl.insertOne({
        courseName: cname,
        assTitle: title,
        assLink: asslink,
      });
    }
    
    list.push({
      courseName: cname,
      assTitle: title,
      assLink: asslink,
    })
  }
  return list;
}

function convert24(time) {
  return time[1] == "PM"
    ? `${String(Number(time[0].split(":")[0]) + 12)}:${time[0].split(":")[1]}`
    : time[0];
}

function convertdate(date, time) {
  if (date === "No due date") {
    return ["NO due date", "-:-:-"];
  } else {
    let [day, month, year] = date.split(" ");
    const datetime = `${month} ${day}, ${year} ${time}:00`;
    time = time.split(":").map((it) => Number(it));
    return [datetime, time];
  }
}


// Function that takes page and list of assignment links as parameter
async function getStatus(page, list, link, courseName) {
  const dataJ = [];
  if (list.length > 0) {
    for (let lin of list) {
      await page.goto(lin.assLink);
      const title = await page.$eval(
        "div.page-header-headings",
        (el) => el.innerText
      );
      const dateD = await page.$eval(
        "div.description-inner",
        (el) => el.innerText
      );

      let due;
      let val;
      let time;

      if (dateD.split("\n").length >= 2) {
        due = dateD.split("\n")[1].split(", ")[1];
        val = dateD.split("\n")[1].split(", ")[2].split(" ");
        time = convert24(val);
      } else {
        due = "No due date";
        time = "----";
      }

      const [date, T] = convertdate(due, time);
      //TODO
      let status = "";
      let timeLList = [
        "td.earlysubmission.cell.c1.lastcol",
        "td.timeremaining.cell.c1.lastcol",
        "td.latesubmission.cell.c1.lastcol",
        "td.overdue.cell.c1.lastcol"
      ];
      let etl = "";

      // Try to get status using the selector and if the selector aint found
      // catch the error and declare status as not submitted
      for (let it of timeLList) {
        let el = await page.$(it);
        if (el) {
          etl = await page.$eval(it, (el) => el.innerText);
          status = etl.includes("submitted") ? "submitted" : "not submitted";
          break
        }
        else{
          etl = "Not found or overdue"
          status = "not submitted"
          break
        }
      }
    
      const data = {
        courseName: courseName,
        courseLink: link,
        title: title,
        status: status,
        etl: etl,
        due: due,
        link: lin.assLink,
        date: date,
      };
      dataJ.push(data);
    }
  }
  return dataJ;
}

//Main codeblock in which the code runs
async function main(eNo, pw) {
  const { browser, page } = await init();

  const userInpt = await page.$('input[type="text"]');
  const userPw = await page.$("input[type='password']");
  await userInpt.type(eNo);
  console.log("Entered Enrollment number");
  try {
    await userPw.type(pw);
    console.log("Entered password");
    await page.click("button[type='submit']");
    console.log("Submitted");
    const fail = await page.$("div.alert.alert-danger");

    if (fail) {
      console.log("Login error. Wrong credentials entered");

      return "over";
    }
  } catch (error) {
    console.log("Error:", error);
  }

  //list of courses enrolled
  console.log('**** Fetching Courses ****')
  const clist = await getCourse(page); //await courseColl.find().toArray();

  console.log('Done Fetching Courses...', `Number of Courses: ${clist.length}`);
  const test = {
    email: `${eNo}.gcit@rub.edu.bt`,
    enrollNo: eNo,
    pw: pw,
    courses: [],
  };
  // [{link}]

  for (let it of clist) {
    let clink = it["courseLink"],
      cname = it["courseName"];

    console.log(`**** Getting Assignments *****`)
    const alist = await getAssignment(page, clink, cname);//await assignColl.find().toArray();
    console.log('Done fetching assignments...', `Number of Assignments: ${alist.length}`)

    console.log('**** Getting Assignment Status ****')
    const stat = await getStatus(page, alist, clink, cname);
    const assStat = {
      courseName: cname,
      courseLink: clink,
      assignments: [],
    };
    stat.forEach((itm) => {
      const dem = {
        title: itm.title,
        assignmentLink: itm.link,
        due: itm.due,
        date: itm.date,
        longStat: itm.etl,
        stat: itm.status,
      };

      if(cname === itm.courseName){
        assStat.assignments.push(dem);
      }

    });
    console.log('Done fetching assignment status....')
    test.courses.push(assStat);
    // console.log(assStat, stat);
    // console.log(test);
  }
  // const checkCourses = await userColl.find({'enrollNo'})
  await userColl.updateOne({'enrollNo': eNo}, {$set:{"courses":test.courses}})

  console.log('----------------------------------------------------------------')
  console.log(`Done Scraping Assignment For ${eNo}. Scraping Done...`)
  console.log('----------------------------------------------------------------')
  await browser.close();
}

export async function scrape() {
  const users = await userColl.find().toArray();

  users.forEach((user) => {
    if (user.sendMail) {
      const dePWD = decrypt(user.scrpPwd, PASSPHRASE);
      console.log('-----------------------------------------------------')
      console.log(`User: ${user.enrollNo}`)
      main(user.enrollNo, dePWD);
    }
  });
};

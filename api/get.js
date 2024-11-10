import puppeteer from "puppeteer";

import {connectMongo} from "./db.js";

const [db, client] = connectMongo()


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
    if (!list.includes(link) && !courseName.includes("\n")) {
      list.push({
        link: link,
        cName: courseName,
      });
    }
  }
  return list;
}

//Get assignment by taking page and course link as parameter
async function getAssignment(page, link) {
  const dummyforAssign =
    "a[href*='https://vle.gcit.edu.bt/mod/assign/view.php?id=']";
  await page.goto(link);

  const list = [];
  const alist = await page.$$(dummyforAssign);
  for (let it of alist) {
    let context = await it.evaluate((el) => el.href);
    if (!list.includes(context)) {
      list.push(context);
    }
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

function getDaysLeft(date) {
  let difference = new Date().getTime() - date.getTime();

  const msInDay = 24 * 60 * 60 * 1000;
  const msInHour = 60 * 60 * 1000;

  const totalDays = difference / msInDay;

  // Extract full days and the remaining fractional part
  const fullDays = Math.floor(totalDays);

  return fullDays;
}

// Function that takes page and list of assignment links as parameter
async function getStatus(page, list, link, courseName) {
  const dataJ = [];
  if (list.length > 0) {
    for (let lin of list) {
      await page.goto(lin);
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
      ];
      let etl = "";

      // Try to get status using the selector and if the selector aint found
      // catch the error and declare status as not submitted
      for (let it of timeLList) {
        let el = await page.$(it);
        if (el) {
          etl = await page.$eval(it, (el) => el.innerText);
          status = etl.includes("submitted") ? "submitted" : "not submitted";
        }
      }

      const data = {
        courseName: courseName,
        courseLink: link,
        title: title,
        status: status,
        etl: etl,
        due: due,
        link: lin,
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
  try {
    const fail = await page.$("alert.alert-danger");
    if (fail) {
      return console.log("Login error. Wrong credentials entered");
    }
  } catch (error) {}
  const userPw = await page.$("input[type='password']");

  await userInpt.type(eNo);
  await userPw.type(pw);
  await page.click("button[type='submit']");

  //list of courses enrolled
  const clist = await getCourse(page);
  console.log(clist);
  // [{link}]

  for (let it of clist) {
    let clink = it["link"],
      cname = it["cName"];
    const alist = await getAssignment(page, clink);
    console.log(alist);
    const stat = await getStatus(page, alist, clink, cname);

    console.log(stat);
  }

  await browser.close();
}

(async () => {
  main("12240095", "Gengiskhan10@123");
  // main('12240095',  'Cid@11608004092')
})();

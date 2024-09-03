import puppeteer from "puppeteer";


// Initializing the browser and page
async function init(){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://vle.gcit.edu.bt/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  console.log(page.url());

  return {browser, page}
}

// Function to get the courses
async function getCourse(page){
  const dummyL = 'a[href*="https://vle.gcit.edu.bt/course/view.php?id="]';
  await page.waitForSelector(dummyL);

  const cLink = await page.$$(dummyL);
  let list = [];
  for(let it of cLink){
    let context = await it.evaluate(el => el.href);
    if(!(list.includes(context))){
      list.push(context)
    };
  };
  return list
};

//Get assignment by taking page and course link as parameter
async function getAssignment(page, link){
  const dummyforAssign = "a[href*='https://vle.gcit.edu.bt/mod/assign/view.php?id=']"
  await page.goto(link);
  const courseName = await page.$eval('h1.h2', el => el.innerText)
  const list = [];
  const alist = await page.$$(dummyforAssign)
  for(let it of alist){
    let context = await it.evaluate(el => el.href);
    if(!(list.includes(context))){
      list.push(context)
    };
  };
  return [list, courseName]
};

function convert24(time){
  return time[1] == "PM" ? `${String(Number(time[0].split(':')[0])+12)}:${time[0].split(':')[1]}`:time[0]
}

function convertdate(date, time){
  let [day, month, year] = date.split(' ');
  const datetime = `${month} ${day}, ${year} ${time}:00`
  time = time.split(':').map(it => Number(it));
  return [datetime, time]
 
}

function getTimeLeft(){

}
// Function that takes page and list of assignment links as parameter
async function getStatus(page, list, link, courseName){

  const dataJ = [];
  if(list.length > 0){
    for(let lin of list){
      await page.goto(lin);
      const title = await page.$eval('div.page-header-headings', el=>el.innerText);
      const dateD = await page.$eval('div.description-inner', el => el.innerText);
      let due = dateD.split('\n')[1].split(', ')[1]
      
      let val = dateD.split('\n')[1].split(', ')[2].split(' ')
      // console.log('Debug time', time)
    
      let time = convert24(val)


      // console.log('Debug convert')
      // console.log(due,time, convert)
      
      const [date, T] = convertdate(due, time)
      
      let status;
      let timeLList = ['td.earlysubmission.cell.c1.lastcol', 'td.timeremaining.cell.c1.lastcol', 'td.latesubmission.cell.c1.lastcol']
      let timeLeft;
      // Try to get status using the selector and if the selector aint found
      // catch the error and declare status as not submitted
      try{
        status = await page.$eval('td.submissionstatussubmitted.cell.c1.lastcol', el => el.innerText);
        
      }
      catch(error){
       status = 'Not Submitted'
      }
      const data = {
        courseName: courseName,
        courseLink : link,
        title : title,
        status : status,
        due : due,
        link: lin,
        date: date,
      };
      dataJ.push(data);
    }
  }
  return dataJ
}

//Main codeblock in which the code runs
async function main(eNo, pw){
  const {browser, page} = await init();
  
  const userInpt = await page.$('input[type="text"]');
  try{
    const fail = await page.$('alert.alert-danger')
    if(fail){
      return console.log('Login error. Wrong credentials entered')
    }
  }
  catch(error){

  };
  const userPw = await page.$("input[type='password']");
  
  await userInpt.type(eNo);
  await userPw.type(pw);
  await page.click("button[type='submit']")

  //list of courses enrolled
  const clist = await getCourse(page);
  console.log(clist)
  for(let link of clist){
    const [alist,courseName] = await getAssignment(page, link);
    const stat = await getStatus(page, alist, link, courseName);
    console.log(stat)
  }
  
  await browser.close();
}



(async () => {
  // await main('12240095', 'Gengiskhan10@123');
  main('12240094',  'Cid@11608004092')
})();




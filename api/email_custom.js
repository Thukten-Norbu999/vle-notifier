import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?compose=new"
  );

  await page.$()
  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  console.log(page.url());
}

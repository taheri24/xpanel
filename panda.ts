import puppeteer from "puppeteer-core"
const {PANDA_TOKEN}=process.env;
// Replace puppeteer.launch with puppeteer.connect.
const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://euwest.cloud.lightpanda.io/ws?token=${PANDA_TOKEN}`,
})

// The rest of your script remains the same.
const page = await browser.newPage();
await page.goto(`https://majidtaheri.netlify.app/`);
console.log(await page.title())
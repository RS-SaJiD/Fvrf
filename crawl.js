const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DOMAIN = 'nctb.cloud';
const START_URL = `https://${DOMAIN}/`;

const visitedUrls = new Set();
const queue = [START_URL];

(async () => {
  console.log('Starting website crawler...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  while (queue.length > 0) {
    const currentUrl = queue.shift();

    // ইতোমধ্যে ভিজিট করা হয়ে থাকলে স্কিপ করবে
    if (visitedUrls.has(currentUrl)) continue;

    visitedUrls.add(currentUrl);
    console.log(`Processing (${visitedUrls.size}): ${currentUrl}`);

    try {
      // পেজ পুরোপুরি লোড হওয়া পর্যন্ত অপেক্ষা করবে
      await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });
      const content = await page.content();

      // ১. ইউআরএল অনুযায়ী ফোল্ডার ও ফাইল পাথ তৈরি
      const urlObj = new URL(currentUrl);
      let relativePath = urlObj.pathname;

      if (relativePath.endsWith('/') || !path.extname(relativePath)) {
        relativePath = path.join(relativePath, 'index.html');
      }

      const filePath = path.join(__dirname, 'site_archive', DOMAIN, relativePath);
      
      // ফোল্ডার না থাকলে স্বয়ংক্রিয়ভাবে তৈরি করবে
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf8');

      // ২. পেজের সব <a> ট্যাগ থেকে নতুন লিংক খুঁজে বের করা
      const links = await page.$$eval('a[href]', (anchors) =>
        anchors.map((a) => a.href)
      );

      for (const link of links) {
        try {
          const parsedLink = new URL(link);

          // শুধু একই ডোমেইনের (nctb.cloud) ইন্টারনাল লিংকগুলো প্রক্রিয়া করবে
          if (
            parsedLink.hostname === DOMAIN &&
            !visitedUrls.has(parsedLink.href) &&
            !queue.includes(parsedLink.href)
          ) {
            // ইউআরএল এর হ্যাশ (#) অংশ বাদ দেওয়া
            parsedLink.hash = '';
            queue.push(parsedLink.href);
          }
        } catch (e) {
          // ইনভ্যালিড ইউআরএল এড়িয়ে যাওয়ার জন্য
        }
      }
    } catch (err) {
      console.error(`Failed to load ${currentUrl}:`, err.message);
    }
  }

  await browser.close();
  console.log(`Finished! Total pages archived: ${visitedUrls.size}`);
})();

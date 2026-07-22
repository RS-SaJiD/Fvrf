const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DOMAIN = 'nctb.cloud';
const START_URL = `https://${DOMAIN}/`;
const OUT_DIR = path.join(__dirname, 'site_archive', DOMAIN);

// tenders এর মধ্যে শুধু এই একটাই রাখা হবে, বাকি সব tender পেজ crawl-ই হবে না
const KEEP_TENDER = '0516a256b18d';

const visitedUrls = new Set();
const savedAssets = new Set();
const queue = [START_URL];

// /tenders/{id} প্যাটার্নের কোনো লিংক হলে, এবং সেই id KEEP_TENDER না হলে, স্কিপ করে দেয়
// /tenders (index পেজ) নিজে স্কিপ হয় না
function isSkippedTenderLink(urlObj) {
  const match = urlObj.pathname.match(/^\/tenders\/([^/]+)\/?$/);
  if (!match) return false;
  const tenderId = match[1];
  return tenderId !== KEEP_TENDER;
}

// URL কে লোকাল ফাইল পাথে রূপান্তর করে (HTML পেজের জন্য index.html বসায়)
function urlToFilePath(urlStr) {
  const urlObj = new URL(urlStr);
  let relativePath = urlObj.pathname;

  if (relativePath.endsWith('/') || !path.extname(relativePath)) {
    relativePath = path.join(relativePath, 'index.html');
  }

  return path.join(OUT_DIR, relativePath);
}

// পেজ লোড হওয়ার সময় ব্রাউজার যত রিসোর্স (css, js, png, woff2, ইত্যাদি) ফেচ করে
// সবগুলো ধরে নিজের ডোমেইনেরটা হলে ডিস্কে সেভ করে
async function saveResponse(response) {
  try {
    const url = response.url();
    const urlObj = new URL(url);

    if (urlObj.hostname !== DOMAIN) return; // অন্য ডোমেইনের (CDN ইত্যাদি) রিসোর্স স্কিপ
    if (savedAssets.has(url)) return;

    const status = response.status();
    if (status < 200 || status >= 300) return;

    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) return; // HTML page.content() দিয়ে আলাদাভাবে সেভ হয়

    const buffer = await response.body();
    const filePath = urlToFilePath(url);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    savedAssets.add(url);
    console.log(`  Asset saved: ${urlObj.pathname}`);
  } catch (e) {
    // কিছু রেসপন্সের বডি পাওয়া যায় না (যেমন redirect/cache) — সেগুলো স্কিপ করা হয়
  }
}

(async () => {
  console.log('Starting website crawler (pages + assets)...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // প্রতিটা নেটওয়ার্ক রেসপন্স শোনা হবে যাতে css/js/image/font সব ধরা পড়ে
  page.on('response', saveResponse);

  while (queue.length > 0) {
    const currentUrl = queue.shift();

    if (visitedUrls.has(currentUrl)) continue;
    visitedUrls.add(currentUrl);
    console.log(`Processing (${visitedUrls.size}): ${currentUrl}`);

    try {
      await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });
      const content = await page.content();

      const filePath = urlToFilePath(currentUrl);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf8');

      const links = await page.$$eval('a[href]', (anchors) =>
        anchors.map((a) => a.href)
      );

      for (const link of links) {
        try {
          const parsedLink = new URL(link);

          if (
            parsedLink.hostname === DOMAIN &&
            !visitedUrls.has(parsedLink.href) &&
            !queue.includes(parsedLink.href) &&
            !isSkippedTenderLink(parsedLink)
          ) {
            parsedLink.hash = '';
            queue.push(parsedLink.href);
          }
        } catch (e) {
          // ইনভ্যালিড লিংক স্কিপ
        }
      }
    } catch (err) {
      console.error(`Failed to load ${currentUrl}:`, err.message);
    }
  }

  await browser.close();
  console.log(`Finished! Pages archived: ${visitedUrls.size}, Assets archived: ${savedAssets.size}`);
})();

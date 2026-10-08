const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('assert/strict');
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
 const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
 const css = fs.readFileSync('jellyfin-plugin-media-bar-main/slideshowpure.css', 'utf8');
 for (const tv of [false, true]) for (const layout of ['classic','plate','marquee']) {
  await page.setContent(`<html class="sspure-${layout} ${tv ? 'layout-tv sspure-tv' : ''}"><head><style>${css}</style></head><body><div class="page"><div id="slides-container" class="layout-${layout}"><div class="slide active"><div class="slide-content"><div class="logo-container"><div class="logo-title">Example movie</div></div><div class="plot-container">A plot summary</div><div class="button-container"><button class="play-button">Play</button><button class="detail-button">Details</button></div></div></div></div><div class="homeSectionsContainer">Library rows</div></div></body></html>`);
  const box = await page.evaluate(() => {
   const stage = document.querySelector('#slides-container').getBoundingClientRect();
   const content = document.querySelector('.slide-content').getBoundingClientRect();
   const button = document.querySelector('.play-button').getBoundingClientRect();
   return {height: stage.height, rows: document.querySelector('.homeSectionsContainer').getBoundingClientRect().top, contentTop: content.top, contentBottom: content.bottom, buttonBottom: button.bottom, stageBottom: stage.bottom};
  });
  if(tv) { assert.equal(box.height,432); assert.ok(box.rows <= 450); assert.ok(box.contentTop >= 0); assert.ok(box.buttonBottom <= box.stageBottom); }
  else assert.equal(box.height,1080);
  console.log(tv ? 'TV' : 'Desktop', layout, JSON.stringify(box));
 }
 await browser.close();
})().catch(e => { console.error(e); process.exitCode=1; });
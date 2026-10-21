const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true,
  });
  try {
    const source = fs.readFileSync('jellyfin-plugin-media-bar-main/slideshowpure.js', 'utf8')
      .replace('\nbootstrap();', '\n');
    const css = fs.readFileSync('jellyfin-plugin-media-bar-main/slideshowpure.css', 'utf8');
    for (const theme of ['None', 'Halloween', 'Christmas']) {
      for (const device of ['web', 'tv', 'webos']) {
        const page = await browser.newPage({
          viewport: { width: 1920, height: 1080 },
          ...(device === 'webos' ? { userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV)' } : {}),
        });
        await page.setContent(`<html class="${device === 'tv' ? 'layout-tv' : ''}"><head><style>${css}</style></head><body style="background:#1c1d25"></body></html>`);
        await page.evaluate(({ source, theme }) => {
          window.MediaBarServerConfig = { SeasonalTheme: theme };
          new Function(source + '\nwindow.layoutSync = LayoutSync;')();
          window.slideshowPure.SlideUtils.getOrCreateSlidesContainer();
          window.slideshowPure.SlideUtils.getOrCreateSlidesContainer();
        }, { source, theme });
        const garland = page.locator('.ss-seasonal-garland');
        if (theme === 'None' || device !== 'web') {
          assert.equal(await garland.count(), 0, `${theme}/${device}: no decoration nodes or animations`);
        } else {
          assert.equal(await garland.count(), 1, 'Repeated initialization must not duplicate decoration');
          assert.equal(await garland.getAttribute('aria-hidden'), 'true');
          assert.equal(await garland.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
          const ornament = page.locator('.ss-garland-ornament').first();
          assert.equal(await ornament.evaluate(el => getComputedStyle(el).animationName), 'ss-garland-sway');
          const start = await ornament.evaluate(el => getComputedStyle(el).transform);
          await page.waitForTimeout(150);
          assert.notEqual(await ornament.evaluate(el => getComputedStyle(el).transform), start);
          await page.emulateMedia({ reducedMotion: 'reduce' });
          assert.equal(await ornament.evaluate(el => getComputedStyle(el).animationName), 'none');
          if (process.env.MEDIABAR_SCREENSHOTS) {
            await page.screenshot({ path: `.build-tools/seasonal-${theme}.png` });
          }
          // Observe switching modes on an already initialized web page.
          await page.evaluate(() => {
            window.layoutSync.init();
            document.documentElement.classList.add('layout-tv');
          });
          await garland.waitFor({ state: 'detached' });
          await page.evaluate(() => document.documentElement.classList.remove('layout-tv'));
          await garland.waitFor({ state: 'visible' });
        }
        console.log(`Seasonal garland verified: ${theme}/${device}`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

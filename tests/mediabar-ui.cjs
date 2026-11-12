const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true,
  });
  try {
    const source = fs.readFileSync('jellyfin-plugin-media-bar-main/slideshowpure.js', 'utf8').replace('\nbootstrap();', '\n');
    const css = fs.readFileSync('jellyfin-plugin-media-bar-main/slideshowpure.css', 'utf8');
    for (const width of [1920, 768, 390]) for (const card of [false, true]) {
      const page = await browser.newPage({ viewport: { width, height: 1080 } });
      await page.clock.install({ time: new Date('2026-10-15T12:00:00') });
      await page.setContent(`<html><head><style>${css}
        body { margin:0; background:#101927; }
        .skinHeader { position:fixed; top:0; left:0; right:0; height:64px; z-index:100; background:#1a2433; }
        #slides-container { ${card ? 'top:96px;left:24px;width:calc(100% - 48px);border-radius:20px;' : ''} background:linear-gradient(120deg,#312231,#526a65); }
        .test-content { position:absolute; top:240px; left:5%; color:white; font:32px sans-serif; }
      </style></head><body><header class="skinHeader">Jellyfin</header></body></html>`);
      await page.evaluate(source => {
        window.MediaBarServerConfig = { SeasonalTheme: 'Halloween' };
        new Function(source + '\nwindow.layoutSync = LayoutSync; window.addMediaBarControls = initArrowNavigation;')();
        const stage = window.slideshowPure.SlideUtils.getOrCreateSlidesContainer();
        stage.insertAdjacentHTML('beforeend', '<div class="test-content">Ein Filmabend im Herbst</div>');
      }, source);
      const geometry = await page.evaluate(() => {
        const stage = document.querySelector('#slides-container').getBoundingClientRect();
        const garland = document.querySelector('.ss-seasonal-garland').getBoundingClientRect();
        const wire = document.querySelector('.ss-garland-wire').getBoundingClientRect();
        const ornament = document.querySelector('.ss-garland-hanger').getBoundingClientRect();
        return { stageTop:stage.top, stageLeft:stage.left, stageWidth:stage.width,
          top:garland.top, bottom:garland.bottom, wireLeft:wire.left, wireWidth:wire.width, ornamentWidth:ornament.width };
      });
      assert.ok(Math.abs(geometry.top - (card ? geometry.stageTop + 64 : 80)) < 1);
      assert.ok(Math.abs(geometry.wireLeft - geometry.stageLeft) <= 2);
      assert.ok(Math.abs(geometry.wireWidth - geometry.stageWidth) <= 3, 'Cord spans the bar instead of letterboxing');
      assert.ok(geometry.ornamentWidth <= 34 && geometry.ornamentWidth >= 20);
      assert.ok(geometry.bottom - geometry.top <= 64, 'Decoration stays compact');

      // Controls are created after the decoration, and may remain hidden until hover.
      await page.evaluate(() => window.addMediaBarControls());
      const clearance = await page.evaluate(() => {
        const garland = document.querySelector('.ss-seasonal-garland').getBoundingClientRect();
        const settings = document.querySelector('.ss-settings-toggle').getBoundingClientRect();
        return garland.top - settings.bottom;
      });
      assert.ok(clearance >= 15, 'Garland must clear the toolbar even before hover');

      // A navigation row may have a zero-height wrapper and finish sizing after startup.
      await page.evaluate(() => {
        window.layoutSync.init();
        const header = document.querySelector('.skinHeader');
        header.style.height = '0';
        header.innerHTML = '<nav class="headerTop" style="height:190px;width:100%;position:absolute;top:0;left:0">Navigation</nav>';
      });
      await page.waitForFunction(() => document.querySelector('.ss-seasonal-garland').getBoundingClientRect().top >= 206);

      // Test the actual client settings UI, including administrator restrictions.
      await page.evaluate(() => {
        window.slideshowPure.ApiUtils.fetchViews = async () => [{ Id:'films', Name:'Filme' }];
        window.slideshowPure.settings.open();
      });
      const dialog = page.locator('[role="dialog"]');
      assert.equal(await dialog.getAttribute('aria-label'), 'Media-Bar-Einstellungen');
      const text = await dialog.textContent();
      assert.ok(text.includes('Auf Servervorgaben zurücksetzen'));
      assert.ok(text.includes('Vom Serveradministrator vorgegeben'));
      assert.ok(!/Slideshow|Motion effects|Libraries|Reset to server|Set by your/.test(text));
      assert.ok(await dialog.locator('.ss-settings-body').evaluate(el => el.scrollWidth <= el.clientWidth + 1),
        'German labels must fit without horizontal scrolling');
      if (process.env.MEDIABAR_SCREENSHOTS && width === 1920) {
        await page.screenshot({ path:`.build-tools/garland-${card ? 'card' : 'standard'}.png` });
      }
      console.log(`Responsive garland and German client UI verified: ${width}px/${card ? 'card' : 'standard'}`);
      await page.close();
    }

    const page = await browser.newPage();
    await page.evaluate(() => {
      window.savedConfig = null;
      window.Dashboard = { showLoadingMsg() {}, hideLoadingMsg() {}, processPluginConfigurationUpdateResult() {} };
      window.ApiClient = {
        getPluginConfiguration: async () => ({
          Enabled:'Enabled', UseAvatarsFile:true, AllowUnpinnedRefs:false, AvatarsPlaylist:'', VersionString:'embedded',
          WebConfig: { SelectionMode:'Latest', SeasonalTheme:'Christmas', ItemCount:12, MediaCategory:'Movies', LibraryNames:['Filme'], TvHeightPercent:50,
            ShuffleInterval:12000, RetryInterval:500, MinSwipeDistance:50, LoadingCheckInterval:100, MaxPlotLength:360,
            MaxMovies:-1, MaxTvShows:-1, MaxItems:50, PreloadCount:1, FadeTransitionDuration:500, SlideAnimationEnabled:true, EnableTrailers:false, SyncPageBackdrop:false },
        }),
        updatePluginConfiguration: async (_, config) => { window.savedConfig = config; },
      };
    });
    const html = fs.readFileSync('jellyfin-plugin-media-bar-main/Jellyfin.Plugin.MediaBar/Configuration/config.html', 'utf8');
    await page.setContent(html);
    await page.evaluate(() => document.querySelector('#mediaBarConfigurationPage').dispatchEvent(new Event('pageshow')));
    await page.waitForFunction(() => document.querySelector('#itemCount').value === '12');
    await page.getByRole('button', { name:'Darstellung und Inhalte' }).click();
    assert.equal(await page.locator('#seasonalTheme option:checked').textContent(), 'Weihnachten');
    assert.equal(await page.locator('#selectionMode option:checked').textContent(), 'Zuletzt hinzugefügt (neueste zuerst)');
    await page.getByRole('button', { name:'Speichern' }).click();
    const saved = await page.evaluate(() => window.savedConfig.WebConfig);
    assert.equal(saved.SelectionMode, 'Latest');
    assert.equal(saved.SeasonalTheme, 'Christmas');
    assert.equal(saved.MediaCategory, 'Movies');
    assert.deepEqual(saved.LibraryNames, ['Filme']);
    assert.equal(saved.ItemCount, 12);
    assert.equal(saved.TvHeightPercent, 50);
    console.log('German plugin settings round-trip verified; stored configuration values preserved');
    await page.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

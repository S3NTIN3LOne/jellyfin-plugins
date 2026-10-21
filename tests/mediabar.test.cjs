const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../jellyfin-plugin-media-bar-main/slideshowpure.js'), 'utf8');
function load(server = {}, stored = {}, userAgent = 'browser') {
  const classes = new Set();
  const styles = {};
  const context = vm.createContext({
    console, URLSearchParams, setTimeout, clearTimeout,
    navigator: { userAgent },
    window: { MediaBarServerConfig: server, location: { hash: '', search: '' } },
    document: {
      querySelector: () => null,
      getElementById: () => null,
      documentElement: { classList: { toggle: (key, on) => on ? classes.add(key) : classes.delete(key) },
        style: { setProperty: (key, value) => { styles[key] = value; } } },
    },
    localStorage: { getItem: () => JSON.stringify({ __v: 1, ...stored }) },
    sessionStorage: { getItem: () => JSON.stringify({ ids: ['old', 'new'], index: 1 }) },
  });
  // Suppress automatic browser startup; exercise the actual config and API code.
  vm.runInContext(source.replace('\nbootstrap();', '\n') + '\nthis.layoutSync = LayoutSync;', context);
  const api = context.window.slideshowPure;
  Object.assign(api.STATE.jellyfinData, { userId: 'user', accessToken: 'token', serverAddress: 'https://server' });
  return { api, context, classes, styles };
}

test('loading retains the slide timer so previews can advance, pause and resume', async () => {
  const { api, context } = load({ SelectionMode: 'Latest' });
  const callbacks = new Map();
  let nextId = 0;
  context.setInterval = callback => { callbacks.set(++nextId, callback); return nextId; };
  context.clearInterval = id => callbacks.delete(id);
  api.ApiUtils.fetchItemsFromServer = async () => [{ Id: 'one' }, { Id: 'two' }];
  api.SlideshowManager.createPaginationDots = () => {};
  // Rendering starts the retained timer only when a slide is ready.
  api.SlideshowManager.updateCurrentSlide = async () => {};
  await api.SlideshowManager.loadSlideshowData();
  const timer = api.STATE.slideshow.slideInterval;
  assert.ok(timer, 'loadSlideshowData must retain the timer for updateCurrentSlide');
  assert.equal(callbacks.size, 0, 'do not advance before rendering has completed');
  let advances = 0;
  api.SlideshowManager.nextSlide = () => advances++;
  api.VisibilityObserver.wasVisible = true;
  timer.restart();
  const tick = () => Array.from(callbacks.values()).forEach(callback => callback());
  tick(); tick();
  assert.equal(advances, 2, 'more than the first preview must advance');
  api.STATE.slideshow.isPaused = true;
  tick();
  api.STATE.slideshow.isPaused = false;
  api.STATE.slideshow.isVideoPlaying = true;
  tick();
  assert.equal(advances, 2, 'respect explicit pause and a playing trailer');
  api.SlideshowManager.setTrailerVisible = () => {};
  api.SlideshowManager.onTrailerEnded('one', null);
  assert.equal(advances, 3, 'a finished trailer advances to the next preview');
  api.VisibilityObserver.wasVisible = false;
  tick();
  assert.equal(advances, 3, 'do not advance off the home page');
  timer.stop();
});

test('server selection takes precedence over stored and runtime client preferences', () => {
  const { api } = load({ SelectionMode: 'Latest', ItemCount: 7, MediaCategory: 'Movies', LibraryNames: ['Kids'] },
    { maxItems: 100, maxMovies: 20, libraries: ['Private'], selectionMode: 'Client', mediaCategory: 'Series' });
  api.applyConfig({ maxItems: 1, libraries: [], selectionMode: 'Client' });
  assert.equal(api.CONFIG.selectionMode, 'Latest');
  assert.equal(api.CONFIG.maxItems, 7);
  assert.equal(api.CONFIG.mediaCategory, 'Movies');
  assert.deepEqual(Array.from(api.CONFIG.libraries), ['Kids']);
});

test('client mode preserves local library and count preferences', () => {
  const { api } = load({ SelectionMode: 'Client' }, { maxItems: 12, libraries: ['Movies'] });
  assert.equal(api.CONFIG.maxItems, 12);
  assert.deepEqual(Array.from(api.CONFIG.libraries), ['Movies']);
});

test('latest query is user scoped, includes watched titles without logos and uses creation date', async () => {
  const { api, context } = load({ SelectionMode: 'Latest', ItemCount: 2, MediaCategory: 'Movies' });
  let request;
  context.fetch = async (url) => {
    request = new URL(url);
    return { ok: true, json: async () => ({ Items: [{ Id: 'new', DateCreated: '2026-10-09' }] }) };
  };
  const items = await api.ApiUtils.fetchItemsFromServer();
  assert.equal(items.length, 1);
  assert.equal(request.searchParams.get('UserId'), 'user');
  assert.equal(request.searchParams.get('IncludeItemTypes'), 'Movie');
  assert.equal(request.searchParams.get('SortBy'), 'DateCreated,SortName');
  assert.equal(request.searchParams.get('SortOrder'), 'Descending');
  assert.equal(request.searchParams.get('Limit'), '2');
  assert.equal(request.searchParams.has('isPlayed'), false);
  assert.equal(request.searchParams.has('imageTypes'), false);
});

test('latest merges libraries globally by date, deduplicates and applies total limit', async () => {
  const { api } = load({ SelectionMode: 'Latest' });
  api.ApiUtils.fetchItemPage = async (_, __, library) => library.Id === 'a'
    ? [{ Id: 'old', DateCreated: '2026-01-01' }, { Id: 'shared', DateCreated: '2026-09-01' }]
    : [{ Id: 'new', DateCreated: '2026-10-01' }, { Id: 'shared', DateCreated: '2026-09-01' }];
  const items = await api.ApiUtils.fetchAcrossLibraries('Movie,Series', 2, [{ Id: 'a' }, { Id: 'b' }]);
  assert.deepEqual(Array.from(items, item => item.Id), ['new', 'shared']);
  assert.deepEqual(Array.from(api.SlideshowManager.applySessionOrder(items), item => item.Id), ['new', 'shared']);
  assert.equal(api.STATE.slideshow.resumeIndex, 0);
});

test('inaccessible configured libraries never fall back to unrestricted content', async () => {
  const { api } = load({ SelectionMode: 'Latest', LibraryNames: ['Restricted'] });
  api.ApiUtils.fetchViews = async () => [];
  api.ApiUtils.fetchItemPage = async () => { throw new Error('Must not fetch unrestricted items'); };
  assert.equal((await api.ApiUtils.fetchItemsFromServer()).length, 0);
});

test('server-managed selection bypasses playlists and list.txt', async () => {
  const { api } = load({ SelectionMode: 'Latest' });
  let listCalls = 0;
  let serverCalls = 0;
  api.ApiUtils.fetchListEntries = async () => { listCalls++; return { ids: ['old'], filters: [] }; };
  api.ApiUtils.fetchItemsFromServer = async () => { serverCalls++; return []; };
  api.SlideUtils.getOrCreateSlidesContainer = () => ({ style: {} });
  await api.SlideshowManager.loadSlideshowData();
  assert.equal(listCalls, 0);
  assert.equal(serverCalls, 1);
});

test('TV sizing detects webOS and leaves desktop unchanged', () => {
  const defaults = load({}, {}, 'Web0S');
  defaults.context.layoutSync.update();
  assert.equal(defaults.styles['--slideshow-tv-height'], '50vh');
  const tv = load({ TvHeightPercent: 40 }, {}, 'Mozilla/5.0 (Web0S; Linux/SmartTV)');
  tv.context.layoutSync.update();
  assert.equal(tv.classes.has('sspure-tv'), true);
  assert.equal(tv.styles['--slideshow-tv-height'], '40vh');
  const desktop = load();
  desktop.context.layoutSync.update();
  assert.equal(desktop.classes.has('sspure-tv'), false);
});

test('season is disabled by default and cannot be enabled by local preferences', () => {
  const { api } = load({}, { seasonalTheme: 'Halloween' });
  assert.equal(api.CONFIG.seasonalTheme, 'None');
});

test('season takes server category, libraries and count even in client selection mode', () => {
  const { api } = load({ SeasonalTheme: 'Halloween', ItemCount: 6, MediaCategory: 'Movies', LibraryNames: ['Family'] },
    { seasonalTheme: 'Christmas', maxItems: 100, libraries: ['Other'] });
  assert.equal(api.CONFIG.selectionMode, 'Client');
  assert.equal(api.CONFIG.seasonalTheme, 'Halloween');
  assert.equal(api.CONFIG.maxItems, 6);
  assert.deepEqual(Array.from(api.CONFIG.libraries), ['Family']);
});

test('Halloween queries only seasonal metadata in the selected library and includes titles without logos', async () => {
  const { api, context } = load({ SeasonalTheme: 'Halloween', ItemCount: 3, MediaCategory: 'Movies', LibraryNames: ['Family'] });
  api.ApiUtils.fetchViews = async () => [{ Id: 'family-id', Name: 'Family' }];
  const requests = [];
  context.fetch = async url => {
    requests.push(new URL(url));
    return { ok: true, json: async () => ({ Items: [{ Id: 'seasonal' }] }) };
  };
  const items = await api.ApiUtils.fetchItemsFromServer();
  assert.equal(items.length, 1); // Genre and tag matches must not duplicate slides.
  assert.equal(requests.length, 2);
  assert.deepEqual(requests.map(url => url.searchParams.get('Genres') || url.searchParams.get('Tags')), ['Horror', 'Halloween']);
  for (const url of requests) {
    assert.equal(url.searchParams.get('ParentId'), 'family-id');
    assert.equal(url.searchParams.get('IncludeItemTypes'), 'Movie');
    assert.equal(url.searchParams.get('UserId'), 'user');
    assert.equal(url.searchParams.has('isPlayed'), false);
    assert.equal(url.searchParams.has('imageTypes'), false);
  }
});

test('Christmas merges by newest date and total limit across metadata and libraries', async () => {
  const { api, context } = load({ SelectionMode: 'Latest', SeasonalTheme: 'Christmas', ItemCount: 2 });
  const requests = [];
  context.fetch = async url => {
    requests.push(new URL(url));
    return { ok: true, json: async () => ({ Items: [
      { Id: 'older', DateCreated: '2026-01-01' },
      { Id: 'newer', DateCreated: '2026-10-21' },
      { Id: 'middle', DateCreated: '2026-10-01' },
    ] }) };
  };
  const items = await api.ApiUtils.fetchAcrossLibraries('Series', 2, [{ Id: 'a' }, { Id: 'b' }]);
  assert.deepEqual(Array.from(items, item => item.Id), ['newer', 'middle']);
  assert.equal(requests.length, 4);
  requests.forEach(url => assert.equal(url.searchParams.get('Tags') || url.searchParams.get('Genres'), 'Christmas|Weihnachten|Xmas'));
});

test('empty seasonal results never trigger a nonseasonal fallback or playlist request', async () => {
  const { api, context } = load({ SeasonalTheme: 'Christmas' });
  api.ApiUtils.fetchListEntries = async () => { throw new Error('Season must bypass lists'); };
  api.SlideUtils.getOrCreateSlidesContainer = () => ({ style: {} });
  const requests = [];
  context.fetch = async url => {
    requests.push(new URL(url));
    return { ok: true, json: async () => ({ Items: [] }) };
  };
  await api.SlideshowManager.loadSlideshowData();
  assert.equal(requests.length, 2);
  assert.ok(requests.every(url => url.searchParams.has('Tags') || url.searchParams.has('Genres')));
  assert.equal(api.STATE.slideshow.totalItems, 0);
});

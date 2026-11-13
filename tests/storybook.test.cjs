"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "game.js"), "utf8");
function reader({
  mobile = false,
  reduced = false,
  saved = null,
  blockedStorage = false,
} = {}) {
  const dom = new JSDOM(html, {
      url: "https://example.test/banana-monkey-game-/",
      runScripts: "outside-only",
    }),
    w = dom.window;
  let now = 0,
    id = 0;
  const timers = new Map(),
    listeners = new Set();
  w.setTimeout = (fn, delay = 0) => {
    timers.set(++id, { fn, time: now + delay });
    return id;
  };
  w.clearTimeout = (id) => timers.delete(id);
  w.matchMedia = (query) => ({
    get matches() {
      return query.includes("700px") ? mobile : reduced;
    },
    addEventListener: (event, fn) => listeners.add(fn),
  });
  w.Element.prototype.animate = () => ({});
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  if (saved) w.localStorage.setItem("banana-monkey-storybook-v2", saved);
  if (blockedStorage) {
    w.Storage.prototype.setItem = () => {
      throw Error("storage disabled");
    };
    w.Storage.prototype.getItem = () => {
      throw Error("storage disabled");
    };
  }
  w.eval(script);
  const tick = (ms = 800) => {
    const end = now + ms;
    for (let count = 0; count < 500; count++) {
      const due = [...timers.entries()]
        .filter(([, t]) => t.time <= end)
        .sort((a, b) => a[1].time - b[1].time)[0];
      if (!due) break;
      now = due[1].time;
      timers.delete(due[0]);
      due[1].fn();
    }
    now = end;
  };
  const $ = (id) => w.document.getElementById(id);
  const next = () => {
    $("next").click();
    tick();
  };
  const prev = () => {
    $("prev").click();
    tick();
  };
  const pages = () =>
    [...$("book").querySelectorAll(".spread > .page[data-page]")].map(
      (p) => +p.dataset.page,
    );
  const key = (key) =>
    w.document.dispatchEvent(
      new w.KeyboardEvent("keydown", { key, bubbles: true }),
    );
  const swipe = (dx, dy = 0, cancel = false) => {
    for (const [type, x, y] of [
      ["pointerdown", 200, 200],
      [cancel ? "pointercancel" : "pointerup", 200 + dx, 200 + dy],
    ]) {
      const e = new w.Event(type, { bubbles: true });
      Object.assign(e, {
        clientX: x,
        clientY: y,
        pointerId: 1,
        isPrimary: true,
        button: 0,
      });
      $("book").dispatchEvent(e);
    }
    tick();
  };
  return {
    w,
    $,
    next,
    prev,
    pages,
    key,
    tick,
    swipe,
    resize: (value) => {
      mobile = value;
      listeners.forEach((fn) => fn());
    },
    close: () => dom.window.close(),
  };
}
test("desktop: cover, every spread, twelve unique illustrated actions, fake ending, reveal and replay", () => {
  const r = reader();
  assert(r.$("book").querySelector(".cover-wrap"));
  assert(r.$("prev").disabled);
  const arts = new Set();
  for (let i = 0; i < 5; i++) {
    r.next();
    assert.deepEqual(r.pages(), [i * 2, i * 2 + 1]);
    for (const p of r.$("book").querySelectorAll(".spread > .page")) {
      const art = p.querySelector(".illustration"),
        img = art.querySelector("img");
      assert(img.alt.length > 60);
      arts.add(img.getAttribute("src") + art.getAttribute("style"));
      assert(!p.textContent.includes("undefined"));
    }
  }
  r.next();
  assert.deepEqual(r.pages(), [10]);
  assert(r.$("book").querySelector(".credit-page"));
  assert(!r.$("book").textContent.includes("Peel Jr."));
  assert(!r.$("book").querySelector('[data-page="11"]'));
  r.tick(4200);
  assert(r.$("book").textContent.includes("WAAAAAAH!"));
  assert(r.$("next").textContent.includes("One more page"));
  r.next();
  assert.deepEqual(r.pages(), [10, 11]);
  assert(r.$("book").textContent.includes("diaper bill"));
  assert(r.$("book").textContent.includes("THE END. FOR REAL."));
  for (const p of r.$("book").querySelectorAll(".spread > .page")) {
    const art = p.querySelector(".illustration");
    arts.add(
      art.querySelector("img").getAttribute("src") + art.getAttribute("style"),
    );
  }
  assert.equal(arts.size, 12);
  r.tick(1000);
  assert(r.w.document.querySelector(".banana-projectile"));
  r.tick(2000);
  assert(!r.w.document.querySelector(".banana-projectile"));
  r.next();
  assert(r.$("book").querySelector(".cover-wrap"));
  r.close();
});
test("mobile: exactly one page at a time through all twelve, surprise stays concealed", () => {
  const r = reader({ mobile: true });
  for (let i = 0; i < 12; i++) {
    r.next();
    assert.deepEqual(r.pages(), [i]);
    assert.equal(r.$("book").querySelectorAll(".spread > .page").length, 1);
    if (i === 10) {
      assert(!r.$("book").textContent.includes("Peel Jr."));
      r.tick(4200);
      assert(r.$("book").textContent.includes("WAAAAAAH!"));
    }
  }
  assert(r.$("book").textContent.includes("Peel Jr."));
  r.prev();
  assert.deepEqual(r.pages(), [10]);
  r.close();
});
test("navigation: keyboard, backwards, rapid click protection, vertical scroll and horizontal swipe", () => {
  const r = reader({ mobile: true });
  r.key("ArrowLeft");
  assert.deepEqual(r.pages(), []);
  r.key("ArrowRight");
  r.tick();
  assert.deepEqual(r.pages(), [0]);
  r.swipe(10, -140);
  assert.deepEqual(r.pages(), [0]);
  r.swipe(-120, 5);
  assert.deepEqual(r.pages(), [1]);
  r.swipe(120, 10);
  assert.deepEqual(r.pages(), [0]);
  r.swipe(-120, 0, true);
  assert.deepEqual(r.pages(), [0]);
  r.$("next").click();
  r.$("next").click();
  r.$("next").click();
  r.tick();
  assert.deepEqual(r.pages(), [1]);
  r.key("Home");
  assert.deepEqual(r.pages(), []);
  r.close();
});
test("fake-ending timer is cancelled when leaving, and desktop reveal can be reversed", () => {
  const r = reader({ saved: JSON.stringify({ cursor: 10, revealed: false }) });
  r.prev();
  r.tick(5000);
  assert(!r.$("book").textContent.includes("WAAAAAAH!"));
  r.next();
  r.next();
  assert.deepEqual(r.pages(), [10, 11]);
  r.prev();
  assert.deepEqual(r.pages(), [10]);
  assert(r.$("book").querySelector(".credit-page"));
  r.prev();
  assert.deepEqual(r.pages(), [8, 9]);
  r.close();
});
test("progress restores safely across viewport changes and corrupt or blocked storage", () => {
  const r = reader({
    mobile: true,
    saved: JSON.stringify({ cursor: 7, revealed: false }),
  });
  assert.deepEqual(r.pages(), [7]);
  r.resize(false);
  assert.deepEqual(r.pages(), [6, 7]);
  r.resize(true);
  assert.deepEqual(r.pages(), [6]);
  r.$("restart").click();
  assert.equal(
    JSON.parse(r.w.localStorage.getItem("banana-monkey-storybook-v2")).cursor,
    -1,
  );
  r.close();
  for (const saved of [
    "{bad",
    '{"cursor":900}',
    '{"cursor":null}',
    '{"cursor":-9}',
  ]) {
    const q = reader({ saved });
    assert.deepEqual(q.pages(), []);
    q.close();
  }
  const blocked = reader({ blockedStorage: true });
  blocked.next();
  assert.deepEqual(blocked.pages(), [0, 1]);
  blocked.close();
});
test("reduced motion, dialog keyboard guard, and unavailable audio fail gracefully", () => {
  const r = reader({ reduced: true });
  r.next();
  r.next();
  assert(!r.$("book").querySelector(".turn-leaf"));
  r.$("credits-button").click();
  assert(r.$("about").open);
  r.key("ArrowRight");
  assert.deepEqual(r.pages(), [2, 3]);
  r.$("about").querySelector(".close-dialog").click();
  r.key("ArrowRight");
  assert.deepEqual(r.pages(), [4, 5]);
  r.$("sound").click();
  assert.equal(r.$("sound").getAttribute("aria-pressed"), "false");
  r.$("home").click();
  assert.deepEqual(r.pages(), []);
  r.close();
});
test("all assets exist, paths work under a GitHub Pages subdirectory, and illustrations are a complete 2x2 set", () => {
  const r = reader({ mobile: true, reduced: true });
  for (let i = 0; i < 12; i++) {
    r.next();
    const img = r.$("book").querySelector(".illustration img");
    const url = new URL(img.src);
    assert(url.pathname.startsWith("/banana-monkey-game-/assets/"));
    assert(fs.existsSync(path.join(root, img.getAttribute("src"))));
  }
  for (const f of [
    "style.css",
    "game.js",
    "assets/banana.svg",
    "assets/flying-banana.svg",
    ".nojekyll",
  ])
    assert(fs.existsSync(path.join(root, f)));
  for (const file of [
    "chapters-01-04.png",
    "chapters-05-08.png",
    "chapters-09-12.png",
  ]) {
    const b = fs.readFileSync(path.join(root, "assets", file));
    assert.equal(b.toString("ascii", 1, 4), "PNG");
    assert.equal(b.readUInt32BE(16), 1536);
    assert.equal(b.readUInt32BE(20), 1024);
  }
  r.close();
});

test("resizing the baby reveal keeps the reveal visible on desktop", () => {
  const r = reader({
    mobile: true,
    saved: JSON.stringify({ cursor: 11, revealed: false }),
  });
  assert.deepEqual(r.pages(), [11]);
  r.resize(false);
  assert.deepEqual(r.pages(), [10, 11]);
  assert(r.$("book").textContent.includes("Peel Jr."));
  r.close();
});

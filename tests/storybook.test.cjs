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
  speech = false,
  audio = false,
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
  if (speech) {
    w.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    w.speechSynthesis = {
      spoken: [],
      cancels: 0,
      cancel() {
        this.cancels++;
      },
      getVoices() {
        return [{ name: "English Natural", lang: "en-US" }];
      },
      speak(u) {
        this.spoken.push(u);
      },
    };
  }
  if (audio) {
    w.audioStarts = 0;
    const param = () => ({
      setValueAtTime() {},
      exponentialRampToValueAtTime() {},
      linearRampToValueAtTime() {},
      value: 0,
    });
    const node = () => ({
      connect() {},
      start() {
        w.audioStarts++;
      },
      stop() {},
      frequency: param(),
      gain: param(),
    });
    w.AudioContext = class {
      constructor() {
        this.currentTime = 0;
        this.sampleRate = 1000;
        this.destination = {};
      }
      resume() {}
      suspend() {}
      createOscillator() {
        return node();
      }
      createGain() {
        return node();
      }
      createBiquadFilter() {
        return node();
      }
      createBufferSource() {
        return node();
      }
      createBuffer(c, n) {
        return { getChannelData: () => new Float32Array(n) };
      }
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
  assert(r.$("next").textContent.includes("Reveal the surprise"));
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
  r.tick(3200);
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
    "story-revisions.png",
    "kindness-spread.png",
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

test("inside-book reveal prompt gets desktop and mobile readers to the twins", () => {
  for (const mobile of [false, true]) {
    const r = reader({
      mobile,
      saved: JSON.stringify({ cursor: 10, revealed: false }),
    });
    const prompt = r.$("book").querySelector("[data-reveal]");
    assert(prompt.textContent.includes("Turn the page"));
    assert(!r.$("book").textContent.includes("Peel Jr."));
    prompt.click();
    r.tick();
    assert(r.$("book").textContent.includes("Peel Jr. and Pip"));
    assert(r.$("book").textContent.includes("TWO MINI MONKEYS"));
    assert(r.$("book").textContent.includes("diaper bill"));
    r.close();
  }
});
test("secret art gags are optional, work on all four action pages, and never block the ending", () => {
  const r = reader({ mobile: true });
  for (let i = 0; i < 12; i++) {
    r.next();
    if ([3, 6, 8, 11].includes(i)) {
      const trigger = r.$("book").querySelector("[data-secret]");
      assert(trigger);
      trigger.click();
      assert(r.w.document.querySelector(".banana-projectile"));
      r.tick(2100);
    }
  }
  assert(r.$("book").textContent.includes("THE END. FOR REAL."));
  r.close();
});

test("Milo wins through brave kindness and befriends Bruno before the wedding", () => {
  const r = reader({ saved: JSON.stringify({ cursor: 6, revealed: false }) });
  const spread = r.$("book").textContent;
  assert(spread.includes("shelter Luna"));
  assert(spread.includes("made room under the leaf for Bruno"));
  assert(spread.includes("can I still come to the wedding"));
  assert(!spread.includes("backflipped"));
  assert(!spread.includes("ONE brain cell"));
  assert.equal(
    r.$("book").querySelector('[data-secret="6"]').getAttribute("aria-label"),
    "Send Milo’s brave leaf flying",
  );
  r.next();
  assert(r.$("book").textContent.includes("Bruno officiating"));
  r.close();
});

test("final banana grows to fill most of the viewport", () => {
  const r = reader({
    mobile: true,
    saved: JSON.stringify({ cursor: 11, revealed: true }),
  });
  r.$("book").querySelector('[data-secret="11"]').click();
  const banana = r.w.document.querySelector(".banana-projectile");
  assert(
    Number(banana.style.getPropertyValue("--big-scale")) * 90 >=
      r.w.innerWidth * 0.8,
  );
  assert(
    Number(banana.style.getPropertyValue("--end-scale")) >
      Number(banana.style.getPropertyValue("--big-scale")),
  );
  r.close();
});

test("optional narrator reads only visible pages and cancels when pages turn", () => {
  const r = reader({ speech: true, mobile: true });
  assert.equal(r.$("narrator").disabled, false);
  r.next();
  r.$("narrator").click();
  let speech = r.w.speechSynthesis;
  assert(speech.spoken.at(-1).text.includes("premium bananas"));
  const old = speech.spoken.at(-1),
    cancels = speech.cancels;
  r.next();
  assert(speech.cancels > cancels);
  assert(speech.spoken.at(-1).text.includes("eighteen banana splits"));
  const total = speech.spoken.length;
  old.onend();
  r.tick(1000);
  assert.equal(speech.spoken.length, total);
  r.$("narrator").click();
  assert.equal(r.$("narrator").getAttribute("aria-pressed"), "false");
  r.close();
});
test("narrator does not spoil concealed twins, and disabled browser speech is handled", () => {
  const r = reader({
    speech: true,
    saved: JSON.stringify({ cursor: 10, revealed: false }),
  });
  r.$("narrator").click();
  assert(!r.w.speechSynthesis.spoken.at(-1).text.includes("Peel Jr."));
  r.$("book").querySelector("[data-reveal]").click();
  r.tick();
  assert(r.w.speechSynthesis.spoken.at(-1).text.includes("Happily"));
  r.w.speechSynthesis.spoken.at(-1).onend();
  r.tick(1000);
  assert(r.w.speechSynthesis.spoken.at(-1).text.includes("Peel Jr."));
  r.close();
  const q = reader();
  assert(q.$("narrator").disabled);
  q.close();
});
test("every page has a short scene cue; sound effects can be muted independently of narration", () => {
  const r = reader({ audio: true, speech: true, mobile: true });
  r.$("sound").click();
  for (let i = 0; i < 12; i++) {
    const before = r.w.audioStarts;
    r.next();
    r.tick(1000);
    assert(r.w.audioStarts > before);
    assert(r.$("book").querySelector(".scene-reaction").textContent.length > 0);
  }
  r.$("narrator").click();
  const spoken = r.w.speechSynthesis.spoken.length;
  r.$("sound").click();
  assert.equal(r.$("sound").getAttribute("aria-pressed"), "false");
  assert.equal(r.$("narrator").getAttribute("aria-pressed"), "true");
  assert.equal(r.w.speechSynthesis.spoken.length, spoken);
  r.$("sound").click();
  r.tick(1000);
  assert.equal(r.w.speechSynthesis.spoken.length, spoken);
  r.close();
});

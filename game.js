/* Banana Monkey — a twelve-page picture book. No network calls or build step. */
"use strict";
const STORY = [
  {
    title: "The lonely <em>monkey.</em>",
    kicker: "SINGLE. VERY SINGLE.",
    narration:
      "Milo was single, and his mom had already named his future grandchildren.",
    lines: [["Milo", "“Mom, I can’t even afford premium bananas!”"]],
    caption: "A ROMANCE WITH A LIMITED BUDGET",
    alt: "Milo panics on a phone call with his mother in a cramped treehouse, surrounded by bills, a dying plant, and one lonely banana.",
  },
  {
    title: "Love at first <em>swipe.</em>",
    kicker: "WELCOME TO BANANAR",
    narration:
      "He joined BANANAR and accidentally matched with a literal banana.",
    lines: [
      [
        "Profile",
        "“Professional Banana Inspector · Emotionally available · Financially questionable”",
      ],
    ],
    caption: "GREAT PROFILE. ZERO CONVERSATION.",
    alt: "Milo stares at his phone in disbelief across a candlelit table from a real banana wearing a bow tie.",
  },
  {
    title: "An a-peeling <em>match.</em>",
    kicker: "THEN ALONG CAME LUNA",
    narration: "Luna: a monkey with standards—apparently flexible ones",
    lines: [
      ["Milo", "“Are you a banana? Because you’re a-peeling.”"],
      ["Luna", "“That was awful—when are you free?”"],
    ],
    caption: "THE BAR WAS LOW. HE TRIPPED OVER IT.",
    alt: "Nervous Milo presents a banana bouquet to Luna on a sunset park bench; Luna raises a sarcastic eyebrow, her red bow bright in her hair.",
  },
  {
    title: "He fell. <em>Hard.</em>",
    kicker: "THE FIRST DATE",
    narration:
      "At the banana café, Milo slipped on a peel and sent his smoothie into low orbit.",
    lines: [["Luna", "“You really fell for me, huh?”"]],
    caption: "SMOOTHIE: 1. DIGNITY: 0.",
    alt: "Milo flies backward through the air over a banana peel as his pink smoothie arcs above him; Luna laughs at her café table and a frog waiter looks horrified.",
    effect: "slip",
  },
  {
    title: "His last <em>banana.</em>",
    kicker: "THE GOOD KIND OF BANANAS",
    narration: "They laughed, dated, and cuddled beneath the stars.",
    lines: [
      [
        "Narrator",
        "“For the first time, Milo found someone worth sharing his last banana with.”",
      ],
    ],
    caption: "THIS WAS FINANCIALLY SIGNIFICANT.",
    alt: "Milo and Luna cuddle on a picnic blanket under a star-filled jungle sky, laughing and sharing one last banana while an owl looks away.",
    effect: "hearts",
  },
  {
    title: "Enter <em>Bruno.</em>",
    kicker: "47 BANANAS. NO SELF-AWARENESS.",
    narration: "Bruno: 47 bananas and the confidence of a man never told “no”",
    lines: [
      [
        "Bruno",
        "“Hey beautiful—I own three trees and have zero emotional baggage.”",
      ],
      ["Milo", "“I own a houseplant—it’s dying.”"],
    ],
    caption: "REAL ESTATE IS NOT A PERSONALITY.",
    alt: "Huge purple-shirted gorilla Bruno makes a heroic entrance carrying a mountain of bananas; tiny Milo holds a pathetic dying houseplant and Luna looks unimpressed.",
  },
  {
    title: "A very smooth <em>move.</em>",
    kicker: "TWO MEN. ONE SHARED BRAIN CELL.",
    narration: "Bruno flirted; Milo challenged him.",
    lines: [
      [
        "Narrator",
        "Bruno flexed out of his shirt; Milo backflipped directly into a banana smoothie.",
      ],
    ],
    caption: "NEITHER HAD A BACKUP PLAN.",
    alt: "Bruno flexes so hard his purple sleeves rip while upside-down Milo lands headfirst in a giant pink smoothie; Luna facepalms in the background.",
    effect: "chaos",
  },
  {
    title: "Three trees. <em>One idiot.</em>",
    kicker: "A SMALL MISUNDERSTANDING",
    narration: "A misunderstanding, a kiss, and absolutely no competition",
    lines: [
      ["Luna", "“Milo! I don’t want a gorilla!”"],
      ["Milo", "“But he has THREE TREES!”"],
      ["Luna", "“And apparently ONE brain cell!”"],
    ],
    caption: "COMMUNICATION. AN UNEXPECTED CONCEPT.",
    alt: "Luna holds Milo’s face and kisses his cheek on a moonlit footbridge; both laugh, with pink smoothie still in his hair and Bruno fussing over trees far behind.",
  },
  {
    title: "The wrong <em>pocket.</em>",
    kicker: "THE PROPOSAL",
    narration: "One knee, one ring box… one tiny banana",
    lines: [
      ["Luna", "“Is that… a banana?”"],
      ["Milo", "“Wrong pocket—WAIT!”"],
      ["Luna", "“YES!”"],
    ],
    caption: "HE FOUND THE RING. EVENTUALLY.",
    alt: "Milo kneels in a fairy-lit garden and opens a velvet box containing a tiny banana, frantically searching his other pocket for the real ring as Luna laughs.",
  },
  {
    title: "I now pronounce you <em>bananas.</em>",
    kicker: "THE JUNGLE WEDDING",
    narration:
      "They married beneath the banana trees, with Bruno officiating and crying hysterically.",
    lines: [["Bruno", "“You may now kiss your… sniff… banana.”"]],
    caption: "SOMETHING BORROWED. SOMETHING BRUNO.",
    alt: "Milo and Luna kiss under a jungle wedding arch; Luna wears her red bow and a veil, while purple-shirted Bruno officiates behind them, sobbing into a tissue.",
    effect: "hearts",
  },
  {
    title: "Happily <em>ever after.</em>",
    kicker: "AND SO, DEAR READER…",
    narration: "And they lived happily ever after.",
    lines: [["Narrator", "The end."]],
    caption: "A COMPLETELY NORMAL ENDING.",
    alt: "Married Milo and Luna sit together on a tree branch beneath a banana-shaped moon, tails curling into a heart against a vast peaceful starry sky.",
    effect: "ending",
  },
  {
    title: "A very small <em>plot twist.</em>",
    kicker: "ONE YEAR LATER…",
    narration: "Peel Jr.: banana-peel hat, excellent aim, absolutely no income",
    lines: [
      ["Bruno", "“WAIT! YOU TWO MADE A MINI MONKEY?!”"],
      ["Milo", "“I thought marriage was bananas.”"],
      ["Luna", "“Wait until you see the diaper bill.”"],
    ],
    caption: "THE END. FOR REAL. 🍌",
    alt: "Luna cradles baby Peel Jr., who wears a banana-peel hat and throws a banana toward the reader; exhausted Milo holds a huge diaper bill while Bruno bursts through the nursery window.",
    effect: "baby",
  },
];
const $ = (id) => document.getElementById(id);
const media = window.matchMedia("(max-width: 700px)");
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const STORAGE = "banana-monkey-storybook-v2";
let cursor = -1,
  revealed = false,
  cryReady = false,
  busy = false,
  audioOn = false,
  audioContext,
  cryTimer,
  flipTimer,
  actionTimer,
  pointerStart;
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (
      saved &&
      Number.isInteger(saved.cursor) &&
      saved.cursor >= -1 &&
      saved.cursor < 12
    ) {
      cursor = saved.cursor;
      revealed = saved.revealed === true;
    }
  } catch {}
}
function save() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({ cursor, revealed }));
  } catch {}
}
function alignCursor() {
  if (cursor === 11) revealed = true;
  if (!media.matches && cursor >= 0) cursor = Math.floor(cursor / 2) * 2;
}
function artMarkup(i) {
  const sheet = Math.floor(i / 4) + 1,
    x = i % 2,
    y = Math.floor((i % 4) / 2);
  return `<div class="illustration" style="--x:${x};--y:${y}"><span class="loading-art" aria-hidden="true">A little jungle magic…</span><img src="./assets/chapters-${sheet === 1 ? "01-04" : sheet === 2 ? "05-08" : "09-12"}.png" alt="${STORY[i].alt}" draggable="false" decoding="async"><div class="ill-overlay" aria-hidden="true">${i === 3 ? '<span class="sfx sfx-slip">whoooops.</span>' : i === 6 ? '<span class="sfx sfx-chaos">SPLORP!</span>' : i === 11 ? '<span class="sfx sfx-burst">SURPRISE.</span>' : i === 4 || i === 9 ? '<span class="heart-spark" style="left:17%;top:26%">✧</span><span class="heart-spark" style="left:79%;top:16%;animation-delay:1s">✦</span>' : ""}</div></div>`;
}
function pageMarkup(i, side = "left", animate = true) {
  const s = STORY[i];
  return `<article class="page ${side} ${animate ? "enter" : ""} ${i === 10 ? "fake-ending" : ""}" aria-label="Page ${i + 1}: ${s.title.replace(/<[^>]*>/g, "")}" data-page="${i}"><div class="page-kicker"><span>${s.kicker}</span><span class="chapter">${String(i + 1).padStart(2, "0")}</span></div>${artMarkup(i)}<h2 class="page-title">${s.title}</h2><p class="narration">${s.narration}</p><div class="dialogue">${s.lines.map(([speaker, line], n) => `<p class="line ${speaker.toLowerCase()}" style="--line:${n}"><span class="speaker">${speaker}</span>${line}</p>`).join("")}</div>${i === 11 ? '<div class="real-end">THE END. FOR REAL. 🍌</div>' : ""}<div class="page-bottom"><span>${i === 11 ? "NO RETURNS. NO REFUNDS." : s.caption}</span><span class="folio">${i + 1}</span></div></article>`;
}
function creditsMarkup() {
  return `<article class="page right credit-page" aria-label="Closing credits"><div class="colophon-flower" aria-hidden="true">❧</div><span class="eyebrow">A BANANA MONKEY PRODUCTION</span><h2>That’s all,<br>sweet reader.</h2><p>One awkward monkey.<br>One very patient monkey.<br>A perfectly sensible ending.</p><div class="credits"><span>STARRING <b>MILO & LUNA</b></span><span>EMOTIONAL SUPPORT <b>BRUNO</b></span><span>CATERING <b>ALSO BRUNO</b></span><span>FILMED ENTIRELY ON <b>THREE TREES</b></span></div><div id="cry-slot">${cryReady ? cryMarkup() : ""}</div><div class="page-bottom"><span>THANK YOU FOR READING</span><span class="flourish">❧</span></div></article>`;
}
function cryMarkup() {
  return '<div class="cry" role="status">WAAAAAAH!</div><p class="cry-caption">…that wasn’t in the credits.</p>';
}
function coverMarkup() {
  return `<section class="cover-wrap" aria-label="Book cover"><div class="cover-type"><span class="cover-eyebrow">A JUNGLE ROMANTIC COMEDY</span><h2 class="cover-title">Banana<br>Monkey<br><em>Love Quest.</em></h2><p class="cover-subtitle">A love story, with issues.</p><div class="cover-rule"></div><p class="cover-description">He wanted a soulmate.<br>He got a story worth telling.<br>And a truly alarming banana bill.</p><span class="cover-imprint">THE ILLUSTRATED EDITION &nbsp; · &nbsp; VOL. 01</span></div><div class="cover-art"><div class="cover-window"><img src="./assets/chapters-01-04.png" alt="Milo nervously offers a banana bouquet to a very amused Luna." draggable="false"></div><div class="cover-seal"><strong>12</strong><span>PAGES OF</span><span>BAD DECISIONS</span></div></div><span class="cover-corner" aria-hidden="true">❧</span></section>`;
}
function visiblePages() {
  if (cursor < 0) return [];
  if (media.matches) return [cursor];
  if (cursor === 10 && !revealed) return [10];
  return [cursor, cursor + 1];
}
function isFinal() {
  return cursor === 11 || (!media.matches && cursor === 10 && revealed);
}
function isFakeEnding() {
  return cursor === 10 && !isFinal();
}
function render(animate = true) {
  clearTimeout(cryTimer);
  clearTimeout(actionTimer);
  alignCursor();
  $("book").classList.toggle("is-open", cursor >= 0);
  $("book").innerHTML =
    cursor < 0
      ? coverMarkup()
      : `<div class="spread">${media.matches ? pageMarkup(cursor, "left", animate) : pageMarkup(cursor, "left", animate) + (cursor === 10 && !revealed ? creditsMarkup() : pageMarkup(cursor + 1, "right", animate))}</div>`;
  updateNavigation();
  const pages = visiblePages();
  $("announcement").textContent =
    cursor < 0
      ? "Book cover. Open the book to begin."
      : pages
          .map(
            (i) => `Page ${i + 1}: ${STORY[i].title.replace(/<[^>]*>/g, "")}`,
          )
          .join(". ");
  if (isFakeEnding()) {
    if (!cryReady) cryTimer = setTimeout(revealCry, 4200);
    if (media.matches && cryReady) injectMobileCry();
  }
  if (isFinal() && animate) actionTimer = setTimeout(throwBanana, 1700);
  save();
}
function updateNavigation() {
  $("prev").disabled = cursor < 0;
  let label =
    cursor < 0
      ? "Open the book"
      : isFinal()
        ? "Read it again"
        : isFakeEnding()
          ? cryReady
            ? "One more page?"
            : "The end…?"
          : "Turn the page";
  $("next").querySelector(".button-label").textContent = label;
  $("next").setAttribute("aria-label", label);
  $("position").textContent =
    cursor < 0
      ? "A LOVE STORY, WITH ISSUES"
      : isFinal()
        ? "THE END. FOR REAL."
        : media.matches
          ? `PAGE ${String(cursor + 1).padStart(2, "0")} OF 12`
          : cursor === 10
            ? "THE END. PROBABLY."
            : `PAGES ${String(cursor + 1).padStart(2, "0")} — ${String(cursor + 2).padStart(2, "0")} OF 12`;
  $("dots").innerHTML = STORY.map(
    (_, i) =>
      `<span class="${visiblePages().includes(i) ? "active" : i < cursor ? "read" : ""}" aria-hidden="true"></span>`,
  ).join("");
  $("dots").setAttribute(
    "aria-label",
    cursor < 0 ? "Not started" : `Reading page ${cursor + 1} of 12`,
  );
  $("hint").innerHTML =
    cursor < 0
      ? "12 illustrated pages <span>·</span> About 3 minutes <span>·</span> Best enjoyed with a banana"
      : isFinal()
        ? "Thank you for reading. Your last banana is safe with us."
        : media.matches
          ? "Swipe to turn <span>·</span> Tap the arrows <span>·</span> Take your sweet time"
          : "Use ← → to turn the pages <span>·</span> Take your sweet time";
}
function injectMobileCry() {
  const page = $("book").querySelector(".page");
  if (page && !page.querySelector(".cry")) {
    const div = document.createElement("div");
    div.className = "mobile-cry";
    div.innerHTML = cryMarkup();
    page.querySelector(".dialogue").replaceChildren(div);
  }
}
function revealCry() {
  if (!isFakeEnding()) return;
  cryReady = true;
  const slot = $("cry-slot");
  if (slot) slot.innerHTML = cryMarkup();
  if (media.matches) injectMobileCry();
  updateNavigation();
  $("announcement").textContent =
    "WAAAAAAH! Wait. That wasn’t in the credits. One more page?";
  playSound("cry");
}
function navigate(direction) {
  if (busy) return;
  if (direction < 0 && cursor < 0) return;
  const book = $("book"),
    old =
      cursor < 0
        ? book.querySelector(".cover-wrap")
        : book.querySelector(
            direction > 0 && !media.matches ? ".page.right" : ".page.left",
          );
  const clone = old?.cloneNode(true);
  const fromCover = cursor < 0;
  clearTimeout(cryTimer);
  clearTimeout(actionTimer);
  if (direction > 0) {
    if (cursor < 0) {
      cursor = 0;
      revealed = false;
      cryReady = false;
    } else if (isFinal()) {
      cursor = -1;
      revealed = false;
      cryReady = false;
    } else if (!media.matches && cursor === 10 && !revealed) {
      revealed = true;
      cryReady = false;
    } else {
      cursor += media.matches ? 1 : 2;
    }
  } else {
    if (!media.matches && cursor === 10 && revealed) {
      revealed = false;
      cryReady = false;
    } else {
      cursor = Math.max(-1, cursor - (media.matches ? 1 : 2));
      cryReady = false;
    }
  }
  render();
  playSound("page");
  if (!motion.matches && clone && !fromCover && cursor >= 0) {
    busy = true;
    clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    clone.classList.remove("enter");
    const leaf = document.createElement("div");
    leaf.className = `turn-leaf ${direction > 0 ? "forward-turn" : "backward-turn"}`;
    leaf.setAttribute("aria-hidden", "true");
    leaf.append(clone);
    book.append(leaf);
    flipTimer = setTimeout(() => {
      leaf.remove();
      busy = false;
    }, 720);
  } else if (fromCover && !motion.matches) {
    busy = true;
    flipTimer = setTimeout(() => {
      busy = false;
    }, 650);
    book.animate(
      [
        { transform: "rotateY(-7deg) scale(.98)" },
        { transform: "rotateY(0) scale(1)" },
      ],
      { duration: 650, easing: "ease-out" },
    );
  }
}
function returnToCover() {
  clearTimeout(cryTimer);
  clearTimeout(flipTimer);
  clearTimeout(actionTimer);
  busy = false;
  cursor = -1;
  revealed = false;
  cryReady = false;
  render();
}
function throwBanana() {
  if (!isFinal()) return;
  playSound("banana");
  if (motion.matches) return;
  const banana = document.createElement("img");
  banana.src = "./assets/flying-banana.svg";
  banana.alt = "";
  banana.setAttribute("aria-hidden", "true");
  banana.className = "banana-projectile";
  const splat = document.createElement("div");
  splat.className = "banana-splat";
  splat.setAttribute("aria-hidden", "true");
  document.body.append(banana, splat);
  setTimeout(() => {
    banana.remove();
    splat.remove();
  }, 1600);
}
function playSound(kind) {
  if (!audioOn) return;
  try {
    audioContext =
      audioContext || new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const now = audioContext.currentTime;
    if (kind === "page") {
      const count = Math.floor(audioContext.sampleRate * 0.18),
        buffer = audioContext.createBuffer(1, count, audioContext.sampleRate),
        data = buffer.getChannelData(0);
      for (let i = 0; i < count; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / count);
      const source = audioContext.createBufferSource(),
        filter = audioContext.createBiquadFilter(),
        gain = audioContext.createGain();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 1300;
      gain.gain.value = 0.13;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      source.start();
    } else {
      const osc = audioContext.createOscillator(),
        gain = audioContext.createGain();
      osc.type = kind === "cry" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(kind === "cry" ? 620 : 260, now);
      osc.frequency.exponentialRampToValueAtTime(
        kind === "cry" ? 430 : 85,
        now + 0.32,
      );
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(now + 0.42);
    }
  } catch {
    audioOn = false;
    updateSoundButton();
  }
}
function updateSoundButton() {
  const b = $("sound");
  b.setAttribute("aria-pressed", String(audioOn));
  b.setAttribute("aria-label", audioOn ? "Turn sound off" : "Turn sound on");
  b.innerHTML = audioOn
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6"/></svg>';
}
function init() {
  readSaved();
  alignCursor();
  render(false);
  $("next").addEventListener("click", () => navigate(1));
  $("prev").addEventListener("click", () => navigate(-1));
  $("home").addEventListener("click", (e) => {
    e.preventDefault();
    returnToCover();
  });
  $("restart").addEventListener("click", returnToCover);
  $("sound").addEventListener("click", () => {
    audioOn = !audioOn;
    updateSoundButton();
    playSound("page");
  });
  $("credits-button").addEventListener("click", () => $("about").showModal());
  $("about")
    .querySelector(".close-dialog")
    .addEventListener("click", () => $("about").close());
  $("about").addEventListener("click", (e) => {
    if (e.target === $("about")) {
      const r = $("about").getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        $("about").close();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      $("about").open ||
      e.altKey ||
      e.metaKey ||
      e.ctrlKey ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
    )
      return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      navigate(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigate(-1);
    }
    if (e.key === "Home") {
      e.preventDefault();
      returnToCover();
    }
  });
  $("book").addEventListener("pointerdown", (e) => {
    if (e.isPrimary === false || e.button !== 0) return;
    pointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  $("book").addEventListener("pointerup", (e) => {
    if (!pointerStart || pointerStart.id !== e.pointerId) return;
    const dx = e.clientX - pointerStart.x,
      dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4)
      navigate(dx < 0 ? 1 : -1);
  });
  $("book").addEventListener("pointercancel", () => (pointerStart = null));
  media.addEventListener("change", () => {
    clearTimeout(flipTimer);
    busy = false;
    render(false);
  });
}
init();

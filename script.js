const STORAGE_KEY = "plankton-gen-custom-terms";
const HISTORY_LIMIT = 8;

const basePrefixes = [
  "プランクトン",
  "ミトコンドリア",
  "カルシウム",
  "オブラート",
  "レンコン",
  "ジンジャーエール",
  "よもぎもち",
  "アスファルト",
  "ラジオ体操",
  "カスタネット",
  "レモンサワー",
  "大気圏",
  "ペペロンチーノ",
  "ホワイトボード",
  "タルタルソース",
  "蛍光灯",
  "ハイボール缶",
  "黒板けし",
  "ガードレール",
  "ぬるま湯",
  "ショベルカー",
  "セルフレジ",
  "マカロニ",
  "三角コーン",
  "冷凍うどん",
  "中二階",
  "サーモグラフィー",
  "ポリバケツ",
  "エリンギ",
  "月謝袋",
  "スニーカー箱",
  "バーベキュー網",
  "木工用ボンド",
  "空中ブランコ",
  "炭酸水",
  "ビニール傘",
  "オムライス",
  "砂利道",
  "ホコリ取り",
  "卓上カレンダー"
];

const baseSuffixes = [
  "後藤",
  "前田",
  "田所",
  "佐々木",
  "沼田",
  "西岡",
  "梅沢",
  "川原",
  "藤宮",
  "大村",
  "神谷",
  "児玉",
  "竹下",
  "赤松",
  "日比野",
  "仲宗根",
  "小野寺",
  "久保田",
  "有村",
  "真壁",
  "金城",
  "鳥居",
  "白石",
  "羽柴",
  "二階堂",
  "百瀬",
  "多賀谷",
  "犬飼",
  "諸星",
  "出水",
  "樽見",
  "古賀",
  "柳沢",
  "黒木",
  "長内",
  "茂木",
  "桐山",
  "国府田",
  "鶴岡",
  "南雲"
];

const prefixDisplay = document.querySelector("#prefixDisplay");
const suffixDisplay = document.querySelector("#suffixDisplay");
const fullNameDisplay = document.querySelector("#fullNameDisplay");
const prefixCount = document.querySelector("#prefixCount");
const suffixCount = document.querySelector("#suffixCount");
const comboCount = document.querySelector("#comboCount");
const prefixCatalog = document.querySelector("#prefixCatalog");
const suffixCatalog = document.querySelector("#suffixCatalog");
const historyList = document.querySelector("#historyList");
const generateButton = document.querySelector("#generateButton");
const termForm = document.querySelector("#termForm");
const prefixInput = document.querySelector("#prefixInput");
const suffixInput = document.querySelector("#suffixInput");
const resetCustomButton = document.querySelector("#resetCustomButton");
const prefixSlot = document.querySelector("#prefixSlot");
const suffixSlot = document.querySelector("#suffixSlot");
const settingsModal = document.querySelector("#settingsModal");
const openModalButton = document.querySelector("#openModalButton");
const closeModalButton = document.querySelector("#closeModalButton");
const modalBackdrop = document.querySelector("#modalBackdrop");

let customPrefixes = [];
let customSuffixes = [];
let history = [];
let activeRunId = 0;

function loadCustomTerms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    customPrefixes = Array.isArray(parsed.prefixes) ? parsed.prefixes : [];
    customSuffixes = Array.isArray(parsed.suffixes) ? parsed.suffixes : [];
  } catch {
    customPrefixes = [];
    customSuffixes = [];
  }
}

function saveCustomTerms() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ prefixes: customPrefixes, suffixes: customSuffixes })
  );
}

function dedupe(list) {
  return [...new Set(list.map((item) => item.trim()).filter(Boolean))];
}

function getPrefixes() {
  return dedupe([...basePrefixes, ...customPrefixes]);
}

function getSuffixes() {
  return dedupe([...baseSuffixes, ...customSuffixes]);
}

function pickRandom(list, exceptValue = "") {
  if (list.length === 1) {
    return list[0];
  }

  let candidate = exceptValue;
  while (candidate === exceptValue) {
    candidate = list[Math.floor(Math.random() * list.length)];
  }

  return candidate;
}

function renderStats() {
  const prefixes = getPrefixes();
  const suffixes = getSuffixes();
  prefixCount.textContent = prefixes.length.toLocaleString("ja-JP");
  suffixCount.textContent = suffixes.length.toLocaleString("ja-JP");
  comboCount.textContent = (prefixes.length * suffixes.length).toLocaleString("ja-JP");
}

function renderCatalog() {
  prefixCatalog.textContent = getPrefixes().join(" / ");
  suffixCatalog.textContent = getSuffixes().join(" / ");
}

function renderHistory() {
  historyList.innerHTML = "";

  history.forEach((name) => {
    const item = document.createElement("li");
    item.textContent = name;
    historyList.appendChild(item);
  });
}

function updateResult(prefix, suffix) {
  prefixDisplay.textContent = prefix;
  suffixDisplay.textContent = suffix;
  fullNameDisplay.textContent = `${prefix}${suffix}`;

  history = [fullNameDisplay.textContent, ...history.filter((item) => item !== fullNameDisplay.textContent)]
    .slice(0, HISTORY_LIMIT);
  renderHistory();
}

function toggleRollingState(isRolling) {
  prefixSlot.classList.toggle("rolling", isRolling);
  suffixSlot.classList.toggle("rolling", isRolling);
  fullNameDisplay.classList.toggle("rolling", isRolling);
  generateButton.disabled = isRolling;
}

function spinSlot({ list, display, steps, baseDelay, variance, exceptValue, runId, onTick, onDone }) {
  let count = 0;
  let previousValue = display.textContent;

  function tick() {
    if (runId !== activeRunId) {
      return;
    }

    const nextValue = pickRandom(list, previousValue);
    display.textContent = nextValue;
    previousValue = nextValue;
    onTick();
    count += 1;

    if (count >= steps) {
      const finalValue = pickRandom(list, exceptValue || previousValue);
      display.textContent = finalValue;
      onDone(finalValue);
      return;
    }

    const delay = baseDelay + count * variance;
    window.setTimeout(tick, delay);
  }

  tick();
}

function animateRoulette() {
  const prefixes = getPrefixes();
  const suffixes = getSuffixes();
  const runId = activeRunId + 1;
  let finalPrefix = prefixDisplay.textContent;
  let finalSuffix = suffixDisplay.textContent;
  let completedSlots = 0;

  activeRunId = runId;
  toggleRollingState(true);

  function syncFullName() {
    fullNameDisplay.textContent = `${prefixDisplay.textContent}${suffixDisplay.textContent}`;
  }

  function handleDone() {
    completedSlots += 1;
    if (completedSlots < 2) {
      return;
    }

    toggleRollingState(false);
    updateResult(finalPrefix, finalSuffix);
  }

  spinSlot({
    list: prefixes,
    display: prefixDisplay,
    steps: 26,
    baseDelay: 38,
    variance: 3,
    exceptValue: prefixDisplay.textContent,
    runId,
    onTick: syncFullName,
    onDone: (value) => {
      finalPrefix = value;
      syncFullName();
      prefixSlot.classList.remove("rolling");
      handleDone();
    }
  });

  spinSlot({
    list: suffixes,
    display: suffixDisplay,
    steps: 32,
    baseDelay: 42,
    variance: 4,
    exceptValue: suffixDisplay.textContent,
    runId,
    onTick: syncFullName,
    onDone: (value) => {
      finalSuffix = value;
      syncFullName();
      suffixSlot.classList.remove("rolling");
      handleDone();
    }
  });
}

function addTerms(prefix, suffix) {
  let changed = false;

  if (prefix) {
    customPrefixes = dedupe([...customPrefixes, prefix]);
    changed = true;
  }

  if (suffix) {
    customSuffixes = dedupe([...customSuffixes, suffix]);
    changed = true;
  }

  if (!changed) {
    return;
  }

  saveCustomTerms();
  renderStats();
  renderCatalog();
}

function getInitialResult() {
  const prefixes = getPrefixes();
  const suffixes = getSuffixes();

  return {
    prefix: pickRandom(prefixes),
    suffix: pickRandom(suffixes)
  };
}

function openModal() {
  settingsModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal() {
  settingsModal.hidden = true;
  document.body.classList.remove("modal-open");
}

generateButton.addEventListener("click", animateRoulette);

termForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const prefix = prefixInput.value.trim();
  const suffix = suffixInput.value.trim();

  if (!prefix && !suffix) {
    prefixInput.focus();
    return;
  }

  addTerms(prefix, suffix);
  prefixInput.value = "";
  suffixInput.value = "";
  animateRoulette();
});

resetCustomButton.addEventListener("click", () => {
  customPrefixes = [];
  customSuffixes = [];
  saveCustomTerms();
  renderStats();
  renderCatalog();
  animateRoulette();
});

openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsModal.hidden) {
    closeModal();
  }
});

loadCustomTerms();
renderStats();
renderCatalog();
const initialResult = getInitialResult();
updateResult(initialResult.prefix, initialResult.suffix);

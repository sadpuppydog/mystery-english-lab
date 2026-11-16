import { TOPICS, BOARD_LAYOUT, COLS } from './data/topics.js';
import { EVENTS } from './data/events.js';
import { STAGES } from './data/story.js';

export const REASON_THRESHOLD = 1500;
export const MIN_LEARNING = 800;
export const ASSIST_START = 1500;
export const HINT_COST = 5;
export const AI_COST = 5;
export const SCORE = { cell: 100, event: 200, line: 150, cellCoin: 5, eventCoin: 20, eventFail: 20 };

// ---------- 小工具 ----------
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const fmt = (n) => Number(n).toLocaleString('en-US');
export const cellKey = (r, c) => `${r}-${c}`;
export const cellLabel = (key) => { const [r, c] = key.split('-').map(Number); return `${COLS[c]}${r + 1}`; };
export const cellId = (key) => { const [r, c] = key.split('-').map(Number); return BOARD_LAYOUT[r][c]; };
export const isEventId = (id) => id.startsWith('E');
export const ALL_KEYS = BOARD_LAYOUT.flatMap((row, r) => row.map((_, c) => cellKey(r, c)));

export function thresholds(n) {
  return Array.from({ length: n }, (_, i) => Math.round((REASON_THRESHOLD * (i + 1)) / n));
}
export function unlockedCount(learning, n) {
  return thresholds(n).filter((t) => learning >= t).length;
}
// 選 n 個線索時，拿到的是最後 n 個（最關鍵的證據）——依 Figma 16a-Z 系列
export function stageClues(stage, n) {
  const all = STAGES[stage].clues;
  return all.slice(all.length - n).map((c, i) => ({ ...c, n: i + 1 }));
}
export function baseGameScore(n) { return 1000 - n * 200; }
export function stars(totalLearning) {
  if (totalLearning >= 6000) return 5;
  if (totalLearning >= 5000) return 4;
  if (totalLearning >= 3600) return 3;
  if (totalLearning >= 2400) return 2;
  return 1;
}

// ---------- Bingo 連線 ----------
export const LINES = (() => {
  const L = [];
  for (let r = 0; r < 5; r++) L.push({ id: `R${r}`, label: `第 ${r + 1} 列`, keys: [0, 1, 2, 3, 4].map((c) => cellKey(r, c)) });
  for (let c = 0; c < 5; c++) L.push({ id: `C${c}`, label: `第 ${COLS[c]} 欄`, keys: [0, 1, 2, 3, 4].map((r) => cellKey(r, c)) });
  L.push({ id: 'D0', label: '左上到右下斜線', keys: [0, 1, 2, 3, 4].map((i) => cellKey(i, i)) });
  L.push({ id: 'D1', label: '右上到左下斜線', keys: [0, 1, 2, 3, 4].map((i) => cellKey(i, 4 - i)) });
  return L;
})();
export function lineCellNames(line) {
  return line.keys.map((k) => { const id = cellId(k); return isEventId(id) ? EVENTS[id].name : TOPICS[id].zh; }).join('・');
}

// ---------- 關卡狀態 ----------
export function newStageState(stage, clueCount, prevPick) {
  const pick = {};
  Object.keys(TOPICS).forEach((t) => {
    pick[t] = prevPick ? 1 - prevPick[t] : Math.round(Math.random());
  });
  const cells = {};
  ALL_KEYS.forEach((k) => { cells[k] = { status: 'open' }; });
  return {
    stage, clueCount, pick, cells,
    eventSet: stage === 1 ? 'A' : 'B',
    learning: 0, coins: 0, assist: ASSIST_START,
    items: { magnifier: 0, glove: 0, coffee: 0 },
    notes: {}, lines: [], seenClues: 0,
    reasoning: null, // { choice, correct }
    route: null,     // 'reason' | 'skip' | 'remedial'
    usage: { hints: 0, ai: 0, aiQuestions: 0 },
    paid: {},        // 每題已付費的提示 / AI 模型
    drawCount: 0,
  };
}

export function challengedCount(st) {
  return ALL_KEYS.filter((k) => ['done', 'fail', 'skip'].includes(st.cells[k].status)).length;
}
export function openKeys(st) { return ALL_KEYS.filter((k) => st.cells[k].status === 'open'); }
export function progressKey(st) { return ALL_KEYS.find((k) => ['progress', 'event'].includes(st.cells[k].status)) || null; }
export function doneCount(st) { return ALL_KEYS.filter((k) => st.cells[k].status === 'done').length; }

// 學習分數增加後：檢查新連線（只算成功的格子）與新解鎖的線索，回傳要跳出的視窗
export function afterScore(st, modals) {
  for (const line of LINES) {
    if (st.lines.includes(line.id)) continue;
    if (line.keys.every((k) => st.cells[k].status === 'done')) {
      st.lines.push(line.id);
      st.learning += SCORE.line;
      modals.push({ type: 'bingo', line: line.id });
    }
  }
  const u = unlockedCount(st.learning, st.clueCount);
  while (st.seenClues < u) {
    st.seenClues += 1;
    modals.push({ type: 'clue', index: st.seenClues });
  }
}

// ---------- 一般格題目 ----------
export function topicSet(st, topicId) { return TOPICS[topicId].sets[st.pick[topicId]]; }

export function buildCellOrder(set) {
  return {
    q1: shuffle([set.w, ...set.ok]),
    q2: shuffle([`${set.fix[0]} → ${set.fix[1]}`, ...set.d2]),
    q3: shuffle([set.cue, set.rule, ...set.cards]),
  };
}

export function cellQuestion(set, order, qi) {
  if (qi === 0) return {
    kind: 'choice', title: '選出文法錯誤的句子', prompt: '下面哪一個句子有文法錯誤？',
    opts: order.q1, answer: set.w, english: true,
    explain: `這句的錯誤在「${set.fix[0]}」：${set.why}`, hint: set.hint,
  };
  if (qi === 1) return {
    kind: 'choice', title: '找出錯誤的位置，選出正確的改法', prompt: set.w,
    opts: order.q2, answer: `${set.fix[0]} → ${set.fix[1]}`, english: true, promptIsSentence: true,
    explain: set.why, hint: `先找出句子裡的線索：${set.cue}，錯誤就在和它搭配的地方。`,
  };
  return {
    kind: 'reason', title: '把選項拖曳到空格，完成文法推理',
    prompt: `想一想：為什麼要把 ${set.fix[0]} 改成 ${set.fix[1]}？`,
    opts: order.q3, answer: [set.cue, set.rule],
    explain: set.tip, hint: '第一個空格放「句子裡的線索」，第二個空格放「要使用的文法」。',
  };
}

// ---------- 事件題 ----------
export function eventQuestions(st, eventId) { return EVENTS[eventId].sets[st.eventSet]; }

// ---------- AI 輔助（原型：預先寫好的回覆） ----------
export const AI_MODELS = [
  { id: 'GPT', vendor: 'OpenAI', mark: 'G' },
  { id: 'Gemini', vendor: 'Google', mark: 'Ge' },
  { id: 'Claude', vendor: 'Anthropic', mark: 'C' },
];
export function aiPresets(topic, set, qi) {
  const q3 = qi === 2;
  return [
    { q: q3 ? '這題要我做什麼？' : '這題在考什麼？', tag: '文法提示',
      a: q3 ? '這題要你說出「為什麼」：先找出決定文法的關鍵，再選出要用的文法。' : `這題考${topic.zh}：${set.tip}` },
    { q: '有什麼關鍵字要注意？', tag: '關鍵字說明',
      a: `注意句子裡的「${set.cue}」，它決定了這題要用什麼文法。` },
    { q: '可以幫我拆這個句子嗎？', tag: '句型解析',
      a: `先找出主詞和動詞：${set.w}\n再看「${set.fix[0]}」這個位置，跟線索「${set.cue}」搭不搭配。` },
    { q: '給我一個類似的例句', tag: '相似例句', a: set.ex },
  ];
}
export function aiFreeReply(model, text, set) {
  return `（${model}）你問的是「${text}」。我先不直接給答案：${set.hint} 想一想句子裡的「${set.cue}」，再回去檢查一次選項。`;
}

// ---------- 存檔 ----------
const SAVE_PREFIX = 'mlab_save_';
export function loadSave(account) {
  try { const s = localStorage.getItem(SAVE_PREFIX + account); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function writeSave(account, data) {
  try { localStorage.setItem(SAVE_PREFIX + account, JSON.stringify(data)); } catch { /* 無法存檔時照常遊玩 */ }
}
export function clearSave(account) {
  try { localStorage.removeItem(SAVE_PREFIX + account); } catch { /* ignore */ }
}

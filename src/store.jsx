import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  newStageState, buildCellOrder, topicSet, afterScore, cellId, isEventId, openKeys, ALL_KEYS, shuffle,
  SCORE, HINT_COST, AI_COST, baseGameScore, doneCount, loadSave, writeSave, clearSave,
} from './game.js';
import { EVENTS, ITEMS } from './data/events.js';
import { STAGES } from './data/story.js';

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

const EMPTY = { screen: 'login', params: {}, user: null, stage: 1, stages: {}, results: {}, modals: [] };
const makeNumberMap = () => {
  const numbers = shuffle(Array.from({ length: 25 }, (_, n) => n + 1));
  return Object.fromEntries(ALL_KEYS.map((key, i) => [key, numbers[i]]));
};
const validNumberMap = (map) => {
  const values = ALL_KEYS.map((key) => Number(map?.[key]));
  return values.length === 25 && values.every((n) => Number.isInteger(n) && n >= 1 && n <= 25) && new Set(values).size === 25;
};
const makePreviewStage = (stageNumber, full = false) => {
  const clueCount = STAGES[stageNumber].clues.length;
  const stage = newStageState(stageNumber, clueCount);
  // 滿分預覽仍要讓玩家親自安排 1–25；線索預覽則直接提供可查看的盤面。
  stage.numberMap = full ? null : makeNumberMap();
  stage.learning = full ? 6000 : 1500;
  stage.coins = full ? 999 : 0;
  stage.items = full ? { magnifier: 9, glove: 9, coffee: 9 } : stage.items;
  stage.seenClues = clueCount;
  stage.notes = Object.fromEntries(Object.keys(EVENTS).map((id) => [id, true]));
  return stage;
};

export function GameProvider({ children }) {
  const [s, setS] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('preview');
    if (!['clues', 'full', 'numbers'].includes(preview)) return EMPTY;
    const stageNumber = params.get('stage') === '2' ? 2 : 1;
    if (preview === 'numbers') {
      const clueCount = STAGES[stageNumber].clues.length;
      return {
        ...EMPTY,
        screen: 'numberSetup',
        stage: stageNumber,
        user: { account: 'number-preview', name: '號碼測試', guest: true },
        stages: { [stageNumber]: newStageState(stageNumber, clueCount) },
      };
    }
    if (preview === 'full') {
      return {
        ...EMPTY,
        screen: 'prologue',
        stage: stageNumber,
        fullPreview: true,
        user: { account: 'full-preview', name: '滿分預覽', guest: true },
        stages: { 1: makePreviewStage(1, true), 2: makePreviewStage(2, true) },
      };
    }
    return { ...EMPTY, screen: 'board', stage: stageNumber, user: { account: 'clue-preview', name: '訪客', guest: true }, stages: { [stageNumber]: makePreviewStage(stageNumber) } };
  });
  const ref = useRef(s);
  ref.current = s;

  // 自動存檔（登入後）
  useEffect(() => {
    if (s.user && !s.user.guest) writeSave(s.user.account, { ...s, modals: [] });
  }, [s]);

  const update = (fn) => setS((prev) => { const d = structuredClone(prev); fn(d); return d; });
  const st = s.stages[s.stage];

  const A = {
    // ---- 測試用（只在 ?debug 時從主控台呼叫） ----
    __set: (fn) => update(fn),

    // ---- 導覽 ----
    go: (screen, params = {}) => update((d) => { d.screen = screen; d.params = params; }),
    switchPreviewStage: (stage) => update((d) => {
      if (d.fullPreview && d.stages[stage]) {
        d.stage = stage;
        d.screen = validNumberMap(d.stages[stage].numberMap) ? 'board' : 'numberSetup';
        d.params = {};
        d.modals = [];
      }
    }),
    popModal: () => update((d) => { d.modals.shift(); }),
    pushModal: (m) => update((d) => { d.modals.push(m); }),

    // ---- 帳號 ----
    login: (user) => update((d) => {
      const saved = user.guest ? null : loadSave(user.account);
      if (saved && saved.stages && Object.keys(saved.stages).length) {
        Object.values(saved.stages).forEach((stage) => {
          if (!validNumberMap(stage.numberMap)) stage.numberMap = makeNumberMap();
        });
        Object.assign(d, saved, { user, modals: [], screen: 'home', params: {} });
      } else {
        Object.assign(d, EMPTY, { user, screen: 'home' });
      }
    }),
    logout: () => setS(EMPTY),
    newGame: () => update((d) => {
      if (d.user && !d.user.guest) clearSave(d.user.account);
      Object.assign(d, { stage: 1, stages: {}, results: {}, modals: [], screen: 'prologue', params: {} });
    }),
    resume: () => update((d) => {
      if (d.results[2]) { d.screen = 'final'; return; }
      d.screen = d.stages[d.stage] ? 'board' : 'mission';
      d.params = {};
    }),

    // ---- 關卡開始 ----
    chooseClues: (n) => update((d) => {
      if (d.fullPreview) {
        // 滿分 Demo 經過開場與任務頁後，仍保留全部線索、紙條、道具與滿分資源。
        d.stages[d.stage] = makePreviewStage(d.stage, true);
      } else {
        const prev = d.stage === 2 && d.stages[1] ? d.stages[1].pick : null;
        d.stages[d.stage] = newStageState(d.stage, n, prev);
      }
      d.screen = 'numberSetup'; d.params = {};
    }),

    confirmNumberMap: (map) => update((d) => {
      if (!validNumberMap(map)) return;
      d.stages[d.stage].numberMap = Object.fromEntries(ALL_KEYS.map((key) => [key, Number(map[key])]));
      d.screen = 'board'; d.params = {};
    }),

    // ---- 抽數字 ----
    pickRandomNumber: () => {
      const keys = openKeys(ref.current.stages[ref.current.stage]);
      return keys.length ? keys[Math.floor(Math.random() * keys.length)] : null;
    },
    pickRandomCell: () => {
      const keys = openKeys(ref.current.stages[ref.current.stage]);
      return keys.length ? keys[Math.floor(Math.random() * keys.length)] : null;
    },
    recordDraw: (key) => update((d) => { const T = d.stages[d.stage]; T.drawCount += 1; T.pendingDraw = key; }),
    clearDraw: () => update((d) => { delete d.stages[d.stage].pendingDraw; }),

    // ---- 一般格 ----
    startCell: (key) => update((d) => {
      const S = d.stages[d.stage]; const c = S.cells[key];
      delete S.pendingDraw;
      if (c.status === 'open') {
        const set = topicSet(S, cellId(key));
        S.cells[key] = { status: 'progress', q: 0, order: buildCellOrder(set), results: [] };
      }
      d.screen = 'cell'; d.params = { key };
    }),
    answerCell: (key, correct) => update((d) => {
      const S = d.stages[d.stage]; const c = S.cells[key];
      c.results.push(correct);
      if (!correct) { c.status = 'fail'; c.failedAt = c.q; return; }
      c.q += 1;
      if (c.q >= 3) {
        c.status = 'done';
        S.learning += SCORE.cell; S.coins += SCORE.cellCoin;
        const modals = []; afterScore(S, modals); c.newModals = modals;
      }
    }),
    finishCell: (key) => update((d) => {
      const S = d.stages[d.stage]; const c = S.cells[key];
      d.screen = 'cellResult'; d.params = { key };
      if (c.newModals) { d.pendingModals = c.newModals; delete c.newModals; }
    }),
    backToBoard: () => update((d) => {
      d.screen = 'board'; d.params = {};
      if (d.pendingModals) { d.modals.push(...d.pendingModals); delete d.pendingModals; }
    }),

    // ---- 協助：提示 / AI ----
    payHint: (qkey) => {
      const S = ref.current.stages[ref.current.stage];
      if (S.paid[qkey + ':hint']) return 'free';
      if (S.assist < HINT_COST) return 'insufficient';
      update((d) => { const T = d.stages[d.stage]; T.assist -= HINT_COST; T.usage.hints += 1; T.paid[qkey + ':hint'] = true; });
      return 'paid';
    },
    hintPaid: (qkey) => !!ref.current.stages[ref.current.stage]?.paid[qkey + ':hint'],
    aiPaid: (qkey, model) => !!ref.current.stages[ref.current.stage]?.paid[`${qkey}:ai:${model}`],
    payAI: (qkey, model) => update((d) => {
      const T = d.stages[d.stage]; const k = `${qkey}:ai:${model}`;
      if (T.paid[k]) return;
      T.paid[k] = true; T.usage.ai += 1;
      T.assist = Math.max(0, T.assist - AI_COST); // 分數不足仍可問 AI
    }),
    countAIQuestion: () => update((d) => { d.stages[d.stage].usage.aiQuestions += 1; }),

    // ---- 事件格 ----
    declineEvent: (key) => update((d) => { const T = d.stages[d.stage]; T.cells[key] = { status: 'skip' }; delete T.pendingDraw; d.screen = 'board'; d.params = {}; }),
    startEvent: (key) => update((d) => {
      const T = d.stages[d.stage]; delete T.pendingDraw;
      T.cells[key] = { status: 'event', q: 0 };
      d.screen = 'event'; d.params = { key };
    }),
    useItem: (item) => update((d) => { const T = d.stages[d.stage]; T.items[item] = Math.max(0, T.items[item] - 1); }),
    endEvent: (key, ok) => update((d) => {
      const S = d.stages[d.stage]; const id = cellId(key);
      if (ok) {
        S.cells[key] = { status: 'done' };
        S.learning += SCORE.event; S.coins += SCORE.eventCoin; S.notes[id] = true;
        const modals = []; afterScore(S, modals); d.pendingModals = modals;
      } else {
        S.cells[key] = { status: 'fail' };
        S.coins = Math.max(0, S.coins - SCORE.eventFail);
      }
      d.screen = 'eventResult'; d.params = { key, ok };
    }),

    // ---- 商店 ----
    buy: (item) => {
      const S = ref.current.stages[ref.current.stage];
      if (S.coins < ITEMS[item].price) return false;
      update((d) => { const T = d.stages[d.stage]; T.coins -= ITEMS[item].price; T.items[item] += 1; });
      return true;
    },

    // ---- 推理與結算 ----
    submitReasoning: (choice) => update((d) => {
      const S = d.stages[d.stage];
      S.reasoning = { choice, correct: choice === STAGES[d.stage].answer };
      d.screen = 'afterReason'; d.params = {};
    }),
    setRoute: (route, screen) => update((d) => { d.stages[d.stage].route = route; d.screen = screen; d.params = {}; }),
    finishStage: () => update((d) => {
      const S = d.stages[d.stage];
      const reasoned = S.route === 'reason';
      d.results[d.stage] = {
        learning: S.learning, assist: S.assist, coins: S.coins, clueCount: S.clueCount,
        route: S.route, correct: reasoned ? S.reasoning.correct : null,
        game: reasoned ? baseGameScore(S.clueCount) + (S.reasoning.correct ? 200 : 0) : null,
        done: doneCount(S), lines: S.lines.length, hints: S.usage.hints, ai: S.usage.ai, aiQuestions: S.usage.aiQuestions,
      };
      if (d.stage === 1) { d.screen = 'stage2Intro'; } else { d.screen = 'final'; }
      d.params = {};
    }),
    enterStage2: () => update((d) => { d.stage = 2; d.screen = 'mission'; d.params = {}; }),
  };

  return <Ctx.Provider value={{ s, st, A }}>{children}</Ctx.Provider>;
}

export const isEvent = (key) => isEventId(cellId(key));

import React, { useEffect } from 'react';
import { GameProvider, useGame } from './store.jsx';
import { Stage, Background } from './components/ui.jsx';
import { QueueModal } from './components/Panels.jsx';
import Auth from './screens/Auth.jsx';
import { Home, Prologue, Rules, Mission, Stage2Intro } from './screens/Intro.jsx';
import NumberSetup from './screens/NumberSetup.jsx';
import Board from './screens/Board.jsx';
import { CellPlay, CellResult, Review } from './screens/Cell.jsx';
import { EventIntro, EventPrep, EventPlay, EventResult, Shop } from './screens/Event.jsx';
import { TOPICS } from './data/topics.js';
import { EVENTS } from './data/events.js';
import { Reasoning, AfterReason, Reveal, Settle, Direct, RemedialStart, Remedial, RemedialDone, Final } from './screens/Ending.jsx';

const SCREENS = {
  login: Auth, register: Auth, forgot: Auth,
  home: Home, prologue: Prologue, rules: Rules, mission: Mission, numberSetup: NumberSetup, stage2Intro: Stage2Intro,
  board: Board, cell: CellPlay, cellResult: CellResult, review: Review,
  eventIntro: EventIntro, eventPrep: EventPrep, event: EventPlay, eventResult: EventResult, shop: Shop,
  reasoning: Reasoning, afterReason: AfterReason, reveal: Reveal, settle: Settle, direct: Direct,
  remedialStart: RemedialStart, remedial: Remedial, remedialDone: RemedialDone, final: Final,
};
const NEEDS_STAGE = new Set(['numberSetup', 'board', 'cell', 'cellResult', 'review', 'eventIntro', 'eventPrep', 'event', 'eventResult', 'shop',
  'reasoning', 'afterReason', 'reveal', 'settle', 'direct', 'remedialStart', 'remedial', 'remedialDone']);

function Router() {
  const game = useGame();
  const { s } = game;
  useEffect(() => {
    // 測試用：網址加上 ?debug 時，可在主控台用 window.__mlab 操作遊戲狀態
    if (new URLSearchParams(window.location.search).has('debug')) window.__mlab = { ...game, data: { TOPICS, EVENTS } };
  });
  let Screen = SCREENS[s.screen] || Home;
  if (NEEDS_STAGE.has(s.screen) && !s.stages[s.stage]) Screen = Mission;
  return (
    <Stage>
      <Background />
      <Screen key={s.screen === 'remedial' ? 'remedial' : s.screen + JSON.stringify(s.params)} />
      <QueueModal />
    </Stage>
  );
}

export default function App() {
  return <GameProvider><Router /></GameProvider>;
}

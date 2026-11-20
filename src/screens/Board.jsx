import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store.jsx';
import { TOPICS, BOARD_LAYOUT, COLS } from '../data/topics.js';
import { EVENTS } from '../data/events.js';
import { STAGES } from '../data/story.js';
import {
  cellKey, cellLabel, cellId, isEventId, openKeys, progressKey, challengedCount, thresholds, stageClues,
  LINES, fmt, REASON_THRESHOLD, MIN_LEARNING, unlockedCount,
} from '../game.js';
import { Icon, Alert, Modal, Toast } from '../components/ui.jsx';
import { TopBar, ProgressBar, EvidenceFolder, ClueZoom, Bag } from '../components/Panels.jsx';
import { RulesModal } from './Intro.jsx';

function cellName(id) {
  if (isEventId(id)) return { en: null, zh: `${EVENTS[id].name}・${EVENTS[id].modeLabel}` };
  return { en: TOPICS[id].en, zh: TOPICS[id].zh };
}

export default function Board() {
  const { s, st, A } = useGame();
  const [overlay, setOverlay] = useState(null); // rules | bag | folder | {zoom} | {alert}
  const [flash, setFlash] = useState(null);
  const [landed, setLanded] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [toast, setToast] = useState(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const S = STAGES[s.stage];
  const prog = progressKey(st);
  const open = openKeys(st);
  const allChallenged = challengedCount(st) === 25;
  const reasoned = !!st.reasoning;
  const canReason = st.learning >= REASON_THRESHOLD && !reasoned;
  const lineKeys = new Set(LINES.filter((l) => st.lines.includes(l.id)).flatMap((l) => l.keys));
  const pending = st.pendingDraw;
  const fullPreview = !!s.fullPreview;

  const numberMap = st.numberMap || {};

  // ---- 抽數字動畫 ----
  const draw = () => {
    if (drawing || !open.length) return;
    const target = A.pickRandomNumber();
    setDrawing(true); setLanded(null);
    let t = 0; const steps = 14;
    for (let i = 0; i < steps; i++) {
      t += 45 + i * i * 0.9;
      timers.current.push(setTimeout(() => {
        const k = i === steps - 1 ? target : open[Math.floor(Math.random() * open.length)];
        setFlash(k);
      }, t));
    }
    timers.current.push(setTimeout(() => { setFlash(null); setLanded(target); A.recordDraw(target); }, t + 260));
    timers.current.push(setTimeout(() => { setDrawing(false); }, t + 650));
  };
  const showPending = pending && !drawing;

  const enterDrawn = (key) => {
    setLanded(null);
    if (isEventId(cellId(key))) A.go('eventIntro', { key });
    else A.startCell(key);
  };

  const onCell = (key) => {
    if (drawing) return;
    const c = st.cells[key]; const id = cellId(key);
    if (c.status === 'done') {
      if (isEventId(id)) setOverlay({ alert: { title: '事件已完成', text: `事件紙條已放進背包：\n「${EVENTS[id].note}」` } });
      else A.go('review', { key });
    } else if (c.status === 'fail') setOverlay({ alert: { title: '挑戰失敗', text: '這格已標記為失敗格，不能重新挑戰。\n去挑戰其他格子吧！', button: '去挑戰其他格子' } });
    else if (c.status === 'skip') A.go('eventIntro', { key });
    else if (c.status === 'progress') A.startCell(key);
    else if (c.status === 'event') A.startEvent(key);
    else setToast('格子由「抽數字」決定，按右下角的按鈕抽出下一個號碼吧！');
  };

  const clues = stageClues(s.stage, st.clueCount);
  const th = thresholds(st.clueCount);
  const got = unlockedCount(st.learning, st.clueCount);

  // ---- 盤面結束的狀況 ----
  let endAction = null;
  if (allChallenged && !reasoned && !prog) {
    if (st.learning >= REASON_THRESHOLD) endAction = null;
    else if (st.learning >= MIN_LEARNING) endAction = { label: '調查結束，直接揭曉真相', go: () => A.go('direct') };
    else endAction = { label: '開始補救學習', go: () => A.go('remedialStart') };
  }

  return (
    <div className="screen">
      <TopBar onRules={() => setOverlay('rules')} onShop={() => A.go('shop', { from: 'board' })} onBag={() => setOverlay('bag')} />
      <ProgressBar />

      <div className="panel board-panel">
        <div className="board-head">
          <span className="board-title">{S.bingo}</span>
          <span className="pill pill-gold">已挑戰 {challengedCount(st)} / 25</span>
          <span className="pill pill-green">Bingo 連線 {st.lines.length} 條</span>
          {fullPreview && <div className="row gap8" style={{ marginLeft: 'auto' }}>
            <button className={`btn btn-sm ${s.stage === 1 ? 'btn-dark' : 'btn-line'}`} onClick={() => A.switchPreviewStage(1)}>第一關</button>
            <button className={`btn btn-sm ${s.stage === 2 ? 'btn-red' : 'btn-line'}`} onClick={() => A.switchPreviewStage(2)}>第二關</button>
          </div>}
        </div>
        <div className="grid">
          <div />
          {COLS.map((c) => <div key={c} className="grid-col">{c}</div>)}
          {BOARD_LAYOUT.map((row, r) => (
            <React.Fragment key={r}>
              <div className="grid-row">{r + 1}</div>
              {row.map((id, c) => {
                const key = cellKey(r, c); const cell = st.cells[key]; const ev = isEventId(id);
                const nm = cellName(id);
                let stateText = null;
                if (cell.status === 'done') stateText = '✓ 已完成';
                else if (cell.status === 'fail') stateText = '✕ 失敗';
                else if (cell.status === 'skip') stateText = '可再挑戰';
                else if (cell.status === 'progress') stateText = `作答中 ${cell.q}/3`;
                else if (cell.status === 'event') stateText = '挑戰中';
                const cls = ['cell', ev ? 'event' : '', ['progress', 'event'].includes(cell.status) ? 'cell-in-progress' : cell.status === 'open' ? '' : cell.status,
                  flash === key ? 'flash' : '', landed === key || (showPending && pending === key) ? 'landed' : '',
                  lineKeys.has(key) ? 'in-line' : '', cell.status !== 'open' ? 'clickable' : ''].join(' ');
                return (
                  <button key={key} className={cls} onClick={() => onCell(key)} aria-label={`${cellLabel(key)} ${nm.zh}`}>
                    <span className="cell-number">{numberMap[key]}</span>
                    {nm.en && <span className="en-name">{nm.en}</span>}
                    <span className="zh-name">{nm.zh}</span>
                    {stateText && <span className="state">{stateText}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--card2)' }} />一般格</span>
          <span><i style={{ background: 'var(--redbg)' }} />事件格</span>
          <span><i style={{ background: 'var(--greenbg)' }} />已完成</span>
          <span><i style={{ background: '#fbf3df', border: '1.5px dashed var(--gold)' }} />作答中</span>
          <span><i style={{ background: '#dcc9b4', borderColor: 'var(--red)' }} />失敗</span>
        </div>
        <div className="draw-area">
          {fullPreview ? (
            <>
              <span className="draw-hint">滿分預覽：剩 {open.length} 個號碼未抽，只有抽中的格子可以挑戰</span>
              <button className="draw-btn" onClick={draw} disabled={drawing || !open.length || !!pending}>
                <Icon name="dice" size={20} />{drawing ? '抽號碼中…' : '抽數字做題目'}
              </button>
            </>
          ) : endAction ? (
            <button className="draw-btn" onClick={endAction.go}><Icon name="info" />{endAction.label}</button>
          ) : (
            <>
              <span className="draw-hint">{open.length ? `剩 ${open.length} 個號碼未抽` : '號碼已全部挑戰'}</span>
              <button className="draw-btn" onClick={draw} disabled={drawing || !open.length || !!pending}><Icon name="dice" size={20} />{drawing ? '抽號碼中…' : '抽數字'}</button>
            </>
          )}
        </div>
      </div>

      <div className="panel side-panel">
        <div className="side-head">
          <span className="h2" style={{ fontSize: 22 }}>{S.clueTitle}</span>
          <button className="link" onClick={() => setOverlay('folder')}>證據資料夾 ›</button>
        </div>
        <div className="scroll" style={{ flex: 1, marginRight: -6, paddingRight: 6 }}>
          {clues.map((c, i) => {
            const on = st.learning >= th[i];
            return on ? (
              <div key={i} className="clue-row">
                <Icon name="check" style={{ color: 'var(--green)' }} />
                <span className="n">線索{'一二三四五'[i]}</span><span className="t">{c.short}</span>
                <button className="view" onClick={() => setOverlay({ zoom: c })}>查看</button>
              </div>
            ) : (
              <button key={i} className="clue-row locked" style={{ width: '100%' }} onClick={() => setOverlay({ alert: { title: '線索尚未解鎖', text: '學習分數達到這條線索的門檻後，就會自動解鎖。' } })}>
                <Icon name="lock" size={16} /><span className="n">線索{'一二三四五'[i]}</span><span className="t">{fmt(th[i])} 分解鎖</span>
              </button>
            );
          })}
        </div>
        {reasoned ? (
          <div className="reason-box open">
            <div className="t1">推理已記錄</div>
            <div className="t2">可以繼續挑戰格子累積學習分數，或直接進入結算。</div>
            <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 10 }} onClick={() => A.setRoute('reason', 'reveal')}>進入結算 ›</button>
          </div>
        ) : canReason ? (
          <div className="reason-box open">
            <div className="t1">推理猜測 已開放</div>
            <div className="t2">線索已全部取得，可以推理一次</div>
            <button className="btn btn-gold btn-sm btn-block" style={{ marginTop: 10 }} onClick={() => A.go('reasoning')}>前往推理 ›</button>
          </div>
        ) : (
          <div className="reason-box">
            <div className="t1">推理 尚未開放</div>
            <div className="t2">還差 {clues.length - got} 個線索・{fmt(REASON_THRESHOLD - st.learning)} 學習分數</div>
          </div>
        )}
      </div>

      {showPending && !overlay && (() => {
        const id = cellId(pending); const ev = isEventId(id); const nm = cellName(id);
        return (
          <Modal width={500}>
            <div className="center">
              <div className="kicker" style={{ marginBottom: 8 }}>抽數字結果</div>
              <div className="serif" style={{ fontSize: 68, fontWeight: 900, lineHeight: 1, color: ev ? 'var(--red)' : 'var(--ink)' }}>{numberMap[pending]}</div>
              <div className="small muted" style={{ marginTop: 8 }}>這個數字放在 {cellLabel(pending)}</div>
              <div className="h2" style={{ margin: '4px 0 6px' }}>{ev ? `${EVENTS[id].name}・${EVENTS[id].title}` : nm.zh}</div>
              {nm.en && <div className="en muted" style={{ fontSize: 17 }}>{nm.en}</div>}
              <p className="small" style={{ color: 'var(--ink2)', margin: '16px 0 22px' }}>
                {ev ? '抽到事件格！必須完成這一格的事件挑戰，完成前不能抽下一個號碼。' : '抽到這一格後必須完成 3 題挑戰，完成前不能抽下一個號碼。'}
              </p>
              <button className={`btn btn-block ${ev ? 'btn-red' : 'btn-dark'}`} onClick={() => enterDrawn(pending)}>{ev ? '開始事件挑戰' : '開始這格題目'}</button>
            </div>
          </Modal>
        );
      })()}

      {overlay === 'rules' && <RulesModal onClose={() => setOverlay(null)} />}
      {overlay === 'bag' && <Bag onClose={() => setOverlay(null)} onShop={() => A.go('shop', { from: 'board' })} />}
      {overlay === 'folder' && <EvidenceFolder onClose={() => setOverlay(null)} onZoom={(c) => setOverlay({ zoom: c })} />}
      {overlay?.zoom && <ClueZoom stage={s.stage} clue={overlay.zoom} onClose={() => setOverlay(null)} />}
      {overlay?.alert && <Alert {...overlay.alert} onClose={() => setOverlay(null)} />}
      {toast && <Toast text={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

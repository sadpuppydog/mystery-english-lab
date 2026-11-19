import React, { useMemo, useState } from 'react';
import { useGame } from '../store.jsx';
import { BOARD_LAYOUT, COLS, TOPICS } from '../data/topics.js';
import { EVENTS } from '../data/events.js';
import { STAGES } from '../data/story.js';
import { ALL_KEYS, cellId, cellKey, isEventId, shuffle } from '../game.js';

function cellName(id) {
  return isEventId(id) ? EVENTS[id].name : TOPICS[id].zh;
}

export default function NumberSetup() {
  const { s, st, A } = useGame();
  const [values, setValues] = useState(() => Object.fromEntries(ALL_KEYS.map((key) => [key, st.numberMap?.[key] ?? ''])));
  const numbers = useMemo(() => ALL_KEYS.map((key) => Number(values[key])).filter((n) => Number.isInteger(n) && n >= 1 && n <= 25), [values]);
  const duplicates = useMemo(() => new Set(numbers.filter((n, i) => numbers.indexOf(n) !== i)), [numbers]);
  const complete = numbers.length === 25 && new Set(numbers).size === 25;
  const filled = ALL_KEYS.filter((key) => values[key] !== '').length;

  const setNumber = (key, raw) => {
    const clean = raw.replace(/\D/g, '').slice(0, 2);
    setValues((old) => ({ ...old, [key]: clean === '' ? '' : Number(clean) }));
  };
  const randomize = () => {
    const order = shuffle(Array.from({ length: 25 }, (_, i) => i + 1));
    setValues(Object.fromEntries(ALL_KEYS.map((key, i) => [key, order[i]])));
  };
  const clear = () => setValues(Object.fromEntries(ALL_KEYS.map((key) => [key, ''])));

  return (
    <div className="screen">
      <div className="panel number-setup-info">
        <div className="kicker">{STAGES[s.stage].mission}・盤面設定</div>
        <div className="h1" style={{ margin: '10px 0 12px' }}>先安排你的 1–25</div>
        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'var(--ink2)' }}>
          把 1 到 25 自由填進右側的 Bingo 格子。每個數字只能出現一次，位置由你決定。
        </p>
        <div className="card" style={{ padding: '16px 18px', marginTop: 18, background: '#2a221b', color: '#f3e6c8', borderColor: '#2a221b' }}>
          <div style={{ color: 'var(--gold2)', fontWeight: 800, marginBottom: 8 }}>遊戲開始後</div>
          <div className="small" style={{ lineHeight: 1.8 }}>系統會抽出一個尚未挑戰的數字。抽到幾號，就必須完成你放置該數字的格子；完成前不能再抽下一個數字。</div>
        </div>
        <div className="card" style={{ padding: '14px 18px', marginTop: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}><span>已填格數</span><b>{filled} / 25</b></div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}><span>重複數字</span><b style={{ color: duplicates.size ? 'var(--red)' : 'var(--green)' }}>{duplicates.size ? [...duplicates].sort((a, b) => a - b).join('、') : '沒有'}</b></div>
        </div>
        <div className="row gap10" style={{ marginTop: 'auto' }}>
          <button className="btn btn-line grow" onClick={clear}>全部清除</button>
          <button className="btn btn-line grow" onClick={randomize}>幫我隨機排列</button>
        </div>
      </div>

      <div className="panel number-setup-board">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div><div className="h2">{STAGES[s.stage].bingo}</div><div className="small muted" style={{ marginTop: 4 }}>在每一格輸入 1–25</div></div>
          <span className={`pill ${complete ? 'pill-green' : 'pill-gold'}`}>{complete ? '盤面完成' : `還有 ${25 - filled} 格`}</span>
        </div>
        <div className="number-grid">
          <div />
          {COLS.map((c) => <div key={c} className="number-grid-label">{c}</div>)}
          {BOARD_LAYOUT.map((row, r) => (
            <React.Fragment key={r}>
              <div className="number-grid-label">{r + 1}</div>
              {row.map((id, c) => {
                const key = cellKey(r, c);
                const number = Number(values[key]);
                const bad = values[key] !== '' && (number < 1 || number > 25 || duplicates.has(number));
                return (
                  <label key={key} className={`number-setup-cell ${isEventId(id) ? 'event' : ''} ${bad ? 'invalid' : ''}`}>
                    <span>{cellName(id)}</span>
                    <input
                      inputMode="numeric"
                      value={values[key]}
                      onChange={(e) => setNumber(key, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      aria-label={`${cellName(id)}的號碼`}
                    />
                  </label>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        {!complete && filled === 25 && <div className="small" style={{ color: 'var(--red)', marginTop: 10, textAlign: 'center', fontWeight: 700 }}>請修正重複或超出 1–25 的數字</div>}
        <button className="btn btn-dark btn-block" style={{ marginTop: 14 }} disabled={!complete} onClick={() => A.confirmNumberMap(values)}>確認盤面，開始抽數字</button>
      </div>
    </div>
  );
}

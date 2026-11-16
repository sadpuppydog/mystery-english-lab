import React, { useState } from 'react';
import { useGame } from '../store.jsx';
import { GAME_TITLE, GAME_SUB, STAGES } from '../data/story.js';
import { EVENTS, ITEMS } from '../data/events.js';
import { thresholds, unlockedCount, stageClues, fmt, LINES, lineCellNames } from '../game.js';
import { Icon, Modal, Photo, ItemIcon } from './ui.jsx';

export function TopBar({ onRules, onShop, onBag }) {
  const { st } = useGame();
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-title">{GAME_TITLE}</div>
        <div className="brand-sub">{GAME_SUB}</div>
      </div>
      <div className="chip"><div><div className="chip-label">協助分數</div><div className="chip-val">{st.assist}</div></div></div>
      <div className="chip"><Icon name="star" size={22} /><div><div className="chip-label">學習分數</div><div className="chip-val">{fmt(st.learning)}</div></div></div>
      <div className="chip" style={{ marginLeft: 14 }}><Icon name="coin" size={22} /><div><div className="chip-label">金幣</div><div className="chip-val">{st.coins}</div></div></div>
      <button className="chip chip-btn" style={{ marginLeft: 14 }} onClick={onRules}><Icon name="book" size={20} />遊戲規則</button>
      <button className="chip chip-btn" onClick={onShop}><Icon name="cart" size={20} />道具商店</button>
      <button className="chip chip-btn" onClick={onBag}><Icon name="bag" size={20} />背包</button>
    </div>
  );
}

export function ProgressBar() {
  const { st } = useGame();
  const th = thresholds(st.clueCount);
  const pct = Math.min(1, st.learning / 1500) * 100;
  return (
    <div className="progress">
      <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      {th.map((t, i) => {
        const goal = i === th.length - 1; const on = st.learning >= t;
        return (
          <div key={t} className="progress-node" style={{ left: `${(t / 1500) * 100}%` }}>
            <div className={`progress-dot ${on ? 'on' : ''} ${goal ? 'goal' : ''}`}><Icon name={on ? 'check' : 'lock'} size={goal ? 16 : 15} stroke={2.5} /></div>
            <div className={`progress-label ${goal ? 'goal' : ''}`}>{fmt(t)}{goal ? ' 推理' : ''}</div>
          </div>
        );
      })}
    </div>
  );
}

export function ClueZoom({ stage, clue, onClose }) {
  return (
    <Modal onClose={onClose} width={940} style={{ maxWidth: 940, padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '530px 1fr', gap: 28 }}>
        <Photo label={clue.photo} h={360} />
        <div className="col">
          <div className="row gap12" style={{ marginBottom: 14 }}>
            <span className="serif" style={{ fontWeight: 800, fontSize: 18 }}>{stage === 1 ? `線索${'一二三四五'[clue.n - 1]}` : clue.short}</span>
            <span className="pill pill-green"><Icon name="check" size={12} />已取得</span>
          </div>
          <div className="h2" style={{ fontSize: 20, marginBottom: 14 }}>{clue.title}</div>
          <div className="card" style={{ padding: '14px 18px', fontSize: 17, lineHeight: 1.6 }}>「{clue.quote}」</div>
          <div className="small muted" style={{ marginTop: 10 }}>{clue.source}</div>
          <button className="btn btn-line" style={{ marginTop: 'auto' }} onClick={onClose}>關閉</button>
        </div>
      </div>
    </Modal>
  );
}

export function EvidenceFolder({ onClose, onZoom }) {
  const { s, st } = useGame();
  const clues = stageClues(s.stage, st.clueCount);
  const th = thresholds(st.clueCount);
  const got = unlockedCount(st.learning, st.clueCount);
  return (
    <Modal onClose={onClose} width={1180} style={{ maxWidth: 1180, padding: '24px 30px' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
        <div className="row gap16"><div className="h2">{STAGES[s.stage].folderTitle}</div><span className="pill pill-gold">已取得 {got} / {clues.length}</span></div>
        <button className="btn btn-dark btn-sm" onClick={onClose}>返回 Bingo 盤面</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(clues.length, 5)}, 1fr)`, gap: 14 }}>
        {clues.map((c, i) => {
          const on = st.learning >= th[i];
          return (
            <div key={i} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 360 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b className="serif">線索{'一二三四五'[i]}</b>
                {on ? <span className="pill pill-green">已取得</span> : <span className="pill pill-dark"><Icon name="lock" size={11} />{fmt(th[i])} 分</span>}
              </div>
              {on ? <>
                <Photo label={c.photo} h={130} />
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>「{c.quote}」</div>
                <div className="small muted">{c.source}</div>
                <button className="link" style={{ marginTop: 'auto', textAlign: 'left' }} onClick={() => onZoom(c)}>放大查看 ›</button>
              </> : <div className="photo" style={{ height: 130 }}><Icon name="lock" size={28} />學習分數達到 {fmt(th[i])} 分解鎖</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export function Bag({ onClose, onShop, context = 'board' }) {
  const { st } = useGame();
  const [tab, setTab] = useState('items');
  const notes = Object.keys(EVENTS).filter((k) => st.notes[k]);
  return (
    <Modal onClose={onClose} width={900} style={{ maxWidth: 900, padding: 0, overflow: 'hidden', background: 'var(--paper2)' }}>
      <div style={{ background: '#3b3047', color: '#f3e6c8', padding: '18px 28px' }} className="row">
        <Icon name="bag" size={22} /><span className="serif" style={{ fontSize: 22, fontWeight: 800, marginLeft: 10 }}>偵探背包</span>
        <span style={{ marginLeft: 'auto', color: 'var(--gold2)', fontWeight: 700 }}>金幣 {st.coins}</span>
        <button style={{ marginLeft: 18 }} onClick={onClose} aria-label="關閉"><Icon name="x" /></button>
      </div>
      <div className="row" style={{ background: '#3b3047', padding: '0 28px', gap: 6 }}>
        {[['items', '道具'], ['notes', '事件紙條']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 18px', fontWeight: 800, borderRadius: '6px 6px 0 0', background: tab === k ? 'var(--paper2)' : 'transparent', color: tab === k ? 'var(--ink)' : 'var(--gold2)' }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: '20px 28px 24px' }}>
        {tab === 'items' && <>
          {Object.entries(ITEMS).map(([k, it]) => (
            <div key={k} className="card row gap16" style={{ padding: '14px 18px', marginBottom: 10, opacity: st.items[k] ? 1 : 0.6 }}>
              <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--dark)', color: 'var(--gold2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ItemIcon item={k} size={26} /></div>
              <div className="grow">
                <div className="serif" style={{ fontWeight: 800, fontSize: 17 }}>{it.name} <span className="muted" style={{ fontSize: 15 }}>×{st.items[k]}</span></div>
                <div className="small" style={{ color: 'var(--ink2)' }}>{it.effect}</div>
                <div className="small muted">使用時機：{k === 'coffee' ? '限時事件挑戰時' : '事件挑戰作答時'}</div>
              </div>
              <span className="pill" style={{ background: '#e4d8bd' }}>{st.items[k] ? (context === 'board' ? '目前不可使用' : '可以帶進事件') : '未持有'}</span>
            </div>
          ))}
          <div className="row" style={{ marginTop: 10 }}>
            <span className="small" style={{ color: 'var(--ink2)' }}><Icon name="info" size={14} style={{ verticalAlign: -2 }} /> 道具只能在事件挑戰中使用，一般文法格請改用 AI 輔助。</span>
            {onShop && <button className="btn btn-dark btn-sm" style={{ marginLeft: 'auto' }} onClick={onShop}>前往道具商店</button>}
          </div>
        </>}
        {tab === 'notes' && <>
          <p className="small" style={{ color: 'var(--ink2)', marginBottom: 14 }}>完成事件挑戰後取得的紙條，補充案件背景（不影響主線推理）。</p>
          {Object.entries(EVENTS).map(([k, ev]) => (
            <div key={k} className="card" style={{ padding: '14px 18px', marginBottom: 10, opacity: st.notes[k] ? 1 : 0.55 }}>
              <div className="row gap12"><span className="pill pill-red">{ev.name}</span><b>{ev.title}</b></div>
              <div style={{ marginTop: 8, fontSize: 15 }}>{st.notes[k] ? `「${ev.note}」` : '尚未取得（完成這個事件挑戰後會出現）'}</div>
            </div>
          ))}
          <div className="small muted" style={{ textAlign: 'right' }}>已取得 {notes.length} / 3 張</div>
        </>}
      </div>
    </Modal>
  );
}

// 全域佇列視窗：Bingo 連線、新線索
export function QueueModal() {
  const { s, st, A } = useGame();
  const m = s.modals[0];
  if (!m || !st) return null;
  if (m.type === 'bingo') {
    const line = LINES.find((l) => l.id === m.line);
    return (
      <Modal width={560}>
        <div className="center">
          <div className="serif" style={{ fontSize: 56, fontWeight: 900, color: 'var(--red)', letterSpacing: 4 }}>BINGO!</div>
          <div className="kicker" style={{ marginBottom: 10 }}>BINGO LINE {st.lines.indexOf(m.line) + 1}</div>
          <div className="h2" style={{ marginBottom: 6 }}>連線達成！</div>
          <p style={{ color: 'var(--ink2)', marginBottom: 18 }}>{line.label}：{lineCellNames(line)}</p>
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <div className="small muted">連線獎勵</div>
            <div className="serif" style={{ fontSize: 32, fontWeight: 900, color: 'var(--green)' }}>+150</div>
            <div className="small muted">連線獎勵已加入學習分數</div>
          </div>
          <p className="small muted" style={{ marginBottom: 18 }}>已完成連線：{st.lines.length} 條（橫、直、斜共 12 條）</p>
          <button className="btn btn-dark btn-block" onClick={A.popModal}>太好了</button>
        </div>
      </Modal>
    );
  }
  if (m.type === 'clue') {
    const clues = stageClues(s.stage, st.clueCount);
    const c = clues[m.index - 1];
    const all = m.index === clues.length;
    return (
      <Modal width={760}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="h1" style={{ fontSize: 28 }}>獲得新線索！</div>
          <span className="pill pill-gold">線索 {m.index} / {clues.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 22 }}>
          <Photo label={c.photo} h={220} />
          <div className="col gap8">
            <div className="kicker">EVIDENCE 0{m.index}</div>
            <div className="small muted">{c.source}</div>
            <div className="h2" style={{ fontSize: 19 }}>{c.title}</div>
            <div className="card" style={{ padding: '12px 16px', fontSize: 16 }}>「{c.quote}」</div>
          </div>
        </div>
        <p className="small" style={{ color: 'var(--ink2)', margin: '18px 0' }}>
          {all ? `${clues.length} 個線索已全部取得，學習分數也達到 1,500 分。回到盤面就可以進行一次推理。` : '線索已放進證據資料夾，可以在右側「調查進度」隨時查看。'}
        </p>
        <button className="btn btn-dark btn-block" onClick={A.popModal}>返回 Bingo 盤繼續調查</button>
      </Modal>
    );
  }
  return null;
}

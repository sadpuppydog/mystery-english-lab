import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../store.jsx';
import { EVENTS, ITEMS } from '../data/events.js';
import { cellId, cellLabel, eventQuestions, shuffle, SCORE } from '../game.js';
import { Icon, Modal, Alert, Confirm, ItemIcon } from '../components/ui.jsx';

export function EventIntro() {
  const { s, A } = useGame();
  const key = s.params.key; const ev = EVENTS[cellId(key)];
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 190, top: 60, width: 900, height: 600, padding: '30px 44px', display: 'flex', flexDirection: 'column' }}>
        <div className="row gap12">
          <span className="pill pill-red" style={{ fontSize: 14 }}>{ev.name}</span>
          <span className="kicker">BINGO {s.stage}・{cellLabel(key)}</span>
        </div>
        <div className="h1" style={{ margin: '14px 0 12px' }}>{ev.title}</div>
        <p className="pre" style={{ fontSize: 16.5, lineHeight: 1.8, color: 'var(--ink2)' }}>{ev.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '20px 0' }}>
          <div className="card" style={{ padding: '14px 18px' }}><div className="small muted">玩法</div><div style={{ fontWeight: 700, marginTop: 4 }}>{ev.special}</div><div className="small" style={{ marginTop: 4 }}>共 3 題</div></div>
          <div className="card" style={{ padding: '14px 18px' }}>
            <div className="small" style={{ color: 'var(--green)', fontWeight: 700 }}>成功　+200 學習分數・+20 金幣・取得事件紙條</div>
            <div className="small" style={{ color: 'var(--red)', fontWeight: 700, marginTop: 8 }}>失敗　扣 20 金幣・此格標記為失敗格</div>
          </div>
        </div>
        <p className="small muted">事件格是支線，提供案件補充資訊；略過後可返回盤面，之後點此格重新挑戰。接受後先進入準備階段，可查看背包、去商店買道具；準備好再按正式開始，開始後不能離開。</p>
        <div className="row gap12" style={{ marginTop: 'auto' }}>
          <button className="btn btn-line grow" onClick={() => A.declineEvent(key)}>拒絕挑戰（略過此格）</button>
          <button className="btn btn-red grow" onClick={() => A.go('eventPrep', { key })}>接受挑戰，進入準備</button>
        </div>
      </div>
    </div>
  );
}

export function EventPrep() {
  const { s, st, A } = useGame();
  const key = s.params.key; const id = cellId(key); const ev = EVENTS[id];
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 190, top: 50, width: 900, height: 620, padding: '28px 44px', display: 'flex', flexDirection: 'column' }}>
        <div className="kicker">STEP 2 / 3・挑戰準備</div>
        <div className="h1" style={{ margin: '8px 0 18px', fontSize: 28 }}>{ev.name}・{ev.shortTitle}</div>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="h2" style={{ fontSize: 18 }}>確認背包道具</span>
          <button className="btn btn-line btn-sm" onClick={() => A.go('shop', { from: 'eventPrep', key })}><Icon name="cart" size={16} />前往道具商店（金幣 {st.coins}）</button>
        </div>
        {Object.entries(ITEMS).map(([k, it]) => {
          const usable = it.events.includes(id);
          return (
            <div key={k} className="card row gap16" style={{ padding: '12px 18px', marginBottom: 10, opacity: st.items[k] && usable ? 1 : 0.6 }}>
              <ItemIcon item={k} size={24} />
              <b className="grow">{it.name} <span className="muted">×{st.items[k]}</span></b>
              <span className={`pill ${usable ? (st.items[k] ? 'pill-green' : 'pill-dark') : 'pill-red'}`}>{!usable ? `${it.eventsLabel}才可用` : st.items[k] ? '本事件可用' : '未持有'}</span>
            </div>
          );
        })}
        <div className="card" style={{ padding: '14px 18px', marginTop: 8, background: '#2a221b', color: '#f3e6c8', borderColor: '#2a221b' }}>
          <div style={{ fontWeight: 700, color: 'var(--gold2)', marginBottom: 6 }}>正式開始後</div>
          <div className="small" style={{ lineHeight: 1.8 }}>不能返回 Bingo 盤面・不能進入道具商店購買・不能使用 AI 輔助・只能使用背包裡已有的道具</div>
        </div>
        <div className="row gap12" style={{ marginTop: 'auto' }}>
          <button className="btn btn-line grow" onClick={() => A.go('eventIntro', { key })}>返回事件說明</button>
          <button className="btn btn-red grow" onClick={() => A.startEvent(key)}>正式開始挑戰</button>
        </div>
      </div>
    </div>
  );
}

export function EventPlay() {
  const { s, st, A } = useGame();
  const key = s.params.key; const id = cellId(key); const ev = EVENTS[id];
  const data = eventQuestions(st, id);
  const [qi, setQi] = useState(0);
  const [replaced, setReplaced] = useState(false); // 鑑識手套換題（只影響目前這一題）
  const [used, setUsed] = useState({});
  const [gone, setGone] = useState([]);
  const [sel, setSel] = useState(ev.mode === 'multi' ? [] : null);
  const [time, setTime] = useState(60);
  const [pop, setPop] = useState(null);
  const [note, setNote] = useState(null);
  const q = replaced ? data.spare : data.qs[qi];
  const order = useMemo(() => shuffle(q.opts.map((_, i) => i)), [q]);

  useEffect(() => {
    if (ev.mode !== 'timed' || pop) return;
    if (time <= 0) { A.endEvent(key, false); return; }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, pop]);

  const toggle = (i) => {
    if (gone.includes(i)) return;
    if (ev.mode === 'multi') setSel((x) => (x.includes(i) ? x.filter((y) => y !== i) : [...x, i]));
    else setSel(i);
  };

  const submit = () => {
    if (ev.mode === 'multi' ? !sel.length : sel === null) { setPop({ alert: { title: '請先選擇答案', text: '先點選選項，再按送出。' } }); return; }
    const ok = ev.mode === 'multi'
      ? sel.length === q.ans.length && q.ans.every((a) => sel.includes(a))
      : sel === q.ans;
    if (!ok) { A.endEvent(key, false); return; }
    if (qi === 2) { A.endEvent(key, true); return; }
    setQi(qi + 1); setReplaced(false); setGone([]); setSel(ev.mode === 'multi' ? [] : null); setTime(60); setNote(null);
  };

  const tryItem = (k) => {
    const it = ITEMS[k];
    if (!st.items[k] || !it.events.includes(id) || used[k]) {
      setPop({ alert: { title: '無法使用這個道具', text: used[k] ? '每種道具每個事件限用一次。' : '背包裡這個道具的數量為 0，或它不適用於這種事件。\n事件開始後不能再去商店購買。' } });
      return;
    }
    setPop({ confirm: k });
  };
  const applyItem = (k) => {
    A.useItem(k); setUsed((u) => ({ ...u, [k]: true })); setPop(null);
    if (k === 'coffee') { setTime((t) => t + 20); setNote('偵探咖啡已使用：本題作答時間 +20 秒'); }
    if (k === 'magnifier') {
      const wrong = q.opts.map((_, i) => i).filter((i) => (ev.mode === 'multi' ? !q.ans.includes(i) : i !== q.ans));
      const n = ev.mode === 'multi' ? Math.min(2, Math.max(1, wrong.length - 1)) : 2;
      const pick = shuffle(wrong).slice(0, n);
      setGone(pick); setSel((x) => (ev.mode === 'multi' ? x.filter((y) => !pick.includes(y)) : pick.includes(x) ? null : x));
      setNote(`線索放大鏡已使用：排除 ${n} 個錯誤選項`);
    }
    if (k === 'glove') { setReplaced(true); setGone([]); setSel(ev.mode === 'multi' ? [] : null); setNote('鑑識手套已使用：已換成新的一題'); if (ev.mode === 'timed') setTime(60); }
  };

  const mm = String(Math.floor(time / 60)).padStart(2, '0'); const ss = String(time % 60).padStart(2, '0');
  return (
    <div className="screen">
      <div className="q-top">
        <span className="pill pill-red" style={{ fontSize: 14, height: 30 }}>{ev.name}・{ev.modeLabel}</span>
        <span className="title">{ev.title}</span>
        <span className="pill" style={{ marginLeft: 'auto', border: '1px solid var(--red)', color: '#f1c7bd' }}><Icon name="lock" size={12} />挑戰中・無法離開・AI 已停用</span>
        <span className="serif" style={{ color: '#f3e6c8', fontSize: 18, marginLeft: 12 }}>第 {qi + 1} / 3 題</span>
      </div>
      {ev.mode === 'timed' && (
        <div className="panel row gap16" style={{ position: 'absolute', left: 28, right: 28, top: 80, height: 56, padding: '0 22px', background: '#3b3047', color: '#f3e6c8' }}>
          <Icon name="clock" size={22} style={{ color: time <= 10 ? '#ff9b88' : 'var(--gold2)' }} />
          <span className="serif" style={{ fontSize: 30, fontWeight: 800, color: time <= 10 ? '#ff9b88' : '#f6c8a8', width: 90 }}>{mm}:{ss}</span>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.12)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (time / (used.coffee ? 80 : 60)) * 100)}%`, height: '100%', background: '#e07f6a', transition: 'width 1s linear' }} />
          </div>
          <span className="small" style={{ color: '#d8c69a' }}>剩餘時間{used.coffee ? '（已延長 +20 秒）' : '（本題 60 秒）'}</span>
        </div>
      )}
      <div className="panel" style={{ position: 'absolute', left: 28, width: 920, top: ev.mode === 'timed' ? 150 : 86, bottom: 22, padding: '24px 30px', display: 'flex', flexDirection: 'column' }}>
        <div className="q-meta"><span>{ev.mode === 'six' ? '增加選項・6 選 1' : ev.mode === 'multi' ? '多選題' : '限時挑戰'}</span><span>{ev.instruction}</span></div>
        {ev.mode === 'multi'
          ? <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>正確答案不只一個・要全部選對才算答對</p>
          : <div className="en" style={{ fontSize: 24, lineHeight: 1.4, marginBottom: 20 }}>{q.q}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: ev.mode === 'multi' ? '1fr' : '1fr 1fr', gap: '0 12px' }}>
          {order.map((oi, pos) => {
            const isSel = ev.mode === 'multi' ? sel.includes(oi) : sel === oi;
            return (
              <button key={oi} className={`opt ${isSel ? 'sel' : ''} ${gone.includes(oi) ? 'gone' : ''}`} disabled={gone.includes(oi)} onClick={() => toggle(oi)}>
                <span className="badge-letter" style={ev.mode === 'multi' ? { background: isSel ? 'var(--ink)' : '#fff', color: isSel ? '#fff' : 'var(--ink)', border: '1.5px solid var(--ink)' } : undefined}>
                  {ev.mode === 'multi' ? (isSel ? <Icon name="check" size={15} stroke={3} /> : '') : 'ABCDEF'[pos]}
                </span>
                <span>{q.opts[oi]}</span>
              </button>
            );
          })}
        </div>
        {note && <div className="small" style={{ color: 'var(--goldd)', fontWeight: 700 }}>{note}</div>}
        <div className="q-foot">
          {ev.mode === 'timed' && <span className="small" style={{ color: 'var(--red)', marginRight: 'auto' }}>時間到仍未作答＝本題答錯，事件挑戰失敗</span>}
          <button className="btn btn-dark" style={{ width: 170 }} onClick={submit}>送出答案</button>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 966, right: 28, top: ev.mode === 'timed' ? 150 : 86 }}>
        <div className="card" style={{ padding: '14px 16px', background: '#3b3047', color: '#f3e6c8', borderColor: '#3b3047', marginBottom: 14 }}>
          <div className="small" style={{ color: '#d8c69a' }}>事件規則</div>
          <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6 }}>3 題全對才算成功；任一題答錯即挑戰失敗並扣 20 金幣。</div>
        </div>
        <div className="small light" style={{ marginBottom: 8, color: '#e8dbbd' }}>背包道具（只能用事前準備的）</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(ITEMS).map(([k, it]) => {
            const ok = st.items[k] > 0 && it.events.includes(id) && !used[k];
            return (
              <button key={k} onClick={() => tryItem(k)} className="card" style={{ height: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative',
                background: ok ? '#3b3047' : 'rgba(59,48,71,.45)', color: '#f3e6c8', borderColor: ok ? 'var(--gold)' : 'transparent' }}>
                <span style={{ position: 'absolute', right: 8, top: 6, fontSize: 12, color: 'var(--gold2)' }}>{used[k] ? '已使用' : !it.events.includes(id) ? '不適用' : `×${st.items[k]}`}</span>
                <ItemIcon item={k} size={26} /><span style={{ fontSize: 13, fontWeight: 700 }}>{it.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {pop?.alert && <Alert {...pop.alert} onClose={() => setPop(null)} />}
      {pop?.confirm && <Confirm title={`要使用${ITEMS[pop.confirm].name}嗎？`} text={`${ITEMS[pop.confirm].confirm}使用後背包數量 −1，每個事件限用一次，用了就不能收回。`}
        okLabel="確定使用" onOk={() => applyItem(pop.confirm)} onCancel={() => setPop(null)} />}
    </div>
  );
}

export function EventResult() {
  const { s, A } = useGame();
  const { key, ok } = s.params; const ev = EVENTS[cellId(key)];
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 290, top: 80, width: 700, padding: '32px 44px 34px', textAlign: 'center' }}>
        <div className="kicker">——— Bingo {s.stage} 事件格 ———</div>
        <div className="serif" style={{ fontSize: 40, fontWeight: 900, margin: '12px 0 4px', color: ok ? 'var(--green)' : 'var(--red)' }}>{ok ? '事件挑戰成功' : '挑戰失敗'}</div>
        <div className="row gap8" style={{ justifyContent: 'center', marginBottom: 18 }}><b>{ev.title}</b><span className="pill pill-red">{ev.modeLabel}</span></div>
        {ok ? <>
          <div className="card" style={{ padding: '18px 24px', margin: '0 auto 18px', maxWidth: 520, background: '#fbf3df', transform: 'rotate(-1deg)' }}>
            <div className="small muted" style={{ marginBottom: 6 }}>{ev.noteTitle}</div>
            <div className="serif" style={{ fontSize: 19, lineHeight: 1.6 }}>「{ev.note}」</div>
          </div>
          <div className="row gap16" style={{ justifyContent: 'center', marginBottom: 14 }}>
            <div className="card" style={{ padding: '10px 26px' }}><div className="small muted">學習分數</div><div className="serif" style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>+{SCORE.event}</div></div>
            <div className="card" style={{ padding: '10px 26px' }}><div className="small muted">金幣</div><div className="serif" style={{ fontSize: 28, fontWeight: 900, color: 'var(--goldd)' }}>+{SCORE.eventCoin}</div></div>
          </div>
          <p className="small muted" style={{ marginBottom: 18 }}>紙條已放進背包的「事件紙條」，可隨時回顧</p>
        </> : <>
          <p className="pre" style={{ fontSize: 17, lineHeight: 1.8, margin: '10px 0' }}>{ev.failText}</p>
          <p className="muted" style={{ marginBottom: 14 }}>看來這次還不夠仔細……</p>
          <div className="card" style={{ padding: '10px 26px', display: 'inline-block', marginBottom: 20 }}><div className="small muted">金幣</div><div className="serif" style={{ fontSize: 28, fontWeight: 900, color: 'var(--red)' }}>−{SCORE.eventFail}</div></div>
          <br />
        </>}
        <button className="btn btn-dark" style={{ width: 260 }} onClick={A.backToBoard}>返回 Bingo 盤</button>
      </div>
    </div>
  );
}

export function Shop() {
  const { s, st, A } = useGame();
  const [pick, setPick] = useState('magnifier');
  const [msg, setMsg] = useState(null);
  const it = ITEMS[pick];
  const back = () => (s.params.from === 'eventPrep' ? A.go('eventPrep', { key: s.params.key }) : A.go('board'));
  const buy = () => {
    const before = st.coins;
    if (A.buy(pick)) setMsg({ ok: true, text: `購買成功！${it.name} ×1 已放入背包・金幣 ${before} → ${before - it.price}` });
    else setMsg({ ok: false, text: `金幣不足：${it.name}需要 ${it.price} 金幣，目前只有 ${before}。` });
  };
  return (
    <div className="screen">
      <div className="q-top">
        <button className="btn btn-ghost-light btn-sm" onClick={back}><Icon name="back" size={16} />{s.params.from === 'eventPrep' ? '返回挑戰準備' : '返回 Bingo 盤面'}</button>
        <div style={{ marginLeft: 8 }}><div className="title" style={{ marginLeft: 0 }}>偵探道具商店</div><div className="small" style={{ color: '#d8c69a' }}>道具只能在事件格使用・需在事件開始前購買</div></div>
        <div className="chip" style={{ marginLeft: 'auto' }}><Icon name="coin" size={22} /><div><div className="chip-label">目前金幣</div><div className="chip-val">{st.coins}</div></div></div>
      </div>
      {msg && <div className={`alert ${msg.ok ? 'alert-green' : 'alert-red'}`} style={{ position: 'absolute', left: 300, right: 300, top: 86, zIndex: 5, textAlign: 'center', fontWeight: 700 }}>{msg.text}</div>}
      <div className="panel" style={{ position: 'absolute', left: 28, top: 130, width: 860, bottom: 22, padding: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {Object.entries(ITEMS).map(([k, x]) => (
          <button key={k} onClick={() => { setPick(k); setMsg(null); }} className="card" style={{ padding: '22px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: pick === k ? '2.5px solid var(--ink)' : '1px solid var(--line)', background: pick === k ? '#fffaf0' : 'var(--card)' }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--dark)', color: 'var(--gold2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ItemIcon item={k} size={38} /></div>
            <div className="h2" style={{ fontSize: 21, marginTop: 14 }}>{x.name}</div>
            <div className="small" style={{ color: 'var(--ink2)', marginTop: 4 }}>{x.short}</div>
            <div style={{ width: '100%', borderTop: '1px solid var(--line)', margin: '14px 0', paddingTop: 12, textAlign: 'left' }}>
              <div className="small" style={{ fontWeight: 800 }}>效果</div>
              <div className="small" style={{ color: 'var(--ink2)', margin: '4px 0 10px' }}>{x.effect}</div>
              <div className="small" style={{ fontWeight: 800 }}>適用事件</div>
              <div className="small" style={{ color: 'var(--ink2)', marginTop: 4 }}>{x.eventsLabel}</div>
            </div>
            <div className="serif" style={{ fontSize: 24, marginTop: 'auto', color: st.coins < x.price ? 'var(--red)' : 'var(--ink)' }}>{x.price} 金幣</div>
            <div className="small" style={{ marginTop: 4, color: st.coins < x.price ? 'var(--red)' : 'var(--muted)', fontWeight: 700 }}>{st.coins < x.price ? '金幣不足・' : ''}背包持有 ×{st.items[k]}</div>
          </button>
        ))}
        <div className="small muted" style={{ gridColumn: '1 / -1', alignSelf: 'end' }}>道具價格為暫定值</div>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 906, right: 28, top: 130, bottom: 22, padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="kicker">道具說明</div>
        <div className="h1" style={{ fontSize: 28, margin: '8px 0 10px' }}>{it.name}</div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink2)' }}>{it.desc}</p>
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 16, paddingTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', margin: '6px 0' }}><span>價格</span><b>{it.price} 金幣</b></div>
          <div className="row" style={{ justifyContent: 'space-between', margin: '6px 0' }}><span>{st.coins >= it.price ? '購買後剩餘' : '還差'}</span><b>{st.coins >= it.price ? st.coins - it.price : it.price - st.coins} 金幣</b></div>
        </div>
        <div style={{ margin: '18px auto', width: 140, height: 140, borderRadius: '50%', border: '2px dashed var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 112, height: 112, borderRadius: '50%', background: 'var(--dark)', color: 'var(--gold2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ItemIcon item={pick} size={50} /></div>
        </div>
        <div className="center small" style={{ fontWeight: 700 }}>適用：{it.eventsLabel}</div>
        <div className="center small muted" style={{ marginTop: 4 }}>購買後放入背包，在事件挑戰中點選使用</div>
        <button className="btn btn-dark btn-block" style={{ marginTop: 'auto' }} onClick={buy} disabled={st.coins < it.price}>{st.coins < it.price ? '金幣不足，無法購買' : '購買並放入背包'}</button>
      </div>
    </div>
  );
}

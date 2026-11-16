import React, { useEffect, useState } from 'react';
import { useGame } from '../store.jsx';
import { STAGES, REMEDIAL, FINAL_TEXT } from '../data/story.js';
import { stageClues, unlockedCount, baseGameScore, challengedCount, fmt, stars } from '../game.js';
import { Icon, Modal, Photo, Stars, Alert } from '../components/ui.jsx';
import { ClueZoom } from '../components/Panels.jsx';

// ---------- 推理 ----------
export function Reasoning() {
  const { s, st, A } = useGame();
  const S = STAGES[s.stage];
  const clues = stageClues(s.stage, st.clueCount).slice(0, unlockedCount(st.learning, st.clueCount));
  const [sel, setSel] = useState(null);
  const [pop, setPop] = useState(null);
  const base = baseGameScore(st.clueCount);
  return (
    <div className="screen">
      <div className="q-top">
        <span className="title" style={{ fontSize: 26 }}>推理時間｜{S.name}</span>
        <span className="small" style={{ color: '#d8c69a', marginLeft: 8 }}>學習分數 {fmt(st.learning)} 達成・{st.clueCount} 個線索已全部取得</span>
        <button className="btn btn-ghost-light btn-sm" style={{ marginLeft: 'auto' }} onClick={() => A.go('board')}><Icon name="back" size={16} />返回 Bingo 盤面</button>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 28, top: 86, width: 420, bottom: 22, padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
        <div className="h2" style={{ fontSize: 19, marginBottom: 12 }}>已取得的證據</div>
        {clues.map((c, i) => (
          <button key={i} className="clue-row" style={{ height: 'auto', minHeight: 50, padding: '10px 14px', textAlign: 'left' }} onClick={() => setPop({ zoom: c })}>
            <span className="n" style={{ color: 'var(--red)', fontSize: 14, flex: 'none' }}>線索{'一二三四五'[i]}</span>
            <span className="t" style={{ color: 'var(--ink)' }}>{c.quote}</span>
          </button>
        ))}
        <div className="small muted" style={{ marginTop: 'auto' }}>點擊線索可放大查看照片</div>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 466, right: 28, top: 86, bottom: 22, padding: '24px 30px', display: 'flex', flexDirection: 'column' }}>
        <div className="h2">{S.question}</div>
        <p className="small" style={{ color: 'var(--red)', fontWeight: 700, margin: '8px 0 16px' }}>本關只能推理一次，送出後無法更改。答案將在結果動畫中揭曉。</p>
        {S.options.map((o, i) => (
          <button key={i} className={`opt ${sel === i ? 'sel' : ''}`} style={{ fontFamily: 'var(--sans)', fontSize: 16.5, minHeight: 62, border: sel === i ? '2px solid var(--red)' : undefined }} onClick={() => setSel(i)}>
            <span className="badge-letter" style={sel === i ? { background: 'var(--red)' } : undefined}>{'ABCD'[i]}</span><span>{o}</span>
          </button>
        ))}
        <div className="row" style={{ marginTop: 'auto' }}>
          <span className="small" style={{ color: 'var(--ink2)' }}>本關選 {st.clueCount} 個線索：基礎遊戲分數 {base}，猜對 +200</span>
          <button className="btn btn-dark" style={{ marginLeft: 'auto', width: 200 }} onClick={() => (sel === null ? setPop({ alert: true }) : setPop({ confirm: true }))}><Icon name="send" size={16} />送出推理</button>
        </div>
      </div>
      {pop?.zoom && <ClueZoom stage={s.stage} clue={pop.zoom} onClose={() => setPop(null)} />}
      {pop?.alert && <Alert title="請先選擇答案" text="先點選一個推理選項，再按送出。" onClose={() => setPop(null)} />}
      {pop?.confirm && (
        <Modal width={620} onClose={() => setPop(null)}>
          <div className="modal-title">確定送出推理嗎？</div>
          <div className="small muted" style={{ marginBottom: 8 }}>{S.confirmLabel}</div>
          <div className="card row gap12" style={{ padding: '14px 16px', border: '2px solid var(--red)', marginBottom: 14 }}>
            <span className="badge-letter" style={{ background: 'var(--red)' }}>{'ABCD'[sel]}</span><span style={{ fontSize: 16 }}>{S.options[sel]}</span>
          </div>
          <div className="card small" style={{ padding: '12px 16px', lineHeight: 1.8, marginBottom: 20 }}>
            ・每一關只能正式推理一次，送出後不能修改。<br />・答案不會馬上公布，會在結果動畫中揭曉。<br />・送出後可以選擇直接結算，或繼續挑戰剩餘格子。
          </div>
          <div className="row gap12">
            <button className="btn btn-line grow" onClick={() => setPop(null)}>再想想</button>
            <button className="btn btn-red grow" onClick={() => A.submitReasoning(sel)}>確定送出</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function AfterReason() {
  const { s, st, A } = useGame();
  const left = 25 - challengedCount(st);
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 190, top: 90, width: 900, padding: '32px 44px 36px' }}>
        <span className="pill pill-green">推理已記錄・{STAGES[s.stage].label}過關</span>
        <div className="h1" style={{ margin: '14px 0 8px' }}>接下來要怎麼做？</div>
        <p style={{ color: 'var(--ink2)', marginBottom: 24 }}>答案會在結果動畫中揭曉。繼續挑戰可以累積更多學習分數。</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="card col" style={{ padding: 22, minHeight: 230 }}>
            <div className="h2" style={{ fontSize: 20 }}>直接進入結果</div>
            <p className="small" style={{ color: 'var(--ink2)', margin: '10px 0 20px', lineHeight: 1.7 }}>播放{s.stage === 1 ? '犯案手法' : '真相'}動畫，公布正確答案，接著進入{STAGES[s.stage].label}結算。</p>
            <button className="btn btn-red" style={{ marginTop: 'auto' }} onClick={() => A.setRoute('reason', 'reveal')}>揭曉真相</button>
          </div>
          <div className="card col" style={{ padding: 22, minHeight: 230 }}>
            <div className="h2" style={{ fontSize: 20 }}>繼續挑戰剩餘格子</div>
            <p className="small" style={{ color: 'var(--ink2)', margin: '10px 0 20px', lineHeight: 1.7 }}>還有 {left} 格未挑戰。返回盤面累積學習分數，不能再推理；盤面上會一直有「進入結算」按鈕。</p>
            <button className="btn btn-dark" style={{ marginTop: 'auto' }} disabled={left === 0} onClick={() => A.go('board')}>返回 Bingo 盤</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- 揭曉動畫 ----------
export function Reveal() {
  const { s, A } = useGame();
  const S = STAGES[s.stage]; const R = S.reveal;
  const total = s.stage === 1 ? 9 : 10;
  const [t, setT] = useState(0);
  useEffect(() => { if (t >= total) return; const x = setTimeout(() => setT((v) => v + 0.25), 250); return () => clearTimeout(x); }, [t]);
  const n = s.stage === 1 ? R.scenes.length : R.suspects.length;
  const shown = Math.min(n, Math.floor((t / total) * (n + 0.6)) + 1);
  const done = t >= total;
  const sec = (v) => `0:${String(Math.floor(v * 5)).padStart(2, '0')}`;
  return (
    <div className="screen" style={{ background: 'rgba(10,6,3,.55)' }}>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 40 }}>
        <div className="kicker" style={{ color: 'var(--gold2)' }}>{R.tag}</div>
        <div className="serif" style={{ fontSize: 34, fontWeight: 900, color: '#f3e6c8', marginTop: 6 }}>{R.title}</div>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 140, display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 20 }}>
        {s.stage === 1 ? R.scenes.map((sc, i) => (
          <div key={i} className={`panel scene ${i < shown ? 'on' : ''}`} style={{ padding: 18 }}>
            <Photo label={sc.title} h={220} />
            <div className="row gap8" style={{ marginTop: 14 }}><span className="badge-letter" style={{ background: 'var(--red)' }}>0{i + 1}</span><b className="serif" style={{ fontSize: 18 }}>{sc.title}</b></div>
            <p style={{ marginTop: 10, lineHeight: 1.7, color: 'var(--ink2)' }}>{sc.text}</p>
          </div>
        )) : R.suspects.map((p, i) => (
          <div key={i} className={`panel scene ${i < shown ? 'on' : ''}`} style={{ padding: 16, border: p.verdict === '兇手' ? '3px solid var(--red)' : undefined }}>
            <Photo label={p.name} h={170} />
            <div className="row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
              <div><b className="serif" style={{ fontSize: 20 }}>{p.name}</b> <span className="small muted">{p.role}</span></div>
              <span className={`pill ${p.verdict === '兇手' ? 'pill-red' : p.verdict === '被冒用' ? 'pill-gold' : 'pill-green'}`}>{p.verdict}</span>
            </div>
            <p className="small" style={{ marginTop: 8, lineHeight: 1.7, color: 'var(--ink2)' }}>{p.text}</p>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 40 }} className="row gap16">
        <span className="small" style={{ color: '#e8dbbd' }}>{done ? '動畫播放完畢' : '動畫播放中'}</span>
        <div className="reveal-bar grow"><i style={{ width: `${(t / total) * 100}%` }} /></div>
        <span className="small" style={{ color: '#e8dbbd', width: 90 }}>{sec(t)} / {sec(total)}</span>
        <button className="btn btn-ghost-light btn-sm" onClick={() => setT(total)} disabled={done}>略過</button>
        <button className="btn btn-gold" disabled={!done} onClick={() => A.go('settle')}>{STAGES[s.stage].label}結算</button>
      </div>
    </div>
  );
}

// ---------- 結算 ----------
export function Settle() {
  const { s, st, A } = useGame();
  const S = STAGES[s.stage]; const route = st.route;
  const reasoned = route === 'reason'; const correct = reasoned && st.reasoning.correct;
  const base = baseGameScore(st.clueCount); const game = reasoned ? base + (correct ? 200 : 0) : null;
  const tag = reasoned ? (correct ? ['推理正確', 'var(--green)'] : ['推理錯誤', 'var(--red)']) : route === 'skip' ? ['未進行推理', 'var(--ink2)'] : ['補救完成', 'var(--goldd)'];
  const Box = ({ letter, text, kind }) => (
    <div className="card row gap12" style={{ padding: '10px 14px', display: 'inline-flex', background: kind === 'ok' ? 'var(--greenbg2)' : 'var(--redbg2)', border: `1.5px solid ${kind === 'ok' ? 'var(--green)' : 'var(--red)'}` }}>
      <span className="badge-letter" style={{ background: kind === 'ok' ? 'var(--green)' : 'var(--red)' }}>{letter}</span><span>{text}</span>
    </div>
  );
  return (
    <div className="screen">
      <div style={{ position: 'absolute', left: 48, top: 26 }} className="serif"><span style={{ fontSize: 32, fontWeight: 900, color: '#f3e6c8' }}>{S.label}結算｜{S.name}</span></div>
      <div className="panel" style={{ position: 'absolute', left: 48, top: 92, width: 760, bottom: 26, padding: '26px 32px', display: 'flex', flexDirection: 'column' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="kicker">真相揭曉</span>
          <span className="serif" style={{ border: `2px solid ${tag[1]}`, color: tag[1], padding: '4px 14px', fontWeight: 800, fontSize: 18 }}>{tag[0]}</span>
        </div>
        <div className="serif pre" style={{ fontSize: 25, fontWeight: 800, lineHeight: 1.6, margin: '12px 0 26px' }}>{S.truth}</div>
        {reasoned && <>
          <div className="row gap16" style={{ marginBottom: 12 }}><span style={{ width: 70 }}>你的推理</span><Box letter={'ABCD'[st.reasoning.choice]} text={S.options[st.reasoning.choice]} kind={correct ? 'ok' : 'bad'} /></div>
          {!correct && <div className="row gap16"><span style={{ width: 70 }}>正確答案</span><Box letter={'ABCD'[S.answer]} text={S.options[S.answer]} kind="ok" /></div>}
        </>}
        {route === 'skip' && <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'var(--ink2)' }}>25 格已全部挑戰，學習分數 {fmt(st.learning)}（介於 800–1,499）。<br />依規則本關<b>跳過推理</b>，直接播放真相並結算。</p>}
        {route === 'remedial' && <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'var(--ink2)' }}>學習分數 {fmt(st.learning)}，低於 800。已完成 <b>3 題補救學習</b>（只看是否作答完，不看對錯）。<br />本關不進行推理，直接揭曉真相。</p>}
        <p className="pre" style={{ marginTop: 'auto', fontSize: 15, lineHeight: 1.8, color: 'var(--ink2)' }}>{S.teaser}</p>
      </div>
      <div style={{ position: 'absolute', left: 828, right: 48, top: 92 }}>
        <div className="panel" style={{ padding: 18 }}>
          <div className="card" style={{ padding: '14px 18px', marginBottom: 12 }}>
            <div className="small muted">學習分數</div>
            <div className="serif" style={{ fontSize: 36, fontWeight: 800 }}>{fmt(st.learning)}</div>
            <div className="small muted">完成 {Object.values(st.cells).filter((c) => c.status === 'done').length} 格・Bingo 連線 {st.lines.length} 條</div>
          </div>
          <div className="card" style={{ padding: '14px 18px', marginBottom: 12 }}>
            <div className="small muted">遊戲分數</div>
            <div className="serif" style={{ fontSize: 36, fontWeight: 800 }}>{game === null ? '—' : fmt(game)}</div>
            <div className="small muted">{reasoned ? `選擇 ${st.clueCount} 個線索：基礎 ${base} ＋ ${correct ? '推理正確 200' : '推理錯誤 0'}` : '未進行推理，不計推理加分'}</div>
          </div>
          <div className="card row" style={{ padding: '14px 18px' }}>
            <span className="small muted">協助分數</span>
            <span style={{ marginLeft: 'auto' }}>剩 {fmt(st.assist)}（AI {st.usage.ai} 次・提示 {st.usage.hints} 次）</span>
          </div>
        </div>
        <p className="small" style={{ color: '#e8dbbd', marginTop: 12, lineHeight: 1.7 }}>{s.stage === 1 ? '本關紀錄已保存。進入第二關後，學習分數、遊戲分數、金幣與道具將重新計算。' : '第二關紀錄已保存。'}</p>
      </div>
      <button className="btn btn-red" style={{ position: 'absolute', right: 48, bottom: 26, width: 404, height: 54, fontSize: 17 }} onClick={A.finishStage}>{S.nextLabel} →</button>
    </div>
  );
}

// ---------- 未達推理門檻：直接揭曉 ----------
export function Direct() {
  const { s, st, A } = useGame();
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 240, top: 90, width: 800, padding: '32px 44px 36px' }}>
        <div className="kicker">BINGO {s.stage}・25 / 25 格已挑戰</div>
        <div className="h1" style={{ margin: '10px 0 22px' }}>調查結束，直接揭曉真相</div>
        <div className="row gap16" style={{ marginBottom: 20 }}>
          {[['你的學習分數', fmt(st.learning)], ['推理門檻', '1,500'], ['最低學習門檻', '800']].map(([k, v]) => (
            <div key={k} className="card grow" style={{ padding: '14px 18px' }}><div className="small muted">{k}</div><div className="serif" style={{ fontSize: 30, fontWeight: 800 }}>{v}</div></div>
          ))}
        </div>
        <div className="card" style={{ padding: '14px 18px', marginBottom: 24 }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>你的情況</div>
          <div style={{ lineHeight: 1.7 }}>學習分數已達 800，但還沒到推理門檻 1,500：本關不進行推理，直接揭曉真相並結算。</div>
        </div>
        <button className="btn btn-red btn-block" onClick={() => A.setRoute('skip', 'reveal')}>{s.stage === 1 ? '播放犯案手法動畫並結算' : '揭曉真正兇手並結算'}</button>
      </div>
    </div>
  );
}

// ---------- 補救學習 ----------
export function RemedialStart() {
  const { st, A } = useGame();
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 320, top: 100, width: 640, padding: '32px 40px 34px' }}>
        <div className="row gap12"><span className="pill pill-dark">調查暫停</span><span className="kicker">補強學習</span></div>
        <div className="h1" style={{ margin: '12px 0 18px' }}>偵探，再複習一下吧</div>
        <div className="row gap16" style={{ marginBottom: 16 }}>
          <div className="card grow" style={{ padding: '12px 16px' }}><div className="small muted">已挑戰格子</div><div className="serif" style={{ fontSize: 28, fontWeight: 800 }}>25 / 25</div></div>
          <div className="card grow" style={{ padding: '12px 16px' }}><div className="small muted">學習分數（最低門檻 800）</div><div className="serif" style={{ fontSize: 28, fontWeight: 800, color: 'var(--red)' }}>{fmt(st.learning)}</div></div>
        </div>
        <p style={{ lineHeight: 1.8, color: 'var(--ink2)', marginBottom: 14 }}>盤面已全部挑戰完，但學習分數還沒到 800。完成 3 題補救題，每題都會告訴你正確答案和原因，完成後就能看到本關真相。</p>
        <div className="row gap8" style={{ marginBottom: 14 }}><span className="small" style={{ fontWeight: 700 }}>本次複習的文法</span>{REMEDIAL.map((r) => <span key={r.topic} className="pill pill-gold">{r.topic}</span>)}</div>
        <p className="small muted" style={{ marginBottom: 22 }}>補救題不計分、不需全部答對，答完 3 題就完成；之後不進行推理，直接揭曉。</p>
        <button className="btn btn-dark btn-block" onClick={() => A.go('remedial', { i: 0 })}>開始補救學習（3 題）</button>
      </div>
    </div>
  );
}

export function Remedial() {
  const { s, A } = useGame();
  const i = s.params.i || 0; const R = REMEDIAL[i];
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  const [warn, setWarn] = useState(false);
  useEffect(() => { setSel(null); setChecked(false); }, [i]);
  const ok = sel === R.ans;
  return (
    <div className="screen">
      <div className="q-top">
        <span className="title" style={{ fontSize: 24 }}>補救學習</span>
        <div className="row gap8" style={{ marginLeft: 'auto' }}>
          {[0, 1, 2].map((k) => <span key={k} style={{ width: 40, height: 5, borderRadius: 3, background: k <= i ? 'var(--gold2)' : 'rgba(255,255,255,.2)' }} />)}
          <span style={{ color: '#e8dbbd', marginLeft: 8 }}>{i + 1} / 3</span>
        </div>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 28, top: 86, width: checked ? 776 : 1224, bottom: 22, padding: '24px 30px', display: 'flex', flexDirection: 'column' }}>
        <div className="kicker" style={{ marginBottom: 10 }}>REVIEW {i + 1}・{R.topic}</div>
        <div className="en" style={{ fontSize: 23, lineHeight: 1.4, marginBottom: 18 }}>{R.q}</div>
        {R.opts.map((o, k) => {
          let cls = sel === k ? 'sel' : '';
          if (checked) cls = k === R.ans ? 'right' : k === sel ? 'wrong' : '';
          return (
            <button key={k} className={`opt ${cls}`} disabled={checked} onClick={() => setSel(k)}>
              <span className="badge-letter" style={checked && k === R.ans ? { background: 'var(--green)' } : checked && k === sel ? { background: 'var(--red)' } : undefined}>{'ABCD'[k]}</span>
              <span>{o}</span>
              {checked && k === sel && <span className="tag" style={{ color: k === R.ans ? 'var(--green)' : 'var(--red)' }}>{k === R.ans ? '正確' : '你的答案'}</span>}
              {checked && k === R.ans && k !== sel && <span className="tag" style={{ color: 'var(--green)' }}>正確答案</span>}
            </button>
          );
        })}
        {!checked && <div className="q-foot"><button className="btn btn-dark" style={{ width: 200 }} onClick={() => (sel === null ? setWarn(true) : setChecked(true))}>確認答案</button></div>}
      </div>
      {checked && (
        <div style={{ position: 'absolute', left: 822, right: 28, top: 86, bottom: 22, display: 'flex', flexDirection: 'column' }}>
          <div className="panel" style={{ padding: 18, flex: 1 }}>
            <div className="card" style={{ padding: '12px 16px', marginBottom: 12 }}>
              <div className="small" style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>{ok ? '答對了！' : '錯誤原因'}</div>
              <div className="small" style={{ lineHeight: 1.7 }}>{ok ? `${R.opts[R.ans]} 是正確答案。${R.point}` : R.wrong[sel]}</div>
            </div>
            <div className="card" style={{ padding: '12px 16px', marginBottom: 12 }}>
              <div className="small" style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>文法重點</div>
              <div className="small" style={{ lineHeight: 1.7 }}>{R.point}</div>
            </div>
            <div className="card" style={{ padding: '12px 16px' }}>
              <div className="small" style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>相關解釋</div>
              <div className="en" style={{ fontSize: 16 }}>{R.example}</div>
            </div>
          </div>
          <div className="small" style={{ color: '#d8c69a', margin: '10px 0' }}>補救題不計分，系統只記錄是否完成</div>
          <button className="btn btn-dark btn-block" style={{ height: 52 }} onClick={() => (i < 2 ? A.go('remedial', { i: i + 1 }) : A.go('remedialDone'))}>{i < 2 ? '下一題' : '完成補救學習'}</button>
        </div>
      )}
      {warn && <Alert title="請先選擇答案" text="先點選一個選項，再按確認答案。" onClose={() => setWarn(false)} />}
    </div>
  );
}

export function RemedialDone() {
  const { A } = useGame();
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 340, top: 120, width: 600, padding: '34px 40px', textAlign: 'center' }}>
        <div className="kicker">——— 補救學習 ———</div>
        <div className="serif" style={{ fontSize: 40, fontWeight: 900, margin: '12px 0 20px', color: 'var(--green)' }}>複習完成</div>
        <div className="row gap12" style={{ justifyContent: 'center', marginBottom: 20 }}>
          {REMEDIAL.map((r, i) => <div key={i} className="card" style={{ padding: '10px 20px' }}><div className="small muted">第 {i + 1} 題</div><b>{r.topic}</b></div>)}
        </div>
        <p style={{ lineHeight: 1.8, color: 'var(--ink2)', marginBottom: 24 }}>補救學習已完成（只看是否作答完，不看對錯）。<br />本關不進行推理猜測，接下來直接揭曉真相。</p>
        <button className="btn btn-red" style={{ width: 260 }} onClick={() => A.setRoute('remedial', 'reveal')}>揭曉真相</button>
      </div>
    </div>
  );
}

// ---------- 最終結算 ----------
export function Final() {
  const { s, A } = useGame();
  const r1 = s.results[1]; const r2 = s.results[2];
  const [rec, setRec] = useState(false);
  const total = r1.learning + r2.learning;
  const gameTotal = (r1.game || 0) + (r2.game || 0);
  const res = (r) => (r.route === 'reason' ? `${r.correct ? '正確' : '錯誤'}（${r.clueCount} 線索）` : r.route === 'skip' ? '未推理' : '補救學習');
  return (
    <div className="screen">
      <div style={{ position: 'absolute', left: 0, right: 0, top: 24, textAlign: 'center' }}>
        <div className="kicker" style={{ color: 'var(--gold2)' }}>CASE CLOSED</div>
        <div className="serif" style={{ fontSize: 40, fontWeight: 900, color: '#f3e6c8', margin: '4px 0 10px' }}>案件真相大白</div>
        <div className="row gap16" style={{ justifyContent: 'center' }}>
          <span className="serif" style={{ color: '#f3e6c8', fontSize: 20, fontWeight: 700 }}>星級評價</span><Stars n={stars(total)} />
        </div>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 48, top: 190, width: 470, height: 420, padding: 24 }}>
        <div className="kicker" style={{ marginBottom: 14 }}>真正兇手</div>
        <div className="row gap16">
          <Photo label="Sophia" w={110} h={140} />
          <div><div className="serif" style={{ fontSize: 34, fontWeight: 900 }}>Sophia</div><div className="muted">研究助理</div></div>
        </div>
        <p style={{ marginTop: 18, lineHeight: 1.8, color: 'var(--ink2)' }}>{FINAL_TEXT}</p>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 540, right: 48, top: 190, height: 420, padding: '20px 26px', display: 'flex', flexDirection: 'column' }}>
        <table className="result">
          <thead><tr><th>關卡</th><th style={{ textAlign: 'right' }}>推理結果</th><th style={{ textAlign: 'right' }}>學習分數</th><th style={{ textAlign: 'right' }}>遊戲分數</th></tr></thead>
          <tbody>
            <tr><td>第一關｜犯案方式</td><td className="num" style={{ fontWeight: 700 }}>{res(r1)}</td><td className="num">{fmt(r1.learning)}</td><td className="num">{r1.game === null ? '—' : fmt(r1.game)}</td></tr>
            <tr><td>第二關｜真正兇手</td><td className="num" style={{ fontWeight: 700 }}>{res(r2)}</td><td className="num">{fmt(r2.learning)}</td><td className="num">{r2.game === null ? '—' : fmt(r2.game)}</td></tr>
            <tr><td className="serif" style={{ fontSize: 22, fontWeight: 800 }}>總計</td><td /><td className="num" style={{ fontSize: 24 }}>{fmt(total)}</td><td className="num" style={{ fontSize: 24 }}>{fmt(gameTotal)}</td></tr>
          </tbody>
        </table>
        <p className="small muted" style={{ marginTop: 'auto', lineHeight: 1.6 }}>星級依兩關學習分數合計：5★ 6,000 以上・4★ 5,000–5,999・3★ 3,600–4,999・2★ 2,400–3,599・1★ 2,399 以下<br />協助分數：第一關剩 {fmt(r1.assist)}・第二關剩 {fmt(r2.assist)}（不計入星級，提供學習分析使用）</p>
      </div>
      <div className="row gap16" style={{ position: 'absolute', left: 0, right: 0, bottom: 40, justifyContent: 'center' }}>
        <button className="btn btn-dark" style={{ width: 180 }} onClick={() => setRec(true)}>查看學習紀錄</button>
        <button className="btn btn-ghost-light" style={{ width: 180 }} onClick={() => A.go('home')}>返回首頁</button>
      </div>
      {rec && (
        <Modal width={620} onClose={() => setRec(false)}>
          <div className="modal-title">學習紀錄</div>
          {[[1, r1, '犯案方式'], [2, r2, '真正兇手']].map(([n, r, nm]) => (
            <div key={n} className="card" style={{ padding: '12px 16px', marginBottom: 10, fontSize: 14, lineHeight: 1.8 }}>
              <b>第{n === 1 ? '一' : '二'}關｜{nm}</b><br />
              學習分數 {fmt(r.learning)}・{res(r)}・完成 {r.done} 格・連線 {r.lines} 條<br />
              協助分數剩 {fmt(r.assist)}・提示 {r.hints} 次・開啟 AI {r.ai} 次（提問 {r.aiQuestions} 次）
            </div>
          ))}
          <p className="small muted" style={{ marginBottom: 18 }}>總學習分數 {fmt(total)}・AI 與提示的使用紀錄已存入學習分析</p>
          <button className="btn btn-dark btn-block" onClick={() => setRec(false)}>知道了</button>
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useGame } from '../store.jsx';
import { TOPICS } from '../data/topics.js';
import { cellId, cellLabel, topicSet, cellQuestion, buildCellOrder, SCORE } from '../game.js';
import { Icon, Modal, Alert, Confirm } from '../components/ui.jsx';
import AIPanel from '../components/AIPanel.jsx';

function Steps({ cur, results }) {
  return (
    <div className="steps">
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="step-line" />}
          <span className={`step ${results[i] === true ? 'ok' : results[i] === false ? 'bad' : i === cur ? 'on' : ''}`}>
            {results[i] === true ? <Icon name="check" size={15} stroke={3} /> : results[i] === false ? <Icon name="x" size={14} stroke={3} /> : i + 1}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

// 文法推理：拖曳或點選卡片放進兩個空格
function ReasonQuestion({ q, value, setValue, onWarn }) {
  const [over, setOver] = useState(null);
  const place = (card, slot) => {
    const v = value.slice();
    if (slot === undefined) slot = v[0] ? (v[1] ? -1 : 1) : 0;
    if (slot === -1) { onWarn('full'); return; }
    if (v.includes(card)) v[v.indexOf(card)] = null;
    v[slot] = card; setValue(v);
  };
  return (
    <>
      <div className="reason-sentence">
        <span>因為有</span>
        {[0, 1].map((i) => (
          <React.Fragment key={i}>
            {i === 1 && <span>，所以要使用</span>}
            <span className={`slot ${value[i] ? 'filled' : ''} ${over === i ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); place(e.dataTransfer.getData('text/plain'), i); }}
              onClick={() => { if (value[i]) { const v = value.slice(); v[i] = null; setValue(v); } }}>
              {value[i] || '拖曳到這裡'}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="cards">
        {q.opts.map((c) => (
          <button key={c} className={`wcard ${value.includes(c) ? 'used' : ''}`} draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', c)} onClick={() => place(c)}>{c}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
        <span className="small muted">拖曳或點選選項放進空格・點空格可以移回</span>
        <button className="btn btn-line btn-sm" onClick={() => setValue([null, null])}>清空重填</button>
      </div>
    </>
  );
}

export function CellPlay() {
  const { s, st, A } = useGame();
  const key = s.params.key;
  const cell = st.cells[key];
  const topicId = cellId(key); const topic = TOPICS[topicId]; const set = topicSet(st, topicId);
  const order = cell.order || buildCellOrder(set);
  const qi = Math.min(cell.q ?? 0, 2);
  const q = cellQuestion(set, order, qi);
  const qkey = `${s.stage}:${key}:${qi}`;
  const [sel, setSel] = useState(null);
  const [slots, setSlots] = useState([null, null]);
  const [fb, setFb] = useState(null); // {ok}
  const [pop, setPop] = useState(null);
  const [ai, setAi] = useState(false);

  const submit = () => {
    if (q.kind === 'choice') {
      if (sel === null) { setPop({ alert: { title: '請先選擇答案', text: '先點選一個選項，再按送出。' } }); return; }
      const ok = sel === q.answer; setFb({ ok, mine: sel, q, qi }); A.answerCell(key, ok);
    } else {
      if (!slots[0] && !slots[1]) { setPop({ alert: { title: '還沒排完', text: '請把需要的字詞依序放進上方的空格，再送出答案。' } }); return; }
      if (!slots[0]) { setPop({ alert: { title: '先完成第一格', text: '第一個空格要放「句子裡的線索」，\n例如是誰在做動作。' } }); return; }
      if (!slots[1]) { setPop({ alert: { title: '第二格放文法規則', text: '第二個空格要放「要使用的文法」，\n例如現在分詞或過去分詞。' } }); return; }
      const ok = slots[0] === q.answer[0] && slots[1] === q.answer[1];
      setFb({ ok, mine: slots.join(' / '), q, qi }); A.answerCell(key, ok);
    }
  };

  const next = () => {
    if (!fb.ok || fb.qi === 2) { A.finishCell(key); return; }
    setFb(null); setSel(null); setSlots([null, null]);
  };

  const askHint = () => {
    if (A.hintPaid(qkey)) { setPop({ hint: true }); return; }
    setPop({ confirmHint: true });
  };
  const confirmHint = () => {
    const r = A.payHint(qkey);
    if (r === 'insufficient') setPop({ alert: { title: '協助分數不足', text: '協助分數不夠使用這個提示了。你還是可以使用 AI 輔助，或試著靠自己作答。' } });
    else setPop({ hint: true });
  };

  const results = cell.results || [];
  const shownResults = fb ? results : results.slice(0, qi);

  return (
    <div className="screen">
      <div className="q-top">
        <button className="btn btn-ghost-light btn-sm" onClick={() => setPop({ save: true })} disabled={!!fb}><Icon name="back" size={16} />返回盤面（保存進度）</button>
        <span className="title">{cellLabel(key)}｜{topic.zh}</span>
        <Steps cur={qi} results={shownResults} />
        <div className="chip" style={{ height: 40 }}><span className="chip-label">協助分數</span><b style={{ fontSize: 17 }}>{st.assist}</b></div>
        <button className="btn btn-ghost-light btn-sm" onClick={askHint}><Icon name="sparkle" size={16} />提示</button>
        <button className="btn btn-ghost-light btn-sm" onClick={() => setAi(true)}><Icon name="sparkle" size={16} />AI 輔助</button>
      </div>

      <div className="panel q-panel">
        <div className="q-meta"><span>QUESTION {qi + 1} / 3</span><span>{q.title}</span></div>
        {q.kind === 'choice' ? <>
          <div className="q-box">
            <div className="lbl">題目</div>
            <div className={`txt ${q.promptIsSentence ? '' : 'zh'}`}>{q.prompt}</div>
          </div>
          {q.opts.map((o, i) => (
            <button key={o} className={`opt ${sel === o ? 'sel' : ''}`} onClick={() => setSel(o)}>
              <span className="badge-letter">{'ABCD'[i]}</span><span>{o}</span>
            </button>
          ))}
        </> : <>
          <div className="q-box"><div className="lbl">想一想</div><div className="txt zh">{q.prompt}</div></div>
          <ReasonQuestion q={q} value={slots} setValue={setSlots} onWarn={() => setPop({ alert: { title: '空格已經填好了', text: '想換答案的話，先點空格把選項移回，\n或按「清空重填」。' } })} />
        </>}
        <div className="q-foot"><button className="btn btn-dark" style={{ width: 170 }} onClick={submit} disabled={!!fb}>送出答案</button></div>
      </div>

      {fb && (
        <div className="fb">
          <div className="fb-card">
            <div className={`fb-head ${fb.ok ? 'ok' : 'bad'}`}>
              <Icon name={fb.ok ? 'check' : 'x'} size={26} stroke={3} />
              <span className="big">{fb.ok ? '答對了' : '答錯了'}</span>
              <span style={{ marginLeft: 'auto', opacity: .9 }}>{topic.zh}・第 {fb.qi + 1} / 3 題</span>
            </div>
            <div className="fb-body">
              {fb.ok ? <>
                <div className="card" style={{ padding: '12px 16px', marginBottom: 14 }}>
                  <div className="small muted" style={{ marginBottom: 4 }}>你的答案</div>
                  <div className="en" style={{ fontSize: 18 }}>{fb.q.kind === 'reason' ? `因為有 ${fb.q.answer[0]}，所以要使用 ${fb.q.answer[1]}` : fb.mine}</div>
                </div>
                <p style={{ fontSize: 15.5, lineHeight: 1.75 }}>{fb.q.explain}</p>
              </> : <>
                <p style={{ fontSize: 15.5, lineHeight: 1.75 }}>很可惜，這題答錯了。<br />任一題答錯，本格即判定失敗，失敗格不能重新挑戰。</p>
                <div className="card" style={{ padding: '12px 16px', marginTop: 14 }}>
                  <div className="small muted" style={{ marginBottom: 4 }}>正確答案</div>
                  <div className="en" style={{ fontSize: 17 }}>{fb.q.kind === 'reason' ? `因為有 ${fb.q.answer[0]}，所以要使用 ${fb.q.answer[1]}` : fb.q.answer}</div>
                  <div style={{ fontSize: 14, marginTop: 8, color: 'var(--ink2)' }}>{fb.q.explain}</div>
                </div>
              </>}
              <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-dark" onClick={next}>{!fb.ok ? '查看本格結果' : fb.qi === 2 ? '本格完成，查看結果' : `下一題（${fb.qi + 2} / 3）`}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {ai && <AIPanel topic={topic} set={set} q={q} qi={qi} qkey={qkey} onClose={() => setAi(false)} />}

      {pop?.alert && <Alert {...pop.alert} onClose={() => setPop(null)} />}
      {pop?.confirmHint && <Confirm title="要使用提示嗎？" text="查看提示會扣除 5 點協助分數（不影響學習分數）。同一題再次打開不會重複扣分。" okLabel="確定使用（−5）" onOk={confirmHint} onCancel={() => setPop(null)} />}
      {pop?.hint && <Alert title="提示" text={q.hint} button="回到作答" onClose={() => setPop(null)} />}
      {pop?.save && (
        <Modal width={520} onClose={() => setPop(null)}>
          <div className="modal-title">先回到 Bingo 盤面？</div>
          <div className="card" style={{ padding: '10px 14px', marginBottom: 14 }}><b>{topic.zh}</b>　<span className="pill pill-gold">作答中 {qi}/3</span></div>
          <p style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink2)', marginBottom: 20 }}>
            這格會標記為「作答中」，下次會從第 {qi + 1} 題繼續。<br />・已答對的題目會保留<br />・關卡結算時仍是「作答中」的格子，視為未挑戰
          </p>
          <div className="row gap12">
            <button className="btn btn-line grow" onClick={() => setPop(null)}>繼續作答</button>
            <button className="btn btn-dark grow" onClick={A.backToBoard}>保存並返回</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function CellResult() {
  const { s, st, A } = useGame();
  const key = s.params.key; const cell = st.cells[key];
  const topic = TOPICS[cellId(key)];
  const ok = cell.status === 'done';
  const res = cell.results || [];
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 290, top: 90, width: 700, padding: '34px 44px 36px', textAlign: 'center' }}>
        <div className="kicker">——— {s.stage === 1 ? 'Bingo 1' : 'Bingo 2'}・一般文法格・{cellLabel(key)} {topic.zh} ———</div>
        <div className="serif" style={{ fontSize: 40, fontWeight: 900, margin: '14px 0 6px', color: ok ? 'var(--green)' : 'var(--red)' }}>{ok ? '格子完成' : '挑戰失敗'}</div>
        <div className="row gap12" style={{ justifyContent: 'center', margin: '18px 0' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="card" style={{ width: 150, padding: '12px 0', background: res[i] === true ? 'var(--greenbg2)' : res[i] === false ? 'var(--redbg2)' : 'var(--card)' }}>
              <div className="serif" style={{ fontWeight: 800 }}>第 {i + 1} 題</div>
              <div className="small" style={{ fontWeight: 700, color: res[i] === true ? 'var(--green)' : res[i] === false ? 'var(--red)' : 'var(--muted)' }}>{res[i] === true ? '答對' : res[i] === false ? '答錯' : '未作答'}</div>
            </div>
          ))}
        </div>
        {ok ? (
          <div className="row gap16" style={{ justifyContent: 'center', marginBottom: 20 }}>
            <div className="card" style={{ padding: '12px 26px' }}><div className="small muted">學習分數</div><div className="serif" style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>+{SCORE.cell}</div></div>
            <div className="card" style={{ padding: '12px 26px' }}><div className="small muted">金幣</div><div className="serif" style={{ fontSize: 28, fontWeight: 900, color: 'var(--goldd)' }}>+{SCORE.cellCoin}</div></div>
          </div>
        ) : (
          <p style={{ fontSize: 15, color: 'var(--ink2)', marginBottom: 20 }}>3 題需全部答對才算完成此格。任一題答錯即結束本格，此格已標記為失敗格，不能重新挑戰。</p>
        )}
        <button className="btn btn-dark" style={{ width: 260 }} onClick={A.backToBoard}>返回 Bingo 盤</button>
      </div>
    </div>
  );
}

export function Review() {
  const { s, st, A } = useGame();
  const key = s.params.key; const id = cellId(key);
  const topic = TOPICS[id]; const set = topicSet(st, id);
  return (
    <div className="screen">
      <div className="q-top">
        <button className="btn btn-ghost-light btn-sm" onClick={() => A.go('board')}><Icon name="back" size={16} />返回盤面</button>
        <span className="title">{cellLabel(key)}｜{topic.zh}</span>
        <span className="pill pill-green" style={{ marginLeft: 'auto' }}>已完成・回顧本格三題</span>
      </div>
      <div className="panel q-panel">
        <div className="q-meta"><span>REVIEW・題目回顧</span><span>三題皆已答對</span></div>
        {[
          ['第 1 題・找出錯誤的句子', set.w],
          ['第 2 題・找出錯誤位置並改正', `${set.fix[0]} → ${set.fix[1]}`],
          ['第 3 題・文法概念推理', `因為有 ${set.cue}，所以要使用 ${set.rule}`],
        ].map(([t, v], i) => (
          <div key={i} className="card row gap16" style={{ padding: '14px 18px', marginBottom: 12 }}>
            <span className="badge-letter" style={{ background: 'var(--green)' }}>{i + 1}</span>
            <div><div className="small muted">{t}</div><div className={i < 2 ? 'en' : ''} style={{ fontSize: 19, marginTop: 2 }}>{v}</div></div>
          </div>
        ))}
        <div className="card" style={{ padding: '14px 18px', background: '#2a221b', color: '#f3e6c8', borderColor: '#2a221b' }}>
          <div className="small" style={{ color: 'var(--gold2)', fontWeight: 700, marginBottom: 4 }}>重點整理</div>
          <div style={{ fontSize: 16 }}>{set.tip}</div>
        </div>
        <div className="q-foot"><button className="btn btn-dark" onClick={() => A.go('board')}>返回盤面</button></div>
      </div>
    </div>
  );
}

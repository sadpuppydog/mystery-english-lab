import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store.jsx';
import { AI_MODELS, aiPresets, aiFreeReply } from '../game.js';
import { Icon, Modal, Confirm } from './ui.jsx';

// AI 輔助（原型）：選模型 → 確認扣協助分數 → 用預設問題或自己的話提問。回覆是依題目資料預先寫好的提示，不會直接給答案。
export default function AIPanel({ topic, set, q, qi, qkey, onClose }) {
  const { st, A } = useGame();
  const [model, setModel] = useState('Claude');
  const [step, setStep] = useState('pick'); // pick | confirm | chat
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const chatRef = useRef(null);
  useEffect(() => { chatRef.current?.scrollTo(0, 99999); }, [msgs]);

  const start = () => {
    if (A.aiPaid(qkey, model)) setStep('chat');
    else setStep('confirm');
  };
  const presets = aiPresets(topic, set, qi);
  const ask = (question, answer, tag) => {
    A.countAIQuestion();
    setMsgs((m) => [...m, { q: question }, { a: answer, tag }]);
  };

  if (step === 'pick') return (
    <Modal onClose={onClose} width={720}>
      <div className="modal-title">選擇你的 AI 助手</div>
      <p className="small" style={{ color: 'var(--ink2)', marginBottom: 18 }}>系統會把這一題交給你選的 AI，用自己的話提問。每個 AI 扣 5 點協助分數（同一題同一個 AI 不重複扣）。</p>
      <div className="row gap12" style={{ marginBottom: 18 }}>
        {AI_MODELS.map((m) => (
          <button key={m.id} onClick={() => setModel(m.id)} className="card" style={{ flex: 1, padding: '18px 0', textAlign: 'center',
            border: model === m.id ? '2.5px solid var(--ink)' : '1px solid var(--line)', background: model === m.id ? '#fff6dd' : 'var(--card)' }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 8px', borderRadius: 10, background: 'var(--dark)', color: 'var(--gold2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>{m.mark}</div>
            <div className="serif" style={{ fontWeight: 800, fontSize: 18 }}>{m.id}</div>
            <div className="small muted">{m.vendor}</div>
            {A.aiPaid(qkey, m.id) && <div className="pill pill-green" style={{ marginTop: 6 }}>本題已開啟</div>}
          </button>
        ))}
      </div>
      <p className="small muted" style={{ marginBottom: 18, lineHeight: 1.7 }}>你可以問：文法提示・關鍵字說明・句型解析・相似例句<br />系統會記錄使用的 AI、提問次數，作為學習分析。事件格不開放 AI。</p>
      <div className="row gap12">
        <button className="btn btn-line grow" onClick={onClose}>先不用</button>
        <button className="btn btn-dark grow" onClick={start}>使用 {model} 開始提問</button>
      </div>
    </Modal>
  );

  if (step === 'confirm') return (
    <Confirm title="要使用 AI 輔助嗎？"
      text={`開始提問會扣除 5 點協助分數（不影響學習分數）。同一題換另一個 AI 會再扣 5 點，同一個 AI 再次開啟不重複扣分。${st.assist < 5 ? '\n\n協助分數已不足，但仍然可以使用 AI。' : ''}`}
      okLabel="確定使用（−5）" onCancel={() => setStep('pick')}
      onOk={() => { A.payAI(qkey, model); setStep('chat'); }} />
  );

  return (
    <div className="ai-wrap">
      <div className="ai-left">
        <button className="btn btn-dark btn-sm" style={{ alignSelf: 'flex-start' }} onClick={onClose}><Icon name="back" size={16} />收合 AI，回到作答</button>
        <div className="small muted">{topic.zh}・QUESTION {qi + 1} / 3</div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div className={q.kind === 'reason' ? 'serif' : 'en'} style={{ fontSize: 17, lineHeight: 1.5 }}>{q.prompt}</div>
          <div className="small pre" style={{ marginTop: 10, color: 'var(--ink2)', lineHeight: 1.7 }}>
            {q.kind === 'reason' ? `因為有 ＿＿＿，所以要使用 ＿＿＿\n選項：${q.opts.slice(0, 3).join('／')}…` : q.opts.map((o, i) => `${'ABCD'[i]}. ${o}`).join('\n')}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px', marginTop: 'auto' }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>本題 AI 使用紀錄</div>
          <div className="small">模型：{model}</div>
          <div className="small">提問次數：{msgs.filter((m) => m.q).length}</div>
          <div className="small muted" style={{ marginTop: 4 }}>紀錄會用於學習分析，不影響分數</div>
        </div>
      </div>
      <div className="ai-right">
        <div className="ai-head">
          <Icon name="sparkle" /><span className="serif" style={{ fontSize: 20, fontWeight: 800 }}>AI 輔助學習</span>
          <span className="pill pill-gold">已將第 {qi + 1} 題交給 {model}</span>
        </div>
        <div className="ai-chat scroll" ref={chatRef}>
          {!msgs.length && <div className="bubble-a"><span className="tag">{model}</span>嗨，我會幫你想清楚這題，但不會直接告訴你答案。可以點下面的問題，或用你自己的話問我。</div>}
          {msgs.map((m, i) => m.q ? <div key={i} className="bubble-q">{m.q}</div> : <div key={i} className="bubble-a"><span className="tag">{m.tag}</span>{m.a}</div>)}
        </div>
        <div className="ai-presets">
          {presets.map((p) => <button key={p.q} className="preset" onClick={() => ask(p.q, p.a, p.tag)}>{p.q}</button>)}
        </div>
        <form className="ai-input" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; ask(text.trim(), aiFreeReply(model, text.trim(), set), '回覆'); setText(''); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="用你自己的話問 AI…" />
          <button className="btn btn-dark" type="submit"><Icon name="send" size={16} />送出</button>
        </form>
      </div>
    </div>
  );
}

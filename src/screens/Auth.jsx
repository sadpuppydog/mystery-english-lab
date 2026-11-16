import React, { useState } from 'react';
import { useGame } from '../store.jsx';
import { GAME_SUB } from '../data/story.js';

// 原型用的本機帳號（存在瀏覽器 localStorage）
const KEY = 'mlab_users';
const readUsers = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saveUsers = (u) => { try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ } };
const DEMO = { account: 's1120345', password: 'detective01', name: '小偵探' };

function Field({ label, type = 'text', value, onChange, placeholder, error, autoFocus }) {
  return (
    <div className={`field ${error ? 'err' : ''}`}>
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="msg">{error}</span>}
    </div>
  );
}

export default function Auth() {
  const { s, A } = useGame();
  const mode = s.screen; // login | register | forgot
  const [f, setF] = useState({ name: '', account: '', password: '', confirm: '' });
  const [err, setErr] = useState({});
  const [banner, setBanner] = useState(null);
  const [fails, setFails] = useState(0);
  const [done, setDone] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const switchTo = (m) => { setErr({}); setBanner(null); setDone(null); A.go(m); };

  const doLogin = () => {
    const e = {};
    if (!f.account.trim()) e.account = '請輸入帳號';
    if (!f.password) e.password = '請輸入密碼';
    setErr(e);
    if (Object.keys(e).length) { setBanner({ kind: 'red', text: '還有欄位沒有填寫，請完成後再送出。' }); return; }
    const users = readUsers();
    const u = f.account === DEMO.account && f.password === DEMO.password ? DEMO : users[f.account];
    if (!u || u.password !== f.password) {
      const n = fails + 1; setFails(n);
      setBanner({ kind: 'red', text: n >= 5 ? '連續錯誤 5 次，已暫時鎖定 10 分鐘（原型示範，重新整理即可再試）。' : `帳號或密碼錯誤，請確認後再試一次。連續錯誤 5 次會暫時鎖定 10 分鐘（還可以再試 ${5 - n} 次）。` });
      return;
    }
    setBanner({ kind: 'green', text: `登入成功！歡迎回來，偵探 ${u.name}。正在進入調查…` });
    setTimeout(() => A.login({ account: f.account, name: u.name }), 900);
  };

  const doRegister = () => {
    const e = {}; const users = readUsers();
    if (f.name.trim().length < 2 || f.name.trim().length > 12) e.name = '請輸入 2–12 個字的偵探名稱';
    if (!f.account.trim()) e.account = '請輸入帳號';
    else if (users[f.account] || f.account === DEMO.account) e.account = '這個帳號已經註冊過了，請直接登入';
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(f.password)) e.password = '密碼至少 8 碼，需包含英文和數字';
    if (f.confirm !== f.password || !f.confirm) e.confirm = '兩次輸入的密碼不一致';
    setErr(e);
    if (Object.keys(e).length) return;
    users[f.account] = { name: f.name.trim(), password: f.password };
    saveUsers(users);
    setDone({ kind: 'register', account: f.account, name: f.name.trim() });
  };

  const doForgot = () => {
    if (!f.account.trim()) { setErr({ account: '請輸入帳號' }); return; }
    setDone({ kind: 'forgot', account: f.account });
  };

  return (
    <div className="screen">
      <div style={{ position: 'absolute', left: 110, top: 220, width: 540 }}>
        <div className="kicker light" style={{ color: '#c9b48a', marginBottom: 18 }}>CASE FILE No.1112</div>
        <div className="serif" style={{ fontSize: 60, fontWeight: 900, color: '#f3e6c8', lineHeight: 1.15, textShadow: '0 3px 10px rgba(0,0,0,.6)' }}>英語實驗室<br />密室命案</div>
        <div style={{ fontSize: 13, letterSpacing: 4.5, color: '#c9b48a', marginTop: 14 }}>{GAME_SUB}</div>
        <div style={{ width: 80, height: 2, background: 'var(--red)', margin: '22px 0' }} />
        <p style={{ color: '#e8dbbd', fontSize: 18, lineHeight: 1.8 }}>用英文，找出真相。<br />完成 Grammar Bingo，蒐集證據，破解林教授之死。</p>
      </div>

      <div className="panel" style={{ position: 'absolute', left: 730, top: 110 + (mode === 'register' ? -40 : 0), width: 470, padding: '26px 35px 30px', background: 'var(--paper2)' }}>
        {done?.kind === 'register' && (
          <div>
            <div className="h2" style={{ marginBottom: 8 }}>註冊成功</div>
            <div className="alert alert-green">偵探證已核發！<br />歡迎加入調查，偵探 {done.name}。</div>
            <div className="card" style={{ padding: 18, marginBottom: 20, fontFamily: 'var(--en)', letterSpacing: 1 }}>DETECTIVE ID：{done.account}</div>
            <button className="btn btn-dark btn-block" onClick={() => switchTo('login')}>前往登入</button>
          </div>
        )}
        {done?.kind === 'forgot' && (
          <div>
            <div className="h2" style={{ marginBottom: 12 }}>已寄出重設連結</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink2)', marginBottom: 22 }}>重設密碼的連結已寄到你的信箱（{done.account}），請在 30 分鐘內點擊連結完成重設。<br /><span className="muted small">（原型示範，不會真的寄信。）</span></p>
            <button className="btn btn-dark btn-block" onClick={() => switchTo('login')}>返回登入</button>
          </div>
        )}
        {!done && mode !== 'forgot' && (
          <div className="tabs">
            <button className={`tab ${mode === 'login' ? 'on' : ''}`} onClick={() => switchTo('login')}>登入</button>
            <button className={`tab ${mode === 'register' ? 'on' : ''}`} onClick={() => switchTo('register')}>註冊</button>
          </div>
        )}
        {!done && banner && <div className={`alert alert-${banner.kind}`}>{banner.text}</div>}

        {!done && mode === 'login' && (
          <form onSubmit={(e) => { e.preventDefault(); doLogin(); }}>
            <Field label="帳號" value={f.account} onChange={set('account')} placeholder="輸入學號或 Email" error={err.account} autoFocus />
            <Field label="密碼" type="password" value={f.password} onChange={set('password')} placeholder="輸入密碼" error={err.password} />
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="small muted">示範帳號 {DEMO.account} / {DEMO.password}</span>
              <button type="button" className="link" onClick={() => switchTo('forgot')}>忘記密碼？</button>
            </div>
            <button className="btn btn-dark btn-block" type="submit" disabled={fails >= 5}>{fails ? '再試一次' : '進入調查'}</button>
            <button type="button" className="btn btn-line btn-block btn-sm" style={{ marginTop: 10 }} onClick={() => A.login({ account: 'guest', name: '訪客', guest: true })}>訪客試玩（不存檔）</button>
          </form>
        )}

        {!done && mode === 'register' && (
          <form onSubmit={(e) => { e.preventDefault(); doRegister(); }}>
            <Field label="偵探名稱（遊戲暱稱）" value={f.name} onChange={set('name')} placeholder="2–12 個字" error={err.name} autoFocus />
            <Field label="帳號" value={f.account} onChange={set('account')} placeholder="輸入學號或 Email" error={err.account} />
            <Field label="密碼" type="password" value={f.password} onChange={set('password')} placeholder="至少 8 碼，需包含英文和數字" error={err.password} />
            <Field label="確認密碼" type="password" value={f.confirm} onChange={set('confirm')} placeholder="再輸入一次密碼" error={err.confirm} />
            <button className="btn btn-dark btn-block" type="submit">建立帳號</button>
            <div className="center" style={{ marginTop: 12 }}><button type="button" className="link" onClick={() => switchTo('login')}>已經有帳號了？回到登入</button></div>
          </form>
        )}

        {!done && mode === 'forgot' && (
          <form onSubmit={(e) => { e.preventDefault(); doForgot(); }}>
            <div className="h2" style={{ marginBottom: 8 }}>忘記密碼</div>
            <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 18 }}>輸入註冊時的學號或 Email，我們會寄送重設密碼的連結給你。</p>
            <Field label="帳號" value={f.account} onChange={set('account')} placeholder="輸入學號或 Email" error={err.account} autoFocus />
            <button className="btn btn-dark btn-block" type="submit">寄送重設連結</button>
            <div className="center" style={{ marginTop: 14 }}><button type="button" className="link" onClick={() => switchTo('login')}>‹ 返回登入</button></div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useGame } from '../store.jsx';
import { GAME_TITLE, GAME_SUB, PROLOGUE, SUSPECTS, STAGES, RULES } from '../data/story.js';
import { thresholds, baseGameScore, fmt } from '../game.js';
import { Icon, Photo, Modal } from '../components/ui.jsx';

export function Home() {
  const { s, A } = useGame();
  const hasSave = Object.keys(s.stages).length > 0;
  const stage1Done = !!s.results[1];
  return (
    <div className="screen">
      <div style={{ position: 'absolute', left: 48, top: 30, right: 48 }} className="row">
        <div className="brand">
          <div className="brand-title">{GAME_TITLE}</div>
          <div className="brand-sub">{GAME_SUB}</div>
        </div>
        <div className="chip" style={{ height: 44 }}><Icon name="user" /><span>偵探 {s.user?.name}</span></div>
        <button className="btn btn-ghost-light btn-sm" style={{ height: 44 }} onClick={A.logout}>登出</button>
      </div>
      <div style={{ position: 'absolute', left: 48, top: 150, width: 520 }}>
        <div className="serif" style={{ fontSize: 50, fontWeight: 900, color: '#f3e6c8', lineHeight: 1.25, textShadow: '0 3px 10px rgba(0,0,0,.6)' }}>林教授之死<br />真相藏在 Bingo 盤中</div>
        <p style={{ color: '#e1d2b0', fontSize: 17, margin: '20px 0 34px' }}>兩個關卡：先破解犯案方式，再找出真正兇手。</p>
        <div className="col gap12" style={{ width: 380 }}>
          {hasSave && <button className="btn btn-gold" onClick={A.resume}><Icon name="play" />{s.results[2] ? '查看最終結算' : '繼續調查'}</button>}
          <button className={`btn ${hasSave ? 'btn-ghost-light' : 'btn-gold'}`} onClick={A.newGame}>
            <Icon name="play" />{hasSave ? '重新開始（清除進度）' : '開始調查（播放開場動畫）'}
          </button>
        </div>
      </div>
      {[1, 2].map((n) => {
        const S = STAGES[n]; const locked = n === 2 && !stage1Done;
        return (
          <div key={n} className="panel" style={{ position: 'absolute', left: n === 1 ? 640 : 950, top: 150, width: 290, height: 420, padding: 24, opacity: locked ? 0.82 : 1 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="kicker">STAGE 0{n}</span>
              <span className={`pill ${locked ? 'pill-dark' : 'pill-green'}`}>{locked ? <><Icon name="lock" size={12} />完成第一關後解鎖</> : '可進入'}</span>
            </div>
            <div className="serif" style={{ fontSize: 54, fontWeight: 900, marginTop: 22, color: n === 1 ? 'var(--ink)' : 'var(--red)' }}>{S.key}</div>
            <div className="h2" style={{ marginTop: 4 }}>{n === 1 ? '找出犯案方式' : '找出真正兇手'}</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink2)', marginTop: 14 }}>{S.homeDesc}</p>
            <div style={{ position: 'absolute', left: 24, right: 24, bottom: 22, borderTop: '1px solid var(--line)', paddingTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              線索：{n === 1 ? '案件現場與證據照片' : '嫌疑人與相關證據照片'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Prologue() {
  const { A } = useGame();
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 60, top: 40, width: 1160, height: 640, padding: '30px 40px', display: 'grid', gridTemplateColumns: '640px 1fr', gap: 36 }}>
        <div className="col gap16">
          <div className="kicker">PROLOGUE・開場動畫</div>
          <div className="small muted">{PROLOGUE.time}</div>
          <video className="prologue-video" controls preload="metadata" aria-label="遊戲前導影片">
            <source src="/videos/prologue.mp4" type="video/mp4" />
            你的瀏覽器不支援影片播放。
          </video>
          <p className="pre" style={{ fontSize: 16, lineHeight: 1.85 }}>{PROLOGUE.text}</p>
          <div className="card" style={{ padding: '14px 18px', background: '#2a221b', color: '#f3e6c8', borderColor: '#2a221b' }}>
            <div className="small" style={{ color: 'var(--gold2)', fontWeight: 700, marginBottom: 6 }}>教授留下的訊息</div>
            <div style={{ fontSize: 15, lineHeight: 1.75 }}>{PROLOGUE.message}</div>
          </div>
        </div>
        <div className="col">
          <div className="h2" style={{ marginBottom: 16 }}>警方鎖定的四名關係人</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {SUSPECTS.map((p) => (
              <div key={p.id} className="card" style={{ padding: 12 }}>
                <Photo label={p.id} h={130} />
                <div className="serif" style={{ fontWeight: 800, fontSize: 19, marginTop: 8 }}>{p.id}</div>
                <div className="small muted">{p.role}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-dark" style={{ marginTop: 'auto' }} onClick={() => A.go('rules', { first: true })}>開始調查</button>
        </div>
      </div>
    </div>
  );
}

function RuleGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {RULES.map((r, i) => (
        <div key={i} className="card" style={{ padding: '16px 18px', minHeight: 230 }}>
          <div className="row gap8" style={{ marginBottom: 10 }}>
            <span className="badge-letter" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>{i + 1}</span>
            <span className="serif" style={{ fontWeight: 800, fontSize: 18 }}>{r.title}</span>
          </div>
          <p className="pre" style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink2)' }}>{r.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Rules() {
  const { A } = useGame();
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 60, top: 30, width: 1160, height: 660, padding: '26px 36px' }}>
        <div className="h1" style={{ marginBottom: 18 }}>偵探守則</div>
        <RuleGrid />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-dark" onClick={() => A.go('mission')}>我了解了，開始遊戲</button>
        </div>
      </div>
    </div>
  );
}

export function RulesModal({ onClose }) {
  return (
    <Modal onClose={onClose} width={1100} style={{ maxWidth: 1100 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="h1">偵探守則</div>
        <button className="btn btn-dark btn-sm" onClick={onClose}>返回遊戲</button>
      </div>
      <RuleGrid />
    </Modal>
  );
}

export function Mission() {
  const { s, A } = useGame();
  const S = STAGES[s.stage];
  const [n, setN] = useState(5);
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 60, top: 40, width: 470, height: 640, padding: '28px 32px', background: '#e9d9b4' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="kicker">{S.mission}</span><span className="pill pill-red">機密</span>
        </div>
        <div className="serif pre" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.35, margin: '18px 0' }}>{S.missionTitle}</div>
        <p className="pre" style={{ fontSize: 15.5, lineHeight: 1.85, color: 'var(--ink2)' }}>{S.brief}</p>
        <div className="card" style={{ padding: '14px 18px', marginTop: 22 }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>你的任務</div>
          <div style={{ fontSize: 15, lineHeight: 1.7 }}>{S.task}</div>
        </div>
        <div className="card" style={{ padding: '12px 18px', marginTop: 14, background: 'transparent' }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>怎麼選？</div>
          <div className="small" style={{ lineHeight: 1.7, color: 'var(--ink2)' }}>拿多一點線索 → 證據多，比較好猜，但猜對拿到的遊戲分數少<br />拿少一點線索 → 要自己多想，但猜對拿到的遊戲分數多</div>
        </div>
      </div>
      <div className="panel" style={{ position: 'absolute', left: 560, top: 40, width: 660, height: 640, padding: '28px 34px', display: 'flex', flexDirection: 'column' }}>
        <div className="h2">選擇本關要取得的線索數量</div>
        <p className="small" style={{ color: 'var(--ink2)', margin: '8px 0 20px', lineHeight: 1.6 }}>線索＝推理時可以看的證據。學習分數每到一個門檻就解鎖一個線索，滿 1,500 分就能開始推理。</p>
        <div className="row gap12">
          {[1, 2, 3, 4, 5].map((k) => (
            <button key={k} onClick={() => setN(k)} className="card" style={{ flex: 1, height: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: k === n ? '2.5px solid var(--ink)' : '1px solid var(--line)', background: k === n ? '#fff6dd' : 'var(--card)' }}>
              <span className="serif" style={{ fontSize: 34, fontWeight: 900 }}>{k}</span>
              <span className="small muted">個線索</span>
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: '16px 20px', marginTop: 22 }}>
          <div className="small" style={{ fontWeight: 800, marginBottom: 10 }}>每個線索的解鎖分數</div>
          <div className="row gap8" style={{ flexWrap: 'wrap' }}>
            {thresholds(n).map((t, i) => <span key={i} className="pill pill-gold">線索 {i + 1}・{fmt(t)} 分</span>)}
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 16, fontSize: 15 }}>
            <span>推理開放門檻</span><b className="serif">1,500 分</b>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 15 }}>
            <span>可得遊戲分數（猜錯／猜對）</span><b className="serif">{baseGameScore(n)} ／ {baseGameScore(n) + 200}</b>
          </div>
        </div>
        <button className="btn btn-dark" style={{ marginTop: 'auto' }} onClick={() => A.chooseClues(n)}>下一步：安排 1–25</button>
      </div>
    </div>
  );
}

export function Stage2Intro() {
  const { s, A } = useGame();
  const r = s.results[1];
  const routeText = r.route === 'reason' ? (r.correct ? '正確' : '錯誤') : r.route === 'skip' ? '未推理' : '補救學習';
  const Row = ({ k, v }) => <div className="row" style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)' }}><span>{k}</span><b className="serif">{v}</b></div>;
  return (
    <div className="screen">
      <div className="panel" style={{ position: 'absolute', left: 60, top: 40, width: 1160, height: 640, padding: '28px 40px' }}>
        <div className="kicker">STAGE 02・WHO</div>
        <div className="h1" style={{ margin: '6px 0 22px' }}>第一關完成，準備進入第二關</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 24 }}>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div className="h2" style={{ fontSize: 18, marginBottom: 6 }}>第一關成績</div>
            <Row k="學習分數" v={fmt(r.learning)} />
            <Row k="遊戲分數" v={r.game === null ? '—' : fmt(r.game)} />
            <Row k="金幣" v={r.coins} />
            <Row k="協助分數" v={fmt(r.assist)} />
            <Row k="推理結果" v={routeText} />
            <p className="small muted" style={{ marginTop: 10 }}>兩關的成績最後會一起算總分喔！</p>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div className="h2" style={{ fontSize: 18, marginBottom: 6 }}>第二關重置</div>
            <Row k="學習分數" v="0" /><Row k="遊戲分數" v="0" /><Row k="協助分數" v="1,500" /><Row k="金幣" v="0" /><Row k="背包道具" v="清空" />
          </div>
          <div className="card" style={{ padding: '16px 20px', background: '#2a221b', color: '#f3e6c8', borderColor: '#2a221b' }}>
            <div className="kicker" style={{ color: 'var(--gold2)' }}>MISSION 02</div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 10px' }}>找出真正兇手</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.75 }}>犯案方式已經確認：兇手從設備室啟動通風系統。<br />現在，四名關係人之中，誰有機會、也有動機？</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              {SUSPECTS.map((p) => <div key={p.id} style={{ fontSize: 14 }}><b>{p.id}</b> <span style={{ color: '#c9b48a' }}>{p.role}</span></div>)}
            </div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', position: 'absolute', right: 40, bottom: 28 }}>
          <button className="btn btn-red" onClick={A.enterStage2}>選擇本關線索數量</button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

// ---------- 圖示 ----------
const P = {
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  coin: <><ellipse cx="12" cy="6.5" rx="7" ry="3" /><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></>,
  book: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  cart: <><path d="M3 4h2l2.4 11h10.2L20 8H6.3" /><circle cx="9" cy="19" r="1.4" /><circle cx="17" cy="19" r="1.4" /></>,
  bag: <><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  clock: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9.5 2.5h5" /></>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  glove: <path d="M7 21v-7l-2.5-3.5a1.6 1.6 0 0 1 2.6-1.9L9 11V4.5a1.5 1.5 0 0 1 3 0V10V3.5a1.5 1.5 0 0 1 3 0V10 5a1.5 1.5 0 0 1 3 0v8c0 4-2 8-6 8z" />,
  coffee: <><path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3" /></>,
  photo: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-8 8" /></>,
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />,
  dice: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" /><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" /><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" /><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></>,
  folder: <path d="M3 6h6l2 2h10v11H3z" />,
  play: <path d="M7 4v16l13-8z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></>,
};
export function Icon({ name, size = 18, stroke = 2, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{P[name]}</svg>
  );
}

// ---------- 1280×720 舞台 ----------
export function Stage({ children }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="viewport">
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>{children}</div>
    </div>
  );
}

export function Background() {
  return (
    <div className="bg">
      <div className="deco report" style={{ left: -36, top: 525, transform: 'rotate(7deg)' }} />
      <div className="deco paper" style={{ left: 18, top: 28, transform: 'rotate(4deg)' }} />
      <div className="deco polaroid" style={{ left: 215, top: 58, transform: 'rotate(-8deg)' }}><i /></div>
      <div className="deco tag" style={{ left: 650, top: 22, transform: 'rotate(-13deg)' }}>A101</div>
      <div className="deco polaroid" style={{ left: 930, top: 32, transform: 'rotate(5deg)' }}><i /></div>
      <div className="deco polaroid" style={{ left: 1070, top: -18, transform: 'rotate(-7deg)' }}><i /></div>
      <div className="deco polaroid" style={{ left: 1190, top: 35, transform: 'rotate(3deg)' }}><i /></div>
      <div className="deco paper" style={{ left: 1040, top: 140, transform: 'rotate(7deg)' }} />
      <div className="deco paper" style={{ left: 930, top: 535, transform: 'rotate(-8deg)' }} />
      <div className="deco lens" style={{ left: 750, top: 625 }} />
      <div className="deco pin" style={{ left: 1000, top: 35 }} />
      <div className="deco pin" style={{ left: 1165, top: 45 }} />
      <div className="deco string" style={{ left: 1006, top: 40, width: 170, transform: 'rotate(12deg)' }} />
    </div>
  );
}

export function Modal({ children, onClose, width, style }) {
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className="modal" style={{ width, ...style }} role="dialog">{children}</div>
    </div>
  );
}

export function Alert({ title, text, onClose, button = '知道了' }) {
  return (
    <Modal onClose={onClose} width={460}>
      <div className="modal-title">{title}</div>
      <p className="pre" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink2)', marginBottom: 22 }}>{text}</p>
      <button className="btn btn-dark btn-block" onClick={onClose}>{button}</button>
    </Modal>
  );
}

export function Confirm({ title, text, okLabel = '確定', cancelLabel = '取消', onOk, onCancel, danger }) {
  return (
    <Modal onClose={onCancel} width={500}>
      <div className="modal-title">{title}</div>
      <p className="pre" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink2)', marginBottom: 22 }}>{text}</p>
      <div className="row gap12">
        <button className="btn btn-line grow" onClick={onCancel}>{cancelLabel}</button>
        <button className={`btn grow ${danger ? 'btn-red' : 'btn-dark'}`} onClick={onOk}>{okLabel}</button>
      </div>
    </Modal>
  );
}

export function Photo({ label, src, w = '100%', h = 160, style }) {
  const character = ['Alex', 'Emma', 'Kevin', 'Sophia'].includes(label);
  const rawImage = src || (character ? `/characters/${label}.png` : null);
  const image = rawImage?.startsWith('/') ? `${import.meta.env.BASE_URL}${rawImage.slice(1)}` : rawImage;
  const evidence = Boolean(src);
  return (
    <div className="photo" style={{ width: w, height: evidence ? 'auto' : h, aspectRatio: evidence ? '16 / 9' : undefined, ...style }}>
      {image ? (
        <img className={`photo-character${evidence ? ' photo-evidence' : ''}`} src={image} alt={`${label} 的照片`} />
      ) : (
        <><Icon name="photo" size={34} stroke={1.5} /><span>[照片：{label}]</span></>
      )}
    </div>
  );
}

export function Stars({ n }) {
  return (
    <div className="stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={34} stroke={1.5} fill={i < n ? '#e2c06b' : 'none'} style={{ color: i < n ? '#c9a24a' : '#8a7656' }} />
      ))}
    </div>
  );
}

export function Toast({ text, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [text]);
  return <div className="toast">{text}</div>;
}

export function ItemIcon({ item, size = 22 }) {
  const map = { magnifier: 'search', glove: 'glove', coffee: 'coffee' };
  return <Icon name={map[item]} size={size} />;
}

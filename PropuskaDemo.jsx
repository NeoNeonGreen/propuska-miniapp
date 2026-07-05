import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   «Пропуска» — демо Telegram Mini App (без интеграций)
   Роли: Собственник K0 · Член семьи K1 · Арендатор K2 · Ребёнок K1.2
   ============================================================ */

/* ---------------- Дизайн-токены ---------------- */
const CSS = `
.pk-root{
  --bg:#0c0d10; --card:#17181d; --card2:#1f2127; --input:#24262d;
  --stroke:#2a2d34; --text:#f4f5f7; --t2:#9aa0ab; --t3:#646a76;
  --accent:#3390ff; --accent-soft:rgba(51,144,255,.13);
  --green:#34d183; --red:#ff5f5f; --yellow:#f7c64b;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif;
  color:var(--text);
  -webkit-font-smoothing:antialiased;
}
.pk-root *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
.pk-stage{min-height:100vh;background:radial-gradient(900px 600px at 50% -10%,#12151c 0%,#07080a 65%);
  display:flex;justify-content:center;padding:0}
@media(min-width:560px){.pk-stage{padding:28px 0;align-items:center}}
.pk-phone{width:100%;max-width:400px;background:var(--bg);display:flex;flex-direction:column;
  position:relative;overflow:hidden;height:100vh}
@media(min-width:560px){.pk-phone{height:min(830px,calc(100vh - 56px));border-radius:20px;
  border:1px solid #22242a;box-shadow:0 24px 70px rgba(0,0,0,.6)}}
.pk-chip{display:inline-flex;align-items:center;gap:6px;background:var(--card);
  border:1px solid var(--stroke);border-radius:999px;padding:6px 12px;font-size:13px;
  color:var(--t2);cursor:pointer;user-select:none;border:none;font-family:inherit}
.pk-chip:active{opacity:.65}
.pk-screen{flex:1;overflow-y:auto;padding:14px 16px 100px;scrollbar-width:none}
.pk-screen::-webkit-scrollbar{display:none}
.pk-screen.bare{padding-bottom:28px}
.pk-fade{animation:pkF .22s ease}
@keyframes pkF{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}

h1.pk{font-size:22px;font-weight:700;letter-spacing:-.3px;margin:10px 2px 14px}
.pk-sub{color:var(--t2);font-size:13px;line-height:1.5}
.pk-eyebrow{font-size:11.5px;color:var(--t3);text-transform:none}

.pk-card{background:var(--card);border:1px solid #22242a;border-radius:15px;padding:14px;margin-bottom:12px}
.pk-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:11px}
.pk-head h2{font-size:16px;font-weight:650}
.pk-meta{font-size:12px;color:var(--t2)}
.pk-meta b{color:var(--text)}
.pk-row2{display:flex;gap:10px}.pk-row2>*{flex:1;min-width:0}

.pk-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;
  border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:14px;
  font-weight:600;padding:12px 16px;color:#fff;background:var(--accent);
  transition:transform .06s,opacity .15s}
.pk-btn:active{transform:scale(.985)}
.pk-btn.sm{padding:8px 12px;font-size:13px;border-radius:10px}
.pk-btn.ghost{background:var(--card2);color:var(--text)}
.pk-btn.soft{background:var(--accent-soft);color:var(--accent)}
.pk-btn.danger{background:rgba(255,95,95,.12);color:var(--red)}
.pk-btn:disabled{background:var(--card2);color:var(--t3);cursor:default;transform:none}
.pk-btn.auto{width:auto}

.pk-opt{background:var(--card2);border-radius:12px;padding:12px;display:flex;
  flex-direction:column;gap:9px}
.pk-opt .lbl{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}
.pk-opt .lbl svg{width:18px;height:18px;flex-shrink:0}
.pk-opt .note{font-size:11px;color:var(--t3);margin-top:-3px}

.pk-seg{display:flex;background:var(--card);border:1px solid #22242a;border-radius:12px;
  padding:4px;margin-bottom:14px}
.pk-seg button{flex:1;border:none;background:none;color:var(--t2);font-family:inherit;
  font-size:13px;font-weight:600;padding:9px 6px;border-radius:9px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:6px}
.pk-seg button.on{background:var(--input);color:var(--text)}
.pk-cnt{background:var(--accent);color:#fff;border-radius:8px;font-size:10px;font-weight:700;
  min-width:17px;height:16px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px}

.pk-field{margin-bottom:10px;position:relative}
.pk-label{display:block;font-size:12px;color:var(--t3);margin:2px 2px 6px}
.pk-input{width:100%;background:var(--input);border:1px solid transparent;border-radius:11px;
  padding:12px 13px;color:var(--text);font-family:inherit;font-size:14px;outline:none;
  transition:border-color .15s;appearance:none}
.pk-input::placeholder{color:var(--t3)}
.pk-input:focus{border-color:var(--accent)}
.pk-input.err{border-color:var(--red)}
.pk-input:disabled{color:var(--t2)}
select.pk-input{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239aa0ab' stroke-width='2.4'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;padding-right:34px}
.pk-err{color:var(--red);font-size:11.5px;margin:2px 2px 8px;line-height:1.4}
.pk-lock{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none}

.pk-check{display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:7px 2px;
  font-size:13px;color:var(--t2);user-select:none}
.pk-check .bx{width:20px;height:20px;border-radius:6px;flex-shrink:0;margin-top:1px;
  border:1.5px solid var(--stroke);display:flex;align-items:center;justify-content:center;
  transition:all .13s}
.pk-check.on .bx{background:var(--accent);border-color:var(--accent)}
.pk-check .bx svg{opacity:0}
.pk-check.on .bx svg{opacity:1}
.pk-check b{color:var(--text);font-weight:600}
.pk-check a{color:var(--accent);text-decoration:none}

.pk-switch{position:relative;width:46px;height:27px;flex-shrink:0;cursor:pointer;
  background:var(--input);border-radius:999px;border:none;transition:background .18s}
.pk-switch::after{content:"";position:absolute;top:3px;left:3px;width:21px;height:21px;
  background:#fff;border-radius:50%;transition:transform .18s;box-shadow:0 2px 5px rgba(0,0,0,.4)}
.pk-switch.on{background:var(--accent)}
.pk-switch.on::after{transform:translateX(19px)}

.pk-item{background:var(--card);border:1px solid #22242a;border-radius:15px;
  padding:12px 13px;margin-bottom:10px}
.pk-item.tap{cursor:pointer}
.pk-item.tap:active{border-color:var(--accent)}
.pk-top{display:flex;align-items:center;gap:11px}
.pk-av{width:42px;height:42px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;
  justify-content:center;font-size:14px;font-weight:700;color:#fff;position:relative}
.pk-av .n{position:absolute;top:-4px;left:-4px;background:var(--accent);font-size:10px;
  font-weight:700;min-width:17px;height:17px;border-radius:9px;display:flex;align-items:center;
  justify-content:center;border:2px solid var(--card);padding:0 3px}
.pk-info{flex:1;min-width:0}
.pk-info .r{font-size:11px;color:var(--t3)}
.pk-info .nm{font-size:14px;font-weight:600;margin:1px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pk-info .ph{font-size:12px;color:var(--t2)}
.pk-side{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.pk-ls{font-size:11px;color:var(--t3)}
.pk-acts{display:flex;gap:8px;margin-top:11px}

.pk-ico{width:38px;height:38px;border-radius:11px;background:var(--card2);display:flex;
  align-items:center;justify-content:center;flex-shrink:0}
.pk-ico svg{width:19px;height:19px}

.pk-st{font-size:12px;font-weight:600;margin-top:2px}
.pk-st.ok{color:var(--green)}.pk-st.no{color:var(--red)}.pk-st.wait{color:var(--yellow)}
.pk-hdate{font-size:12px;color:var(--t3);margin:14px 4px 8px;font-weight:600}

.pk-banner{background:var(--card);border:1px solid #22242a;border-radius:14px;padding:12px 13px;
  margin-bottom:12px;display:flex;gap:10px;align-items:flex-start;font-size:12.5px;
  color:var(--t2);line-height:1.5}
.pk-banner svg{width:18px;height:18px;flex-shrink:0;margin-top:1px}
.pk-banner b{color:var(--text)}
.pk-banner.warn{border-color:rgba(247,198,75,.28)}
.pk-banner.bad{border-color:rgba(255,95,95,.3)}

.pk-rc{background:var(--card);border:1px solid #22242a;border-radius:15px;padding:16px;margin-bottom:14px}
.pk-rc .tp{display:flex;gap:12px;align-items:flex-start}
.pk-rc .ic{width:42px;height:42px;border-radius:12px;flex-shrink:0;display:flex;
  align-items:center;justify-content:center;background:var(--accent-soft)}
.pk-rc .ic svg{width:21px;height:21px}
.pk-rc .stt{font-size:12px;font-weight:650;margin-bottom:2px}
.pk-rc .ttl{font-size:15px;font-weight:700}
.pk-rc .sb{font-size:12.5px;color:var(--t2);margin-top:3px;line-height:1.45}
.pk-code{margin-top:14px;background:var(--accent);border:none;border-radius:11px;width:100%;
  padding:11px;color:#fff;font-family:inherit;font-size:17px;font-weight:700;letter-spacing:4px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
.pk-code svg{width:16px;height:16px}

.pk-tabbar{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-around;
  padding:8px 8px 14px;background:rgba(15,16,19,.93);backdrop-filter:blur(18px);
  border-top:1px solid #1b1d22}
.pk-tab{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;
  color:var(--t3);cursor:pointer;padding:6px 13px;border-radius:12px;position:relative;
  border:none;background:none;font-family:inherit}
.pk-tab svg{width:22px;height:22px}
.pk-tab.on{color:var(--accent);background:var(--accent-soft)}
.pk-tab .bdg{position:absolute;top:-1px;right:5px;background:var(--accent);color:#fff;
  font-size:10px;font-weight:700;min-width:16px;height:16px;border-radius:8px;display:flex;
  align-items:center;justify-content:center;padding:0 4px}

.pk-toast{position:absolute;left:50%;bottom:98px;transform:translateX(-50%) translateY(14px);
  background:#2b2d33;color:var(--text);font-size:13px;font-weight:500;padding:10px 18px;
  border-radius:999px;opacity:0;pointer-events:none;transition:all .25s;white-space:nowrap;
  z-index:60;box-shadow:0 8px 26px rgba(0,0,0,.55)}
.pk-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

.pk-logo{width:64px;height:64px;border-radius:19px;margin:0 auto 18px;
  background:linear-gradient(135deg,#3390ff,#1e63d6);display:flex;align-items:center;
  justify-content:center;box-shadow:0 14px 34px rgba(51,144,255,.32)}
.pk-logo svg{width:32px;height:32px}
.pk-role{background:var(--card);border:1px solid #22242a;border-radius:15px;padding:13px 14px;
  margin-bottom:9px;cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;
  font-family:inherit;text-align:left;transition:border-color .15s;color:var(--text)}
.pk-role:active{border-color:var(--accent)}
.pk-role .ic{width:38px;height:38px;border-radius:11px;background:var(--accent-soft);
  display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pk-role .ic svg{width:19px;height:19px}
.pk-role .n{font-size:14px;font-weight:600}
.pk-role .n span{color:var(--t3);font-weight:500}
.pk-role .d{font-size:11.5px;color:var(--t3);margin-top:2px;line-height:1.4}
.pk-note{text-align:center;font-size:11px;color:var(--t3);margin-top:18px;line-height:1.5}

.pk-spin{width:34px;height:34px;border-radius:50%;margin:90px auto 20px;
  border:3px solid var(--card2);border-top-color:var(--accent);animation:pkSp .8s linear infinite}
@keyframes pkSp{to{transform:rotate(360deg)}}
.pk-dots{display:flex;gap:6px;justify-content:center;margin:2px 0 14px}
.pk-dots i{width:6px;height:6px;border-radius:50%;background:var(--card2)}
.pk-dots i.on{background:var(--accent)}
.pk-hr{height:1px;background:#22242a;margin:14px 0}
.pk-empty{text-align:center;color:var(--t3);font-size:13px;padding:52px 24px;line-height:1.6}
.pk-empty svg{width:34px;height:34px;margin-bottom:10px}
.pk-payrow{display:flex;justify-content:space-between;align-items:center;padding:10px 2px 6px;
  font-size:13px;color:var(--t2)}
.pk-payrow b{font-size:16px;color:var(--text);font-weight:700}
.pk-notif{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid #22242a;
  border-radius:12px;padding:11px 13px;margin-bottom:9px;font-size:13px}
.pk-notif .g{flex:1;color:var(--t2)}
`;

/* ---------------- Иконки ---------------- */
const Svg = ({ d, c = "currentColor", w = 1.8, style, children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w}
    strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);
const Ic = {
  house: (p) => <Svg {...p}><path d="m4 11 8-7 8 7M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" /><path d="M10 20v-6h4v6" /></Svg>,
  pass: (p) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></Svg>,
  users: (p) => <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M16 5.5a3 3 0 0 1 0 5.4M17.5 14.7c2 .6 3.1 1.9 3.5 4.3" /></Svg>,
  hist: (p) => <Svg {...p}><rect x="4" y="3.5" width="16" height="17" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></Svg>,
  acc: (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.4c1-2.6 3-3.9 5.5-3.9s4.5 1.3 5.5 3.9" /></Svg>,
  walk: (p) => <Svg {...p}><circle cx="13" cy="4.5" r="1.7" /><path d="M13 7.5 10 9l-1.5 4M13 7.5l2 3 3 1M13 7.5l-1 5.5 2.5 3 .8 4M11.5 14.5 9 17l-1.5 3.5" /></Svg>,
  car: (p) => <Svg {...p}><path d="M5 13 6.6 8.4A2 2 0 0 1 8.5 7h7a2 2 0 0 1 1.9 1.4L19 13M5 13h14a1.5 1.5 0 0 1 1.5 1.5V17a1 1 0 0 1-1 1H19M5 13a1.5 1.5 0 0 0-1.5 1.5V17a1 1 0 0 0 1 1H6" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></Svg>,
  truck: (p) => <Svg {...p}><path d="M3 7h10v9H3zM13 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></Svg>,
  clock: (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>,
  cardIc: (p) => <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18" /></Svg>,
  copy: (p) => <Svg w={2} {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Svg>,
  info: (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8v.4" /></Svg>,
  warn: (p) => <Svg {...p}><path d="M12 4 2.8 20h18.4L12 4z" /><path d="M12 10v4.5M12 17.4v.4" /></Svg>,
  ok: (p) => <Svg w={2.4} d="m5 13 4.2 4L19 7.5" {...p} />,
  x: (p) => <Svg w={2.2} d="M6 6l12 12M18 6 6 18" {...p} />,
  chev: (p) => <Svg w={2} d="m9 6 6 6-6 6" {...p} />,
  back: (p) => <Svg w={2.2} d="M15 6l-6 6 6 6" {...p} />,
  edit: (p) => <Svg d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" {...p} />,
  trash: (p) => <Svg {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 12.2a1.5 1.5 0 0 0 1.5 1.3h6a1.5 1.5 0 0 0 1.5-1.3l1-12.2" /></Svg>,
  lock: (p) => <Svg {...p}><rect x="5" y="10.5" width="14" height="9" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Svg>,
  userAdd: (p) => <Svg {...p}><circle cx="10" cy="8" r="3.2" /><path d="M4 19c.7-3 2.9-4.5 6-4.5s5.3 1.5 6 4.5M18 6v6M21 9h-6" /></Svg>,
  plus: (p) => <Svg w={2.2} d="M12 5v14M5 12h14" {...p} />,
  out: (p) => <Svg {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 8l4 4-4 4M19 12H9" /></Svg>,
};

/* ---------------- Константы и утилиты ---------------- */
const ROLES = {
  owner: { label: "Собственник", tag: "K0" },
  family: { label: "Член семьи", tag: "K1" },
  renter: { label: "Арендатор", tag: "K2" },
  child: { label: "Ребёнок", tag: "K1.2" },
};
const NAMES = {
  owner: "Александр Иванов", family: "Мария Иванова",
  renter: "Пётр Сидоров", child: "Кирилл Иванов",
};
const USER_LIMIT = 5;
const CARGO_PRICE = 1500;
const CAR_MARKS = ["Lada", "Hyundai", "Kia", "Toyota", "Skoda", "Volkswagen", "BMW", "Mercedes-Benz", "Geely", "Haval", "Другая"];
const TRUCK_MARKS = ["КамАЗ", "ГАЗель", "MAN", "Volvo", "Scania", "Другая"];
const AV = ["#3b6fd1", "#7a5bd6", "#2f9e8f", "#c46a3c", "#b04a8c", "#4f8f4a"];
const avColor = (i) => AV[Math.abs(i) % AV.length];
const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
const ruName = (s) => /^[А-ЯЁа-яё][А-ЯЁа-яё-]{1,}$/.test(s.trim());
const plateOk = (s) => /^[АВЕКМНОРСТУХавекмнорстух]\d{3}[АВЕКМНОРСТУХавекмнорстух]{2}\d{2,3}$/.test(s.trim());
const phoneOk = (s) => s.replace(/\D/g, "").length === 11;
const money = (n) => n.toLocaleString("ru-RU") + " ₽";
// коды по ТЗ: разовые/временные — первая цифра 1–7, грузовые — 8–9
const genCode = (kind) => {
  const first = kind === "cargo" ? 8 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 7);
  return first + String(Math.floor(Math.random() * 1000)).padStart(3, "0");
};
const KIND_ICON = { ped: Ic.walk, auto: Ic.car, cargo: Ic.truck, temp: Ic.clock };
const KIND_NAME = { ped: "Пешеходный", auto: "Автомобильный", temp: "Временный" };
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0") + ":00");
let _id = 500;
const nextId = () => ++_id;

/* ---------------- Начальные данные (моки) ---------------- */
const seedUsers = [
  { id: 1, role: "Член семьи", name: "Мария Иванова", phone: "+7 (999) 111-22-33", ls: "1234567", on: true, req: 2 },
  { id: 2, role: "Арендатор", name: "Пётр Сидоров", phone: "+7 (999) 444-55-66", ls: "1234567", on: true, req: 1 },
  { id: 3, role: "Ребёнок", name: "Кирилл Иванов", phone: "+7 (999) 777-88-99", ls: "1234567", on: false, req: 0 },
];
const seedRequests = [
  { id: 101, who: "Мария Иванова", role: "Член семьи", kind: "ped", subject: "Смирнов Олег Петрович", status: "pending" },
  { id: 102, who: "Пётр Сидоров", role: "Арендатор", kind: "auto", subject: "Skoda А111БВ 000", status: "pending" },
];
const seedHistory = [
  { id: 1, date: "Вчера", kind: "auto", title: "Разовый автомобильный", sub: "Hyundai А123БВ 777", code: "4821", st: "ok", stTxt: "Активен · до 18:40" },
  { id: 2, date: "Вчера", kind: "ped", title: "Разовый пешеходный", sub: "Иванов Иван Иванович", code: "2314", st: "ok", stTxt: "Использован" },
  { id: 3, date: "20 июня", kind: "cargo", title: "Грузовой пропуск", sub: "КамАЗ В555ХУ 178", code: "8567", st: "ok", stTxt: "Оплачен · 1 500 ₽" },
  { id: 4, date: "20 июня", kind: "temp", title: "Временный пропуск", sub: "Пропуск для «Курьер»", code: "7003", st: "no", stTxt: "Истёк" },
];
const seedMyReq = [
  { id: 11, date: "Вчера", kind: "ped", title: "Разовый пешеходный", sub: "Фамилия Имя Отчество", st: "ok", stTxt: "Одобрен" },
  { id: 12, date: "20 июня", kind: "auto", title: "Разовый автомобильный", sub: "Skoda А111БВ 000", st: "no", stTxt: "Отклонён" },
];

/* ============================================================
   Мелкие UI-компоненты
   ============================================================ */
const Btn = ({ kind = "", sm, auto, children, ...p }) => (
  <button className={`pk-btn ${kind} ${sm ? "sm" : ""} ${auto ? "auto" : ""}`} {...p}>{children}</button>
);
const Card = ({ children, style }) => <div className="pk-card" style={style}>{children}</div>;
const Field = ({ children, label }) => (
  <div className="pk-field">{label && <label className="pk-label">{label}</label>}{children}</div>
);
const Input = ({ err, ...p }) => <input className={`pk-input ${err ? "err" : ""}`} {...p} />;
const Select = ({ err, options, placeholder, ...p }) => (
  <select className={`pk-input ${err ? "err" : ""}`} {...p}>
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);
const Check = ({ on, onToggle, children }) => (
  <div className={`pk-check ${on ? "on" : ""}`} onClick={onToggle}>
    <span className="bx"><Ic.ok c="#fff" style={{ width: 12, height: 12 }} /></span>
    <span>{children}</span>
  </div>
);
const Switch = ({ on, onToggle }) => (
  <button className={`pk-switch ${on ? "on" : ""}`} onClick={onToggle} aria-label="переключатель" />
);
const Banner = ({ kind = "info", children }) => {
  const icon = kind === "warn" ? <Ic.warn c="var(--yellow)" /> : kind === "bad" ? <Ic.x c="var(--red)" /> : <Ic.info c="var(--accent)" />;
  return <div className={`pk-banner ${kind}`}>{icon}<span>{children}</span></div>;
};
const BackChip = ({ onClick, label = "Назад" }) => (
  <div style={{ margin: "2px 0 10px" }}>
    <button className="pk-chip" onClick={onClick}>
      <Ic.back style={{ width: 14, height: 14 }} /> {label}
    </button>
  </div>
);
const Dots = ({ n, at }) => (
  <div className="pk-dots">{Array.from({ length: n }, (_, i) => <i key={i} className={i === at ? "on" : ""} />)}</div>
);
const StatusColor = { ok: "var(--green)", no: "var(--red)", wait: "var(--yellow)" };
const ResultCard = ({ tone = "ok", status, title, sub, icon, code, onCopy }) => {
  const IconC = icon || Ic.ok;
  const bg = tone === "ok" ? "rgba(52,209,131,.13)" : tone === "no" ? "rgba(255,95,95,.12)" : "var(--accent-soft)";
  const col = tone === "wait" ? "var(--yellow)" : StatusColor[tone] || "var(--accent)";
  return (
    <div className="pk-rc">
      <div className="tp">
        <div className="ic" style={{ background: bg }}><IconC c={col} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="stt" style={{ color: col }}>{status}</div>
          <div className="ttl">{title}</div>
          {sub && <div className="sb">{sub}</div>}
        </div>
      </div>
      {code && (
        <button className="pk-code" onClick={() => onCopy(code)}>
          {code} <Ic.copy c="#fff" />
        </button>
      )}
    </div>
  );
};

/* ============================================================
   ЭКРАНЫ
   ============================================================ */

/* ---------- Старт ---------- */
function StartScreen({ ctx }) {
  const roles = [
    { k: "owner", ic: Ic.house, d: "Полный доступ: все пропуска, одобрение запросов, пользователи" },
    { k: "family", ic: Ic.users, d: "Разовые и временные пропуска по акцепту собственника" },
    { k: "renter", ic: Ic.users, d: "Разовые и временные пропуска по акцепту собственника" },
    { k: "child", ic: Ic.walk, d: "Ограниченный доступ (К1.2), запросы через собственника" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%", padding: "18px 4px" }}>
      <div className="pk-logo"><Ic.house c="#fff" /></div>
      <h1 className="pk" style={{ textAlign: "center", margin: "0 0 6px" }}>Пропуска</h1>
      <p className="pk-sub" style={{ textAlign: "center", marginBottom: 24 }}>
        Заказ пропусков на территорию посёлка.<br />Демо-версия — выберите роль для входа.
      </p>
      {roles.map((r) => (
        <button key={r.k} className="pk-role" onClick={() => ctx.loginAs(r.k)}>
          <span className="ic"><r.ic c="var(--accent)" /></span>
          <span style={{ flex: 1 }}>
            <div className="n">{ROLES[r.k].label} <span>· {ROLES[r.k].tag}</span></div>
            <div className="d">{r.d}</div>
          </span>
          <Ic.chev c="var(--t3)" style={{ width: 16, height: 16 }} />
        </button>
      ))}
      <Btn kind="ghost" style={{ marginTop: 8 }} onClick={() => ctx.nav("reg")}>Пройти регистрацию (демо)</Btn>
      <div className="pk-note">Демо-прототип · данные не сохраняются<br />Интеграции 1С / SIGUR / ЮKassa имитируются</div>
    </div>
  );
}

/* ---------- Регистрация (Форма №1, 3 шага) ---------- */
function RegScreen({ ctx }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ ls: "", fam: "", name: "", otch: "", noOtch: false, ser: "", num: "", phone: "+7 ", agree: [false, false, false] });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k, val) => setF((s) => ({ ...s, [k]: val }));

  const next1 = () => {
    const e = {};
    if (f.ls.replace(/\D/g, "").length < 6) e.ls = 1;
    if (!ruName(f.fam)) e.fam = 1;
    if (!ruName(f.name)) e.name = 1;
    if (!f.noOtch && f.otch && !ruName(f.otch)) e.otch = 1;
    setErrs(e);
    if (!Object.keys(e).length) setStep(1);
  };
  const next2 = () => {
    const e = {};
    if (f.ser.replace(/\D/g, "").length !== 4) e.ser = 1;
    if (f.num.replace(/\D/g, "").length !== 6) e.num = 1;
    if (!phoneOk(f.phone)) e.phone = 1;
    setErrs(e);
    if (!Object.keys(e).length) setStep(2);
  };
  const finish = () => {
    setLoading(true);
    setTimeout(() => ctx.nav("regDone", { fam: f.fam, name: f.name, ls: f.ls }, true), 1500);
  };
  const allAgree = f.agree.every(Boolean);

  if (loading) return (
    <div style={{ textAlign: "center", paddingTop: 40 }}>
      <div className="pk-spin" />
      <p className="pk-sub">Проверяем данные в 1С:ЖКХ…<br />
        <span style={{ fontSize: 11, color: "var(--t3)" }}>(имитация верификации)</span></p>
    </div>
  );

  const AGREEMENTS = ["Согласие на обработку персональных данных", "Договор оферты КО", "Договор оферты ВС, ВО"];
  return (
    <>
      <BackChip onClick={() => (step ? setStep(step - 1) : ctx.back())} />
      <Card>
        <div style={{ marginBottom: 12 }}>
          <div className="pk-eyebrow">Форма регистрации · шаг {step + 1} из 3</div>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "3px 0 2px" }}>
            {step === 2 ? "Соглашения" : "Заполните все данные"}
          </h2>
          <div className="pk-sub">{["Личные данные", "Паспортные данные и телефон", "Примите все соглашения для завершения"][step]}</div>
        </div>
        <Dots n={3} at={step} />

        {step === 0 && (
          <>
            <Field><Input placeholder="Номер лицевого счёта" inputMode="numeric" maxLength={7}
              value={f.ls} err={errs.ls} onChange={(e) => set("ls", e.target.value)} /></Field>
            <Field><Input placeholder="Фамилия" value={f.fam} err={errs.fam} onChange={(e) => set("fam", e.target.value)} /></Field>
            <Field><Input placeholder="Имя" value={f.name} err={errs.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field><Input placeholder="Отчество" value={f.otch} err={errs.otch} disabled={f.noOtch}
              onChange={(e) => set("otch", e.target.value)} /></Field>
            <Check on={f.noOtch} onToggle={() => set("noOtch", !f.noOtch)}>Нет отчества</Check>
            {!!Object.keys(errs).length && <div className="pk-err">Заполните поля полностью, на русском языке. Лицевой счёт — минимум 6 цифр.</div>}
            <Btn style={{ marginTop: 6 }} onClick={next1}>Далее ›</Btn>
          </>
        )}
        {step === 1 && (
          <>
            <Field><Input placeholder="Серия паспорта" inputMode="numeric" maxLength={4}
              value={f.ser} err={errs.ser} onChange={(e) => set("ser", e.target.value)} /></Field>
            <Field><Input placeholder="Номер паспорта" inputMode="numeric" maxLength={6}
              value={f.num} err={errs.num} onChange={(e) => set("num", e.target.value)} /></Field>
            <Field><Input placeholder="Мобильный телефон" inputMode="tel"
              value={f.phone} err={errs.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            {!!Object.keys(errs).length && <div className="pk-err">Серия — 4 цифры, номер — 6 цифр, телефон — 11 цифр с кодом «+7».</div>}
            <Btn style={{ marginTop: 6 }} onClick={next2}>Далее ›</Btn>
          </>
        )}
        {step === 2 && (
          <>
            {AGREEMENTS.map((t, i) => (
              <Check key={t} on={f.agree[i]} onToggle={() => {
                const a = [...f.agree]; a[i] = !a[i]; set("agree", a);
              }}>
                <b>{t}</b><br />Короткий тезис о соглашении — <a href="#" onClick={(e) => e.preventDefault()}>ссылка</a>
              </Check>
            ))}
            <Btn style={{ marginTop: 10 }} disabled={!allAgree} onClick={finish}>Подтвердить ›</Btn>
          </>
        )}
      </Card>
    </>
  );
}

function RegDoneScreen({ ctx, params }) {
  return (
    <>
      <BackChip label="На главный экран" onClick={() => ctx.nav("start", {}, true)} />
      <ResultCard tone="ok" status="Верификация пройдена"
        title={`${params.fam || "Иванов"} ${params.name || "Александр"}`}
        sub={`Лицевой счёт ${params.ls || "1234567"} подтверждён управляющей компанией`} />
      <Btn onClick={() => ctx.loginAs("owner")}><Ic.pass c="#fff" style={{ width: 18, height: 18 }} /> Получить пропуск</Btn>
      <Btn kind="soft" style={{ marginTop: 9 }} onClick={() => ctx.loginAs("owner", "userAdd")}>
        <Ic.userAdd c="var(--accent)" style={{ width: 18, height: 18 }} /> Добавить пользователей
      </Btn>
    </>
  );
}

/* ---------- Пропуска (главная) ---------- */
function PassesScreen({ ctx }) {
  const { role, me, balance, requests } = ctx;
  const isOwner = role === "owner";
  const isChild = role === "child";
  const needAsk = !isOwner; // К1/2 и ребёнок — запрашивают
  const pending = requests.filter((r) => r.status === "pending");
  const [tab, setTab] = useState("order");
  const cargoAvail = Math.floor(balance / CARGO_PRICE);

  return (
    <>
      <div className="pk-item tap" onClick={() => ctx.goTab("account")}>
        <div className="pk-top">
          <div className="pk-av" style={{ background: avColor(0) }}>{initials(me.name)}</div>
          <div className="pk-info">
            <div className="r">{ROLES[role].label}</div>
            <div className="nm">{me.name}</div>
          </div>
          <Ic.chev c="var(--t3)" style={{ width: 16, height: 16 }} />
        </div>
      </div>

      <h1 className="pk" style={{ marginTop: 16 }}>Заказ пропуска</h1>

      {isOwner && (
        <div className="pk-seg">
          <button className={tab === "order" ? "on" : ""} onClick={() => setTab("order")}>Заказать</button>
          <button className={tab === "req" ? "on" : ""} onClick={() => setTab("req")}>
            Запросы {pending.length > 0 && <span className="pk-cnt">{pending.length}</span>}
          </button>
        </div>
      )}

      {isOwner && tab === "req" ? (
        <RequestsList ctx={ctx} pending={pending} />
      ) : (
        <>
          {/* Разовый */}
          <Card>
            <div className="pk-head"><h2>Разовый пропуск</h2><span className="pk-meta">бесплатно</span></div>
            <div className="pk-row2">
              <div className="pk-opt">
                <div className="lbl"><Ic.walk c="var(--t2)" /> Пешеходный</div>
                <Btn kind="soft" sm onClick={() => ctx.nav("formPed")}>{needAsk ? "Запросить" : "Оформить"}</Btn>
              </div>
              <div className="pk-opt">
                <div className="lbl"><Ic.car c="var(--t2)" /> Автомобиль</div>
                <Btn kind="soft" sm onClick={() => ctx.nav("formAuto")}>{needAsk ? "Запросить" : "Оформить"}</Btn>
              </div>
            </div>
          </Card>

          {/* Грузовой — нет у ребёнка */}
          {!isChild && (
            <Card>
              <div className="pk-head"><h2>Грузовой пропуск</h2>
                <span className="pk-meta">Баланс: <b>{money(balance)}</b></span></div>
              {cargoAvail === 0 && (
                <Banner kind="warn">Для оформления пропуска на счету должно быть не менее <b>1 500 ₽</b></Banner>
              )}
              <div className="pk-row2">
                <div className="pk-opt">
                  <div className="lbl"><Ic.cardIc c="var(--t2)" /> Пополнение баланса</div>
                  <Btn kind="soft" sm onClick={() => ctx.nav("topup")}>Пополнить</Btn>
                </div>
                <div className="pk-opt">
                  <div className="lbl"><Ic.truck c="var(--t2)" /> Автомобиль</div>
                  <div className="note">Доступно: {cargoAvail}</div>
                  <Btn sm disabled={!cargoAvail} onClick={() => ctx.nav("formCargo")}>Оформить</Btn>
                </div>
              </div>
            </Card>
          )}

          {/* Временный */}
          <Card>
            <div className="pk-head"><h2>Временный пропуск</h2></div>
            <Btn onClick={() => ctx.nav("formTemp")}>{isChild ? "Запросить" : "Оформить"}</Btn>
          </Card>

          {/* Постоянный — только собственник */}
          {isOwner && (
            <Card>
              <div className="pk-head"><h2>Постоянный пропуск</h2></div>
              <p className="pk-sub" style={{ marginBottom: 10 }}>
                Оформляется через добавление нового пользователя — после авторизации он получает постоянный доступ.
              </p>
              <Btn onClick={() => ctx.goTab("usersTab", "userAdd")}>Оформить</Btn>
            </Card>
          )}
        </>
      )}
    </>
  );
}

function RequestsList({ ctx, pending }) {
  if (!pending.length) return (
    <div className="pk-empty">
      <Ic.ok c="var(--t3)" /><br />
      Новых запросов нет.<br />Здесь появятся заявки от членов семьи и арендаторов.
    </div>
  );
  return (
    <>
      <div className="pk-eyebrow" style={{ margin: "2px 4px 10px" }}>Согласование пропусков</div>
      {pending.map((r) => {
        const IconC = KIND_ICON[r.kind];
        return (
          <div className="pk-item" key={r.id}>
            <div className="pk-top">
              <div className="pk-ico"><IconC c="var(--accent)" /></div>
              <div className="pk-info">
                <div className="nm">Запрос на {KIND_NAME[r.kind]} пропуск</div>
                <div className="ph">{r.subject}</div>
                <div className="r" style={{ marginTop: 2 }}>Запрашивает: {r.who} · {r.role}</div>
              </div>
            </div>
            <div className="pk-acts">
              <Btn sm onClick={() => ctx.decideRequest(r.id, true)}>Одобрить</Btn>
              <Btn sm kind="ghost" style={{ color: "var(--red)" }} onClick={() => ctx.decideRequest(r.id, false)}>Отклонить</Btn>
            </div>
          </div>
        );
      })}
    </>
  );
}

function ReqDecidedScreen({ ctx, params }) {
  const { ok, req } = params;
  return (
    <>
      <BackChip onClick={ctx.back} />
      <ResultCard tone={ok ? "ok" : "no"} status={ok ? "Одобрен" : "Отклонён"}
        icon={ok ? Ic.ok : Ic.x}
        title={req.subject}
        sub={`${KIND_NAME[req.kind]} пропуск · запросил(а) ${req.who}`} />
      <Btn onClick={() => ctx.goTab("passes")}>На главную</Btn>
    </>
  );
}

/* ---------- Формы заказа ---------- */
function FormPed({ ctx }) {
  const [f, setF] = useState({ fam: "", name: "", otch: "", noOtch: false });
  const [errs, setErrs] = useState({});
  const submit = () => {
    const e = {};
    if (!ruName(f.fam)) e.fam = 1;
    if (!ruName(f.name)) e.name = 1;
    if (!f.noOtch && f.otch && !ruName(f.otch)) e.otch = 1;
    setErrs(e);
    if (Object.keys(e).length) return;
    const fio = `${f.fam.trim()} ${f.name.trim()}${f.noOtch || !f.otch ? "" : " " + f.otch.trim()}`;
    ctx.placeOrder({ kind: "ped", title: "Разовый пешеходный пропуск", subject: fio });
  };
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Card>
        <FormTitle sub="Личные данные посетителя" />
        <Field><Input placeholder="Фамилия" value={f.fam} err={errs.fam} onChange={(e) => setF({ ...f, fam: e.target.value })} /></Field>
        <Field><Input placeholder="Имя" value={f.name} err={errs.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field><Input placeholder="Отчество" value={f.otch} err={errs.otch} disabled={f.noOtch}
          onChange={(e) => setF({ ...f, otch: e.target.value })} /></Field>
        <Check on={f.noOtch} onToggle={() => setF({ ...f, noOtch: !f.noOtch })}>Нет отчества</Check>
        {!!Object.keys(errs).length && <div className="pk-err">Фамилия и имя — полностью, на русском языке.</div>}
        <Btn style={{ marginTop: 6 }} onClick={submit}>{ctx.role === "owner" ? "Оформить" : "Запросить"}</Btn>
      </Card>
    </>
  );
}

function FormAuto({ ctx, cargo = false }) {
  const [f, setF] = useState({ num: "", mark: "" });
  const [errs, setErrs] = useState({});
  const marks = cargo ? TRUCK_MARKS : CAR_MARKS;
  const submit = () => {
    const e = {};
    if (!plateOk(f.num)) e.num = 1;
    if (!f.mark) e.mark = 1;
    setErrs(e);
    if (Object.keys(e).length) return;
    const subject = `${f.mark} ${f.num.toUpperCase()}`;
    if (cargo) {
      ctx.placeCargo(subject);
    } else {
      ctx.placeOrder({ kind: "auto", title: "Разовый автомобильный пропуск", subject });
    }
  };
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Card>
        <FormTitle sub={cargo ? "Грузовое авто" : "Данные авто"} />
        <Field><Input placeholder="Номер ТС, регион (А123БВ777)" maxLength={9}
          value={f.num} err={errs.num} onChange={(e) => setF({ ...f, num: e.target.value })} /></Field>
        <Field><Select placeholder="Марка ТС" options={marks} value={f.mark} err={errs.mark}
          onChange={(e) => setF({ ...f, mark: e.target.value })} /></Field>
        {!!Object.keys(errs).length && <div className="pk-err">Номер в формате А123БВ777 (кириллица), выберите марку ТС.</div>}
        {cargo && <div className="pk-payrow"><span>К оплате (спишется с депозита):</span><b>{money(CARGO_PRICE)}</b></div>}
        <Btn style={{ marginTop: 6 }} onClick={submit}>
          {cargo || ctx.role === "owner" ? "Оформить" : "Запросить"}
        </Btn>
      </Card>
    </>
  );
}

function FormTemp({ ctx }) {
  const isChild = ctx.role === "child";
  const [f, setF] = useState({ vis: "", comp: "", goal: "", from: "", to: "", auto: "", light: false });
  const [errs, setErrs] = useState({});
  const submit = () => {
    const e = {};
    if (f.vis.trim().length < 2) e.vis = 1;
    if (f.goal.trim().length < 2) e.goal = 1;
    setErrs(e);
    if (Object.keys(e).length) return;
    const from = f.from || "08:00", to = f.to || "12:00";
    ctx.placeOrder({
      kind: "temp", title: "Временный пропуск",
      subject: `Пропуск для «${f.vis.trim()}»`,
      extra: `Активен: с ${from} до ${to}`,
    });
  };
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Card>
        <FormTitle h="Заполните форму" sub="Временный пропуск" />
        <Field><Input placeholder="Посетитель" value={f.vis} err={errs.vis} onChange={(e) => setF({ ...f, vis: e.target.value })} /></Field>
        <Field><Input placeholder="Компания" value={f.comp} onChange={(e) => setF({ ...f, comp: e.target.value })} /></Field>
        <Field><Input placeholder="Цель посещения" value={f.goal} err={errs.goal} onChange={(e) => setF({ ...f, goal: e.target.value })} /></Field>
        <Field label="Укажите временной период">
          <div className="pk-row2">
            <Select placeholder="С 00:00" options={HOURS} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
            <Select placeholder="До 00:00" options={HOURS} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
          </div>
        </Field>
        {isChild ? (
          <Check on={f.light} onToggle={() => setF({ ...f, light: !f.light })}>Легковое авто</Check>
        ) : (
          <Field><Select placeholder="Авто (не обязательно)" options={["Легковое авто", "Грузовое авто"]}
            value={f.auto} onChange={(e) => setF({ ...f, auto: e.target.value })} /></Field>
        )}
        {!!Object.keys(errs).length && <div className="pk-err">Укажите посетителя и цель посещения.</div>}
        <Btn style={{ marginTop: 6 }} onClick={submit}>{isChild || ctx.role !== "owner" ? "Запросить" : "Оформить"}</Btn>
      </Card>
    </>
  );
}

const FormTitle = ({ h = "Заполните все данные", sub }) => (
  <div style={{ marginBottom: 12 }}>
    <div className="pk-eyebrow">Форма регистрации</div>
    <h2 style={{ fontSize: 17, fontWeight: 700, margin: "3px 0 2px" }}>{h}</h2>
    {sub && <div className="pk-sub">{sub}</div>}
  </div>
);

/* ---------- Результат заказа ---------- */
function ResultScreen({ ctx, params }) {
  const { mode, kind, title, subject, code, extra } = params;
  const sent = mode === "sent";
  const IconC = sent ? Ic.clock : KIND_ICON[kind] || Ic.ok;
  return (
    <>
      <BackChip label="Вернуться в меню" onClick={() => ctx.goTab("passes")} />
      <ResultCard
        tone={sent ? "wait" : "ok"} icon={IconC}
        status={sent ? "Запрос отправлен" : "Оформлен"}
        title={subject}
        sub={`${title}${extra ? " · " + extra : ""}${sent ? " — статус запроса можно отслеживать в разделе «История»" : ""}`}
        code={code} onCopy={ctx.copyCode}
      />
      <Btn onClick={() => ctx.goTab("passes")}>{sent ? "Запросить ещё" : "Оформить ещё"}</Btn>
      <Btn kind="ghost" style={{ marginTop: 9 }} onClick={() => ctx.goTab("passes")}>На главную</Btn>
    </>
  );
}

/* ---------- Пополнение и оплата ---------- */
function TopupScreen({ ctx }) {
  const [sum, setSum] = useState("");
  const n = parseInt(sum.replace(/\D/g, ""), 10) || 0;
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Card>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Пополнение баланса</h2>
          <div className="pk-sub">Укажите сумму пополнения. Минимум: 1 500 ₽</div>
        </div>
        <Field><Input placeholder="0 ₽" inputMode="numeric" value={sum}
          onChange={(e) => setSum(e.target.value.replace(/[^\d]/g, ""))} /></Field>
        <div className="pk-payrow"><span>К оплате:</span><b>{money(n)}</b></div>
        {n > 0 && n < 1500 && <div className="pk-err">Минимальная сумма пополнения — 1 500 ₽</div>}
        <Btn style={{ marginTop: 6 }} disabled={n < 1500} onClick={() => ctx.nav("payment", { sum: n })}>Оплатить</Btn>
      </Card>
    </>
  );
}

function PaymentScreen({ ctx, params }) {
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Banner><b>Процесс оплаты на стороне партнёра.</b><br />
        Интерфейс платёжного провайдера «ЮKassa» имитируется. Деньги зачисляются на расчётный счёт
        Заказчика по договору между Заказчиком и ЮKassa.</Banner>
      <Card style={{ textAlign: "center", padding: "24px 16px" }}>
        <div className="pk-eyebrow" style={{ marginBottom: 6 }}>ЮKassa · демо</div>
        <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>{money(params.sum)}</div>
        <div className="pk-sub" style={{ marginBottom: 16 }}>Пополнение депозита грузовых пропусков</div>
        <Btn onClick={() => ctx.paymentDone(params.sum, true)}>Оплатить</Btn>
        <Btn kind="ghost" style={{ marginTop: 9 }} onClick={() => ctx.paymentDone(params.sum, false)}>
          Имитировать ошибку платежа
        </Btn>
      </Card>
    </>
  );
}

function PayResultScreen({ ctx, params }) {
  const { ok, sum, balance } = params;
  return (
    <>
      <BackChip label="Вернуться в меню" onClick={() => ctx.goTab("passes")} />
      <ResultCard
        tone={ok ? "ok" : "no"} icon={ok ? Ic.ok : Ic.x}
        status="Подтверждение платежа"
        title={ok ? `Баланс пополнен на ${money(sum)}` : "Платёж не прошёл"}
        sub={ok
          ? `Текущий баланс: ${money(balance)} · доступно грузовых пропусков: ${Math.floor(balance / CARGO_PRICE)}`
          : "Деньги не списаны. Попробуйте ещё раз или обратитесь в управляющую компанию."} />
      {ok ? (
        <>
          <Btn onClick={() => ctx.nav("formCargo")}>Оформить пропуск</Btn>
          <Btn kind="ghost" style={{ marginTop: 9 }} onClick={() => ctx.goTab("passes")}>На главную</Btn>
        </>
      ) : (
        <>
          <Btn onClick={() => ctx.nav("topup")}>Повторить</Btn>
          <Btn kind="ghost" style={{ marginTop: 9 }} onClick={() => ctx.goTab("passes")}>Вернуться в меню</Btn>
        </>
      )}
    </>
  );
}

/* ---------- История ---------- */
function HistoryScreen({ ctx }) {
  const isOwner = ctx.role === "owner";
  const [tab, setTab] = useState(isOwner ? "hist" : "req");
  const list = !isOwner && tab === "req" ? ctx.myRequests : ctx.history;
  let lastDate = null;
  return (
    <>
      <h1 className="pk">История</h1>
      {!isOwner && (
        <div className="pk-seg">
          <button className={tab === "req" ? "on" : ""} onClick={() => setTab("req")}>Запросы</button>
          <button className={tab === "hist" ? "on" : ""} onClick={() => setTab("hist")}>История</button>
        </div>
      )}
      {!list.length ? (
        <div className="pk-empty"><Ic.hist c="var(--t3)" /><br />Пока пусто</div>
      ) : (
        list.map((h) => {
          const showDate = h.date !== lastDate;
          lastDate = h.date;
          const IconC = KIND_ICON[h.kind];
          return (
            <div key={h.id}>
              {showDate && <div className="pk-hdate">{h.date}</div>}
              <div className="pk-item">
                <div className="pk-top">
                  <div className="pk-ico"><IconC c="var(--accent)" /></div>
                  <div className="pk-info">
                    <div className="nm" style={{ fontSize: 13.5 }}>{h.title}</div>
                    <div className="ph">{h.sub}</div>
                    <div className={`pk-st ${h.st}`}>{h.stTxt}</div>
                  </div>
                  {h.code && <Btn kind="soft" sm auto onClick={() => ctx.copyCode(h.code)}>{h.code}</Btn>}
                </div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

/* ---------- Пользователи ---------- */
function UsersScreen({ ctx }) {
  const { users } = ctx;
  const [confirmId, setConfirmId] = useState(null);
  const limitHit = users.length >= USER_LIMIT;
  useEffect(() => {
    if (confirmId == null) return;
    const t = setTimeout(() => setConfirmId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmId]);
  return (
    <>
      <h1 className="pk">Управление пользователями</h1>
      {limitHit && (
        <Banner kind="warn"><b>Вы достигли лимита ({USER_LIMIT}).</b><br />
          Для добавления дополнительных пользователей обратитесь в управляющую компанию.</Banner>
      )}
      <Btn kind="soft" style={{ marginBottom: 14 }} disabled={limitHit} onClick={() => ctx.nav("userAdd")}>
        <Ic.plus c={limitHit ? "var(--t3)" : "var(--accent)"} style={{ width: 16, height: 16 }} /> Добавить пользователя
      </Btn>
      {users.map((u) => (
        <div className="pk-item" key={u.id}>
          <div className="pk-top">
            <div className="pk-av" style={{ background: avColor(u.id) }}>
              {u.req > 0 && <span className="n">{u.req}</span>}
              {initials(u.name)}
            </div>
            <div className="pk-info">
              <div className="r">{u.role}</div>
              <div className="nm">{u.name}</div>
              <div className="ph">{u.phone}</div>
            </div>
            <div className="pk-side">
              <span className="pk-ls">Л/С {u.ls}</span>
              <Switch on={u.on} onToggle={() => ctx.toggleUser(u.id)} />
            </div>
          </div>
          <div className="pk-acts">
            <Btn kind="soft" sm onClick={() => ctx.toast("Редактирование — запрос уйдёт в УК (демо)")}>
              <Ic.edit c="var(--accent)" style={{ width: 14, height: 14 }} /> Редактировать
            </Btn>
            <Btn kind="danger" sm auto onClick={() =>
              confirmId === u.id ? ctx.removeUser(u.id) : setConfirmId(u.id)
            }>
              <Ic.trash c="var(--red)" style={{ width: 15, height: 15 }} />
              {confirmId === u.id ? "Точно удалить?" : "Удалить"}
            </Btn>
          </div>
        </div>
      ))}
      <Banner>Тумблер включает и отключает оформление пропусков у пользователя.
        Цифра на аватаре — количество запрошенных пропусков.</Banner>
    </>
  );
}

function UserAddScreen({ ctx }) {
  const [f, setF] = useState({ phone: "+7 ", role: "", rodstvo: "" });
  const [errs, setErrs] = useState({});
  const submit = () => {
    const e = {};
    if (!phoneOk(f.phone)) e.phone = 1;
    if (!f.role) e.role = 1;
    if (f.role === "Член семьи" && f.rodstvo.trim().length < 2) e.rodstvo = 1;
    setErrs(e);
    if (Object.keys(e).length) return;
    ctx.addUser(f);
  };
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Card>
        <FormTitle sub="Личные данные добавляемого пользователя" />
        <Field><Input placeholder="Мобильный телефон" inputMode="tel"
          value={f.phone} err={errs.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field><Select placeholder="Роль" options={["Арендатор", "Член семьи", "Ребёнок (до 14 лет)"]}
          value={f.role} err={errs.role} onChange={(e) => setF({ ...f, role: e.target.value, rodstvo: "" })} /></Field>
        {f.role === "Член семьи" && (
          <Field><Input placeholder="Родство" value={f.rodstvo} err={errs.rodstvo}
            onChange={(e) => setF({ ...f, rodstvo: e.target.value })} /></Field>
        )}
        <Banner>Пользователи категорий К1/2 проходят авторизацию самостоятельно по ссылке.
          Данные ребёнка до 14 лет вводит собственник.</Banner>
        {!!Object.keys(errs).length && <div className="pk-err">Укажите телефон (11 цифр) и роль{f.role === "Член семьи" ? ", заполните родство" : ""}.</div>}
        <Btn onClick={submit}>Добавить</Btn>
      </Card>
    </>
  );
}

function UserAddedScreen({ ctx, params }) {
  return (
    <>
      <BackChip label="Вернуться в меню" onClick={() => ctx.goTab("usersTab")} />
      <ResultCard tone="ok" icon={Ic.userAdd} status="Приглашение отправлено"
        title={params.phone}
        sub="Вы добавили пользователя. Ссылка для авторизации придёт ему в СМС / Телеграм." />
      <Btn onClick={() => ctx.nav("userAdd", {}, true)}>Добавить ещё</Btn>
      <Btn kind="ghost" style={{ marginTop: 9 }} onClick={() => ctx.goTab("usersTab")}>В меню</Btn>
    </>
  );
}

/* ---------- Аккаунт ---------- */
function AccountScreen({ ctx }) {
  const { me, role, notifications } = ctx;
  useEffect(() => { ctx.markNotifsSeen(); }, []); // eslint-disable-line
  return (
    <>
      <h1 className="pk">Управление аккаунтом</h1>
      <div className="pk-item">
        <div className="pk-top">
          <div className="pk-av" style={{ background: avColor(0) }}>{initials(me.name)}</div>
          <div className="pk-info">
            <div className="r">{ROLES[role].label} · Л/С {me.ls}</div>
            <div className="nm">{me.name}</div>
            <div className="ph">{me.phone}</div>
          </div>
        </div>
        <div className="pk-acts">
          <Btn kind="soft" sm onClick={() => ctx.nav("accountEdit")}>
            <Ic.edit c="var(--accent)" style={{ width: 14, height: 14 }} /> Редактировать
          </Btn>
        </div>
      </div>

      {notifications.length > 0 && (
        <>
          <div className="pk-eyebrow" style={{ margin: "14px 4px 8px" }}>Уведомления</div>
          {notifications.map((n) => (
            <div className="pk-notif" key={n.id}>
              <Ic.edit c="var(--t2)" style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span className="g">{n.text}</span>
              <span className={`pk-st ${n.ok ? "ok" : "wait"}`} style={{ marginTop: 0 }}>{n.status}</span>
            </div>
          ))}
        </>
      )}

      <div className="pk-hr" />
      <Btn kind="danger" onClick={() => ctx.logout()}>
        <Ic.out c="var(--red)" style={{ width: 17, height: 17 }} /> Выйти (сменить роль — демо)
      </Btn>
      <div className="pk-note">Изменение ФИО и паспортных данных проходит согласование в управляющей компании</div>
    </>
  );
}

function AccountEditScreen({ ctx }) {
  const [fam, name] = ctx.me.name.split(" ");
  const [f, setF] = useState({ ls: ctx.me.ls, phone: ctx.me.phone });
  const [errs, setErrs] = useState({});
  const submit = () => {
    const e = {};
    if (f.ls.replace(/\D/g, "").length < 6) e.ls = 1;
    if (!phoneOk(f.phone)) e.phone = 1;
    setErrs(e);
    if (Object.keys(e).length) return;
    ctx.submitAccountEdit(f);
  };
  return (
    <>
      <BackChip onClick={ctx.back} />
      <Card>
        <FormTitle sub="Личные данные" />
        <Field>
          <Input value={fam} disabled />
          <span className="pk-lock"><Ic.lock c="var(--t3)" style={{ width: 15, height: 15 }} /></span>
        </Field>
        <Field>
          <Input value={name} disabled />
          <span className="pk-lock"><Ic.lock c="var(--t3)" style={{ width: 15, height: 15 }} /></span>
        </Field>
        <Field><Input placeholder="Номер лицевого счёта" value={f.ls} err={errs.ls}
          onChange={(e) => setF({ ...f, ls: e.target.value })} /></Field>
        <Field><Input placeholder="Мобильный телефон" value={f.phone} err={errs.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Banner>ФИО и паспортные данные меняются через запрос в управляющую компанию —
          поля с замком заблокированы.</Banner>
        {!!Object.keys(errs).length && <div className="pk-err">Проверьте лицевой счёт и телефон.</div>}
        <Btn onClick={submit}>Изменить</Btn>
      </Card>
    </>
  );
}

function EditSentScreen({ ctx }) {
  return (
    <>
      <BackChip label="Вернуться в меню" onClick={() => ctx.goTab("account")} />
      <ResultCard tone="wait" icon={Ic.clock} status="Запрос отправлен"
        title="Данные на согласовании"
        sub="Данные направлены в управляющую компанию для согласования и внесения в систему. Ожидайте уведомлений от управляющей компании." />
      <Btn onClick={() => ctx.goTab("account")}>Вернуться в меню</Btn>
    </>
  );
}

/* ============================================================
   Корневой компонент
   ============================================================ */
const TABS = {
  owner: ["passes", "usersTab", "history", "account"],
  family: ["passes", "history", "account"],
  renter: ["passes", "history", "account"],
  child: ["passes", "history", "account"],
};
const TAB_META = {
  passes: { t: "Пропуска", ic: Ic.pass },
  usersTab: { t: "Пользователи", ic: Ic.users },
  history: { t: "История", ic: Ic.hist },
  account: { t: "Аккаунт", ic: Ic.acc },
};
// какой корневой таб подсвечивать для каждого экрана
const TAB_OF = {
  passes: "passes", formPed: "passes", formAuto: "passes", formCargo: "passes",
  formTemp: "passes", topup: "passes", payment: "passes", payResult: "passes",
  result: "passes", reqDecided: "passes",
  usersTab: "usersTab", userAdd: "usersTab", userAdded: "usersTab",
  history: "history",
  account: "account", accountEdit: "account", editSent: "account",
};
const NO_TABBAR = new Set(["start", "reg", "regDone", "payment"]);

export default function PropuskaDemo() {
  /* --- навигация --- */
  const [stack, setStack] = useState([{ name: "start", params: {} }]);
  const cur = stack[stack.length - 1];
  const nav = useCallback((name, params = {}, replaceAll = false) =>
    setStack((s) => (replaceAll ? [{ name, params }] : [...s, { name, params }])), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const goTab = useCallback((name, then) => {
    setStack(then ? [{ name, params: {} }, { name: then, params: {} }] : [{ name, params: {} }]);
  }, []);

  /* --- данные --- */
  const [role, setRole] = useState(null);
  const [me, setMe] = useState({ name: NAMES.owner, phone: "+7 (999) 888-77-66", ls: "1234567" });
  const [balance, setBalance] = useState(1500);
  const [users, setUsers] = useState(seedUsers);
  const [requests, setRequests] = useState(seedRequests);
  const [history, setHistory] = useState(seedHistory);
  const [myRequests, setMyRequests] = useState(seedMyReq);
  const [notifications, setNotifications] = useState([]);

  /* --- тост --- */
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1900);
  }, []);

  /* --- родная кнопка «Назад» Telegram --- */
  useEffect(() => {
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (!tg || !tg.BackButton) return;
    const handler = () => back();
    tg.BackButton.onClick(handler);
    return () => tg.BackButton.offClick(handler);
  }, [back]);
  useEffect(() => {
    const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (!tg || !tg.BackButton) return;
    if (stack.length > 1) tg.BackButton.show();
    else tg.BackButton.hide();
  }, [stack.length]);

  /* --- действия --- */
  const loginAs = (r, then) => {
    setRole(r);
    setMe((m) => ({ ...m, name: NAMES[r] }));
    goTab("passes", then && r === "owner" ? undefined : undefined);
    if (then && r === "owner") setStack([{ name: "usersTab", params: {} }, { name: then, params: {} }]);
  };
  const logout = () => { setRole(null); nav("start", {}, true); };

  const copyCode = (code) => {
    const done = () => toast("Код скопирован: " + code);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(() => toast("Код: " + code));
    } else toast("Код: " + code);
  };

  // заказ разового/временного: собственник — сразу код, остальные — запрос собственнику
  const placeOrder = ({ kind, title, subject, extra }) => {
    if (role !== "owner") {
      setRequests((r) => [...r, {
        id: nextId(), who: me.name, role: ROLES[role].label, kind, subject, status: "pending",
      }]);
      setMyRequests((r) => [{
        id: nextId(), date: "Сегодня", kind, title, sub: subject, st: "wait", stTxt: "Отправлен",
      }, ...r]);
      nav("result", { mode: "sent", kind, title, subject });
    } else {
      const code = genCode(kind);
      setHistory((h) => [{
        id: nextId(), date: "Сегодня", kind, title, sub: subject, code, st: "ok",
        stTxt: extra || "Активен · 24 часа",
      }, ...h]);
      nav("result", { mode: "done", kind, title, subject, code, extra });
    }
  };

  // грузовой: списываем депозит, код сразу (для всех, у кого есть доступ)
  const placeCargo = (subject) => {
    const code = genCode("cargo");
    setBalance((b) => b - CARGO_PRICE);
    setHistory((h) => [{
      id: nextId(), date: "Сегодня", kind: "cargo", title: "Грузовой пропуск", sub: subject,
      code, st: "ok", stTxt: "Оплачен · 1 500 ₽ · действителен 24 часа",
    }, ...h]);
    nav("result", {
      mode: "done", kind: "cargo", title: "Грузовой пропуск", subject, code,
      extra: "действителен 24 часа",
    });
  };

  const decideRequest = (id, ok) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: ok ? "approved" : "rejected" } : r)));
    if (ok) {
      setHistory((h) => [{
        id: nextId(), date: "Сегодня", kind: req.kind,
        title: `${KIND_NAME[req.kind]} пропуск (по запросу)`, sub: req.subject,
        code: genCode(req.kind), st: "ok", stTxt: `Одобрен · запросил(а) ${req.who}`,
      }, ...h]);
    }
    nav("reqDecided", { ok, req });
  };

  const paymentDone = (sum, ok) => {
    if (ok) {
      const newBalance = balance + sum;
      setBalance(newBalance);
      nav("payResult", { ok: true, sum, balance: newBalance }, true);
    } else {
      nav("payResult", { ok: false, sum }, true);
    }
  };

  const toggleUser = (id) => {
    setUsers((us) => us.map((u) => {
      if (u.id !== id) return u;
      toast(u.on ? `${u.name}: оформление отключено` : `${u.name}: оформление включено`);
      return { ...u, on: !u.on };
    }));
  };
  const removeUser = (id) => {
    setUsers((us) => us.filter((u) => u.id !== id));
    toast("Пользователь удалён");
  };
  const addUser = (f) => {
    const pool = ["Ольга Смирнова", "Дмитрий Козлов", "Анна Петрова", "Сергей Волков"];
    setUsers((us) => [...us, {
      id: nextId(), role: f.role.replace(" (до 14 лет)", ""),
      name: pool[us.length % pool.length], phone: f.phone.trim(), ls: me.ls, on: true, req: 0,
    }]);
    nav("userAdded", { phone: f.phone.trim() });
  };

  const submitAccountEdit = (f) => {
    setMe((m) => ({ ...m, ls: f.ls, phone: f.phone }));
    const nid = nextId();
    setNotifications((ns) => [{ id: nid, text: "Изменение данных", status: "На согласовании", ok: false, seen: false }, ...ns]);
    setTimeout(() => {
      setNotifications((ns) => ns.map((n) => (n.id === nid ? { ...n, status: "Согласовано", ok: true, seen: false } : n)));
      toast("УК согласовала изменения (демо)");
    }, 4500);
    nav("editSent");
  };
  const markNotifsSeen = () => setNotifications((ns) =>
    ns.some((n) => !n.seen) ? ns.map((n) => ({ ...n, seen: true })) : ns);

  /* --- контекст для экранов --- */
  const ctx = {
    role, me, balance, users, requests, history, myRequests, notifications,
    nav, back, goTab, toast, copyCode,
    loginAs, logout, placeOrder, placeCargo, decideRequest, paymentDone,
    toggleUser, removeUser, addUser, submitAccountEdit, markNotifsSeen,
  };

  /* --- выбор экрана --- */
  const SCREEN = {
    start: <StartScreen ctx={ctx} />,
    reg: <RegScreen ctx={ctx} />,
    regDone: <RegDoneScreen ctx={ctx} params={cur.params} />,
    passes: <PassesScreen ctx={ctx} />,
    formPed: <FormPed ctx={ctx} />,
    formAuto: <FormAuto ctx={ctx} />,
    formCargo: <FormAuto ctx={ctx} cargo />,
    formTemp: <FormTemp ctx={ctx} />,
    result: <ResultScreen ctx={ctx} params={cur.params} />,
    reqDecided: <ReqDecidedScreen ctx={ctx} params={cur.params} />,
    topup: <TopupScreen ctx={ctx} />,
    payment: <PaymentScreen ctx={ctx} params={cur.params} />,
    payResult: <PayResultScreen ctx={ctx} params={cur.params} />,
    history: <HistoryScreen ctx={ctx} />,
    usersTab: <UsersScreen ctx={ctx} />,
    userAdd: <UserAddScreen ctx={ctx} />,
    userAdded: <UserAddedScreen ctx={ctx} params={cur.params} />,
    account: <AccountScreen ctx={ctx} />,
    accountEdit: <AccountEditScreen ctx={ctx} />,
    editSent: <EditSentScreen ctx={ctx} />,
  }[cur.name];

  const showTabbar = role && !NO_TABBAR.has(cur.name);
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const unseenNotifs = notifications.filter((n) => !n.seen).length;
  const badges = { passes: role === "owner" ? pendingCount : 0, account: unseenNotifs, usersTab: 0, history: 0 };

  return (
    <div className="pk-root">
      <style>{CSS}</style>
      <div className="pk-stage">
        <div className="pk-phone">
          <div className={`pk-screen ${showTabbar ? "" : "bare"}`} key={stack.length + cur.name}>
            <div className="pk-fade">{SCREEN}</div>
          </div>
          {showTabbar && (
            <div className="pk-tabbar">
              {TABS[role].map((id) => {
                const m = TAB_META[id];
                const IconC = m.ic;
                const active = TAB_OF[cur.name] === id;
                return (
                  <button key={id} className={`pk-tab ${active ? "on" : ""}`} onClick={() => goTab(id)}>
                    {badges[id] > 0 && <span className="bdg">{badges[id]}</span>}
                    <IconC />
                    <span>{m.t}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className={`pk-toast ${toastMsg ? "show" : ""}`}>{toastMsg}</div>
        </div>
      </div>
    </div>
  );
}

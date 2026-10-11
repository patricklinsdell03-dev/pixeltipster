/* ============================================================================
   TOOLS AND MONEY PATHS
   Premium locks, "where to build this" links, email sign-up, the share image,
   referee pages and the bet returns calculator.
   ========================================================================== */

/* ---------- Premium locks (demo only: the live site checks the plan on the server) ----------
   Free: every sheet, team stats, strongest lines, first 3 players per stat, referee pages, calculator.
   Premium: all players, games filter, landed together, line finder past the top 3, bet tracker. */
const FREE_PLAYERS = 3, FREE_FINDER = 3;
const isPrem = () => A.plan === 'premium';
const lockCard = what => `<div class="card lock"><span class="ptile" style="background:#1a2233">${ico('star')}</span><h2>${what} is Premium</h2>`
  + `<p class="mu">Start a 14-day free trial to unlock it. Cancel any time.</p><a class="btn" href="#/premium">See Premium</a></div>`;
const blurred = (html, what) => isPrem() || !html ? html : `<div class="locked"><div class="blur" aria-hidden="true" inert>${html}</div>${lockCard(what)}</div>`;

/* ---------- Affiliate: where to build a bet builder (placeholders until programmes are live) ---------- */
const buildCard = () => `<div class="card" style="gap:10px"><h2>Where to build this</h2><p class="sm mu">Bet builders for this game are available at:</p>`
  + `<div class="books">${'ABCD'.split('').map(x => `<button class="btn btn2" disabled title="Links go live with the affiliate programmes">Bookmaker ${x}</button>`).join('')}</div>`
  + `<p class="sm mu">We may earn a commission if you join through these links. It never changes the stats. 18+. T&Cs apply. BeGambleAware.org</p></div>`;

/* ---------- Email sign-up (demo: nothing is sent or stored) ---------- */
const signupCard = () => A.signed
  ? `<div class="card signup"><h2>${ico('tick')} You're on the list</h2><p class="mu">Demo: sign-ups open with the live site, so your email wasn't sent or saved.</p></div>`
  : `<div class="card signup"><div><h2>The weekend sheets, free by email</h2><p class="mu">Every Friday: strongest lines and trend notes for the biggest games, with links to the full sheets. No tips. Unsubscribe any time.</p></div>`
    + `<div class="sform"><input id="email" type="email" placeholder="you@example.com" autocomplete="email" aria-label="Email address"${A.emailErr ? ' aria-invalid="true"' : ''}><button class="btn" data-a="signup" data-id="e">Sign me up</button></div>`
    + (A.emailErr ? `<p class="sm bad">That doesn't look like an email address.</p>` : '') + `<p class="sm mu">18+ only. We only use your email for this.</p></div>`;

/* ---------- Share image: a picture of a bet check, made in the browser ---------- */
async function shareImage(legs, together) {
  const W = 1080, rowH = 130, H = 330 + legs.length * rowH + (together.length ? 70 * together.length + 20 : 0) + 130;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  await Promise.all(['700 52px "Pixelify Sans"', '600 36px "IBM Plex Sans"', '400 26px "IBM Plex Sans"', '500 34px "IBM Plex Mono"'].map(f => document.fonts.load(f)));
  const fit = (t, max) => { if (g.measureText(t).width <= max) return t; while (t.length && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; };
  g.fillStyle = '#0d1320'; g.fillRect(0, 0, W, H);
  ['#1f56d6', '#19a974', '#f5b700', '#e5484d', '#7b3fe4'].forEach((col, i) => { g.fillStyle = col; g.fillRect(i * W / 5, 0, W / 5 + 1, 12); });
  g.font = '700 52px "Pixelify Sans"'; g.fillStyle = '#e8edf5'; g.fillText('PIXEL', 60, 100);
  g.fillStyle = '#6f9dff'; g.fillText('TIPSTER', 60 + g.measureText('PIXEL').width, 100);
  g.font = '600 40px "IBM Plex Sans"'; g.fillStyle = '#e8edf5'; g.fillText('My bet builder check', 60, 190);
  g.font = '400 26px "IBM Plex Sans"'; g.fillStyle = '#98a5b9'; g.fillText(fit([...new Set(legs.map(l => l.match))].join(' · '), W - 120), 60, 235);
  for (const [i, l] of legs.entries()) {
    const y = 290 + i * rowH, img = new Image();
    img.src = 'data:image/svg+xml,' + encodeURIComponent(shirtSVG(KITS[l.code] || ['#8a94a6', '#8a94a6', 'plain', '#8a94a6', '#ffffff']));
    await img.decode().catch(() => {});
    g.drawImage(img, 60, y, 70, 60);
    g.font = '600 32px "IBM Plex Sans"'; g.fillStyle = '#e8edf5'; g.fillText(fit(l.text, W - 380), 160, y + 28);
    g.font = '400 24px "IBM Plex Sans"'; g.fillStyle = '#98a5b9'; g.fillText(fit(l.match + ' · last 10 games', W - 380), 160, y + 64);
    g.font = '500 40px "IBM Plex Mono"'; g.fillStyle = l.r.hot ? '#3ccf91' : '#e8edf5'; g.textAlign = 'right'; g.fillText(`${l.r.n}/${l.r.N}`, W - 60, y + 40); g.textAlign = 'left';
    g.fillStyle = '#1c2638'; g.fillRect(160, y + 84, W - 220, 12);
    g.fillStyle = l.r.hot ? '#3ccf91' : '#6f7d93'; g.fillRect(160, y + 84, (W - 220) * l.r.pct / 100, 12);
  }
  let y = 290 + legs.length * rowH + 10;
  g.font = '500 28px "IBM Plex Sans"'; g.fillStyle = '#3ccf91';
  together.forEach(t => { g.fillText(fit(t, W - 120), 60, y + 30); y += 70; });
  g.font = '400 24px "IBM Plex Sans"'; g.fillStyle = '#98a5b9';
  g.fillText("Hit rates from each team's and player's last 10 games. Not a prediction.", 60, H - 80);
  g.fillText('18+ · BeGambleAware.org · Pixeltipster', 60, H - 44);
  return new Promise(res => c.toBlob(res, 'image/png'));
}

/* ---------- Referees ---------- */
function refsPage() {
  return pageHead('Referees', 'Cards and fouls in each referee\'s last 10 games. Cards are one of the biggest bet builder markets.')
    + demo('Demo: made-up referees and sample numbers.')
    + `<div class="card"><div class="tbl"><div class="tr th px" style="grid-template-columns:minmax(0,1fr) 90px 90px"><span>Referee</span><span class="r">Cards</span><span class="r">Fouls</span></div>`
    + REFS.map(r => { const d = refData(r.id); return `<a class="tr" style="grid-template-columns:minmax(0,1fr) 90px 90px" href="#/ref/${r.id}"><span class="withjer">${ico('card')}<span><b style="font-weight:600">${r.name}</b><br><span class="sm mu">${compDot(r.comp)}${r.comp}</span></span></span>`
      + `<span class="mono r">${avg(d.cards).toFixed(1)}</span><span class="mono r">${avg(d.fouls).toFixed(1)}</span></a>`; }).join('') + `</div><p class="sm mu" style="margin-top:10px">Per game, last 10 games.</p></div>`;
}
function refPage(id) {
  const r = REFS.find(x => x.id === id);
  if (!r) return notFoundPage();
  const d = refData(id), up = FIXTURES.filter(f => f.ref === id);
  const lineRow = l => { const n = d.cards.filter(v => v > l).length; return `<div class="tr" style="grid-template-columns:minmax(0,1fr) 70px"><span>Match cards over ${l}<span class="meter ${n >= 8 ? 'hot' : ''}" style="margin-top:6px"><i style="width:${n * 10}%"></i></span></span><b class="mono r ${n >= 8 ? 'g' : ''}">${n}/10</b></div>`; };
  return `<a class="back sm" href="#/refs">← All referees</a>` + pageHead(r.name, `${compDot(r.comp)}${r.comp} referee. Numbers from their last 10 games.`)
    + demo('Demo: a made-up referee with sample numbers.')
    + `<div class="tiles"><div class="card tile"><span class="px">Cards a game</span><b class="mono">${avg(d.cards).toFixed(1)}</b></div><div class="card tile"><span class="px">Fouls a game</span><b class="mono">${avg(d.fouls).toFixed(1)}</b></div>`
    + `<div class="card tile"><span class="px">Red cards</span><b class="mono">${d.reds.reduce((a, b) => a + b, 0)}</b></div><div class="card tile"><span class="px">Penalties given</span><b class="mono">${d.pens.reduce((a, b) => a + b, 0)}</b></div></div>`
    + `<div class="split"><div class="card"><h2 style="padding-bottom:6px">Match cards lines</h2><div class="tbl">${[2.5, 3.5, 4.5, 5.5, 6.5].map(lineRow).join('')}</div></div>`
    + `<div class="card" style="gap:10px"><h2>Game by game</h2>${LEGEND.replace('Green landed, faded is left out.', 'Cards per game.')}<div class="chips mono">${d.cards.map(v => `<i class="${v > 4.5 ? 'y' : ''}">${v}</i>`).join('')}</div>`
    + `<div class="tbl">${d.games.map((g, i) => `<div class="tr" style="grid-template-columns:70px minmax(0,1fr) 60px 60px"><span class="mono sm mu">${g.date}</span><span>${g.match} <span class="sm mu">${g.comp}</span></span><span class="mono r">${d.cards[i]} <span class="sm mu">cards</span></span><span class="mono r mu">${d.fouls[i]}</span></div>`).reverse().join('')}</div></div></div>`
    + (up.length ? `<div class="card"><h2 style="padding-bottom:6px">Next games</h2>${up.map(fxRow).join('')}</div>` : '');
}

/* ---------- Bet returns calculator: users type their own prices; the site shows none ---------- */
const CALC_TYPES = { Single: [1, [1]], Double: [2, [2]], Treble: [3, [3]], Acca: [0, 0], Trixie: [3, [2, 3]], Patent: [3, [1, 2, 3]], Yankee: [4, [2, 3, 4]], 'Lucky 15': [4, [1, 2, 3, 4]], 'Lucky 31': [5, [1, 2, 3, 4, 5]] };
function kCombos(n, k) { const out = [], go = (s, cur) => { if (cur.length === k) return out.push(cur); for (let i = s; i < n; i++) go(i + 1, [...cur, i]); }; go(0, []); return out; }
const parsePrice = t => { t = String(t).trim().toLowerCase(); if (t === 'evs' || t === 'evens') return 2; const m = t.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/); if (m) return 1 + m[1] / m[2]; const d = parseFloat(t); return d >= 1 && /^\d+(\.\d+)?$/.test(t) ? d : NaN; };
function calcResult() {
  const C = A.calc, [fixed, sizes0] = CALC_TYPES[C.type], n = fixed || C.n, sizes = sizes0 || [n];
  const sel = C.sels.slice(0, n).map(s => ({ d: parsePrice(s.p), r: s.r })), stake = parseFloat(C.stake);
  if (!(stake > 0)) return { err: 'Enter a stake.' };
  if (sel.some(s => !(s.d >= 1) && s.r !== 'Void')) return { err: 'Enter a price for every selection, like 5/2, evens or 3.5.' };
  const win = s => s.r === 'Won' ? s.d : s.r === 'Void' ? 1 : 0;
  const place = s => s.r === 'Won' || s.r === 'Placed' ? 1 + (s.d - 1) * C.frac : s.r === 'Void' ? 1 : 0;
  const bets = sizes.flatMap(k => kCombos(n, k));
  const ret = bets.reduce((t, c) => t + stake * c.reduce((m, i) => m * win(sel[i]), 1) + (C.ew ? stake * c.reduce((m, i) => m * place(sel[i]), 1) : 0), 0);
  const total = bets.length * stake * (C.ew ? 2 : 1);
  return { bets: bets.length * (C.ew ? 2 : 1), total, ret, pl: ret - total };
}
const calcOut = () => { const r = calcResult(); return r.err ? `<p class="mu">${r.err}</p>`
  : `<div class="tiles"><div class="card tile"><span class="px">Bets</span><b class="mono">${r.bets}</b></div><div class="card tile"><span class="px">Total stake</span><b class="mono">${money(r.total)}</b></div>`
    + `<div class="card tile"><span class="px">Returns</span><b class="mono">${money(r.ret)}</b></div><div class="card tile"><span class="px">Profit or loss</span><b class="mono ${r.pl < 0 ? 'bad' : 'g'}">${money(r.pl)}</b></div></div>`; };
function calcPage() {
  const C = A.calc, [fixed] = CALC_TYPES[C.type], n = fixed || C.n;
  while (C.sels.length < 12) C.sels.push({ p: '', r: 'Won' });
  const results = C.ew ? ['Won', 'Placed', 'Lost', 'Void'] : ['Won', 'Lost', 'Void'];
  return pageHead('Bet returns calculator', 'Work out what a bet pays. Type in the prices from your bet slip: fractions like 5/2, evens, or decimals like 3.5.')
    + `<div class="pills" data-k="ctype">${Object.keys(CALC_TYPES).map(t => pill('ctype', t, t)).join('')}</div>`
    + `<div class="split"><div class="card" style="gap:14px"><div class="form">`
    + `<label>Stake per bet (£)<input id="calc-stake" type="number" min="0" step="0.1" inputmode="decimal" value="${esc(C.stake)}"></label>`
    + (C.type === 'Acca' ? `<label>Selections<span class="step" style="min-height:44px"><button data-a="cn" data-id="n" data-d="-1" aria-label="Fewer selections">-</button><span class="mono">${C.n}</span><button data-a="cn" data-id="n" data-d="1" aria-label="More selections">+</button></span></label>` : '')
    + `<label>Each way<button class="sw" style="border:0;padding:0;min-height:44px" data-a="cew" data-id="ew" aria-pressed="${C.ew}"><span>${C.ew ? 'On' : 'Off'}</span><i></i></button></label>`
    + (C.ew ? `<label>Place terms<select id="calc-frac">${[[1 / 4, '1/4 odds'], [1 / 5, '1/5 odds']].map(([v, l]) => `<option value="${v}"${C.frac === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>` : '') + `</div>`
    + `<div class="tbl">${C.sels.slice(0, n).map((s, i) => `<div class="tr" style="grid-template-columns:110px minmax(0,1fr) minmax(0,1fr)"><span class="sm mu">Selection ${i + 1}</span>`
      + `<input id="calc-p-${i}" value="${esc(s.p)}" placeholder="e.g. 5/2" aria-label="Price for selection ${i + 1}" autocomplete="off"><select id="calc-r-${i}" aria-label="Result for selection ${i + 1}">${results.map(x => `<option${s.r === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>`).join('')}</div></div>`
    + `<div style="display:flex;flex-direction:column;gap:12px"><div id="calcout">${calcOut()}</div><p class="sm mu">Leaves out bookmaker bonuses, Rule 4 deductions and dead heats, so check your bet slip for the final figure.</p></div></div>`;
}

/* ============================================================================
   PIXELTIPSTER SITE
   Hash routes (#/finder, #/match/liv-mci ...), the site bars, and every page
   except the match sheet itself (sheet.js). Bet check legs, tracker bets,
   alert choices and the theme are saved in this browser only.
   ========================================================================== */
const store = {
  get: (k, d) => { try { const v = localStorage.getItem('pt.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('pt.' + k, JSON.stringify(v)); } catch {} }
};
const A = {
  slip: store.get('slip', []), bets: store.get('bets', null),
  alerts: store.get('alerts', { lineups: true, refs: true, trends: false, finder: false, tg: true, email: false }),
  comp: 'All', day: 'All', big: false, mine: false, q: '', fcomp: 'All', fkind: 'all', ftab: 'form', otab: 'signup',
  plan: store.get('plan', 'free'), favs: store.get('favs', []), entry: store.get('entry', null), signed: false, emailErr: false, share: null,
  calc: { type: 'Lucky 15', n: 5, ew: false, frac: 0.25, stake: '1', sels: [] }, open: {}, systems: store.get('systems', []),
  bt: { sport: 'football', tried: 0, lastKey: '', res: null,
    fb: { market: 'Over 2.5 goals', league: 'All', hgf: '', agc: '', tg: '', hc: '', pmin: '', pmax: '', comm: 2 },
    rc: { market: 'Win', code: 'All', type: 'All', going: 'All', fav: 'Any', flags: { C: false, D: false, G: false, TF: false }, days: 'Any', field: 'Any', bmin: '', bmax: '', comm: 5, marg: 15 } }
};
const save = () => { store.set('slip', A.slip); store.set('bets', A.bets); store.set('alerts', A.alerts); };

/* ---------- Shell ---------- */
const NAV = [['', 'Football', 'cal'], ['racing', 'Racing', 'horse'], ['tester', 'Backtester', 'flask'], ['tracker', 'Bet tracker', 'chart'], ['challenge', 'Challenge', 'trophy'], ['offers', 'Offers', 'gift']];
const NAV_MORE = [['finder', 'Line finder'], ['calc', 'Returns calculator'], ['refs', 'Referees'], ['alerts', 'Alerts'], ['premium', 'Free and Premium'], ['how', 'How the numbers work'], ['safer', 'Safer gambling']];
/* page icon tiles: route -> [icon, colour] */
const PAGE_ICO = { finder: ['search', '#1f56d6'], check: ['chart', '#7b3fe4'], tracker: ['chart', '#7b3fe4'], offers: ['gift', '#e5484d'], alerts: ['bell', '#e08a00'], calc: ['calc', '#19a974'], challenge: ['trophy', '#e08a00'], racing: ['horse', '#8e1f2f'], race: ['horse', '#8e1f2f'], tester: ['flask', '#7b3fe4'], refs: ['card', '#1a2233'], ref: ['card', '#1a2233'], premium: ['star', '#1a2233'], how: ['info', '#1f56d6'], safer: ['shield', '#0b8a5c'], more: ['menu', '#1f56d6'] };
const BNAV = [['', 'Football', 'cal'], ['racing', 'Racing', 'horse'], ['tester', 'Tester', 'flask'], ['tracker', 'Tracker', 'chart'], ['more', 'More', 'menu']];
const TITLES = { '': 'Football', racing: 'Racing', race: 'Race', tester: 'Backtester', finder: 'Line finder', check: 'Bet tracker', tracker: 'Bet tracker', offers: 'Offers', alerts: 'Alerts', calc: 'Bet returns calculator', challenge: 'Weekly challenge', refs: 'Referees', ref: 'Referee', premium: 'Premium', how: 'How the numbers work', safer: 'Safer gambling', more: 'More' };
const route = () => { const [p = '', id] = location.hash.replace(/^#\/?/, '').split('/'); return { p, id }; };
const navOn = (k, p) => k === p || (k === 'tracker' && p === 'check') || (k === '' && p === 'match') || (k === 'racing' && p === 'race') || (k === 'more' && ['finder', 'tracker', 'calc', 'refs', 'ref', 'challenge', 'offers', 'alerts', 'premium', 'how', 'safer'].includes(p));
const cur = (k, p) => navOn(k, p) ? ' class="on" aria-current="page"' : '';
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
const slipCount = () => A.slip.length ? `<span class="count">${A.slip.length}</span>` : '';

const topBar = p => `<header class="site-top"><div class="in"><a class="logo" href="#/" aria-label="Pixeltipster home">${ico('ball')}<b style="font-weight:inherit">PIXEL<span>TIPSTER</span></b></a>`
  + `<nav class="nav" aria-label="Main">${NAV.map(([k, l, i]) => `<a href="#/${k}"${cur(k, p)}>${ico(i)}${l}${k === 'tracker' ? slipCount() : ''}</a>`).join('')}`
  + `<details class="navmore"><summary${NAV_MORE.some(([k]) => k === p || (k === 'refs' && p === 'ref')) ? ' class="on"' : ''}>More</summary><div class="menu">${NAV_MORE.map(([k, l]) => `<a href="#/${k}">${l}</a>`).join('')}</div></details></nav>`
  + `<div class="top-r"><button class="planbtn hide-m" data-a="plan" data-id="p" title="Demo only: see the site as a free or Premium member">Demo view: <b>${isPrem() ? 'Premium' : 'Free'}</b></button>`
  + `<a class="icon btn btn2" href="#/alerts" aria-label="Alerts">${ico('bell')}</a><button class="icon ghost" data-a="theme" data-id="t" aria-label="Switch to ${isDark() ? 'light' : 'dark'} mode">${ico(isDark() ? 'sun' : 'moon')}</button>`
  + `<a class="btn hide-m" href="#/premium">${ico('star')}Go Premium</a></div></div><div class="pixstrip"></div></header>`;
const bottomNav = p => `<nav class="bnav" aria-label="Main">${BNAV.map(([k, l, i]) => `<a href="#/${k}"${cur(k, p)} style="position:relative">${ico(i)}${l}${k === 'tracker' ? slipCount() : ''}</a>`).join('')}</nav>`;
const footer = () => `<footer class="foot"><div><b>18+</b> · Please gamble responsibly · <a href="#/safer">Safer gambling</a> · <a href="#/how">How the numbers work</a> ·<a href="https://www.begambleaware.org" target="_blank" rel="noopener">BeGambleAware.org</a></div>`
  + `<div class="mu sm">Pixeltipster publishes statistics about past matches. We don't take bets, give tips or predict results. This demo uses sample data.</div></footer>`;
const pageHead = (title, sub, extra = '') => { const [i, c] = PAGE_ICO[route().p] || []; return `<div class="head"><div>${i ? `<span class="ptile" style="background:${c}">${ico(i)}</span>` : ''}<h1>${title}</h1>${sub ? `<p class="mu" style="margin-top:6px">${sub}</p>` : ''}</div>${extra}</div>`; };
const demo = txt => `<div class="note">${txt}</div>`;
const pill = (k, v, l) => `<button data-a="${k}" data-id="${v}" class="${A[k] == v ? 'on' : ''}" aria-pressed="${A[k] == v}">${l}</button>`;

/* ---------- Fixtures ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dayName = d => { const n = Math.round((new Date(d) - new Date(TODAY)) / 864e5); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : fmtDate(d); };
const favBtn = (code, name) => { const on = A.favs.includes(code); return `<button class="fav ${on ? 'faved' : ''}" data-a="fav" data-id="${code}" aria-pressed="${on}">${ico('star')}${on ? 'Following' : 'Follow'} ${name}</button>`; };
const fxBadges = f => ([f.hc, f.ac].some(c => A.favs.includes(c)) ? `<span class="badge big">${ico('star')}Your team</span>` : '') + (f.status === 'postponed' ? `<span class="badge bad">Postponed</span>` : '') + (f.lineups ? `<span class="badge good">Line-ups in</span>` : '') + (f.big ? `<span class="badge big">${ico('star')}Big game</span>` : '');
const fxRow = f => `<a class="fxrow" href="#/match/${f.id}"><span class="mono fxko">${f.ko}</span><span class="fxteams"><span class="fxteam">${jer(f.hc)}<b>${f.home}</b></span><span class="fxteam">${jer(f.ac)}<b>${f.away}</b></span></span><span class="fxb">${fxBadges(f)}</span>${ico('arrow')}</a>`;
function fixtureList() {
  const q = A.q.trim().toLowerCase();
  const list = FIXTURES.filter(f => (A.comp === 'All' || f.comp === A.comp) && (A.day === 'All' || f.date === A.day) && (!A.big || f.big) && (!A.mine || [f.hc, f.ac].some(c => A.favs.includes(c))) && (!q || (f.home + ' ' + f.away).toLowerCase().includes(q))).sort((a, b) => a.ko.localeCompare(b.ko));
  if (!list.length) return `<div class="card mu">${A.mine && !A.favs.length ? 'Follow teams from any sheet and their games show up here.' : 'No fixtures match. Try another day, competition or team.'}</div>`;
  return [...new Set(list.map(f => f.date))].map(d => `<section class="fxday"><h2>${dayName(d)}${dayName(d) !== fmtDate(d) ? ` <span class="mu" style="font-weight:400">${fmtDate(d)}</span>` : ''}</h2>`
    + [...new Set(list.filter(f => f.date === d).map(f => f.comp))].map(c => `<div class="card fxcomp"><div class="px">${compDot(c)}${c}</div>`
      + list.filter(f => f.date === d && f.comp === c).map(fxRow).join('') + `</div>`).join('') + `</section>`).join('');
}
function fixturesPage() {
  const comps = ['All', ...new Set(FIXTURES.map(f => f.comp))], days = ['All', ...new Set(FIXTURES.map(f => f.date))];
  return `<section class="card hero"><div><div class="kits" aria-hidden="true">${Object.keys(KITS).map(k => jer(k)).join('')}</div><h1>Stat sheets for every bet builder</h1><p class="mu">Hit rates from each team's and player's recent games, grouped the way bookmakers group their bet builder markets. Facts about past games, never tips.</p>`
    + `<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><a class="btn" href="#/match/liv-mci">See an example sheet</a><a class="btn btn2" href="#/how">How the numbers work</a></div></div>`
    + `<ul class="trust">${['Every number links to the games behind it', 'Leave out cup games or freak results', 'No odds, no tips, no predictions', 'Every sheet free to open, no card needed'].map(t => `<li>${ico('tick')}${t}</li>`).join('')}</ul></section>`
    + demo('Demo: fixtures and numbers are sample data until the live feed is connected.') + signupCard() + challengeBanner()
    + `<div class="card fxfilters"><div class="fxsearch"><input id="fxq" type="search" placeholder="Search for a team" value="${esc(A.q)}" aria-label="Search fixtures by team" autocomplete="off">`
    + `<button data-a="big" data-id="b" class="${A.big ? 'on' : ''}" aria-pressed="${A.big}">${ico('star')}Big games</button><button data-a="mine" data-id="m" class="${A.mine ? 'on' : ''}" aria-pressed="${A.mine}">My teams${A.favs.length ? ` (${A.favs.length})` : ''}</button></div>`
    + `<div class="pills" data-k="fxday">${days.map(d => `<button data-a="fxday" data-id="${d}" class="${A.day === d ? 'on' : ''}" aria-pressed="${A.day === d}">${d === 'All' ? 'All days' : dayName(d)}</button>`).join('')}</div>`
    + `<div class="pills" data-k="fxcomp">${comps.map(c => `<button data-a="fxcomp" data-id="${c}" class="${A.comp === c ? 'on' : ''}" aria-pressed="${A.comp === c}">${c === 'All' ? 'All competitions' : compDot(c) + c}</button>`).join('')}</div></div>`
    + `<div id="fxlist">${fixtureList()}</div>`;
}

function matchPage(id) {
  if (!FIXTURES.some(f => f.id === id)) return notFoundPage();
  openFixture(id);
  return sheetHTML();
}

/* ---------- Line finder: what a plain hit rate hides ----------
   form     last 5 average far from the 5 before
   match    opponent allows far more or less than this team usually gets
   stretch  highest line that landed in 7-9 of 10 (every-game lines left out), furthest above the average first */
const FTABS = { form: 'Form changes', match: 'Matchups', stretch: 'Stretch lines' };
function finderRows() {
  const out = { form: [], match: [], stretch: [] };
  FIXTURES.filter(f => f.status !== 'postponed').forEach(f => withFixture(f.id, () => {
    const miss = DATA.fixture.missing || [];
    T.forEach((t, ti) => {
      const stats = [];
      t.groups.filter(g => !miss.includes(g.name)).forEach(g => g.stats.filter(s => s.core && s.mode === 'over').forEach(s => stats.push({ s, who: t.name, team: 1 })));
      t.players.forEach(p => p.stats.filter(s => s.core && s.mode === 'plus').forEach(s => stats.push({ s, who: p.name, team: 0 })));
      stats.forEach(({ s, who, team }) => {
        const base = { f, code: t.code, team, who, label: s.label.toLowerCase() }, a10 = avg(s.vals);
        const prev = avg(s.vals.slice(0, 5)), last = avg(s.vals.slice(5)), diff = last - prev, rel = Math.abs(diff) / Math.max(prev, 0.5);
        if (Math.abs(diff) >= (team ? 1.5 : 0.8) && rel >= 0.4) out.form.push({ ...base, prev, last, diff, sort: rel });
        if (team && s.opp) { const r = s.opp / a10; if (r >= 1.25 || r <= 0.75) out.match.push({ ...base, opp: T[1 - ti].name, mine: a10, allow: s.opp, r, sort: Math.abs(Math.log(r)) }); }
        for (let l = s.mode === 'over' ? Math.max(...s.vals) - 0.5 : Math.max(...s.vals); l > 0; l--) {
          const n = s.vals.filter(hitFn(s, l)).length;
          if (n >= 7) { if (n < 10) out.stretch.push({ ...base, l, n, a10, line: lineName(s, l), sort: (l - a10) / Math.max(a10, 0.5) + n / 100 }); break; }
        }
      });
    });
  }));
  Object.values(out).forEach(a => a.sort((x, y) => y.sort - x.sort));
  return out;
}
function finderPage() {
  const all = finderRows(), comps = ['All', ...new Set(FIXTURES.map(f => f.comp))], tab = A.ftab;
  const list = all[tab].filter(x => (A.fcomp === 'All' || x.f.comp === A.fcomp) && (tab === 'match' || A.fkind === 'all' || (A.fkind === 'team') === !!x.team));
  const row = (x, main, right) => `<a class="tr" style="grid-template-columns:minmax(0,1fr) auto" href="#/match/${x.f.id}"><span class="withjer">${jer(x.code)}<span><b style="font-weight:600">${main}</b><br>`
    + `<span class="sm mu">${x.f.home} v ${x.f.away} · ${x.f.comp} · ${dayName(x.f.date)}</span></span></span><span class="mono r">${right}</span></a>`;
  const rows = tab === 'form' ? list.map(x => row(x, `${x.who}: ${x.label}`, `${x.prev.toFixed(1)} → <b class="${x.diff > 0 ? 'g' : 'bad'}">${x.last.toFixed(1)}</b>`))
    : tab === 'match' ? list.map(x => row(x, `${x.who}: ${x.label}`, `${x.mine.toFixed(1)} v <b class="${x.r > 1 ? 'g' : 'bad'}">${x.allow.toFixed(1)}</b>`))
    : list.map(x => row(x, `${x.who}: ${x.line.toLowerCase()} ${x.label}`, `<b class="g">${x.n}/10</b><br><span class="sm mu">avg ${x.a10.toFixed(1)}</span>`));
  const head = { form: ['Average: 5 before', 'last 5'], match: ['Team gets', 'opponent allows'], stretch: ['Hits', 'average'] }[tab];
  const explain = {
    form: 'Stats where the last 5 games moved a long way from the 5 before. A 10-game hit rate is slow to show changes like these.',
    match: "Team stats where the opponent gives away at least 25% more or less than this team usually gets, per game.",
    stretch: 'For each stat, the highest line that landed in 7, 8 or 9 of the last 10, furthest above the average first. Lines that landed every game are left out.'
  }[tab];
  return pageHead('Line finder <span class="prem">Premium</span>', 'What a plain hit rate hides, across every fixture on the site. Open any row to see the games behind it.')
    + demo('Demo: sample data. Free to use while the site is in testing.')
    + `<div class="pills" data-k="ftab">${Object.entries(FTABS).map(([k, l]) => pill('ftab', k, l)).join('')}</div>`
    + `<div class="card" style="gap:12px"><p>${explain}</p><div class="pills" data-k="fcomp">${comps.map(c => pill('fcomp', c, c === 'All' ? 'All competitions' : compDot(c) + c)).join('')}</div>`
    + (tab === 'match' ? '' : `<div class="pills">${[['all', 'Teams and players'], ['team', 'Teams'], ['player', 'Players']].map(([v, l]) => pill('fkind', v, l)).join('')}</div>`) + `</div>`
    + `<div class="card"><div class="tbl"><div class="tr th px" style="grid-template-columns:minmax(0,1fr) auto"><span>${list.length} found</span><span class="r">${head[0]} → ${head[1]}</span></div>`
    + ((isPrem() ? rows.slice(0, 50).join('') : rows.slice(0, FREE_FINDER).join('') + blurred(rows.slice(FREE_FINDER, 12).join(''), 'The full line finder')) ||`<div class="tr mu">Nothing matches these filters.</div>`)
    + (rows.length > 50 ? `<div class="tr sm mu">Showing the top 50. Pick a competition to narrow the list.</div>` : '') + `</div></div>`;
}

/* ---------- How the numbers work ---------- */
function howPage() {
  const sec = (t, b) => `<div class="card" style="gap:8px"><h2>${t}</h2>${b}</div>`;
  return pageHead('How the numbers work', 'What every number on a sheet means, and where it comes from.')
    + `<div class="split">`
    + sec('Where the data comes from', `<p>On the live site, match and player stats will come from a football data provider, most likely API-Football. Scripts build each sheet from that data. Nobody edits the numbers by hand.</p><p class="mu sm">This demo uses made-up sample data.</p>`)
    + sec('Lines and hits', `<p><b>Over 2.5</b> means 3 or more. <b>1+</b> means at least 1. A <b>hit</b> is a game where the line was reached, so <b>8/10</b> means it was reached in 8 of the last 10 games.</p>`)
    + sec('Last 10 and last 5', `<p>Every stat uses the team's or player's last 10 games in all competitions. <b>Last 5</b> is the most recent half, to show whether something has changed lately.</p>`)
    + sec('Leaving games out', `<p>The games filter drops a competition or a single game, such as a freak result. Every hit rate, average and strongest line then uses only the games you kept, which is why you may see 7/9 instead of 7/10.</p>`)
    + sec('Strongest lines', `<p>A line appears in a sheet's Strongest lines box when it landed in at least 80% of the selected games and in 4 of the last 5.</p>`)
    + sec('Averages, venue and opponent', `<p><b>Average</b> is per game across the selected games. <b>At home</b> or <b>Away</b> is the average at this game's venue. <b>Allow</b> is how many the opponent gives away per game. When that's clearly more or fewer than the team usually gets, the sheet says which way it leans.</p>`)
    + sec('Updates and line-ups', `<p>Sheets will be rebuilt each morning and again when line-ups are confirmed. Player stats appear once line-ups are in. Every sheet shows when it was last updated.</p>`)
    + sec('Missing stats', `<p>Some competitions don't record every stat. When a stat is missing we leave that market out and say so, rather than guess.</p>`)
    + sec('Trends', `<p>Trend notes are written for the biggest games, using only stats from that game's data. They point out changes the 10-game numbers can hide, such as a player moving position.</p>`)
    + sec("What we don't do", `<p>We don't show odds, give tips or predict results. A hit rate is a fact about past games. It doesn't make a bet more likely to win.</p>`)
    + `</div>`;
}

/* ---------- Bet check (a tab of the bet tracker) ---------- */
const addLegBtn = spec => A.slip.includes(spec)
  ? `<button class="addleg done ghost" data-a="addleg" data-id="${spec}">${ico('tick')} In your bet check</button>`
  : `<button class="addleg ghost" data-a="addleg" data-id="${spec}">+ Add to bet check</button>`;
/* spec = fixture|t|group|stat|team|line or fixture|p|team|player|statKey|line */
function legInfo(spec) {
  const [fx, kind, a, b, c, ln] = spec.split('|'), line = ln === 'null' ? null : +ln;
  return withFixture(fx, () => {
    const t = kind === 't', ti = t ? +c : +a, st = t ? T[ti].groups[+a].stats[+b] : T[ti].players[+b].stats.find(s => s.key === c);
    const who = t ? T[ti].name : T[ti].players[+b].name;
    return { spec, fx, ti, st, team: T[ti].name, code: T[ti].code, match: DATA.fixture.name, r: rate(st, ti, line), text: `${who}: ${isCount(st) ? lineName(st, line).toLowerCase() + ' ' : ''}${st.label.toLowerCase()}` };
  });
}
function checkBody() {
  const legs = A.slip.map(legInfo), groups = {};
  legs.forEach(l => (groups[l.fx + '|' + l.ti] ??= []).push(l));
  const clashes = legs.filter(l => l.st.key === 'cs' && legs.some(m => m.fx === l.fx && (m.st.key === 'btts' || (m.ti === l.ti && m.st.key === 'conceded') || (m.ti !== l.ti && m.st.key === 'goals'))))
    .map(l => `"${l.text}" can't land in the same game as a leg that needs ${l.team}'s opponents to score.`);
  A.together = [];
  const together = Object.values(groups).filter(g => g.length > 1).map(g => {
    const n = [...Array(10).keys()].filter(i => g.every(l => l.r.f(l.st.vals[i]))).length;
    A.together.push(`All ${g.length} ${g[0].team} legs landed together in ${n} of their last 10 games`);
    return `<div class="box" style="display:flex;flex-direction:column;gap:6px"><span>All ${g.length} ${g[0].team} legs landed together in <b class="mono">${n}/10</b> of their last 10 games.</span><span class="meter"><i style="width:${n * 10}%;background:var(--g);opacity:1"></i></span></div>`;
  });
  const cols = 'grid-template-columns:minmax(0,1fr) 56px 44px';
  return `<div class="head"><p class="mu">Add legs from any sheet to see how often each one landed, and how often they landed together. Then log it as a bet.</p>${legs.length ? `<span style="display:flex;gap:8px"><button data-a="logslip" data-id="l">Log this as a bet</button><button data-a="clearslip" data-id="c">Clear all legs</button></span>` : ''}</div>`
    + demo('Demo: sample data. Your legs are saved in this browser only.')
    + (!legs.length ? `<div class="card" style="gap:12px;align-items:flex-start"><h2>No legs yet</h2><p class="mu">Open a sheet, tap any stat and choose "Add to bet check".</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/">Browse fixtures</a><button data-a="demolegs" data-id="d">Try an example</button></div></div>`
      : `<div class="split"><div class="card"><h2 style="padding-bottom:6px">Each leg on its own</h2><div class="tbl">${legs.map(l => `<div class="tr" style="${cols}"><span class="withjer">${jer(l.code)}<span style="flex:1"><b style="font-weight:600">${l.text}</b><br><span class="sm mu">${l.match} · last 10 games</span>`
        + `<span class="meter ${l.r.hot ? 'hot' : ''}" style="margin-top:6px;display:block"><i style="width:${l.r.pct}%"></i></span></span></span><b class="mono r ${l.r.hot ? 'g' : ''}">${l.r.n}/${l.r.N}</b><button class="icon ghost" data-a="rmleg" data-id="${l.spec}" aria-label="Remove this leg">×</button></div>`).join('')}</div></div>`
        + `<div style="display:flex;flex-direction:column;gap:20px">${clashes.length ? `<div class="card" style="gap:8px;border-color:var(--bad)"><h2 class="bad">Clash found</h2>${clashes.map(c => `<p>${c}</p>`).join('')}</div>` : ''}`
        + blurred(`<div class="card" style="gap:10px"><h2>Landed together</h2>${together.join('') || `<p class="mu">Add two or more legs on the same team to see how often they landed in the same game.</p>`}`
        + `<p class="sm mu">Legs on different teams can't be combined this way, because each team's last 10 games are different matches.</p></div>`, 'Landed together') + `</div></div>`
        + `<div class="card share" style="gap:12px"><h2>Share it</h2><p class="mu">Make a picture of this check for WhatsApp, Telegram or X.</p>`
        + (A.share ? `<img src="${A.share}" alt="Picture of your bet check with each leg's hit rate"><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="${A.share}" download="pixeltipster-bet.png">Download picture</a>`
          + (navigator.canShare ? `<button data-a="sharefile" data-id="s">Share</button>` : '') + `</div>` : `<button class="btn" data-a="share" data-id="s" style="align-self:flex-start">Make picture</button>`) + `</div>`
        + `<a class="btn btn2" href="#/challenge" style="align-self:flex-start">${ico('trophy')}Enter these legs in the weekly challenge</a>` + buildCard());
}

/* ---------- Bet tracker ---------- */
const SAMPLE_BETS = [
  ['2026-10-04', 'Bookmaker A', 'Bet builder', 5, 6.5, 'Lost'], ['2026-10-04', 'Bookmaker B', 'Acca', 2, 14, 'Lost'], ['2026-10-03', 'Bookmaker A', 'Single', 10, 1.9, 'Won'],
  ['2026-09-28', 'Bookmaker C', 'Lucky 15', 7.5, 3.2, 'Won'], ['2026-09-27', 'Bookmaker A', 'Bet builder', 5, 4.33, 'Won'], ['2026-09-27', 'Bookmaker B', 'Acca', 2, 22, 'Lost'],
  ['2026-09-21', 'Bookmaker C', 'Single', 10, 2.1, 'Lost'], ['2026-09-20', 'Bookmaker A', 'Bet builder', 5, 8, 'Lost'], ['2026-09-20', 'Bookmaker B', 'Single', 10, 1.8, 'Won'],
  ['2026-09-14', 'Bookmaker C', 'Lucky 15', 7.5, 2, 'Lost']
].map(([date, bk, type, stake, odds, res]) => ({ date, bk, type, stake, odds, res }));
const START = { 'Bookmaker A': 50, 'Bookmaker B': 40, 'Bookmaker C': 60 };   // sample starting balances
const TYPES = ['Bet builder', 'Single', 'Acca', 'Lucky 15', 'Other'];
/* Sample single bets with the market and its base rate (how often that line landed for those teams in their
   last 10 when the bet was placed). On the live site, bets added from a sheet record the base rate themselves. */
const MARKETS = [['Over 2.5 goals', 0.48, 0.06], ['Both teams to score', 0.52, -0.04], ['Match corners over 9.5', 0.45, 0.03], ['Player 1+ shots on target', 0.6, -0.07], ['Team cards over 1.5', 0.55, 0.01]];
(() => {
  const r = rng(hash('sample-bets'));
  for (let i = 0; i < 100; i++) {
    const [market, base, d] = MARKETS[i % 5];
    SAMPLE_BETS.push({ date: new Date(Date.UTC(2026, 7, 16) + i * 0.55 * 864e5).toISOString().slice(0, 10), bk: 'Bookmaker ' + 'ABC'[i % 3], type: 'Single', stake: 5,
      odds: +(1 / (base * 1.07) + (r() - 0.5) * 0.2).toFixed(2), res: r() < base + d ? 'Won' : 'Lost', market, base: +(base + (r() - 0.5) * 0.1).toFixed(2) });
  }
  SAMPLE_BETS.sort((a, b) => b.date.localeCompare(a.date));
})();
/* Edge report: landed rate vs base rate per market. Gaps under 2 standard errors are labelled as possibly luck. */
function edgeReport(done) {
  const m = {};
  done.filter(b => b.market && b.base && b.res !== 'Void').forEach(b => { const x = m[b.market] ??= { n: 0, won: 0, base: 0, st: 0, ret: 0 }; x.n++; x.won += b.res === 'Won'; x.base += b.base; x.st += b.stake; x.ret += back(b); });
  const rows = Object.entries(m).map(([k, x]) => { const p = x.won / x.n, b = x.base / x.n; return { k, n: x.n, p, b, gap: p - b, roi: (x.ret - x.st) / x.st, sure: Math.abs(p - b) / Math.sqrt(b * (1 - b) / x.n) >= 2 }; }).sort((a, b) => b.gap - a.gap);
  if (!rows.length) return '';
  const pc = v => Math.round(v * 100) + '%', cols = 'grid-template-columns:minmax(0,1fr) 54px 70px 70px 70px 76px';
  return `<div class="card"><h2>Your edge report</h2><p class="mu" style="margin:6px 0 10px">How often your picks landed, against the base rate: how often that line landed for those teams in their last 10 games when you placed the bet. Beating the base rate is the honest test of whether you're picking well.</p>`
    + `<div class="mxwrap"><div class="tbl" style="min-width:560px"><div class="tr th px" style="${cols}"><span>Market</span><span class="r">Picks</span><span class="r">Landed</span><span class="r">Base rate</span><span class="r">Gap</span><span class="r">Return</span></div>`
    + rows.map(x => `<div class="tr" style="${cols}"><span>${x.k}<br><span class="sm ${x.sure ? (x.gap > 0 ? 'g' : 'bad') : 'mu'}">${x.sure ? (x.gap > 0 ? 'Clearly above the base rate' : 'Clearly below the base rate') : 'Gap this size could easily be luck'}</span></span>`
      + `<span class="mono r">${x.n}</span><span class="mono r">${pc(x.p)}</span><span class="mono r mu">${pc(x.b)}</span><b class="mono r ${x.gap > 0 ? 'g' : 'bad'}">${x.gap > 0 ? '+' : ''}${Math.round(x.gap * 100)}</b><span class="mono r ${x.roi < 0 ? 'bad' : 'g'}">${x.roi > 0 ? '+' : ''}${Math.round(x.roi * 100)}%</span></div>`).join('')
    + `</div></div><p class="sm mu" style="margin-top:10px">Gap is in percentage points. Return is profit as a share of stakes, at your own prices. Small samples swing a lot: you need dozens of picks per market before a gap means much.</p></div>`;
}
const back = b => b.res === 'Won' ? b.stake * b.odds : b.res === 'Void' ? b.stake : 0;
const money = v => (v < 0 ? '-£' : '£') + Math.abs(v).toFixed(2);
function logBody() {
  const sample = A.bets === null, bets = sample ? SAMPLE_BETS : A.bets, done = bets.filter(b => b.res !== 'Pending');
  const staked = done.reduce((s, b) => s + b.stake, 0), returned = done.reduce((s, b) => s + back(b), 0), pl = returned - staked;
  const by = k => { const m = {}; done.forEach(b => { const x = m[b[k]] ??= { n: 0, pl: 0 }; x.n++; x.pl += back(b) - b.stake; }); return Object.entries(m).sort((a, b) => a[1].pl - b[1].pl); };
  const types = by('type'), books = by('bk'), top = Math.max(1, ...types.map(([, x]) => Math.abs(x.pl)));
  const tile = (l, v, c = '') => `<div class="card tile"><span class="px">${l}</span><b class="mono ${c}">${v}</b></div>`;
  const hc = 'grid-template-columns:90px minmax(0,1fr) 90px 60px 60px 64px 76px';
  return demo(sample ? 'Demo: these are sample bets. Adding your first bet clears them. Bets are saved in this browser only.' : 'Your bets are saved in this browser only.')
    + blurred(`<div class="tiles">${tile('Staked', money(staked))}${tile('Returned', money(returned))}${tile('Profit or loss', money(pl), pl < 0 ? 'bad' : 'g')}${tile('Bets settled', done.length)}</div>`
    + edgeReport(done) + `<div class="split"><div class="card" style="gap:10px"><h2>By bet type</h2>${types[0] && types[0][1].pl < 0 ? `<p class="mu">${types[0][0]} bets have cost you the most: ${money(types[0][1].pl)} over ${types[0][1].n} bets.</p>` : ''}`
    + types.map(([t, x]) => `<div style="display:flex;flex-direction:column;gap:4px"><div class="kv"><span>${t} <span class="mu sm">· ${x.n} bets</span></span><b class="mono ${x.pl < 0 ? 'bad' : 'g'}">${money(x.pl)}</b></div><div class="bar2"><i style="width:${Math.abs(x.pl) / top * 100}%;background:var(--${x.pl < 0 ? 'bad' : 'g'})"></i></div></div>`).join('') + `</div>`
    + `<div class="card"><h2 style="padding-bottom:6px">Bookmaker balances</h2><div class="tbl"><div class="tr th px" style="grid-template-columns:minmax(0,1fr) 80px 80px 80px"><span>Bookmaker</span><span class="r">Start</span><span class="r">P/L</span><span class="r">Balance</span></div>`
    + books.map(([k, x]) => `<div class="tr mono" style="grid-template-columns:minmax(0,1fr) 80px 80px 80px"><span style="font-family:'IBM Plex Sans'">${esc(k)}</span><span class="r mu">${money(START[k] || 0)}</span><span class="r ${x.pl < 0 ? 'bad' : 'g'}">${money(x.pl)}</span><b class="r">${money((START[k] || 0) + x.pl)}</b></div>`).join('') + `</div></div></div>`
    + `<div class="card" style="gap:12px"><h2>Add a bet</h2><div class="form"><label>Date<input id="nb-date" type="date" value="2026-10-11"></label><label>Bookmaker<input id="nb-bk" placeholder="e.g. Bookmaker A"></label>`
    + `<label>Market<select id="nb-mkt">${[...MARKETS.map(m => m[0]), 'Other'].map(t => `<option>${t}</option>`).join('')}</select></label><label>Type<select id="nb-type">${TYPES.map(t => `<option${A.prefill === t ? ' selected' : ''}>${t}</option>`).join('')}</select></label><label>Stake (£)<input id="nb-stake" type="number" min="0" step="0.5" inputmode="decimal"></label>`
    + `<label>Odds (decimal)<input id="nb-odds" type="number" min="1" step="0.01" inputmode="decimal"></label><label>Result<select id="nb-res">${['Pending', 'Won', 'Lost', 'Void'].map(t => `<option>${t}</option>`).join('')}</select></label>`
    + `<button class="btn" data-a="addbet" data-id="b">Add bet</button></div></div>`
    + `<div class="card"><div class="head" style="padding-bottom:6px"><h2>Your bets</h2>${sample ? `<button data-a="clearbets" data-id="x">Clear sample bets</button>` : bets.length ? '' : `<button data-a="samplebets" data-id="s">Show sample bets</button>`}</div><div class="mxwrap"><div class="tbl" style="min-width:640px">`
    + `<div class="tr th px" style="${hc}"><span>Date</span><span>Bookmaker</span><span>Type</span><span class="r">Stake</span><span class="r">Odds</span><span>Result</span><span class="r">Return</span></div>`
    + (bets.slice(0, 25).map(b => `<div class="tr" style="${hc}"><span class="mono sm">${b.date.slice(5).split('-').reverse().join('/')}</span><span>${esc(b.bk)}</span><span>${esc(b.type)}</span><span class="mono r">${money(b.stake)}</span><span class="mono r">${b.odds ? b.odds.toFixed(2) : '-'}</span>`
      + `<span class="${b.res === 'Won' ? 'g' : b.res === 'Lost' ? 'bad' : 'mu'}">${b.res}</span><span class="mono r">${b.res === 'Pending' ? '-' : money(back(b))}</span></div>`).join('') || `<div class="tr mu">No bets yet.</div>`) + (bets.length > 25 ? `<div class="tr sm mu">Showing the latest 25 of ${bets.length}.</div>` : '') + `</div></div></div>`, 'The bet tracker');
}

/* Bet tracker: bet check and bet log as two tabs. #/check opens the check tab. */
function trackerPage() {
  const tab = A.ttab || (A.slip.length ? 'check' : 'log');
  return pageHead('Bet tracker <span class="prem">Premium</span>', 'Check a bet builder before you place it, then log it to see your balances, your edge and which kinds of bet cost you money.')
    + `<div class="pills" data-k="ttab">${[['check', `Bet check${A.slip.length ? ` (${A.slip.length})` : ''}`], ['log', 'Bet log and edge report']].map(([k, l]) => `<button data-a="ttab" data-id="${k}" class="${tab === k ? 'on' : ''}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>`
    + (tab === 'check' ? checkBody() : logBody());
}

/* ---------- Offers ---------- */
const OFFERS = {
  signup: ['Sign-up offers', ['Offer', 'Min odds', 'Key terms'], [['Bet £10, get £30 in free bets', '1/2', 'Free bets expire after 7 days'], ['Bet £5, get £20 in free bets', 'Evens', 'Paid after the bet settles'], ['Bet £10, get £40 in bonuses', '2/1', 'Split across bet types'], ['£20 back if your first bet loses', 'Evens', 'Refund paid as a free bet'], ['Bet £25, get £25 in free bets', '4/5', 'Paid in 5 x £5 free bets'], ['Bet £10, get £20 in free bets', '1/2', 'Football only']]],
  lucky15: ['Lucky 15 bonuses', ['One winner', 'All four win', 'Applies to'], [['Double odds', '10% bonus', 'Horse racing'], ['Treble odds', '20% bonus', 'UK and Irish racing'], ['Double odds', '25% bonus', 'Racing and football'], ['Double odds', 'None', 'Racing'], ['Quadruple odds', '10% bonus', 'Selected races'], ['Double odds', '15% bonus', 'Racing']]],
  boosts: ['Acca boosts and refunds', ['Boost', 'Refund', 'Min legs'], [['Up to 50%', 'Up to £10 if one leg loses', '5'], ['Up to 100%', 'None', '4'], ['Up to 30%', 'Up to £25 if one leg loses', '5'], ['Up to 70%', 'Free bet if one leg loses', '6'], ['None', 'Up to £5 if one leg loses', '4'], ['Up to 25%', 'None', '3']]],
  early: ['Early payout', ['Football', 'Applies to', 'Excludes'], [['Paid if 2 goals ahead', 'Pre-match singles', 'In-play bets'], ['Paid if 2 goals ahead', 'Singles and accas', 'Bet builders'], ['Paid if 3 goals ahead', 'Pre-match singles', 'Cup games'], ['Paid if 2 goals ahead', 'Match result bets', 'Accas'], ['None', '-', '-'], ['Paid if 2 goals ahead', 'Top 5 leagues', 'Bet builders']]]
};
function offersPage() {
  const [, cols, rows] = OFFERS[A.otab], g = 'grid-template-columns:130px 1.4fr 1fr 1fr 120px';
  return pageHead('Bookmaker offers', 'Compare offers side by side. We may earn a commission if you join a bookmaker through our links. It never changes the stats we show.')
    + demo("Example layout. Bookmaker names and terms are placeholders until offers come from the bookmakers' affiliate feeds.")
    + `<div class="pills" data-k="otab">${Object.entries(OFFERS).map(([k, [l]]) => pill('otab', k, l)).join('')}</div>`
    + (A.otab === 'signup' ? `<div class="card" style="gap:14px"><h2>How sign-up offers work</h2><ol class="steps"><li>Pick an offer and read its full terms.</li><li>Join through the link and verify your account.</li><li>Place the qualifying bet at the minimum odds or above.</li><li>The free bets are added once that bet settles.</li></ol></div>` : '')
    + `<div class="card"><div class="tbl"><div class="tr th px otr" style="${g}"><span>Bookmaker</span>${cols.map(c => `<span>${c}</span>`).join('')}<span></span></div>`
    + rows.map((r, i) => `<div class="tr otr" style="${g}"><b style="font-weight:600">Bookmaker ${'ABCDEF'[i]}</b>${r.map((c, j) => `<span><span class="lbl px">${cols[j]}</span>${c}</span>`).join('')}<button class="btn" disabled title="Links go live with the affiliate programmes">Get offer</button></div>`).join('')
    + `</div><p class="sm mu" style="margin-top:12px">18+. New customers only where stated. Full terms on each bookmaker's site. BeGambleAware.org</p></div>`;
}

/* ---------- Alerts, Premium, Safer gambling, More ---------- */
function alertsPage() {
  const sw = (k, l, s, p) => `<button class="sw" data-a="alert" data-id="${k}" aria-pressed="${!!A.alerts[k]}"><span><b style="font-weight:600">${l}</b>${p ? ' <span class="prem">Premium</span>' : ''}<br><span class="sm mu">${s}</span></span><i></i></button>`;
  return pageHead('Alerts', 'Choose what we tell you about, and where.')
    + demo('Demo: your choices are saved in this browser, but no alerts are sent yet.')
    + `<div class="split"><div class="card"><h2 style="padding-bottom:4px">What to send</h2>${sw('lineups', 'Line-ups confirmed', 'For games whose sheets you open.', 1)}${sw('refs', 'Referee appointed', 'With their card and foul averages.', 1)}${sw('trends', 'New trend notes', 'When notes are published for a big game.')}${sw('finder', 'New 90%+ lines', 'When the line finder spots a new strong line.', 1)}</div>`
    + `<div style="display:flex;flex-direction:column;gap:20px"><div class="card"><h2 style="padding-bottom:4px">Where to send them</h2>${sw('tg', 'Telegram', 'Through our Telegram bot.')}${sw('email', 'Email', 'A short summary email.')}</div>`
    + `<div class="card" style="gap:10px"><h2>Free Telegram channel</h2><p class="mu">The strongest lines from each new sheet, posted when it's ready, with a link to the full sheet.</p><button class="btn" disabled style="align-self:flex-start">Channel link coming soon</button></div></div></div>`;
}

function premiumPage() {
  const li = t => `<li>${ico('tick')}<span>${t}</span></li>`;
  return pageHead('Free and Premium', 'Start free. Upgrade if the extra tools are worth it to you.')
    + demo('Demo: prices are provisional and sign-up is not open yet.')
    + `<button data-a="plan" data-id="p3" style="align-self:flex-start">Demo view: <b>${isPrem() ? 'Premium' : 'Free'}</b> (click to see the site as ${isPrem() ? 'a free' : 'a Premium'} member)</button>`
    + `<div class="plans"><div class="card"><h2>Free</h2><div class="price">£0</div><ul>${['Every sheet, every competition', 'Team stats and strongest lines', 'Top 3 players for every stat', 'Referee pages and the returns calculator', 'Weekend email and Telegram channel'].map(li).join('')}</ul><a class="btn btn2" href="#/">Browse fixtures</a></div>`
    + `<div class="card" style="border-color:var(--y);box-shadow:0 0 0 1px var(--y)"><h2>Premium <span class="prem">14-day free trial</span></h2><div class="price">£4.99<span class="mu" style="font-size:15px;font-weight:400"> a month</span></div><div class="sm mu">or £39 a year</div>`
    + `<ul>${['Every player for every stat, with minutes warnings', 'Games filter: leave out cup ties and freak results', 'Bet check: landed together and clash warnings', 'Full line finder: form, matchups and stretch lines', 'Line-up and referee alerts', 'Bet tracker and bet-type report'].map(li).join('')}</ul><button class="btn" disabled>Start free trial (coming soon)</button></div></div>`
    + `<div class="card" style="gap:10px;max-width:900px"><h2>Good to know</h2><p><b>Cancel any time.</b> Premium stays on until the end of the period you've paid for.</p>`
    + `<p><b>We don't sell tips.</b> Premium gives you more stats and tools. It doesn't make any bet more likely to win.</p><p><b>Stay in control.</b> If betting stops being fun, see our <a href="#/safer">safer gambling page</a>.</p></div>`;
}

function saferPage() {
  const ext = (u, l, s) => `<a href="${u}" target="_blank" rel="noopener"><span>${l}<br><span class="sm mu" style="font-weight:400">${s}</span></span>${ico('arrow')}</a>`;
  return pageHead('Safer gambling', 'Betting should be something you enjoy, never something you need.')
    + `<div class="split"><div class="card" style="gap:12px"><h2>Keep it in check</h2><ul class="trust">${['Only bet money you can afford to lose.', 'Set a deposit limit with every bookmaker you use.', 'Take a break with a time-out, or block all UK gambling sites with GamStop.', "Don't chase losses.", 'Hit rates describe past games. They don\'t make a bet more likely to win.'].map(t => `<li>${ico('tick')}<span>${t}</span></li>`).join('')}</ul></div>`
    + `<div class="card" style="gap:8px"><h2>Free, confidential help</h2><p>National Gambling Helpline: <b class="mono">0808 8020 133</b>, open 24 hours a day.</p><div class="links">`
    + ext('https://www.gamcare.org.uk', 'GamCare', 'Support, live chat and counselling') + ext('https://www.begambleaware.org', 'BeGambleAware', 'Advice and self-assessment')
    + ext('https://www.gamstop.co.uk', 'GamStop', 'Block yourself from UK gambling sites') + `</div></div></div>`;
}

const morePage = () => pageHead('More', '')
  + `<div class="card links">${[['challenge', 'Weekly challenge'], ['offers', 'Bookmaker offers'], ['finder', 'Line finder'], ['calc', 'Bet returns calculator'], ['refs', 'Referees'], ['alerts', 'Alerts'], ['premium', 'Free and Premium'], ['how', 'How the numbers work'], ['safer', 'Safer gambling']].map(([k, l]) => `<a href="#/${k}">${l}${ico('arrow')}</a>`).join('')}</div>`
  + `<button data-a="theme" data-id="t2" style="align-self:flex-start;display:inline-flex;gap:8px;align-items:center">${ico(isDark() ? 'sun' : 'moon')}${isDark() ? 'Light' : 'Dark'} mode</button>`
  + `<button data-a="plan" data-id="p2" style="align-self:flex-start">Demo view: <b>${isPrem() ? 'Premium' : 'Free'}</b> (tap to switch)</button>`;

const notFoundPage = () => pageHead('Page not found', "That page doesn't exist, or the sheet isn't ready yet. Sheets go up a few days before each game.")
  + `<a class="btn" href="#/" style="align-self:flex-start">Back to fixtures</a>`;

/* ---------- Actions and rendering ---------- */
function appAction(a, id, d) {
  const v = k => document.getElementById(k).value;
  if (a === 'fxcomp') A.comp = id;
  else if (a === 'fxday') A.day = id;
  else if (a === 'big') A.big = !A.big;
  else if (a === 'fcomp' || a === 'fkind' || a === 'ftab' || a === 'otab') A[a] = id;
  else if (a === 'addleg') { A.slip = A.slip.includes(id) ? A.slip.filter(s => s !== id) : [...A.slip, id]; A.share = null; }
  else if (a === 'rmleg') { A.slip = A.slip.filter(s => s !== id); A.share = null; }
  else if (a === 'clearslip') { A.slip = []; A.share = null; }
  else if (a === 'plan') { A.plan = isPrem() ? 'free' : 'premium'; store.set('plan', A.plan); }
  else if (a === 'fav') { A.favs = A.favs.includes(id) ? A.favs.filter(c => c !== id) : [...A.favs, id]; store.set('favs', A.favs); }
  else if (a === 'mine') A.mine = !A.mine;
  else if (a === 'enter') { A.entry = A.slip.slice(0, 3); store.set('entry', A.entry); }
  else if (a === 'unenter') { A.entry = null; store.set('entry', null); }
  else if (a === 'ttab') { A.ttab = id; A.prefill = null; }
  else if (a === 'logslip') { A.ttab = 'log'; A.prefill = 'Bet builder'; setTimeout(() => document.getElementById('nb-stake')?.focus(), 0); }
  else if (a === 'ropen') A.open[id] = !A.open[id];
  else if (a === 'btsport') { A.bt.sport = id; A.bt.res = null; }
  else if (a === 'btset') { const [path, val] = id.split('|'); btSet(path, val); }
  else if (a === 'btflag') A.bt.rc.flags[id] = !A.bt.rc.flags[id];
  else if (a === 'btrun') btRun();
  else if (a === 'btsave') {
    const B = A.bt, fb = B.sport === 'football', rules = JSON.parse(JSON.stringify(fb ? B.fb : B.rc));
    A.systems = [...A.systems, { name: `${fb ? rules.market : rules.code === 'All' ? 'Racing ' + rules.market.toLowerCase() : rules.code + ' ' + rules.market.toLowerCase()} system ${A.systems.length + 1}`, sport: B.sport, rules }];
    store.set('systems', A.systems);
  } else if (a === 'btload') { const s = A.systems[+id]; A.bt.sport = s.sport; A.bt[s.sport === 'football' ? 'fb' : 'rc'] = JSON.parse(JSON.stringify(s.rules)); btRun(); }
  else if (a === 'btdel') { A.systems = A.systems.filter((_, i) => i !== +id); store.set('systems', A.systems); }
  else if (a === 'signup') { const e = v('email').trim(); A.emailErr = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); A.signed = !A.emailErr; }
  else if (a === 'ctype') A.calc.type = id;
  else if (a === 'cn') A.calc.n = Math.min(12, Math.max(2, A.calc.n + +d));
  else if (a === 'cew') { A.calc.ew = !A.calc.ew; A.calc.sels.forEach(s => { if (!A.calc.ew && s.r === 'Placed') s.r = 'Lost'; }); }
  else if (a === 'share') { shareImage(A.slip.map(legInfo), isPrem() ? A.together : []).then(b => { A.shareBlob = b; A.share = URL.createObjectURL(b); render(); }); return false; }
  else if (a === 'sharefile') { navigator.share({ files: [new File([A.shareBlob], 'pixeltipster-bet.png', { type: 'image/png' })], title: 'My bet builder check' }).catch(() => {}); return false; }
  else if (a === 'demolegs') A.slip = ['liv-mci|t|0|0|0|1.5', 'liv-mci|t|3|0|0|4.5', 'liv-mci|p|1|0|sot|1'];
  else if (a === 'alert') A.alerts[id] = !A.alerts[id];
  else if (a === 'clearbets') A.bets = [];
  else if (a === 'samplebets') A.bets = null;
  else if (a === 'addbet') {
    const b = { date: v('nb-date') || '2026-10-11', bk: v('nb-bk').trim() || 'Bookmaker', type: v('nb-type'), market: v('nb-mkt') === 'Other' ? null : v('nb-mkt'), stake: +v('nb-stake'), odds: +v('nb-odds') || 0, res: v('nb-res') };
    if (!(b.stake > 0)) { document.getElementById('nb-stake').focus(); return false; }
    A.bets = [b, ...(A.bets || [])];
  } else if (a === 'theme') {
    const t = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; store.set('theme', t);
  } else return false;
  save();
  return true;
}

const PAGES = { '': fixturesPage, match: matchPage, finder: finderPage, check: trackerPage, tracker: trackerPage, offers: offersPage, alerts: alertsPage, premium: premiumPage, how: howPage, calc: calcPage, challenge: challengePage, racing: racingPage, race: racePage, tester: testerPage, refs: refsPage, ref: refPage, safer: saferPage, more: morePage };
function render() {
  const r = route(), site = document.getElementById('site');
  if (r.p === 'check' && A.lastRoute !== 'check') A.ttab = 'check';   // old "Check my bet" links open the check tab
  A.lastRoute = r.p;
  const sx = {}; site.querySelectorAll('.pills[data-k]').forEach(p => sx[p.dataset.k] = p.scrollLeft);
  const fo = { ...(document.activeElement?.dataset || {}) };
  site.innerHTML = topBar(r.p) + `<main class="page" id="main">${(PAGES[r.p] || notFoundPage)(r.id)}${footer()}</main>` + bottomNav(r.p);
  document.title = (r.p === 'match' ? DATA.fixture.name : TITLES[r.p] || 'Fixtures') + ' · Pixeltipster';
  site.querySelectorAll('.pills[data-k]').forEach(p => p.scrollLeft = sx[p.dataset.k] || 0);
  if (fo.a) site.querySelector(`[data-a="${fo.a}"][data-id="${fo.id}"]${fo.d ? `[data-d="${fo.d}"]` : ''}`)?.focus({ preventScroll: true });
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const { a, id, d } = b.dataset;
  if (sheetAction(a, id, d) || appAction(a, id, d)) render();
});
document.addEventListener('input', e => {   // team search: redraw only the list so the box keeps focus
  const t = e.target, C = A.calc;
  if (t.id === 'fxq') { A.q = t.value; document.getElementById('fxlist').innerHTML = fixtureList(); }
  if (t.id === 'email' && A.emailErr) { A.emailErr = false; t.removeAttribute('aria-invalid'); }
  if (t.id.startsWith('bt-')) { btSet(t.id.slice(3), t.value); return; }   // backtester rules: saved as you type, used on Run test
  if (!t.id.startsWith('calc-')) return;   // calculator: update the numbers only, so typing isn't interrupted
  const [, k, i] = t.id.split('-');
  if (k === 'stake') C.stake = t.value; else if (k === 'frac') C.frac = +t.value; else if (k === 'p') C.sels[i].p = t.value; else if (k === 'r') C.sels[i].r = t.value;
  document.getElementById('calcout').innerHTML = calcOut();
});
addEventListener('hashchange', () => { render(); scrollTo(0, 0); });
W.addEventListener('change', render); WM.addEventListener('change', render);
render();

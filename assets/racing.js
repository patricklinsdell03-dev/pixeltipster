/* ============================================================================
   RACING (prototype): today's meetings, 30-second race breakdowns, racing offers.
   Made-up horses, jockeys and trainers, so no real one gets invented form.
   No odds anywhere: offers are about places and guarantees, not prices.

   Race:   { id, course, code: 'Flat'|'AW'|'Jumps', time, type, dist, going, places, extra, runners }
   Runner: { no, name, age, wgt, draw, jockey, trainer, silk: [main, second, pattern, sleeves, trim],
             runs: [{ days, course, dist, going, pos, ran }] newest first }
   ========================================================================== */
const RN_A = ['Copper', 'Quiet', 'Silver', 'Northern', 'Velvet', 'Rapid', 'Golden', 'Midnight', 'Harbour', 'Stone', 'Wild', 'Royal', 'Misty', 'Crimson', 'Lucky', 'Bold', 'Distant', 'Paper', 'Iron', 'Summer'];
const RN_B = ['Lantern', 'Echo', 'Comet', 'Ridge', 'Spirit', 'Arrow', 'Meadow', 'Legend', 'Falcon', 'Rhythm', 'Tide', 'Charm', 'Voyage', 'Glory', 'Signal', 'Ember', 'Willow', 'Crown', 'Prospect', 'Harvest'];
const JOCKEYS = ['A. Penrose', 'C. Mallory', 'J. Whitcombe', 'L. Ashdown', 'M. Garrow', 'S. Kettle', 'D. Farleigh', 'K. Brannock'];
const TRAINERS = ['P. Hargate', 'E. Lowther', 'G. Ravensworth', 'M. Tolland', 'J. Corbridge', 'S. Ellery', 'R. Pentreath', 'A. Dunmore'];
const SILK_COL = ['#c8102e', '#003399', '#f5b700', '#19a974', '#ffffff', '#111111', '#7b3fe4', '#ff7a1a', '#6cabdd', '#8e1f2f'];
const SILK_PAT = ['plain', 'stripes', 'hoop', 'halves', 'band', 'centre'];
const COURSES = { Flat: ['Ascot', 'Newmarket', 'York', 'Haydock', 'Goodwood'], AW: ['Kempton', 'Lingfield', 'Wolverhampton'], Jumps: ['Cheltenham', 'Sandown', 'Fairyhouse', 'Punchestown'] };
const GOINGS = { Flat: ['Good', 'Good to Soft', 'Soft'], AW: ['Standard'], Jumps: ['Good to Soft', 'Soft', 'Heavy'] };
const TODAY_MEETS = [['Goodwood', 'Flat', 'Soft', ['13:50', '14:25', '15:00', '15:35']], ['Fairyhouse', 'Jumps', 'Soft', ['13:15', '13:45', '14:20', '14:55']], ['Kempton', 'AW', 'Standard', ['17:15', '17:45', '18:15', '18:45']]];
const TRAINER_FORM = Object.fromEntries(TRAINERS.map(t => { const r = rng(hash(t)), runs = 8 + Math.floor(r() * 20); return [t, { runs, wins: Math.floor(runs * r() * 0.4) }]; }));
const trainerHot = t => TRAINER_FORM[t].wins / TRAINER_FORM[t].runs >= 0.2;
const placesFor = (n, type) => n < 5 ? 1 : n < 8 ? 2 : n >= 16 && /Handicap/.test(type) ? 4 : 3;

/* Silks reuse the pixel shirt, drawn once per colour set into a shared style sheet. */
const SILKS = {}, silkCSS = document.createElement('style'); document.head.appendChild(silkCSS);
const silk = k => { const key = 's' + k.join('').replace(/[#\W]/g, ''); if (!SILKS[key]) { SILKS[key] = 1; silkCSS.textContent += `.${key}{background-image:${uri(shirtSVG(k))}}`; } return `<i class="jer m ${key}" aria-hidden="true"></i>`; };

const MEETINGS = TODAY_MEETS.map(([course, code, going, times]) => {
  const r = rng(hash('meet' + course)), jumps = code === 'Jumps';
  const races = times.map((time, ri) => {
    const type = jumps ? ['Novice Hurdle', 'Handicap Hurdle', 'Beginners Chase', 'Handicap Chase'][ri % 4] : ['Maiden Stakes', 'Novice Stakes', 'Handicap', 'Handicap', 'Listed Stakes'][Math.floor(r() * 5)];
    const dist = jumps ? ['2m', '2m4f', '3m'][Math.floor(r() * 3)] : ['6f', '7f', '1m', '1m2f', '1m4f'][Math.floor(r() * 5)];
    const n = 6 + Math.floor(r() * 9), a0 = Math.floor(r() * 20), b0 = Math.floor(r() * 20), draws = Array.from({ length: n }, (_, i) => i + 1).sort(() => r() - 0.5);
    const runners = Array.from({ length: n }, (_, i) => {
      let days = r() < 0.15 ? 91 + Math.floor(r() * 200) : 7 + Math.floor(r() * 50);
      const runs = Array.from({ length: 5 }, (_, k) => {
        if (k) days += 14 + Math.floor(r() * 50);
        const ran = 6 + Math.floor(r() * 10), fell = jumps && r() < 0.07;
        return { days, course: r() < 0.25 ? course : COURSES[code][Math.floor(r() * COURSES[code].length)], dist: r() < 0.35 ? dist : (jumps ? ['2m', '2m4f', '3m'] : ['6f', '7f', '1m', '1m2f', '1m4f'])[Math.floor(r() * (jumps ? 3 : 5))],
          going: r() < 0.3 ? going : GOINGS[code][Math.floor(r() * GOINGS[code].length)], pos: fell ? (r() < 0.5 ? 'F' : 'PU') : 1 + Math.floor(Math.pow(r(), 1.4) * ran), ran };
      });
      const c1 = Math.floor(r() * 10), c2 = (c1 + 1 + Math.floor(r() * 9)) % 10;
      return { no: i + 1, name: `${RN_A[(a0 + i * 7) % 20]} ${RN_B[(b0 + i * 3) % 20]}`, age: jumps ? 5 + Math.floor(r() * 6) : 3 + Math.floor(r() * 4), wgt: `${jumps ? 10 + Math.floor(r() * 2) : 8 + Math.floor(r() * 2)}-${Math.floor(r() * 14)}`,
        draw: jumps ? null : draws[i], jockey: JOCKEYS[Math.floor(r() * 8)], trainer: TRAINERS[Math.floor(r() * 8)], silk: [SILK_COL[c1], SILK_COL[c2], SILK_PAT[Math.floor(r() * 6)], SILK_COL[c1], SILK_COL[c2]], runs };
    });
    const places = placesFor(n, type);
    return { id: `${course.toLowerCase()}-${time.replace(':', '')}`, course, code, time, type, dist, going, places, runners, lowDraw: jumps ? null : 3 + Math.floor(r() * 5),
      extra: n >= 8 && r() < 0.6 ? `Bookmaker ${'ABCD'[Math.floor(r() * 4)]}` : null };
  });
  return { course, code, going, races };
});
const RACES = MEETINGS.flatMap(m => m.races);

/* Flags worked out from each runner's last 5 runs. */
function flags(run, race) {
  const won = f => run.runs.some(x => x.pos === 1 && f(x));
  return { C: won(x => x.course === race.course), D: won(x => x.dist === race.dist), G: won(x => x.going === race.going), TF: trainerHot(run.trainer), days: run.runs[0].days };
}
const FLAG_TXT = { C: ['C', 'Has won at this course'], D: ['D', 'Has won over this distance'], G: ['G', 'Has won on this going'], TF: ['TF', 'Trainer in form: 20%+ winners in the last 14 days'] };
const flagBadges = (fl) => Object.keys(FLAG_TXT).filter(k => fl[k]).map(k => `<span class="badge good" title="${FLAG_TXT[k][1]}">${FLAG_TXT[k][0]}</span>`).join('')
  + (fl.days > 90 ? `<span class="badge warn" title="Hasn't run for ${fl.days} days">${fl.days} days off</span>` : '');
const formStr = run => run.runs.slice().reverse().map(x => x.pos === 'PU' ? 'P' : x.pos > 9 ? '0' : x.pos).join('');

function raceOffers(race) {
  return `<div class="card" style="gap:10px"><h2>Offers on this race</h2>`
    + (race.extra ? `<p><b>${race.places + 1} places</b> each way at ${race.extra}, instead of the usual ${race.places}.</p>` : `<p class="mu">No extra places on this race yet.</p>`)
    + `<p class="sm">Best Odds Guaranteed today: Bookmaker A and Bookmaker C.</p>`
    + `<div class="books">${'ABCD'.split('').map(x => `<button class="btn btn2" disabled title="Links go live with the affiliate programmes">Bookmaker ${x}</button>`).join('')}</div>`
    + `<p class="sm mu">We may earn a commission if you join through these links. It never changes the breakdowns. 18+. T&Cs apply. BeGambleAware.org</p></div>`;
}

function racingPage() {
  const extras = RACES.filter(r => r.extra), sys = (A.systems || []).filter(s => s.sport === 'racing');
  return pageHead('Racing', "Today's UK and Irish races, broken down in 30 seconds: who's won here, over the trip and on the ground, and whose stable is in form.")
    + demo('Demo: made-up horses, jockeys and trainers with sample form. No odds are shown anywhere.')
    + (sys.length ? `<a class="card chban" href="#/tester"><span class="ptile" style="background:#7b3fe4">${ico('flask')}</span><span><b>Your racing systems</b><br><span class="mu sm">${sys.map(s => `${s.name}: ${rcToday(s.rules).length} runners today`).join(' · ')}</span></span>${ico('arrow')}</a>` : '')
    + `<div class="split"><div class="card" style="gap:4px"><h2 style="padding-bottom:6px">Extra places today</h2>`
    + (extras.length ? extras.map(r => `<a class="tr" style="grid-template-columns:60px minmax(0,1fr) auto" href="#/race/${r.id}"><b class="mono">${r.time}</b><span>${r.course} · ${r.type}<br><span class="sm mu">${r.runners.length} runners</span></span><span class="badge good">${r.places + 1} places · ${r.extra}</span></a>`).join('') : '<p class="mu">None yet today.</p>')
    + `<p class="sm mu" style="margin-top:8px">Placeholder bookmakers until the affiliate feeds are live. 18+. T&Cs apply.</p></div>`
    + `<div class="card" style="gap:8px"><h2>How to read a breakdown</h2><p class="sm">${Object.values(FLAG_TXT).map(([k, t]) => `<span class="badge good">${k}</span> ${t}`).join('<br>')}<br><span class="badge warn">90+ days off</span> Hasn't run for a while</p><p class="sm mu">Form reads oldest to newest: 1 won, 0 tenth or worse, P pulled up, F fell.</p></div></div>`
    + MEETINGS.map(m => `<div class="card fxcomp"><div class="px">${m.course} · ${m.code === 'AW' ? 'All-weather' : m.code} · ${m.going}</div>`
      + m.races.map(r => { const fl = r.runners.map(x => flags(x, r)); return `<a class="fxrow" style="grid-template-columns:52px minmax(0,1fr) auto 18px" href="#/race/${r.id}"><span class="mono fxko">${r.time}</span><span><b>${r.type}</b><br><span class="sm mu">${r.dist} · ${r.runners.length} runners · ${r.places} places</span></span>`
        + `<span class="fxb">${fl.filter(f => f.C).length ? `<span class="badge good">${fl.filter(f => f.C).length} course winners</span>` : ''}${r.extra ? `<span class="badge big">${ico('star')}Extra place</span>` : ''}</span>${ico('arrow')}</a>`; }).join('') + `</div>`).join('');
}

function racePage(id) {
  const race = RACES.find(r => r.id === id);
  if (!race) return notFoundPage();
  const rs = race.runners.map(x => ({ x, fl: flags(x, race) })), names = f => rs.filter(f).map(r => r.x.name);
  const angle = (label, list) => list.length ? `<li><b>${label}:</b> ${list.join(', ')}</li>` : '';
  const angles = angle(`Won on ${race.going.toLowerCase()} ground`, names(r => r.fl.G)) + angle('Course winners', names(r => r.fl.C)) + angle(`Won over ${race.dist}`, names(r => r.fl.D))
    + angle('Trainers in form', [...new Set(rs.filter(r => r.fl.TF).map(r => `${r.x.trainer} (${TRAINER_FORM[r.x.trainer].wins} from ${TRAINER_FORM[r.x.trainer].runs})`))])
    + angle('Off for 90+ days', names(r => r.fl.days > 90))
    + (race.lowDraw != null ? `<li><b>Draw:</b> stalls 1–4 won ${race.lowDraw} of the last 10 races here over ${race.dist}.</li>` : '');
  return `<a class="back sm" href="#/racing">← All racing</a>` + pageHead(`${race.time} ${race.course}`, `${race.type} · ${race.dist} · ${race.going} · ${race.runners.length} runners · ${race.places} places each way`)
    + demo('Demo: made-up runners with sample form.')
    + `<div class="split"><div class="card" style="gap:8px"><h2>The angles</h2><ul class="angles">${angles || '<li class="mu">Nothing stands out on the flags in this race.</li>'}</ul></div>${raceOffers(race)}</div>`
    + `<div class="card"><h2 style="padding-bottom:6px">Runners</h2>` + rs.map(({ x, fl }) => {
      const rid = 'r' + race.id + x.no, open = !!A.open?.[rid];
      return `<div class="row"><button class="rh rrow" data-a="ropen" data-id="${rid}" aria-expanded="${open}"><b class="mono mu">${x.no}</b>${silk(x.silk)}`
        + `<span><b>${x.name}</b>${x.draw ? ` <span class="mu sm">(${x.draw})</span>` : ''}<br><span class="sm mu">${x.age}yo · ${x.wgt} · ${x.jockey} · ${x.trainer}</span></span>`
        + `<span class="rflags"><span class="mono">${formStr(x)}</span>${flagBadges(fl)}</span></button>`
        + (open ? `<div class="det fade" style="padding-left:20px"><div class="tbl">${x.runs.map(u => `<div class="tr" style="grid-template-columns:70px minmax(0,1fr) 70px"><span class="sm mu">${u.days} days ago</span><span>${u.course} · ${u.dist} · ${u.going}</span><b class="mono r">${u.pos}${typeof u.pos === 'number' ? '/' + u.ran : ''}</b></div>`).join('')}</div></div>` : '') + `</div>`;
    }).join('') + `</div>`;
}

/* Today's runners that fit a saved racing system (rules that need a price are checked at the off). */
function rcToday(f) {
  return RACES.flatMap(race => race.runners.map(x => ({ race, x, fl: flags(x, race) }))).filter(({ race, x, fl }) => {
    const code = race.code === 'Jumps' ? (/Chase/.test(race.type) ? 'Chase' : 'Hurdle') : race.code, n = race.runners.length;
    return (f.code === 'All' || f.code === code) && (f.type === 'All' || (f.type === 'Handicap') === /Handicap/.test(race.type))
      && (f.going === 'All' || (f.going === 'Firm/Good' ? /^(Firm|Good)$/.test(race.going) : f.going === 'Soft/Heavy' ? /Soft|Heavy/.test(race.going) : race.going === 'Standard'))
      && Object.entries(f.flags).every(([k, on]) => !on || fl[k]) && (f.days === 'Any' || (f.days === '30 or less' ? fl.days <= 30 : f.days === '31-90' ? fl.days > 30 && fl.days <= 90 : fl.days > 90))
      && (f.field === 'Any' || (f.field === '8 or fewer' ? n <= 8 : f.field === '9-15' ? n > 8 && n < 16 : n >= 16));
  });
}

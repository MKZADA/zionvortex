(function() {
  const TIER_DATA = [
    {
      id: 1, key: 'iniciante', name: 'Frequência 01 · Iniciante', color: 'var(--bronze)',
      lessons: [
        { id: 'i1', title: 'O que é Bitcoin de verdade', desc: 'Por trás do hype: o problema que o Bitcoin resolve e por que isso importa.' },
        { id: 'i2', title: 'Custódia: você ou a exchange?', desc: 'A diferença entre possuir Bitcoin e possuir uma promessa de Bitcoin.' },
        { id: 'i3', title: 'Comprando com segurança', desc: 'Como fazer sua primeira compra sem cair em armadilhas comuns.' },
        { id: 'i4', title: 'Erros que custam caro', desc: 'Os 5 erros mais comuns de quem está começando agora.' }
      ]
    },
    {
      id: 2, key: 'intermediario', name: 'Frequência 02 · Intermediário', color: 'var(--silver)',
      lessons: [
        { id: 'm1', title: 'Estratégia DCA na prática', desc: 'Como estruturar aportes recorrentes sem tentar acertar o timing do mercado.' },
        { id: 'm2', title: 'Ciclos de mercado e halving', desc: 'Entendendo o padrão histórico por trás dos ciclos de alta e baixa.' },
        { id: 'm3', title: 'Segurança avançada', desc: 'Hardware wallet, seed phrase e como proteger seu patrimônio de verdade.' },
        { id: 'm4', title: 'Lendo dados on-chain', desc: 'Métricas básicas para entender o que está acontecendo na rede.' }
      ]
    },
    {
      id: 3, key: 'avancado', name: 'Frequência 03 · Avançado', color: 'var(--gold)',
      lessons: [
        { id: 'a1', title: 'Mineração: viabilidade real', desc: 'ASIC, energia e quando minerar faz sentido financeiro.' },
        { id: 'a2', title: 'Energia solar aplicada à mineração', desc: 'Configurações on-grid e off-grid para reduzir custo de operação.' },
        { id: 'a3', title: 'Autocustódia avançada', desc: 'Multisig e estratégias de herança patrimonial em Bitcoin.' },
        { id: 'a4', title: 'Plano de acumulação de longo prazo', desc: 'Construindo uma tese pessoal de acumulação para décadas.' }
      ]
    }
  ];

  const ACCESS_CODES = {
    'ZION-F1-DEMO': 1,
    'ZION-F2-DEMO': 2,
    'ZION-F3-DEMO': 3,
    'ZION-ADMIN-DEMO': 99
  };

  const BADGE_DEFS = [
    { id: 'b1', label: 'Primeira transmissão recebida', test: s => s.completed.length >= 1 },
    { id: 'b2', label: 'Frequência 01 completa', test: s => TIER_DATA[0].lessons.every(l => s.completed.includes(l.id)) },
    { id: 'b3', label: 'Frequência 02 completa', test: s => TIER_DATA[1].lessons.every(l => s.completed.includes(l.id)) },
    { id: 'b4', label: 'Sinal total recebido', test: s => s.completed.length >= 12 },
    { id: 'b5', label: 'Sequência de 3 dias', test: s => (s.streak && s.streak.count >= 3) }
  ];

  let session = null; // { email, name, tier, completed: [], streak: {lastDate, count}, joinedAt }

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  // ambient waveform bars
  const wf = $('#zs-waveform');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('span');
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    wf.appendChild(s);
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---------------------------------------------------------------
  // PERSISTENCIA: localStorage do navegador.
  // Funciona em qualquer hospedagem (GitHub Pages, Vercel, etc),
  // mas e por navegador/dispositivo - nao sincroniza entre usuarios
  // nem entre o celular e o computador da mesma pessoa.
  // Para dados reais de assinantes compartilhados entre dispositivos,
  // isso precisa virar uma chamada para um backend (ver README.md).
  // ---------------------------------------------------------------
  const MEMBERS_DB_KEY = 'zion_signal_members';

  function readMembersDB() {
    try {
      const raw = localStorage.getItem(MEMBERS_DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Nao foi possivel ler dados locais', e);
      return {};
    }
  }

  function writeMembersDB(db) {
    try {
      localStorage.setItem(MEMBERS_DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Nao foi possivel salvar dados locais (modo anonimo/privado?)', e);
    }
  }

  function memberKey(email) {
    return email.trim().toLowerCase();
  }

  async function loadMember(email) {
    const db = readMembersDB();
    return db[memberKey(email)] || null;
  }

  async function saveMember(state) {
    const db = readMembersDB();
    db[memberKey(state.email)] = state;
    writeMembersDB(db);
  }

  function bumpStreak(state) {
    const today = todayStr();
    if (!state.streak) state.streak = { lastDate: null, count: 0 };
    if (state.streak.lastDate === today) return;
    const last = state.streak.lastDate ? new Date(state.streak.lastDate) : null;
    const now = new Date(today);
    if (last && (now - last) / 86400000 === 1) {
      state.streak.count += 1;
    } else {
      state.streak.count = 1;
    }
    state.streak.lastDate = today;
  }

  // ---------- gate ----------
  $('#zs-btn-enter').addEventListener('click', enter);
  $('#zs-in-code').addEventListener('keydown', e => { if (e.key === 'Enter') enter(); });

  async function enter() {
    const name = $('#zs-in-name').value.trim();
    const email = $('#zs-in-email').value.trim();
    const code = $('#zs-in-code').value.trim().toUpperCase();
    const errEl = $('#zs-gate-error');
    errEl.textContent = '';

    if (!name || !email || !code) {
      errEl.textContent = 'Preencha nome, e-mail e frequência de acesso.';
      return;
    }
    if (!ACCESS_CODES.hasOwnProperty(code)) {
      errEl.textContent = 'Frequência não reconhecida. Verifique o código.';
      return;
    }

    const tier = ACCESS_CODES[code];
    let state = await loadMember(email);
    if (!state) {
      state = { name, email, tier, completed: [], streak: { lastDate: null, count: 0 }, joinedAt: todayStr() };
    } else {
      state.name = name;
      if (tier > state.tier) state.tier = tier; // upgrades only
    }
    bumpStreak(state);
    await saveMember(state);

    session = state;
    $('#zs-gate').style.display = 'none';
    $('#zs-app').style.display = 'block';
    renderAll();
  }

  $('#zs-btn-logout').addEventListener('click', () => {
    session = null;
    $('#zs-app').style.display = 'none';
    $('#zs-gate').style.display = 'flex';
    $('#zs-in-code').value = '';
  });

  // ---------- nav ----------
  $all('.zs-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.zs-nav button').forEach(b => b.classList.remove('zs-nav-active'));
      btn.classList.add('zs-nav-active');
      $all('.zs-view').forEach(v => v.classList.remove('zs-view-active'));
      $('#zs-view-' + btn.dataset.view).classList.add('zs-view-active');
      if (btn.dataset.view === 'admin') renderAdmin();
    });
  });

  // ---------- render ----------
  function tierColor(t) {
    if (t === 1) return 'var(--bronze)';
    if (t === 2) return 'var(--silver)';
    if (t >= 3) return 'var(--gold)';
    return 'var(--text-muted)';
  }
  function tierLabel(t) {
    if (t === 99) return 'ADMIN';
    if (t === 1) return 'FREQ. 01';
    if (t === 2) return 'FREQ. 02';
    if (t === 3) return 'FREQ. 03';
    return '—';
  }

  function totalLessons() { return TIER_DATA.reduce((n, t) => n + t.lessons.length, 0); }

  function renderAll() {
    const badge = $('#zs-tier-badge');
    badge.textContent = tierLabel(session.tier);
    badge.style.color = session.tier === 99 ? 'var(--violet)' : tierColor(session.tier);

    $('#zs-nav-admin').style.display = session.tier === 99 ? '' : 'none';

    renderTransmissoes();
    renderProgresso();
    renderSignalMeter();
  }

  function unlockedAt(tierId) {
    if (session.tier === 99) return true; // admin sees everything
    return session.tier >= tierId;
  }

  function renderTransmissoes() {
    const wrap = $('#zs-tier-groups');
    wrap.innerHTML = '';
    TIER_DATA.forEach(tier => {
      const unlocked = unlockedAt(tier.id);
      const group = document.createElement('div');
      group.className = 'zs-tier-group';
      group.innerHTML = `
        <div class="zs-tier-head" style="color:${tier.color}">
          <div class="zs-tier-num">${tier.id}</div>
          <div class="zs-tier-name">${tier.name}</div>
          <div class="zs-tier-line"></div>
          ${unlocked ? '' : '<span class="zs-lock-tag">BLOQUEADO</span>'}
        </div>
        <div class="zs-lessons">
          ${tier.lessons.map(l => lessonCard(l, unlocked)).join('')}
        </div>
      `;
      wrap.appendChild(group);
    });

    $all('.zs-check-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!session.completed.includes(id)) {
          session.completed.push(id);
        } else {
          session.completed = session.completed.filter(x => x !== id);
        }
        bumpStreak(session);
        await saveMember(session);
        renderTransmissoes();
        renderProgresso();
        renderSignalMeter();
      });
    });
  }

  function lessonCard(lesson, unlocked) {
    const done = session.completed.includes(lesson.id);
    return `
      <div class="zs-lesson-card ${unlocked ? '' : 'zs-locked'}">
        <div class="zs-lesson-title">${lesson.title}</div>
        <div class="zs-lesson-desc">${lesson.desc}</div>
        <div class="zs-lesson-foot">
          ${unlocked
            ? `<button class="zs-check-btn ${done ? 'zs-done' : ''}" data-id="${lesson.id}">${done ? 'Recebida ✓' : 'Marcar como recebida'}</button>`
            : `<span class="zs-lock-tag">Requer frequência ${lesson.id[0] === 'i' ? '01' : lesson.id[0] === 'm' ? '02' : '03'}</span>`
          }
        </div>
      </div>
    `;
  }

  function renderProgresso() {
    const total = totalLessons();
    const done = session.completed.length;
    const pct = Math.round((done / total) * 100);
    $('#zs-stat-completed').textContent = done + ' / ' + total;
    $('#zs-stat-streak').textContent = (session.streak ? session.streak.count : 0) + ' dias';
    $('#zs-stat-pct').textContent = pct + '%';

    const badgeWrap = $('#zs-badges');
    badgeWrap.innerHTML = BADGE_DEFS.map(b => {
      const earned = b.test(session);
      return `<div class="zs-badge ${earned ? 'zs-earned' : ''}">${earned ? '★ ' : '☆ '}${b.label}</div>`;
    }).join('');
  }

  function renderSignalMeter() {
    const total = totalLessons();
    const pct = total ? session.completed.length / total : 0;
    const bars = $all('#zs-signal-bars i');
    const litCount = Math.round(pct * bars.length);
    bars.forEach((bar, i) => bar.classList.toggle('zs-active', i < litCount));
    $('#zs-signal-label').textContent = Math.round(pct * 100) + '% recebido';
  }

  // ---------- admin ----------
  async function renderAdmin() {
    const tbody = $('#zs-admin-rows');
    const db = readMembersDB();
    const rows = Object.values(db);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="zs-empty">Nenhum membro registrado neste navegador ainda.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(m => `
      <tr>
        <td>${m.name || '—'}</td>
        <td>${m.email}</td>
        <td>${tierLabel(m.tier)}</td>
        <td>${m.completed ? m.completed.length : 0} / ${totalLessons()}</td>
        <td>${m.joinedAt || '—'}</td>
      </tr>
    `).join('');
  }

  // ---------- DCA tool ----------
  $('#zs-btn-calc').addEventListener('click', calcDCA);

  function calcDCA() {
    const aporte = parseFloat($('#zs-dca-aporte').value) || 0;
    const preco = parseFloat($('#zs-dca-preco').value) || 1;
    const meses = parseInt($('#zs-dca-meses').value) || 1;
    const anual = parseFloat($('#zs-dca-cenario').value) || 0;
    const mensalRate = Math.pow(1 + anual / 100, 1 / 12) - 1;

    let btcAcumulado = 0;
    let investido = 0;
    let precoAtual = preco;
    const points = [];

    for (let m = 1; m <= meses; m++) {
      btcAcumulado += aporte / precoAtual;
      investido += aporte;
      precoAtual = precoAtual * (1 + mensalRate);
      points.push(btcAcumulado * precoAtual);
    }

    const valorFinal = btcAcumulado * precoAtual;

    $('#zs-out-investido').textContent = formatBRL(investido);
    $('#zs-out-btc').textContent = btcAcumulado.toFixed(6) + ' BTC';
    $('#zs-out-valor').textContent = formatBRL(valorFinal);

    drawChart(points);
  }

  function formatBRL(v) {
    return 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }

  function drawChart(points) {
    const svg = $('#zs-dca-chart');
    if (!points.length) { svg.innerHTML = ''; return; }
    const w = 600, h = 160, pad = 8;
    const max = Math.max(...points);
    const min = 0;
    const stepX = (w - pad * 2) / (points.length - 1 || 1);
    const coords = points.map((p, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((p - min) / (max - min || 1)) * (h - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    const linePath = 'M' + coords.join(' L');
    const areaPath = linePath + ` L${(pad + (points.length - 1) * stepX).toFixed(1)},${h - pad} L${pad},${h - pad} Z`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="zsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4DE8E0" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#4DE8E0" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#zsGrad)" stroke="none"/>
      <path d="${linePath}" fill="none" stroke="#4DE8E0" stroke-width="2"/>
    `;
  }

  // initial calc with defaults so the chart isn't empty
  document.addEventListener('DOMContentLoaded', () => {
    if ($('#zs-btn-calc')) calcDCA();
  });
  // in case DOMContentLoaded already fired (artifact injection)
  if (document.readyState !== 'loading') calcDCA();

})();
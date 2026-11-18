document.addEventListener('DOMContentLoaded', () => {
  const groups = window.rhibmsPrograms;
  if (!groups || !groups.length) return;

  const mastersGroups = groups.filter(g => g.level === 'masters');
  const bscGroups = groups.filter(g => g.level === 'bsc');
  const hndGroups = groups.filter(g => g.level === 'hnd');

  // 1. POPULATE ADMISSION PROGRAM DROPDOWN (#app-program)
  const select = document.getElementById('app-program');
  if (select) {
    const requested = new URLSearchParams(location.search).get('program');

    // A. Master's & MBA Division
    if (mastersGroups.length > 0) {
      const header = document.createElement('optgroup');
      header.label = '🎓 ── MASTER\'S & MBA PROGRAMMES (MSc / MBA / PGD) ──';
      select.append(header);

      for (const group of mastersGroups) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = '★ ' + group.label;
        for (const program of group.programs) {
          const duration = program.years === 1 ? '1 year' : program.years + ' years';
          optgroup.append(new Option(program.name + ' · ' + duration, program.name, false, requested === program.name));
        }
        select.append(optgroup);
      }
    }

    // B. Bachelor's Degree Division (Direct BSc, Top-Up, Conversion)
    if (bscGroups.length > 0) {
      const header = document.createElement('optgroup');
      header.label = '📘 ── BACHELOR\'S DEGREE PROGRAMMES (Direct BSc / Top-Up) ──';
      select.append(header);

      for (const group of bscGroups) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = '◆ ' + group.label;
        for (const program of group.programs) {
          const duration = program.years === 1 ? '1 year' : program.years + ' years';
          optgroup.append(new Option(program.name + ' · ' + duration, program.name, false, requested === program.name));
        }
        select.append(optgroup);
      }
    }

    // C. Higher National Diploma (HND) & Professional Diplomas
    if (hndGroups.length > 0) {
      const header = document.createElement('optgroup');
      header.label = '🏛️ ── HIGHER NATIONAL DIPLOMA (HND) & DIPLOMAS ──';
      select.append(header);

      for (const group of hndGroups) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = '▪ ' + group.label;
        for (const program of group.programs) {
          const duration = program.years === 1 ? '1 year' : program.years + ' years';
          optgroup.append(new Option(program.name + ' · ' + duration, program.name, false, requested === program.name));
        }
        select.append(optgroup);
      }
    }

    // Helper: auto-update qualification selector based on degree level
    select.addEventListener('change', () => {
      const chosen = select.value;
      const isMaster = mastersGroups.some(g => g.programs.some(p => p.name === chosen));
      const isBsc = bscGroups.some(g => g.programs.some(p => p.name === chosen));
      const qualSelect = document.getElementById('app-qualification');

      if (qualSelect) {
        if (isMaster) {
          for (let i = 0; i < qualSelect.options.length; i++) {
            if (qualSelect.options[i].value.includes('Bachelors')) {
              qualSelect.selectedIndex = i;
              break;
            }
          }
        } else if (isBsc && chosen.toLowerCase().includes('top-up')) {
          for (let i = 0; i < qualSelect.options.length; i++) {
            if (qualSelect.options[i].value.includes('HND')) {
              qualSelect.selectedIndex = i;
              break;
            }
          }
        }
      }
    });
  }

  // 2. FRONTEND PROGRAMME CATALOGUE (#program-catalog)
  const catalog = document.getElementById('program-catalog');
  if (!catalog) return;
  const search = document.getElementById('program-search');
  const empty = document.getElementById('program-empty');

  catalog.innerHTML = '';

  // Filter Tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'flex flex-wrap items-center gap-2 pt-1 pb-6';
  tabsContainer.innerHTML = `
    <button type="button" data-filter="all" class="prog-filter-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-dark text-white shadow-md transition-all">
      All Programmes
    </button>
    <button type="button" data-filter="masters" class="prog-filter-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5">
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
      <span>🎓 Master's &amp; MBA (${mastersGroups.reduce((acc, g) => acc + g.programs.length, 0)})</span>
    </button>
    <button type="button" data-filter="bsc" class="prog-filter-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5">
      <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
      <span>📘 Bachelor's Degrees (${bscGroups.reduce((acc, g) => acc + g.programs.length, 0)})</span>
    </button>
    <button type="button" data-filter="hnd" class="prog-filter-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
      <span>🏛️ HND Diplomas (${hndGroups.reduce((acc, g) => acc + g.programs.length, 0)})</span>
    </button>
  `;
  catalog.append(tabsContainer);

  // SECTION 1: MASTER'S & MBA PROGRAMMES (Executive Dark Theme Card)
  const mastersSection = document.createElement('div');
  mastersSection.id = 'section-masters';
  mastersSection.className = 'tier-section space-y-4 mb-10 transition-all';
  mastersSection.dataset.tier = 'masters';
  mastersSection.innerHTML = `
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/30">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase tracking-wider">
            <span>★</span> Master's &amp; Executive Studies
          </span>
          <span class="text-xs text-emerald-300 font-medium bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/20">
            Mentored by UBa &amp; UB
          </span>
        </div>

        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Master of Science (MSc) &amp; MBA Degree Programmes
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Advanced clinical specializations, executive business leadership, and engineering postgraduate tracks designed for university degree holders.
          </p>
        </div>

        <div id="masters-cards-container" class="space-y-4 pt-2"></div>
      </div>
    </div>
  `;
  catalog.append(mastersSection);

  const mastersCardsContainer = mastersSection.querySelector('#masters-cards-container');
  for (const group of mastersGroups) {
    const card = document.createElement('div');
    card.className = 'prog-group-card bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3';
    card.dataset.level = 'masters';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between pb-2 border-b border-white/10';
    header.innerHTML = `
      <h4 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
        <span class="text-amber-400">◆</span>
        <span>${group.label}</span>
      </h4>
      <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider">
        Master's Degree
      </span>
    `;
    card.append(header);

    const list = document.createElement('ul');
    list.className = 'divide-y divide-white/10 text-xs';
    for (const program of group.programs) {
      const row = document.createElement('li');
      row.className = 'prog-item-row flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-white/5 px-2 rounded-xl transition-colors';
      const duration = program.years === 1 ? '1 year' : program.years + ' years';
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold shrink-0">
            ${duration}
          </span>
          <span class="font-semibold text-white text-xs sm:text-sm prog-title">${program.name}</span>
        </div>
        <a href="admissions.html?${new URLSearchParams({ program: program.name })}#apply-wizard" 
           aria-label="Apply for ${program.name}"
           class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0">
          Apply for Master's &rarr;
        </a>
      `;
      list.append(row);
    }
    card.append(list);
    mastersCardsContainer.append(card);
  }

  // SECTION 2: BACHELOR'S DEGREE PROGRAMMES (Distinguished Indigo/Blue Card)
  const bscSection = document.createElement('div');
  bscSection.id = 'section-bsc';
  bscSection.className = 'tier-section space-y-4 mb-10 transition-all';
  bscSection.dataset.tier = 'bsc';
  bscSection.innerHTML = `
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-blue-500/30">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 uppercase tracking-wider">
            <span>📘</span> Bachelor's Degree Pathways
          </span>
          <span class="text-xs text-blue-300 font-medium bg-blue-900/40 px-3 py-1 rounded-full border border-blue-500/20">
            Direct BSc, Top-Ups &amp; BTech
          </span>
        </div>

        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Bachelor of Science (BSc) &amp; Professional Degree Programmes
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Direct 3–4 year university degrees, 1-year degree top-ups for HND/BTS holders, and accelerated professional conversions.
          </p>
        </div>

        <div id="bsc-cards-container" class="space-y-3 pt-2"></div>
      </div>
    </div>
  `;
  catalog.append(bscSection);

  const bscCardsContainer = bscSection.querySelector('#bsc-cards-container');
  for (const group of bscGroups) {
    const details = document.createElement('details');
    details.className = 'prog-group-card rounded-2xl border border-blue-500/20 bg-white/5 backdrop-blur-sm overflow-hidden transition-all';
    details.dataset.level = 'bsc';

    const summary = document.createElement('summary');
    summary.className = 'cursor-pointer px-5 py-3.5 font-bold text-white hover:bg-white/10 flex items-center justify-between text-sm sm:text-base';
    summary.innerHTML = `
      <span class="flex items-center gap-2">
        <span class="text-blue-400">◆</span>
        <span>${group.label}</span>
      </span>
      <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">Bachelor's</span>
    `;
    details.append(summary);

    const list = document.createElement('ul');
    list.className = 'divide-y divide-white/10 px-5 pb-4 text-xs';
    for (const program of group.programs) {
      const row = document.createElement('li');
      row.className = 'prog-item-row flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3';
      const duration = program.years === 1 ? '1 year' : program.years + ' years';
      row.innerHTML = `
        <span class="text-slate-200 font-medium prog-title">${program.name} · ${duration}</span>
        <a href="admissions.html?${new URLSearchParams({ program: program.name })}#apply-wizard"
           aria-label="Apply for ${program.name}"
           class="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all">
          Apply for BSc &rarr;
        </a>
      `;
      list.append(row);
    }
    details.append(list);
    bscCardsContainer.append(details);
  }

  // SECTION 3: HIGHER NATIONAL DIPLOMA (HND) & DIPLOMA PROGRAMMES (Light Theme Card)
  const hndSection = document.createElement('div');
  hndSection.id = 'section-hnd';
  hndSection.className = 'tier-section space-y-4 transition-all';
  hndSection.dataset.tier = 'hnd';
  hndSection.innerHTML = `
    <div class="rounded-3xl bg-white p-6 sm:p-8 text-slate-800 shadow-xl border border-slate-200/90 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
          <span>🏛️</span> National Diplomas &amp; Certifications
        </span>
        <span class="text-xs text-slate-500 font-medium">Accredited by MINESUP &amp; MINSANTE</span>
      </div>

      <div>
        <h3 class="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 tracking-wide">
          Higher National Diploma (HND) &amp; Professional Diplomas
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Accredited 2–3 year vocational degrees designed for hospital simulation, technical engineering, and business management.
        </p>
      </div>

      <div id="hnd-cards-container" class="space-y-3 pt-2"></div>
    </div>
  `;
  catalog.append(hndSection);

  const hndCardsContainer = hndSection.querySelector('#hnd-cards-container');
  for (const group of hndGroups) {
    const details = document.createElement('details');
    details.className = 'prog-group-card rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-sm transition-all';
    details.dataset.level = 'hnd';

    const summary = document.createElement('summary');
    summary.className = 'cursor-pointer px-5 py-4 font-bold text-slate-800 hover:bg-slate-100/80 flex items-center justify-between text-sm sm:text-base';
    summary.innerHTML = `
      <span class="flex items-center gap-2">
        <span class="text-brand-pine">▪</span>
        <span>${group.label}</span>
      </span>
      <span class="text-xs text-slate-400 font-normal">Click to expand</span>
    `;
    details.append(summary);

    const list = document.createElement('ul');
    list.className = 'divide-y divide-slate-200/70 px-5 pb-4 text-xs';
    for (const program of group.programs) {
      const row = document.createElement('li');
      row.className = 'prog-item-row flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3';
      const duration = program.years === 1 ? '1 year' : program.years + ' years';
      row.innerHTML = `
        <span class="text-slate-700 font-medium prog-title">${program.name} · ${duration}</span>
        <a href="admissions.html?${new URLSearchParams({ program: program.name })}#apply-wizard"
           aria-label="Apply for ${program.name}"
           class="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4">
          Apply
        </a>
      `;
      list.append(row);
    }
    details.append(list);
    hndCardsContainer.append(details);
  }

  // 3. TAB FILTER & REAL-TIME SEARCH LOGIC
  let activeFilter = 'all';

  function applyFilterAndSearch() {
    const query = search ? search.value.trim().toLowerCase() : '';
    let totalVisible = 0;

    // Helper to evaluate a tier container
    function filterTier(section, container, isDetails = false) {
      const tierName = section.dataset.tier;
      if (activeFilter !== 'all' && activeFilter !== tierName) {
        section.style.display = 'none';
        return 0;
      }

      let tierHasMatches = false;
      let count = 0;

      for (const card of container.children) {
        const titleEl = card.querySelector('h4') || card.querySelector('summary');
        const groupTitle = titleEl ? titleEl.textContent.toLowerCase() : '';
        let cardMatches = groupTitle.includes(query);
        let itemsVisible = false;

        for (const row of card.querySelectorAll('.prog-item-row')) {
          const titleText = row.querySelector('.prog-title').textContent.toLowerCase();
          const matches = cardMatches || titleText.includes(query);
          row.style.display = matches ? '' : 'none';
          if (matches) itemsVisible = true;
        }

        card.style.display = itemsVisible ? '' : 'none';
        if (query && itemsVisible && isDetails) card.open = true;
        if (itemsVisible) {
          tierHasMatches = true;
          count++;
        }
      }

      section.style.display = tierHasMatches ? '' : 'none';
      return count;
    }

    totalVisible += filterTier(mastersSection, mastersCardsContainer, false);
    totalVisible += filterTier(bscSection, bscCardsContainer, true);
    totalVisible += filterTier(hndSection, hndCardsContainer, true);

    if (empty) empty.hidden = (totalVisible > 0);
  }

  // Tabs click handler
  tabsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.prog-filter-tab');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    for (const b of tabsContainer.querySelectorAll('.prog-filter-tab')) {
      if (b === btn) {
        b.className = 'prog-filter-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-dark text-white shadow-md transition-all';
      } else {
        b.className = 'prog-filter-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5';
      }
    }
    applyFilterAndSearch();
  });

  if (search) {
    search.addEventListener('input', applyFilterAndSearch);
  }
});

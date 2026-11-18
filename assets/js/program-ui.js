document.addEventListener('DOMContentLoaded', () => {
  const groups = window.rhibmsPrograms;
  if (!groups || !groups.length) return;

  const postgradGroups = groups.filter(g => g.level === 'postgraduate');
  const undergradGroups = groups.filter(g => g.level !== 'postgraduate');

  // 1. POPULATE ADMISSION PROGRAM DROPDOWN (#app-program)
  const select = document.getElementById('app-program');
  if (select) {
    const requested = new URLSearchParams(location.search).get('program');

    // A. Master's & Postgraduate Division
    if (postgradGroups.length > 0) {
      const postgradHeader = document.createElement('optgroup');
      postgradHeader.label = '🎓 ── MASTER\'S & POSTGRADUATE PROGRAMMES (MSc / MBA / PGD) ──';
      select.append(postgradHeader);

      for (const group of postgradGroups) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = '★ ' + group.label;
        for (const program of group.programs) {
          const duration = program.years === 1 ? '1 year' : program.years + ' years';
          optgroup.append(new Option(program.name + ' · ' + duration, program.name, false, requested === program.name));
        }
        select.append(optgroup);
      }
    }

    // B. Undergraduate & HND Division
    if (undergradGroups.length > 0) {
      const undergradHeader = document.createElement('optgroup');
      undergradHeader.label = '🏛️ ── UNDERGRADUATE & HND DIPLOMA PROGRAMMES ──';
      select.append(undergradHeader);

      for (const group of undergradGroups) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.label;
        for (const program of group.programs) {
          const duration = program.years === 1 ? '1 year' : program.years + ' years';
          optgroup.append(new Option(program.name + ' · ' + duration, program.name, false, requested === program.name));
        }
        select.append(optgroup);
      }
    }

    // Auto-update qualification selector if a Master's program is selected
    select.addEventListener('change', () => {
      const chosen = select.value;
      const isPostgrad = postgradGroups.some(g => g.programs.some(p => p.name === chosen));
      const qualSelect = document.getElementById('app-qualification');
      if (isPostgrad && qualSelect) {
        if (!qualSelect.value || qualSelect.value === 'GCE A-Level' || qualSelect.value === 'Baccalaureat') {
          for (let i = 0; i < qualSelect.options.length; i++) {
            if (qualSelect.options[i].value.includes('Bachelors')) {
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
  tabsContainer.className = 'flex flex-wrap items-center gap-2 pt-1 pb-4';
  tabsContainer.innerHTML = `
    <button type="button" data-filter="all" class="prog-filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-dark text-white shadow-md transition-all">
      All Programmes
    </button>
    <button type="button" data-filter="postgraduate" class="prog-filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      <span>Master's &amp; MBA Degrees (19)</span>
    </button>
    <button type="button" data-filter="undergraduate" class="prog-filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all">
      Undergraduate &amp; HND
    </button>
  `;
  catalog.append(tabsContainer);

  // SECTION 1: MASTER'S & POSTGRADUATE PROGRAMMES (Executive Dark Theme Card)
  const postgradSection = document.createElement('div');
  postgradSection.id = 'section-postgraduate';
  postgradSection.className = 'space-y-4 mb-10 transition-all';
  postgradSection.innerHTML = `
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/30">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase tracking-wider">
            <span>★</span> Postgraduate &amp; Executive Studies
          </span>
          <span class="text-xs text-emerald-300 font-medium bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/20">
            Mentored by UBa &amp; UB
          </span>
        </div>

        <div>
          <h3 class="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            Master's, MSc &amp; MBA Degree Programmes
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Advanced clinical specializations, executive MBA, and engineering postgraduate degrees designed for university degree holders seeking hospital mastery, executive leadership, and research credentials.
          </p>
        </div>

        <div id="postgrad-cards-container" class="space-y-4 pt-2"></div>
      </div>
    </div>
  `;
  catalog.append(postgradSection);

  const postgradCardsContainer = postgradSection.querySelector('#postgrad-cards-container');
  for (const group of postgradGroups) {
    const card = document.createElement('div');
    card.className = 'prog-group-card bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3';
    card.dataset.level = 'postgraduate';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between pb-2 border-b border-white/10';
    header.innerHTML = `
      <h4 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
        <span class="text-amber-400">◆</span>
        <span>${group.label}</span>
      </h4>
      <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
        Postgraduate
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
          <span class="px-2.5 py-1 rounded-md bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold shrink-0">
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
    postgradCardsContainer.append(card);
  }

  // SECTION 2: UNDERGRADUATE & HND PROGRAMMES
  const undergradSection = document.createElement('div');
  undergradSection.id = 'section-undergraduate';
  undergradSection.className = 'space-y-4 transition-all';
  undergradSection.innerHTML = `
    <div class="flex items-center justify-between pt-4 pb-2 border-b border-slate-200">
      <div>
        <h3 class="text-xl sm:text-2xl font-bold font-serif text-slate-900">
          Undergraduate &amp; Professional Programmes
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Accredited Higher National Diploma (HND), Direct Bachelor's Degrees, BSc Top-Ups, and Concours examinations.
        </p>
      </div>
      <span class="text-xs px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-semibold">Undergraduate</span>
    </div>
    <div id="undergrad-cards-container" class="space-y-3"></div>
  `;
  catalog.append(undergradSection);

  const undergradCardsContainer = undergradSection.querySelector('#undergrad-cards-container');
  for (const group of undergradGroups) {
    const details = document.createElement('details');
    details.className = 'prog-group-card rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all';
    details.dataset.level = 'undergraduate';

    const summary = document.createElement('summary');
    summary.className = 'cursor-pointer px-5 py-4 font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between text-sm sm:text-base';
    summary.innerHTML = `
      <span class="flex items-center gap-2">
        <span class="text-brand-pine">▪</span>
        <span>${group.label}</span>
      </span>
      <span class="text-xs text-slate-400 font-normal">Click to expand</span>
    `;
    details.append(summary);

    const list = document.createElement('ul');
    list.className = 'divide-y divide-slate-100 px-5 pb-4 text-xs';
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
    undergradCardsContainer.append(details);
  }

  // 3. TAB FILTER & REAL-TIME SEARCH LOGIC
  let activeFilter = 'all';

  function applyFilterAndSearch() {
    const query = search ? search.value.trim().toLowerCase() : '';
    let totalVisible = 0;

    // A. Evaluate Postgraduate Section
    if (activeFilter === 'undergraduate') {
      postgradSection.style.display = 'none';
    } else {
      let postgradHasMatches = false;
      for (const card of postgradCardsContainer.children) {
        const groupTitle = card.querySelector('h4').textContent.toLowerCase();
        let cardMatches = groupTitle.includes(query);
        let itemsVisible = false;

        for (const row of card.querySelectorAll('.prog-item-row')) {
          const titleText = row.querySelector('.prog-title').textContent.toLowerCase();
          const matches = cardMatches || titleText.includes(query);
          row.style.display = matches ? '' : 'none';
          if (matches) itemsVisible = true;
        }

        card.style.display = itemsVisible ? '' : 'none';
        if (itemsVisible) {
          postgradHasMatches = true;
          totalVisible++;
        }
      }
      postgradSection.style.display = postgradHasMatches ? '' : 'none';
    }

    // B. Evaluate Undergraduate Section
    if (activeFilter === 'postgraduate') {
      undergradSection.style.display = 'none';
    } else {
      let undergradHasMatches = false;
      for (const details of undergradCardsContainer.children) {
        const summaryText = details.querySelector('summary').textContent.toLowerCase();
        let groupMatches = summaryText.includes(query);
        let itemsVisible = false;

        for (const row of details.querySelectorAll('.prog-item-row')) {
          const titleText = row.querySelector('.prog-title').textContent.toLowerCase();
          const matches = groupMatches || titleText.includes(query);
          row.style.display = matches ? '' : 'none';
          if (matches) itemsVisible = true;
        }

        details.style.display = itemsVisible ? '' : 'none';
        if (query && itemsVisible) details.open = true;
        if (itemsVisible) {
          undergradHasMatches = true;
          totalVisible++;
        }
      }
      undergradSection.style.display = undergradHasMatches ? '' : 'none';
    }

    if (empty) empty.hidden = (totalVisible > 0);
  }

  // Tabs click handler
  tabsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.prog-filter-tab');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    for (const b of tabsContainer.querySelectorAll('.prog-filter-tab')) {
      if (b === btn) {
        b.className = 'prog-filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-dark text-white shadow-md transition-all';
      } else {
        b.className = 'prog-filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all';
      }
    }
    applyFilterAndSearch();
  });

  if (search) {
    search.addEventListener('input', applyFilterAndSearch);
  }
});

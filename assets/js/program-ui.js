document.addEventListener('DOMContentLoaded', () => {
  const groups = window.rhibmsPrograms;
  const select = document.getElementById('app-program');
  if (select) {
    const requested = new URLSearchParams(location.search).get('program');
    for (const group of groups) {
      const options = document.createElement('optgroup');
      options.label = group.label;
      for (const program of group.programs) {
        const duration = program.years === 1 ? '1 year' : program.years + ' years';
        options.append(new Option(program.name + ' · ' + duration, program.name, false, requested === program.name));
      }
      select.append(options);
    }
  }

  const catalog = document.getElementById('program-catalog');
  if (!catalog) return;
  const search = document.getElementById('program-search');
  const empty = document.getElementById('program-empty');
  for (const group of groups) {
    const details = document.createElement('details');
    details.className = 'rounded-xl border border-slate-200 bg-white';
    const summary = document.createElement('summary');
    summary.className = 'cursor-pointer px-5 py-4 font-bold';
    summary.textContent = group.label;
    details.append(summary);
    const list = document.createElement('ul');
    list.className = 'divide-y divide-slate-100 px-5 pb-4';
    for (const program of group.programs) {
      const row = document.createElement('li');
      row.className = 'flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3';
      const title = document.createElement('span');
      title.textContent = program.name + ' · ' + program.years + (program.years === 1 ? ' year' : ' years');
      const apply = document.createElement('a');
      apply.className = 'font-semibold text-emerald-800 underline underline-offset-4';
      apply.href = 'admissions.html?' + new URLSearchParams({ program: program.name }) + '#apply-wizard';
      apply.textContent = 'Apply';
      apply.setAttribute('aria-label', 'Apply for ' + program.name);
      row.append(title, apply);
      list.append(row);
    }
    details.append(list);
    catalog.append(details);
  }
  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let matches = false;
    for (const details of catalog.children) {
      const groupMatches = details.firstElementChild.textContent.toLowerCase().includes(query);
      let visible = false;
      for (const row of details.querySelectorAll('li')) {
        row.hidden = !groupMatches && !row.firstElementChild.textContent.toLowerCase().includes(query);
        visible ||= !row.hidden;
      }
      details.hidden = !visible;
      if (query && visible) details.open = true;
      matches ||= visible;
    }
    empty.hidden = matches;
  });
});

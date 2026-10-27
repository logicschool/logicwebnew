(() => {
  'use strict';
  const filters = document.querySelector('.recorded-filters');
  const grid = document.querySelector('.recorded-grid');
  if (!filters || !grid) return;
  // Keep all cards visible and editable in the CMS; filters are a public-page aid.
  if (new URLSearchParams(location.search).has('cms_edit')) return;
  const count = document.querySelector('.recorded-count');
  const buttons = [...filters.querySelectorAll('button[data-recorded-filter]')];
  filters.hidden = false;
  function select(button) {
    const category = button.dataset.recordedFilter;
    let listed = 0, upcoming = 0;
    for (const card of grid.querySelectorAll('[data-recorded-category]')) {
      card.hidden = category !== 'all' && category !== card.dataset.recordedCategory;
      if (!card.hidden) card.classList.contains('recorded-upcoming') ? upcoming++ : listed++;
    }
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    if (count) count.textContent = `${listed} course${listed === 1 ? '' : 's'} listed${upcoming ? ` · ${upcoming} upcoming` : ''}`;
  }
  for (const button of buttons) button.addEventListener('click', () => select(button));
  if (buttons[0]) select(buttons[0]);
})();

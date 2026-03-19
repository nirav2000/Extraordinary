const state = { data: [], resources: [], category: 'All', scope: 'all', search: '', sort: 'rank-asc' };
const els = {
  grid: document.getElementById('cardsGrid'),
  template: document.getElementById('cardTemplate'),
  categoryChips: document.getElementById('categoryChips'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  resultsCount: document.getElementById('resultsCount'),
  resourceList: document.getElementById('resourceList'),
  statProfiles: document.getElementById('statProfiles')
};
fetch('data.json').then(r => r.json()).then(({ profiles, resources }) => {
  state.data = profiles;
  state.resources = resources;
  els.statProfiles.textContent = profiles.length;
  renderCategoryChips();
  renderResources();
  bindEvents();
  render();
});
function bindEvents() {
  els.searchInput.addEventListener('input', e => { state.search = e.target.value.trim().toLowerCase(); render(); });
  els.sortSelect.addEventListener('change', e => { state.sort = e.target.value; render(); });
  document.querySelectorAll('.toggle').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.scope = btn.dataset.scope;
    render();
  }));
}
function renderCategoryChips() {
  const cats = ['All', ...new Set(state.data.map(item => item.displayCategory))];
  els.categoryChips.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (cat === state.category ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => { state.category = cat; renderCategoryChips(); render(); });
    els.categoryChips.appendChild(btn);
  });
}
function renderResources() {
  els.resourceList.innerHTML = '';
  state.resources.forEach(resource => {
    const item = document.createElement('article');
    item.className = 'resource-item';
    item.innerHTML = `<div class="resource-top"><div><div class="meta-row"><span class="pill resource-type">${escapeHtml(resource.type)}</span></div><h3>${escapeHtml(resource.resource)}</h3></div></div><p>${escapeHtml(resource.summary)}</p><a href="${resource.url}" target="_blank" rel="noreferrer">Open resource</a>`;
    els.resourceList.appendChild(item);
  });
}
function filteredData() {
  let items = [...state.data];
  if (state.scope === 'featured') items = items.filter(item => item.featured);
  if (state.scope === 'bench') items = items.filter(item => !item.featured);
  if (state.category !== 'All') items = items.filter(item => item.displayCategory === state.category);
  if (state.search) items = items.filter(item => [item.name, item.achievement, item.why, item.country, item.category].join(' ').toLowerCase().includes(state.search));
  items.sort(sorter(state.sort));
  return items;
}
function sorter(mode) {
  const [field, dir] = mode.split('-');
  const mul = dir === 'desc' ? -1 : 1;
  return (a, b) => field === 'name' ? a.name.localeCompare(b.name) * mul : (((a[field] ?? 0) > (b[field] ?? 0)) ? 1 : ((a[field] ?? 0) < (b[field] ?? 0)) ? -1 : 0) * mul;
}
function render() {
  const items = filteredData();
  els.resultsCount.textContent = items.length;
  els.grid.innerHTML = '';
  if (!items.length) { els.grid.innerHTML = '<div class="empty-state">No profiles match your current search or filters.</div>'; return; }
  items.forEach(item => {
    const frag = els.template.content.cloneNode(true);
    const img = frag.querySelector('.portrait');
    img.src = item.portrait;
    img.alt = `Portrait illustration of ${item.name}`;
    frag.querySelector('.category-pill').textContent = item.displayCategory;
    frag.querySelector('.tone-pill').textContent = item.tone || (item.featured ? 'Core profile' : 'Bench profile');
    frag.querySelector('.card-name').textContent = item.name;
    frag.querySelector('.submeta').textContent = `${item.country} · Age ${item.age} · ${item.year} · Rank ${item.rank}`;
    frag.querySelector('.achievement').textContent = item.achievement;
    frag.querySelector('.why-text').textContent = item.why;
    els.grid.appendChild(frag);
  });
}
function escapeHtml(str='') { return str.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }

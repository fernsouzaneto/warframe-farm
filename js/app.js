const App = {
  warframes: [],

  init() {
    const el = document.getElementById('warframes-data');
    try { this.warframes = JSON.parse(el.textContent); }
    catch (e) {
      document.getElementById('warframeGrid').innerHTML = '<div class="empty-state"><h3>Erro ao carregar dados</h3><p>Verifique se data/warframes.json existe.</p></div>';
      return;
    }

    Render.init();
    Search.init();
    Filters.init();

    document.getElementById('warframeGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (btn) {
        Store.toggleCompleted(btn.dataset.id);
        this.renderAll();
        return;
      }

      const fav = e.target.closest('.fav-btn');
      if (fav) {
        e.stopPropagation();
        Store.toggleFavorite(fav.dataset.favId);
        this.renderAll();
        return;
      }

      const chk = e.target.closest('.part-check');
      const label = e.target.closest('.part-label');
      const targetPart = chk || (label ? label.querySelector('.part-check') : null);
      if (targetPart) {
        const frameId = targetPart.dataset.frame;
        const partName = targetPart.dataset.part;
        const doneParts = Store.togglePart(frameId, partName);
        const w = this.warframes.find(f => f.id === frameId);
        if (w) {
          const allParts = w.drops.map(d => d.part);
          const allDone = allParts.every(p => doneParts.indexOf(p) !== -1);
          if (allDone && !Store.isCompleted(frameId)) {
            Store.toggleCompleted(frameId);
          } else if (!allDone && Store.isCompleted(frameId)) {
            Store.toggleCompleted(frameId);
          }
        }
        this.renderAll();
        return;
      }

      const card = e.target.closest('.warframe-card');
      if (card) {
        const id = card.dataset.modalId;
        if (id) Modal.open(id);
      }
    });

    document.getElementById('clearStorage').addEventListener('click', () => {
      if (confirm('Limpar todo o progresso salvo?')) {
        Store.clearAll();
        this.renderAll();
      }
    });

    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        Render.sortBy = btn.dataset.sort;
        sortBtns.forEach(b => b.classList.toggle('active', b === btn));
        this.renderAll();
      });
    });

    this.renderAll();
  },

  renderAll() {
    const query = Search.getTerm();
    let filtered = this.warframes;
    if (query) filtered = filtered.filter(w => Search.matches(w));
    filtered = filtered.filter(w => Filters.matches(w));
    Render.renderAll(filtered);
    this.updateProgress();
    this.updateStats();
  },

  updateProgress() {
    const total = this.warframes.length;
    const completed = Store.getCompleted().length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const detail = document.getElementById('progress-detail');
    const label = document.getElementById('progress-label');
    const ring = document.getElementById('progress-ring-fill');

    const dash = Math.round((pct / 100) * 100);
    if (detail) {
      detail.querySelector('.num').textContent = completed;
      detail.querySelector('.total').textContent = total;
    }
    if (label) label.textContent = pct + '%';
    if (ring) ring.setAttribute('stroke-dasharray', dash + ', 100');
  },

  updateStats() {
    const total = this.warframes.length;
    const completed = Store.getCompleted().length;
    const pending = total - completed;
    const favCount = Store.getFavorites().length;
    const panel = document.getElementById('stats-panel');
    if (!panel) return;

    const planets = new Set(this.warframes.map(w => w.planet));

    panel.innerHTML = `
      <div class="stat-item"><div class="stat-val">${pending}</div><div class="stat-lbl">Pendentes</div></div>
      <div class="stat-item"><div class="stat-val">${completed}</div><div class="stat-lbl">Concluidos</div></div>
      <div class="stat-item"><div class="stat-val">${favCount}</div><div class="stat-lbl">Favoritos</div></div>
    `;
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

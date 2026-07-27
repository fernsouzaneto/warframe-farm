const App = {
  warframes: [],
  primes: [],
  currentTab: 'warframes',

  init() {
    const el = document.getElementById('warframes-data');
    try { this.warframes = JSON.parse(el.textContent); }
    catch (e) {
      document.getElementById('warframeGrid').innerHTML = '<div class="empty-state"><h3>Erro ao carregar dados</h3><p>Verifique se data/warframes.json existe.</p></div>';
      return;
    }

    const elPrime = document.getElementById('warframes-prime-data');
    try { this.primes = JSON.parse(elPrime.textContent); }
    catch (e) {
      // dados de prime sao opcionais
    }

    Render.init();
    Search.init();
    Filters.init();

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        Render.sortBy = 'name';
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === 'name'));
        this.renderAll();
      });
    });

    document.getElementById('warframeGrid').addEventListener('click', (e) => {
      const isPrime = this.currentTab === 'primes';

      const btn = e.target.closest('.toggle-btn');
      if (btn) {
        if (isPrime) Store.togglePrimeCompleted(btn.dataset.id);
        else Store.toggleCompleted(btn.dataset.id);
        this.renderAll();
        return;
      }

      const fav = e.target.closest('.fav-btn');
      if (fav) {
        e.stopPropagation();
        if (isPrime) Store.togglePrimeFavorite(fav.dataset.favId);
        else Store.toggleFavorite(fav.dataset.favId);
        this.renderAll();
        return;
      }

      const chk = e.target.closest('.part-check');
      const label = e.target.closest('.part-label');
      const targetPart = chk || (label ? label.querySelector('.part-check') : null);
      if (targetPart) {
        const frameId = targetPart.dataset.frame;
        const partName = targetPart.dataset.part;
        const dataset = isPrime ? this.primes : this.warframes;
        const doneParts = isPrime ? Store.togglePrimePart(frameId, partName) : Store.togglePart(frameId, partName);
        const w = dataset.find(f => f.id === frameId);
        if (w) {
          const allParts = w.drops.map(d => d.part);
          const allDone = allParts.every(p => doneParts.indexOf(p) !== -1);
          const completed = isPrime ? Store.isPrimeCompleted(frameId) : Store.isCompleted(frameId);
          if (allDone && !completed) {
            if (isPrime) Store.togglePrimeCompleted(frameId);
            else Store.toggleCompleted(frameId);
          } else if (!allDone && completed) {
            if (isPrime) Store.togglePrimeCompleted(frameId);
            else Store.toggleCompleted(frameId);
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

  getActiveDataset() {
    return this.currentTab === 'primes' ? this.primes : this.warframes;
  },

  renderAll() {
    const dataset = this.getActiveDataset();
    const query = Search.getTerm();
    let filtered = dataset;
    if (query) filtered = filtered.filter(w => Search.matches(w));
    filtered = filtered.filter(w => Filters.matches(w));
    Render.renderAll(filtered);
    this.updateProgress();
    this.updateStats();
  },

  updateProgress() {
    const dataset = this.getActiveDataset();
    const total = dataset.length;
    const completed = this.currentTab === 'primes' ? Store.getPrimeCompleted().length : Store.getCompleted().length;
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
    const dataset = this.getActiveDataset();
    const total = dataset.length;
    const completed = this.currentTab === 'primes' ? Store.getPrimeCompleted().length : Store.getCompleted().length;
    const pending = total - completed;
    const favCount = this.currentTab === 'primes' ? Store.getPrimeFavorites().length : Store.getFavorites().length;
    const panel = document.getElementById('stats-panel');
    if (!panel) return;

    if (this.currentTab === 'primes') {
      const vaulted = dataset.filter(w => w.vaulted).length;
      panel.innerHTML = `
        <div class="stat-item"><div class="stat-val">${pending}</div><div class="stat-lbl">Pendentes</div></div>
        <div class="stat-item"><div class="stat-val">${completed}</div><div class="stat-lbl">Concluidos</div></div>
        <div class="stat-item"><div class="stat-val">${favCount}</div><div class="stat-lbl">Favoritos</div></div>
        <div class="stat-item"><div class="stat-val">${vaulted}</div><div class="stat-lbl">Vaulted</div></div>
      `;
    } else {
      panel.innerHTML = `
        <div class="stat-item"><div class="stat-val">${pending}</div><div class="stat-lbl">Pendentes</div></div>
        <div class="stat-item"><div class="stat-val">${completed}</div><div class="stat-lbl">Concluidos</div></div>
        <div class="stat-item"><div class="stat-val">${favCount}</div><div class="stat-lbl">Favoritos</div></div>
      `;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

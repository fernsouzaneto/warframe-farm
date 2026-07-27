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
        const id = btn.dataset.id;
        const dataset = isPrime ? this.primes : this.warframes;
        const w = dataset.find(f => f.id === id);
        if (w) {
          const allParts = w.drops.map(d => d.part);
          if (isPrime) {
            if (Store.isPrimeCompleted(id)) {
              Store.clearPrimeFrameParts(id);
              Store.togglePrimeCompleted(id);
            } else {
              Store.setPrimeFrameParts(id, allParts);
              if (!Store.isPrimeCompleted(id)) Store.togglePrimeCompleted(id);
            }
          } else {
            if (Store.isCompleted(id)) {
              Store.clearFrameParts(id);
              Store.toggleCompleted(id);
            } else {
              Store.setFrameParts(id, allParts);
              if (!Store.isCompleted(id)) Store.toggleCompleted(id);
            }
          }
        }
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
    const updateOne = (detailId, labelId, ringId, completed, total) => {
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const dash = Math.round((pct / 100) * 100);
      const detail = document.getElementById(detailId);
      const label = document.getElementById(labelId);
      const ring = document.getElementById(ringId);
      if (detail) {
        detail.querySelector('.num').textContent = completed;
        detail.querySelector('.total').textContent = total;
      }
      if (label) label.textContent = pct + '%';
      if (ring) ring.setAttribute('stroke-dasharray', dash + ', 100');
    };

    const wfCompleted = Store.getCompleted().length;
    const primeCompleted = Store.getPrimeCompleted().length;

    updateOne('progress-detail', 'progress-label', 'progress-ring-fill', wfCompleted, this.warframes.length);
    updateOne('prime-progress-detail', 'prime-progress-label', 'prime-ring-fill', primeCompleted, this.primes.length);
  },

  updateStats() {
    const dataset = this.getActiveDataset();
    const total = dataset.length;
    const completed = this.currentTab === 'primes' ? Store.getPrimeCompleted().length : Store.getCompleted().length;
    const pending = total - completed;
    const favCount = this.currentTab === 'primes' ? Store.getPrimeFavorites().length : Store.getFavorites().length;
    const panel = document.getElementById('stats-panel');
    if (!panel) return;

    const active = Filters.current;

    const statItem = (filter, val, label) =>
      `<div class="stat-item${active === filter ? ' active' : ''}" data-filter="${filter}"><div class="stat-val">${val}</div><div class="stat-lbl">${label}</div></div>`;

    if (this.currentTab === 'primes') {
      const vaulted = dataset.filter(w => w.vaulted).length;
      panel.innerHTML =
        statItem('pending', pending, 'Pendentes') +
        statItem('completed', completed, 'Concluidos') +
        statItem('favoritos', favCount, 'Favoritos') +
        statItem('vaulted', vaulted, 'Vaulted');
    } else {
      panel.innerHTML =
        statItem('pending', pending, 'Pendentes') +
        statItem('completed', completed, 'Concluidos') +
        statItem('favoritos', favCount, 'Favoritos');
    }

    panel.querySelectorAll('.stat-item').forEach(el => {
      el.addEventListener('click', () => {
        const filter = el.dataset.filter;
        if (filter === Filters.current) {
          Filters.current = 'all';
        } else {
          Filters.current = filter;
        }
        document.querySelectorAll('.filters .chip').forEach(c => c.classList.toggle('active', c.dataset.filter === Filters.current));
        App.renderAll();
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

const Render = {
  grid: null,
  sortBy: 'name',

  init() { this.grid = document.getElementById('warframeGrid'); },

  renderAll(warframes) {
    if (!this.grid) return;

    if (App.currentTab === 'primes') {
      this.renderPrimes(warframes);
      return;
    }

    const sortFn = this.getSortFn();

    const pending = warframes.filter(w => !Store.isCompleted(w.id));
    const completed = warframes.filter(w => Store.isCompleted(w.id));

    pending.sort(sortFn);
    completed.sort(sortFn);

    const section = (label, list) => {
      if (!list.length) return '';
      return `<div class="planet-group">
        <div class="planet-header" onclick="Render.toggle(this)">
          <span class="planet-toggle">&#9660;</span>
          <h2>${label}</h2>
          <span class="planet-count">${list.length}</span>
        </div>
        <div class="planet-content">
          <div class="card-grid">${list.map(f => this.card(f)).join('')}</div>
        </div>
      </div>`;
    };

    let html = section('Pendentes', pending) + section('Concluidos', completed);

    if (!html) {
      html = '<div class="empty-state"><h3>Nenhum Warframe encontrado</h3><p>Tente ajustar os filtros ou pesquisa.</p></div>';
    }

    this.grid.innerHTML = html;
  },

  renderPrimes(warframes) {
    const sortFn = this.getSortFn();

    const available = warframes.filter(w => !w.vaulted);
    const vaulted = warframes.filter(w => w.vaulted);

    available.sort(sortFn);
    vaulted.sort(sortFn);

    let html = '';

    if (available.length) {
      const done = available.filter(f => Store.isPrimeCompleted(f.id)).length;
      html += `<div class="planet-group">
        <div class="planet-header" onclick="Render.toggle(this)">
          <span class="planet-toggle">&#9660;</span>
          <h2>Disponivel</h2>
          <span class="planet-count">${done}/${available.length}</span>
        </div>
        <div class="planet-content">
          <div class="card-grid">${available.map(f => this.primeCard(f)).join('')}</div>
        </div>
      </div>`;
    }

    if (vaulted.length) {
      const done = vaulted.filter(f => Store.isPrimeCompleted(f.id)).length;
      html += `<div class="planet-group">
        <div class="planet-header" onclick="Render.toggle(this)">
          <span class="planet-toggle">&#9660;</span>
          <h2>No Vault (Vaulted)</h2>
          <span class="planet-count">${done}/${vaulted.length}</span>
        </div>
        <div class="planet-content">
          <div class="card-grid">${vaulted.map(f => this.primeCard(f)).join('')}</div>
        </div>
      </div>`;
    }

    if (!html) {
      html = '<div class="empty-state"><h3>Nenhum Warframe Prime encontrado</h3><p>Tente ajustar os filtros ou pesquisa.</p></div>';
    }

    this.grid.innerHTML = html;
  },

  getSortFn() {
    const s = this.sortBy;
    if (s === 'planet') return (a, b) => (a.planet || '').localeCompare(b.planet || '');
    if (s === 'difficulty') return (a, b) => {
      const rank = { 'Facil': 0, 'Media': 1, 'Dificil': 2 };
      return (rank[a.difficulty] ?? 1) - (rank[b.difficulty] ?? 1);
    };
    if (s === 'parts') {
      const isPrime = App.currentTab === 'primes';
      return (a, b) => {
        const aDone = isPrime ? Store.getPrimeFrameParts(a.id).length : Store.getFrameParts(a.id).length;
        const bDone = isPrime ? Store.getPrimeFrameParts(b.id).length : Store.getFrameParts(b.id).length;
        if (aDone !== bDone) return bDone - aDone;
        return (a.name || '').localeCompare(b.name || '');
      };
    }
    const isPrime = App.currentTab === 'primes';
    return (a, b) => {
      const aDone = isPrime ? (Store.isPrimeCompleted(a.id) ? 1 : 0) : (Store.isCompleted(a.id) ? 1 : 0);
      const bDone = isPrime ? (Store.isPrimeCompleted(b.id) ? 1 : 0) : (Store.isCompleted(b.id) ? 1 : 0);
      if (aDone !== bDone) return aDone - bDone;
      return (a.name || '').localeCompare(b.name || '');
    };
  },

  card(w) {
    const done = Store.isCompleted(w.id);
    const fav = Store.isFavorite(w.id);
    const badge = this.getBadge(w.missionType);
    const doneParts = Store.getFrameParts(w.id);

    const showRot = d => {
      const na = ['N/A','Boss','Quest','Syndicate','Dojo','Junction'];
      return na.indexOf(d.rotation) !== -1 ? '<span class="na">-</span>' : this.esc(d.rotation);
    };

    const imgSrc = w.image ? this.esc(w.image) : '';
    return `<div class="warframe-card ${done?'completed':''}" data-modal-id="${this.esc(w.id)}">
      <div class="card-img">${imgSrc ? `<img src="${imgSrc}" alt="${this.esc(w.name)}" class="card-img-src" loading="lazy">` : ''}
        <span class="card-badge ${badge.cls}">${badge.label}</span>
        ${done ? '<span class="card-badge completed-badge">Concluido</span>' : ''}
        <button class="fav-btn ${fav?'active':''}" data-fav-id="${this.esc(w.id)}" title="${fav?'Remover dos favoritos':'Adicionar aos favoritos'}">${fav?'&#9733;':'&#9734;'}</button>
      </div>
      <div class="card-body">
        <div class="card-head">
          <h3 class="card-title">${this.esc(w.name)}</h3>
          ${w.wiki ? `<a href="${this.esc(w.wiki)}" target="_blank" rel="noopener" class="wiki-link" title="Abrir na Wiki">&#128279;</a>` : ''}
        </div>
        <div class="card-subtitle"><span class="planet-tag ${this.planetClass(w.planet)}">${this.esc(w.planet)}</span><span class="mission-tag">${this.esc(w.mission)}</span></div>
        <div class="parts-checklist">${w.drops.map(d => {
          const pid = this.esc(w.id) + '-' + this.esc(d.part).replace(/\s+/g, '_');
          const checked = doneParts.indexOf(d.part) !== -1 ? 'checked' : '';
          return `<label class="part-label"><input type="checkbox" class="part-check" data-frame="${this.esc(w.id)}" data-part="${this.esc(d.part)}" id="${pid}" ${checked}> ${this.esc(d.part)}</label>`;
        }).join('')}</div>
        <button class="btn btn-sm ${done?'btn-ghost':'btn-accent'} toggle-btn" data-id="${this.esc(w.id)}">${done ? 'Remover Conclusao' : 'Marcar como Concluido'}</button>
      </div>
    </div>`;
  },

  primeCard(w) {
    const done = Store.isPrimeCompleted(w.id);
    const fav = Store.isPrimeFavorite(w.id);
    const doneParts = Store.getPrimeFrameParts(w.id);

    const imgSrc = w.image ? this.esc(w.image) : '';
    return `<div class="warframe-card ${done?'completed':''}" data-modal-id="${this.esc(w.id)}">
      <div class="card-img">${imgSrc ? `<img src="${imgSrc}" alt="${this.esc(w.name)}" class="card-img-src" loading="lazy">` : ''}
        <span class="card-badge badge-prime">Prime</span>
        ${w.vaulted ? '<span class="card-badge badge-vaulted">Vaulted</span>' : ''}
        ${done ? '<span class="card-badge completed-badge">Concluido</span>' : ''}
        <button class="fav-btn ${fav?'active':''}" data-fav-id="${this.esc(w.id)}" title="${fav?'Remover dos favoritos':'Adicionar aos favoritos'}">${fav?'&#9733;':'&#9734;'}</button>
      </div>
      <div class="card-body">
        <div class="card-head">
          <h3 class="card-title">${this.esc(w.name)}</h3>
          ${w.wiki ? `<a href="${this.esc(w.wiki)}" target="_blank" rel="noopener" class="wiki-link" title="Abrir na Wiki">&#128279;</a>` : ''}
        </div>
        <div class="card-subtitle">Void Fissures ${w.vaulted ? '&middot; <span class="vaulted-label">Vaulted</span>' : '&middot; <span class="available-label">Disponivel</span>'}</div>
        <div class="parts-checklist">${w.drops.map(d => {
          const pid = this.esc(w.id) + '-' + this.esc(d.part).replace(/\s+/g, '_');
          const checked = doneParts.indexOf(d.part) !== -1 ? 'checked' : '';
          const ducatVal = d.ducats || '';
          return `<label class="part-label"><input type="checkbox" class="part-check" data-frame="${this.esc(w.id)}" data-part="${this.esc(d.part)}" id="${pid}" ${checked}> ${this.esc(d.part)}${ducatVal ? ` <span class="ducats-badge">${ducatVal} <span class="ducat-icon">D</span></span>` : ''}</label>`;
        }).join('')}</div>
        <button class="btn btn-sm ${done?'btn-ghost':'btn-accent'} toggle-btn" data-id="${this.esc(w.id)}">${done ? 'Remover Conclusao' : 'Marcar como Concluido'}</button>
      </div>
    </div>`;
  },

  planetClass(planet) {
    const map = {
      'Venus':'planet-venus','Orb Vallis':'planet-orb-vallis','Deimos':'planet-deimos',
      'Mars':'planet-mars','Earth':'planet-earth','Ceres':'planet-ceres','Phobos':'planet-phobos',
      'Saturn':'planet-saturn','Jupiter':'planet-jupiter','Europa':'planet-europa',
      'Eris':'planet-eris','Lua':'planet-lua','Uranus':'planet-uranus','Uranus Proxima':'planet-uranus-proxima',
      'Neptune':'planet-neptune','Neptune Proxima':'planet-neptune-proxima',
      'Sedna':'planet-sedna','Pluto':'planet-pluto','Orokin Fortress':'planet-orokin-fortress',
      'Void':'planet-void','Archwing':'planet-archwing','Cetus':'planet-cetus','Duviri':'planet-duviri',
      'Hollvania':'planet-hollvania','Zariman':'planet-zariman','Sanctum Anatomica':'planet-sanctum-anatomica',
      'Junctions':'planet-junctions','Spy Missions':'planet-spy-missions','Nightwave':'planet-nightwave',
      'Dojo':'planet-dojo','Qualquer':'planet-qualquer',
    };
    return map[planet] || '';
  },

  getBadge(mt) {
    if (!mt) return { label:'Outro', cls:'badge-rotation' };
    const t = mt.toLowerCase();
    if (t.includes('granum')) return { label:'Granum', cls:'badge-granum' };
    if (t.includes('follie')) return { label:"Follie's Hunt", cls:'badge-follie' };
    if (t.includes('boss')) return { label:'Boss', cls:'badge-boss' };
    if (t.includes('quest')) return { label:'Quest', cls:'badge-quest' };
    if (t.includes('mirror')) return { label:'Mirror Defense', cls:'badge-defense' };
    if (t.includes('stage')) return { label:'Stage Defense', cls:'badge-stage' };
    if (t.includes('ascension')) return { label:'Ascension', cls:'badge-ascension' };
    if (t.includes('open') || t.includes('narmer')) return { label:'Open World', cls:'badge-world' };
    if (t.includes('syndicate')) return { label:'Syndicate', cls:'badge-syndicate' };
    if (t.includes('dojo')) return { label:'Dojo', cls:'badge-dojo' };
    if (t.includes('disruption')) return { label:'Disruption', cls:'badge-disruption' };
    if (t.includes('spy') || t.includes('rotation') || t.includes('puzzle')) return { label:'Rotation', cls:'badge-rotation' };
    if (t.includes('railjack')) return { label:'Railjack', cls:'badge-railjack' };
    if (t.includes('defense')) return { label:'Defense', cls:'badge-defense' };
    return { label:t.substring(0,12), cls:'badge-rotation' };
  },

  toggle(header) {
    header.classList.toggle('collapsed');
    const content = header.nextElementSibling;
    if (content) content.style.display = content.style.display === 'none' ? '' : 'none';
  },

  esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },
};

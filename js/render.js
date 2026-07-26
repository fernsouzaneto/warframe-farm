const Render = {
  grid: null,
  sortBy: 'name',

  init() { this.grid = document.getElementById('warframeGrid'); },

  renderAll(warframes) {
    if (!this.grid) return;

    const groups = {};
    for (const w of warframes) {
      const p = w.planet || 'Outros';
      if (!groups[p]) groups[p] = [];
      groups[p].push(w);
    }

    const planetOrder = [
      'Venus','Orb Vallis','Deimos','Mars','Earth','Ceres','Phobos','Saturn',
      'Jupiter','Europa','Eris','Lua','Uranus','Uranus Proxima','Neptune',
      'Neptune Proxima','Sedna','Pluto','Orokin Fortress','Void','Archwing',
      'Cetus','Duviri','Hollvania','Zariman','Sanctum Anatomica',
      'Junctions','Spy Missions','Nightwave','Dojo',
    ];

    const planetRank = {};
    planetOrder.forEach((p, i) => { planetRank[p] = i; });

    const sortedPlanets = Object.keys(groups).sort((a, b) => (planetRank[a] ?? 99) - (planetRank[b] ?? 99));

    const sortFn = this.getSortFn();

    let html = '';
    for (const planet of sortedPlanets) {
      const frames = groups[planet];
      const done = frames.filter(f => Store.isCompleted(f.id)).length;

      frames.sort(sortFn);

      html += `<div class="planet-group">
        <div class="planet-header" onclick="Render.toggle(this)">
          <span class="planet-toggle">&#9660;</span>
          <h2>${this.esc(planet)}</h2>
          <span class="planet-count">${done}/${frames.length}</span>
        </div>
        <div class="planet-content">
          <div class="card-grid">${frames.map(f => this.card(f)).join('')}</div>
        </div>
      </div>`;
    }

    if (!html) {
      html = '<div class="empty-state"><h3>Nenhum Warframe encontrado</h3><p>Tente ajustar os filtros ou pesquisa.</p></div>';
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
    if (s === 'parts') return (a, b) => {
      const aDone = Store.getFrameParts(a.id).length;
      const bDone = Store.getFrameParts(b.id).length;
      if (aDone !== bDone) return bDone - aDone;
      return (a.name || '').localeCompare(b.name || '');
    };
    return (a, b) => {
      const aDone = Store.isCompleted(a.id) ? 1 : 0;
      const bDone = Store.isCompleted(b.id) ? 1 : 0;
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
        <div class="card-subtitle">${this.esc(w.planet)} &middot; ${this.esc(w.mission)}</div>
        <div class="parts-checklist">${w.drops.map(d => {
          const pid = this.esc(w.id) + '-' + this.esc(d.part).replace(/\s+/g, '_');
          const checked = doneParts.indexOf(d.part) !== -1 ? 'checked' : '';
          return `<label class="part-label"><input type="checkbox" class="part-check" data-frame="${this.esc(w.id)}" data-part="${this.esc(d.part)}" id="${pid}" ${checked}> ${this.esc(d.part)}</label>`;
        }).join('')}</div>
        <button class="btn btn-sm ${done?'btn-ghost':'btn-accent'} toggle-btn" data-id="${this.esc(w.id)}">${done ? 'Remover Conclusao' : 'Marcar como Concluido'}</button>
      </div>
    </div>`;
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

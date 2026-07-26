const Modal = {
  open(frameId) {
    const w = App.warframes.find(f => f.id === frameId);
    if (!w) return;
    const html = this.renderModal(w);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const el = temp.firstElementChild;
    document.body.appendChild(el);

    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.id === 'modalClose') this.close(el);
    });
    document.addEventListener('keydown', this._keyHandler = (e) => {
      if (e.key === 'Escape') this.close(el);
    });
    document.body.style.overflow = 'hidden';
  },

  renderModal(w) {
    const badge = Render.getBadge(w.missionType);
    const parts = Store.getFrameParts(w.id);
    const allDrops = w.drops.map(d => `<tr><td>${Render.esc(d.part)}</td><td>${Render.esc(d.location)}</td><td>${Render.esc(d.rotation)}</td><td>${Render.esc(d.chance)}</td><td><span class="part-status ${parts.indexOf(d.part) !== -1 ? 'obtido' : ''}">${parts.indexOf(d.part) !== -1 ? 'Obtido' : 'Pendente'}</span></td></tr>`).join('');

    const imgSrc = w.image ? Render.esc(w.image) : '';
    return `<div class="modal-backdrop" id="modalBackdrop">
      <div class="modal-window">
        <button class="modal-close" id="modalClose">&times;</button>
        <div class="modal-img">${imgSrc ? `<img src="${imgSrc}" alt="${Render.esc(w.name)}" class="modal-img-src" loading="lazy">` : ''}<span class="modal-badge ${badge.cls}">${badge.label}</span></div>
        <div class="modal-body">
          <h2 class="modal-title">${Render.esc(w.name)}</h2>
          <div class="modal-meta">${Render.esc(w.planet)} &middot; ${Render.esc(w.mission)}</div>
          <p class="modal-desc">${Render.esc(w.description || '')}</p>
          <div class="modal-section">
            <h4>Como obter</h4>
            <p>${Render.esc(w.howToGet || '')}</p>
          </div>
          ${w.requirements ? `<div class="modal-section"><h4>Requisitos</h4><p>${Render.esc(w.requirements)}</p></div>` : ''}
          <div class="modal-section">
            <h4>Tabela de Drops</h4>
            <table class="drops-table"><thead><tr><th>Parte</th><th>Local</th><th>Rot.</th><th>Chance</th><th>Status</th></tr></thead><tbody>${allDrops}</tbody></table>
          </div>
        </div>
      </div>
    </div>`;
  },

  close(el) {
    if (document.getElementById('modalBackdrop')) {
      document.getElementById('modalBackdrop').remove();
    } else if (el) {
      el.remove();
    }
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
    document.body.style.overflow = '';
  },
};

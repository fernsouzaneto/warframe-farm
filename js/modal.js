const Modal = {
  open(frameId) {
    const w = App.warframes.find(f => f.id === frameId) || App.primes.find(f => f.id === frameId);
    if (!w) return;
    const html = w.isPrime ? this.renderPrimeModal(w) : this.renderModal(w);
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
          <h2 class="modal-title">${Render.esc(w.name)} ${w.wiki ? `<a href="${Render.esc(w.wiki)}" target="_blank" rel="noopener" class="wiki-link" title="Abrir na Wiki">&#128279;</a>` : ''}</h2>
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

  renderPrimeModal(w) {
    const parts = Store.getPrimeFrameParts(w.id);

    const relicTiers = { 'Lith':'#8B6914', 'Meso':'#2E86AB', 'Neo':'#1B7A4A', 'Axi':'#A93226' };

    const rows = w.drops.map(d => {
      const obtained = parts.indexOf(d.part) !== -1;
      const relicCells = d.relics.map(r => {
        const color = relicTiers[r.tier] || '#666';
        return `<span class="relic-name" style="border-left:3px solid ${color}" title="${Render.esc(r.tier)} ${Render.esc(r.name)}: Intact ${Render.esc(r.intact)}, Exceptional ${Render.esc(r.exceptional)}, Flawless ${Render.esc(r.flawless)}, Radiant ${Render.esc(r.radiant)}">${Render.esc(r.tier)} ${Render.esc(r.name)} <span class="relic-rarity ${r.rarity === 'Raro' ? 'raro' : r.rarity === 'Incomum' ? 'incomum' : 'comum'}">${Render.esc(r.rarity)}</span></span>`;
      }).join(', ');
      return `<tr class="${obtained ? 'obtido' : ''}">
        <td>${Render.esc(d.part)}</td>
        <td class="relics-cell">${relicCells}</td>
        <td class="ducats-cell">${d.ducats || '-'}</td>
        <td><span class="part-status ${obtained ? 'obtido' : ''}">${obtained ? 'Obtido' : 'Pendente'}</span></td>
      </tr>`;
    }).join('');

    const badge = w.vaulted ? 'badge-vaulted' : 'badge-prime';
    const badgeLabel = w.vaulted ? 'Vaulted' : 'Prime';

    const imgSrc = w.image ? Render.esc(w.image) : '';
    return `<div class="modal-backdrop" id="modalBackdrop">
      <div class="modal-window modal-prime">
        <button class="modal-close" id="modalClose">&times;</button>
        <div class="modal-img">${imgSrc ? `<img src="${imgSrc}" alt="${Render.esc(w.name)}" class="modal-img-src" loading="lazy">` : ''}<span class="modal-badge ${badge}">${badgeLabel}</span></div>
        <div class="modal-body">
          <h2 class="modal-title">${Render.esc(w.name)} ${w.wiki ? `<a href="${Render.esc(w.wiki)}" target="_blank" rel="noopener" class="wiki-link" title="Abrir na Wiki">&#128279;</a>` : ''}</h2>
          <div class="modal-meta">Void Fissures &middot; ${w.vaulted ? '<span class="vaulted-label">Vaulted</span>' : '<span class="available-label">Disponivel</span>'}</div>
          <p class="modal-desc">${Render.esc(w.description || '')}</p>
          <div class="modal-section">
            <h4>Como obter</h4>
            <p>${Render.esc(w.howToGet || '')}</p>
          </div>
          ${w.requirements ? `<div class="modal-section"><h4>Requisitos</h4><p>${Render.esc(w.requirements)}</p></div>` : ''}
          <div class="modal-section">
            <h4>Tabela de Reliquias</h4>
            <div class="relic-legend">
              <span class="relic-legend-item lith-legend">Lith</span>
              <span class="relic-legend-item meso-legend">Meso</span>
              <span class="relic-legend-item neo-legend">Neo</span>
              <span class="relic-legend-item axi-legend">Axi</span>
            </div>
            <table class="drops-table prime-drops-table">
              <thead><tr><th>Parte</th><th>Reliquias</th><th>Ducats</th><th>Status</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <details class="relic-chances-details">
            <summary>Chances por refinamento</summary>
            <table class="drops-table chance-table">
              <thead><tr><th>Refinamento</th><th>Comum</th><th>Incomum</th><th>Raro</th></tr></thead>
              <tbody>
                <tr><td>Intact</td><td>50.67%</td><td>38.00%</td><td>11.33%</td></tr>
                <tr><td>Exceptional</td><td>46.67%</td><td>38.00%</td><td>15.33%</td></tr>
                <tr><td>Flawless</td><td>42.00%</td><td>38.00%</td><td>20.00%</td></tr>
                <tr><td>Radiant</td><td>40.00%</td><td>34.00%</td><td>26.00%</td></tr>
              </tbody>
            </table>
          </details>
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

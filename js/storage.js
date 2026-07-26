const Store = {
  KEYS: {
    COMPLETED: 'warframe_completed',
    FAVORITES: 'warframe_favorites',
    PARTS: 'warframe_parts',
  },

  getCompleted() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.COMPLETED)) || []; }
    catch { return []; }
  },
  saveCompleted(ids) { localStorage.setItem(this.KEYS.COMPLETED, JSON.stringify(ids)); },
  toggleCompleted(id) {
    const c = this.getCompleted();
    const i = c.indexOf(id);
    if (i === -1) c.push(id); else c.splice(i, 1);
    this.saveCompleted(c);
    return c;
  },
  isCompleted(id) { return this.getCompleted().indexOf(id) !== -1; },

  getFavorites() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.FAVORITES)) || []; }
    catch { return []; }
  },
  saveFavorites(ids) { localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(ids)); },
  toggleFavorite(id) {
    const f = this.getFavorites();
    const i = f.indexOf(id);
    if (i === -1) f.push(id); else f.splice(i, 1);
    this.saveFavorites(f);
    return f;
  },
  isFavorite(id) { return this.getFavorites().indexOf(id) !== -1; },

  getParts() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.PARTS)) || {}; }
    catch { return {}; }
  },
  saveParts(p) { localStorage.setItem(this.KEYS.PARTS, JSON.stringify(p)); },
  getFrameParts(id) { return this.getParts()[id] || []; },
  togglePart(frameId, partName) {
    const p = this.getParts();
    if (!p[frameId]) p[frameId] = [];
    const i = p[frameId].indexOf(partName);
    if (i === -1) p[frameId].push(partName); else p[frameId].splice(i, 1);
    this.saveParts(p);
    return p[frameId];
  },
  isPartDone(frameId, partName) {
    return this.getFrameParts(frameId).indexOf(partName) !== -1;
  },

  clearAll() {
    localStorage.removeItem(this.KEYS.COMPLETED);
    localStorage.removeItem(this.KEYS.FAVORITES);
    localStorage.removeItem(this.KEYS.PARTS);
  },
};

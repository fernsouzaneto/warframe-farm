const Store = {
  KEYS: {
    COMPLETED: 'warframe_completed',
    FAVORITES: 'warframe_favorites',
    PARTS: 'warframe_parts',
    PRIME_COMPLETED: 'warframe_prime_completed',
    PRIME_FAVORITES: 'warframe_prime_favorites',
    PRIME_PARTS: 'warframe_prime_parts',
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

  getPrimeCompleted() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.PRIME_COMPLETED)) || []; }
    catch { return []; }
  },
  savePrimeCompleted(ids) { localStorage.setItem(this.KEYS.PRIME_COMPLETED, JSON.stringify(ids)); },
  togglePrimeCompleted(id) {
    const c = this.getPrimeCompleted();
    const i = c.indexOf(id);
    if (i === -1) c.push(id); else c.splice(i, 1);
    this.savePrimeCompleted(c);
    return c;
  },
  isPrimeCompleted(id) { return this.getPrimeCompleted().indexOf(id) !== -1; },

  getPrimeFavorites() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.PRIME_FAVORITES)) || []; }
    catch { return []; }
  },
  savePrimeFavorites(ids) { localStorage.setItem(this.KEYS.PRIME_FAVORITES, JSON.stringify(ids)); },
  togglePrimeFavorite(id) {
    const f = this.getPrimeFavorites();
    const i = f.indexOf(id);
    if (i === -1) f.push(id); else f.splice(i, 1);
    this.savePrimeFavorites(f);
    return f;
  },
  isPrimeFavorite(id) { return this.getPrimeFavorites().indexOf(id) !== -1; },

  getPrimeParts() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.PRIME_PARTS)) || {}; }
    catch { return {}; }
  },
  savePrimeParts(p) { localStorage.setItem(this.KEYS.PRIME_PARTS, JSON.stringify(p)); },
  getPrimeFrameParts(id) { return this.getPrimeParts()[id] || []; },
  togglePrimePart(frameId, partName) {
    const p = this.getPrimeParts();
    if (!p[frameId]) p[frameId] = [];
    const i = p[frameId].indexOf(partName);
    if (i === -1) p[frameId].push(partName); else p[frameId].splice(i, 1);
    this.savePrimeParts(p);
    return p[frameId];
  },
  isPrimePartDone(frameId, partName) {
    return this.getPrimeFrameParts(frameId).indexOf(partName) !== -1;
  },

  setFrameParts(frameId, partNames) {
    const p = this.getParts();
    p[frameId] = partNames;
    this.saveParts(p);
  },
  clearFrameParts(frameId) {
    const p = this.getParts();
    delete p[frameId];
    this.saveParts(p);
  },
  setPrimeFrameParts(frameId, partNames) {
    const p = this.getPrimeParts();
    p[frameId] = partNames;
    this.savePrimeParts(p);
  },
  clearPrimeFrameParts(frameId) {
    const p = this.getPrimeParts();
    delete p[frameId];
    this.savePrimeParts(p);
  },

  clearAll() {
    localStorage.removeItem(this.KEYS.COMPLETED);
    localStorage.removeItem(this.KEYS.FAVORITES);
    localStorage.removeItem(this.KEYS.PARTS);
    localStorage.removeItem(this.KEYS.PRIME_COMPLETED);
    localStorage.removeItem(this.KEYS.PRIME_FAVORITES);
    localStorage.removeItem(this.KEYS.PRIME_PARTS);
  },
};

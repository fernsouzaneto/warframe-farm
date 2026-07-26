const Filters = {
  current: 'all',

  init() {
    document.querySelectorAll('.filters .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.current = chip.dataset.filter;
        document.querySelectorAll('.filters .chip').forEach(c => c.classList.toggle('active', c.dataset.filter === this.current));
        App.renderAll();
      });
    });
  },

  matches(frame) {
    const f = this.current;
    if (f === 'all') return true;
    if (f === 'pending') return !Store.isCompleted(frame.id);
    if (f === 'completed') return Store.isCompleted(frame.id);
    if (f === 'favoritos') return Store.isFavorite(frame.id);
    const type = (frame.missionType || '').toLowerCase();
    return type.includes(f.toLowerCase());
  },
};

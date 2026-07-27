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
    const isPrime = App.currentTab === 'primes';
    if (f === 'all') return true;
    if (f === 'prime') return frame.isPrime === true;
    if (f === 'vaulted') return frame.vaulted === true;
    if (f === 'available') return !frame.vaulted;
    if (f === 'pending') return isPrime ? !Store.isPrimeCompleted(frame.id) : !Store.isCompleted(frame.id);
    if (f === 'completed') return isPrime ? Store.isPrimeCompleted(frame.id) : Store.isCompleted(frame.id);
    if (f === 'favoritos') return isPrime ? Store.isPrimeFavorite(frame.id) : Store.isFavorite(frame.id);
    const type = (frame.missionType || '').toLowerCase();
    return type.includes(f.toLowerCase());
  },
};

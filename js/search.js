const Search = {
  term: '',

  init() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', (e) => {
      this.term = e.target.value.trim().toLowerCase();
      App.renderAll();
    });
  },

  getTerm() { return this.term; },

  matches(w) {
    if (!this.term) return true;
    const fields = [w.name, w.planet, w.mission, w.missionType, w.howToGet || '', w.requirements || '', w.description || ''];
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].toLowerCase().includes(this.term)) return true;
    }
    return false;
  },
};

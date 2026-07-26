# Warframe Farm Planner — Tech Spec

## Escopo

Aplicacao **100% offline** para gerenciar farm de Warframes. Usuario marca quais warframes ja obteve, marca pecas individualmente, favorita, pesquisa, filtra, ve tabela de drops, ordena, abre modal com detalhes. Tudo salvo no LocalStorage.

---

## Stack (sem dependencias externas)

- HTML5
- CSS3 puro (um unico arquivo, Single File Component)
- JavaScript ES6+ (modulos em script tags, sem bundler)

---

## Estrutura de arquivos

```
warframe-farm/
├── index.html            (entrada unica, contem dados inline)
├── css/tailwind.css      (todos os estilos em arquivo unico)
├── data/warframes.json   (mesmos dados do inline, para edicao manual)
├── js/
│   ├── storage.js        (LocalStorage: concluidos, favoritos, partes)
│   ├── search.js         (barra de pesquisa em tempo real)
│   ├── filters.js        (filtros por tipo de missao)
│   ├── render.js         (renderizar grid, cards, modal HTML)
│   ├── modal.js          (abrir/fechar modal de detalhes)
│   └── app.js            (orquestrador: init, eventos, progress, stats)
├── assets/               (placeholder para imagens futuras)
├── README.md
└── SPECS.md              (este arquivo)
```

---

## Fluxo de inicializacao (app.js)

1. DOMContentLoaded → `App.init()`
2. Ler `#warframes-data` (script type="application/json" no HTML)
3. Parsear JSON → `this.warframes`
4. `Render.init()` → pegar ref da `#warframeGrid`
5. `Search.init()` → bind input `#searchInput`
6. `Filters.init()` → bind click nos `.filters .chip`
7. Bind click delegado na `#warframeGrid`:
   - `.toggle-btn` → toggle completo/incompleto
   - `.fav-btn` → toggle favorito
   - `.part-check` → toggle parte; se todas marcadas auto-conclui frame; se desmarcar alguma auto-desmarca
   - `.warframe-card` → abre modal de detalhes
8. Bind click nos `.sort-btn` → altera `Render.sortBy` e rerenderiza
9. Bind click no `#clearStorage`
10. `this.renderAll()` → filtrar + renderizar + progresso + estatisticas

---

## Estrutura do JSON (cada Warframe)

```json
{
  "id": "protea",
  "name": "Protea",
  "image": "",
  "description": "Descricao curta do lore.",
  "planet": "Venus",
  "mission": "Granum Void (Corpus Ship)",
  "missionType": "Granum Void",
  "howToGet": "Explicacao textual de como obter.",
  "requirements": "Requisitos (quests, ranks, recursos)",
  "drops": [
    {
      "part": "Blueprint",
      "location": "The Deadlock Protocol",
      "rotation": "N/A",
      "chance": "100%"
    }
  ]
}
```

### Campos obrigatorios

| Campo | Tipo | Descricao |
|---|---|---|
| id | string | Identificador unico (slug) |
| name | string | Nome do Warframe |
| planet | string | Deve bater com `planetOrder` no render.js |
| mission | string | Nome do no/missao |
| missionType | string | Boss, Quest, Granum Void, Spy, Defense, etc. Usado para badge e filtro |
| howToGet | string | Instrucoes de farm |
| drops | array | Lista de drops (part, location, rotation, chance) |

### Planetas validos (planetOrder no render.js)

```
Venus, Orb Vallis, Deimos, Mars, Cetus, Europa, Eris, Lua,
Uranus, Uranus Proxima, Sedna, Pluto, Duviri, Hollvania,
Sanctum Anatomica, Junctions, Spy Missions, Nightwave, Dojo
```

### Valores de missionType (determinam a badge)

| missionType (case-insensitive) | Badge | Classe CSS |
|---|---|---|
| granum | Granum | badge-granum |
| follie | Follie's Hunt | badge-follie |
| boss | Boss | badge-boss |
| quest | Quest | badge-quest |
| mirror | Mirror Defense | badge-defense |
| stage | Stage Defense | badge-stage |
| ascension | Ascension | badge-ascension |
| open / narmer | Open World | badge-world |
| syndicate | Syndicate | badge-syndicate |
| dojo | Dojo | badge-dojo |
| disruption | Disruption | badge-disruption |
| spy / rotation / puzzle | Rotation | badge-rotation |
| railjack | Railjack | badge-railjack |
| defense | Defense | badge-defense |
| (outros) | (primeiros 12 chars) | badge-rotation |

---

## Renderizacao (render.js)

### Agrupamento

Warframes sao agrupados por `planet`. Ordem dos grupos segue `planetOrder` (array fixo). Dentro de cada planeta: ordenacao conforme `sortBy`.

### Ordenacao (sortBy)

| Valor | Comportamento |
|---|---|
| `name` (padrao) | Incompletos primeiro, depois completos; ordem alfabetica |
| `planet` | Ordem alfabetica por planeta |
| `difficulty` | Por dificuldade (Facil < Media < Dificil) |

### Card HTML

```html
<div class="warframe-card [completed]" data-modal-id="protea">
  <div class="card-img">
    <span class="card-badge badge-XXX">Tipo</span>
    <span class="card-badge completed-badge">Concluido</span> (se concluido)
    <button class="fav-btn [active]" data-fav-id="protea">★/☆</button>
  </div>
  <div class="card-body">
    <h3 class="card-title">Nome</h3>
    <div class="card-subtitle">Planeta · Missao</div>
    <div class="parts-checklist">
      <label class="part-label"><input type="checkbox" class="part-check" data-frame="id" data-part="Blueprint"> Blueprint</label>
      <label class="part-label"><input type="checkbox" class="part-check" data-frame="id" data-part="Chassis"> Chassis</label>
      ...
    </div>
    <button class="btn btn-sm btn-accent/btn-ghost toggle-btn" data-id="...">
      Marcar como Concluido / Remover Conclusao
    </button>
  </div>
</div>
```

### Toggle por planeta

Clicar no `.planet-header` alterna classe `collapsed` e esconde `.planet-content`.

### Seguranca XSS

Toda string renderizada passa por `Render.esc()`, que cria `textContent` em elemento temporario e retorna `innerHTML`.

---

## Modal de detalhes (modal.js)

### Abertura

`Modal.open(frameId)` — busca frame em `App.warframes`, gera HTML via `Render.renderModal(w)`, insere no `document.body`.

### Conteudo do Modal

```html
<div class="modal-backdrop" id="modalBackdrop">
  <div class="modal-window">
    <button class="modal-close">&times;</button>
    <div class="modal-img"><span class="modal-badge badge-XXX">Tipo</span></div>
    <div class="modal-body">
      <h2 class="modal-title">Nome</h2>
      <div class="modal-meta">Planeta · Missao</div>
      <p class="modal-desc">Descricao/lore</p>
      <div class="modal-section"><h4>Como obter</h4><p>...</p></div>
      <div class="modal-section"><h4>Requisitos</h4><p>...</p></div>
      <div class="modal-section">
        <h4>Tabela de Drops</h4>
        <table class="drops-table">
          <thead><tr><th>Parte</th><th>Local</th><th>Rot.</th><th>Chance</th><th>Status</th></tr></thead>
          <tbody>...</tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

### Fechamento

- Clicar no backdrop (fora do modal)
- Clicar no botao X
- Tecla ESC
- Animacoes: fadeIn (backdrop), slideUp (janela)

---

## Filtros (filters.js)

Filtros sao botoes `.chip[data-filter]` no HTML. Logica de `matches()`:

| data-filter | Comportamento |
|---|---|
| `all` | true |
| `pending` | `!isCompleted(id)` |
| `completed` | `isCompleted(id)` |
| `favoritos` | `isFavorite(id)` |
| qualquer outro | substring match em `missionType` (case insensitive) |

Filtros atualmente definidos no HTML:

```
all, boss, quest, granum, mirror defense, open world, syndicate,
dojo, disruption, spy, ascension, pending, completed, favoritos
```

---

## Pesquisa (search.js)

- Bind `input` no `#searchInput`
- Busca em tempo real (cada tecla rerenderiza)
- Campos buscados: `name`, `planet`, `mission`, `missionType`, `howToGet`, `requirements`, `description`
- Case insensitive

---

## Persistencia (storage.js)

**Nota:** O nome `Store` (e nao `Storage`) foi usado para evitar conflito com a API nativa `window.Storage` do browser.

### localStorage Keys

| Chave | Conteudo | Descricao |
|---|---|---|
| `warframe_completed` | `["protea", "gauss"]` | IDs dos warframes concluidos |
| `warframe_favorites` | `["saryn", "mesa"]` | IDs favoritados |
| `warframe_parts` | `{"protea": ["Blueprint", "Chassis"]}` | Objeto: frameId → array de partes obtidas |

### Metodos (objeto global `Store`)

| Funcao | Descricao |
|---|---|
| `getCompleted()` | Array de IDs concluidos |
| `toggleCompleted(id)` | Adiciona ou remove ID |
| `isCompleted(id)` | Boolean |
| `getFavorites()` | Array de IDs favoritos |
| `toggleFavorite(id)` | Adiciona ou remove ID |
| `isFavorite(id)` | Boolean |
| `getParts()` | Objeto completo de partes |
| `getFrameParts(frameId)` | Array de partes obtidas para um frame |
| `togglePart(frameId, partName)` | Marca/desmarca parte individual |
| `isPartDone(frameId, partName)` | Boolean |
| `clearAll()` | Remove todas as 3 chaves do localStorage |

### Auto-conclusao

Em `app.js`, quando todas as partes de um frame sao marcadas via checkbox, o frame e automaticamente marcado como concluido. Se uma parte for desmarcada, o frame volta a pendente.

---

## Progresso e Estatisticas (app.js)

### Barra de progresso (header)

```
<div class="header-progress">
  <div class="progress-ring">
    <svg viewBox="0 0 36 36">
      <path class="progress-bg" d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 ..."/>
      <path class="progress-fill-ring" id="progress-ring-fill" d="..." stroke-dasharray="0,100"/>
    </svg>
    <span class="progress-ring-label" id="progress-label">0%</span>
  </div>
  <div class="header-progress-text">
    <div class="progress-count" id="progress-detail"><span class="num">3</span>/<span class="total">24</span></div>
    <div class="progress-sub">concluidos</div>
  </div>
</div>
```

- `#progress-ring-fill` → `stroke-dasharray` animado via SVG (circular)
- `#progress-label` → percentual no centro do anel
- `#progress-detail .num` → numero em dourado; `.total` → numero em cinza

### Painel de estatisticas (`#stats-panel`)

Tres colunas:
- Pendentes (total - completos)
- Concluidos
- Favoritos (count)

---

## Tema CSS

Variaveis no `:root`:

```css
--bg: #0f0f0f           (fundo principal)
--bg2: #1a1a1a          (fundo secundario)
--card: #1e1e1e         (fundo dos cards)
--card-hover: #252525   (hover dos cards)
--input: #2a2a2a        (fundo input/chips)
--border: #2a2a2a       (bordas)
--text: #ececec         (texto principal)
--text2: #999           (texto secundario)
--text3: #666           (texto terciario/muted)
--accent: #d89b2b       (dourado)
--success: #53c653      (verde)
--error: #ff5555        (vermelho)
```

Fonte: `Inter, Segoe UI, Roboto, system-ui, sans-serif`

### Classes CSS principais (alem das de layout)

| Classe | Uso |
|---|---|
| `.warframe-card` | Card individual |
| `.card-img` | Banner 90px com gradiente |
| `.card-badge` | Badge de tipo (absolute no card-img) |
| `.badge-follie` | Rosa #e91e63 para Follie's Hunt |
| `.fav-btn` | Botao estrela (♡/★), absolute no card-img |
| `.parts-checklist` | Container flex de checkboxes |
| `.part-label` | Label estilizada de cada parte |
| `.part-check` | Checkbox com accent-color dourado |
| `.drops-table` | Tabela de drops no card |
| `.toggle-btn` | Botao marcar/remover conclusao |
| `.sort-row` | Linha de botoes de ordenacao |
| `.sort-btn` | Botao de ordenacao |
| `.modal-backdrop` | Overlay fixo com fadeIn |
| `.modal-window` | Janela modal com slideUp |
| `.stat-item` | Card de estatistica no painel |
| `.chip` | Botao de filtro |
| `.planet-group` | Grupo de planetas com header |
| `.planet-header` | Header clicavel com toggle |

---

## Responsividade

Breakpoints no CSS:

| Largura | Colunas no grid |
|---|---|
| >1200px | 4 |
| 901-1200px | 3 |
| 641-900px | 2 |
| <=640px | 1 |

Mobile (640px): header vira empilhado, search ocupa 100%, progress bar expande, filtros viram scroll horizontal.

---

## Como modificar

### Adicionar novo Warframe

1. Adicionar objeto no array `#warframes-data` no `index.html` (e opcionalmente em `data/warframes.json`)
2. Seguir schema exato com `id`, `name`, `planet`, `mission`, `missionType`, `drops`, etc.
3. `planet` deve estar no `planetOrder` do `render.js`
4. `missionType` determina a badge CSS — adicionar classe no CSS se for tipo novo
5. As partes listadas em `drops[].part` serao usadas como checkboxes

### Adicionar novo filtro

1. Adicionar `<button class="chip" data-filter="novo-tipo">Novo Tipo</button>` no HTML
2. Se o filtro for substring de `missionType`, funciona automaticamente
3. Se for logica diferente, editar `Filters.matches()` em `filters.js`

### Adicionar nova badge/tipo

1. Adicionar `if (t.includes('novo')) return { label: 'Novo', cls: 'badge-novo' }` em `Render.getBadge()` (render.js)
2. Adicionar classe CSS `.badge-novo{...}` no `tailwind.css`

### Alterar ordem dos planetas

Editar `planetOrder` no `render.js`

### Limpar LocalStorage

Botao "Limpar Progresso" no footer, ou manualmente no console:
```js
localStorage.removeItem('warframe_completed')
localStorage.removeItem('warframe_favorites')
localStorage.removeItem('warframe_parts')
```

---

## Convencoes de codigo

- Nada de frameworks (sem React, Vue, Bootstrap, Tailwind, etc.)
- Nada de dependencias externas
- Nada de imports ES module (sem `type="module"`) — scripts carregados como script tags comuns
- Nada de `fetch()` ou XHR — dados inline no HTML via `<script type="application/json">`
- CSS em arquivo unico minificado (mas legivel por linha)
- IDs em snake-case, classes em kebab-case
- Tudo em portugues (BR): comentarios, nomes de metodos, labels
- Sem comentarios no codigo final (a nao ser que seja util)
- XSS prevention: sempre usar `textContent` para escapar antes de inserir como HTML
- Eventos na grid usam event delegation (um listener no parent, nao em cada card)

---

## Arquivo de dados (`data/warframes.json`)

Mantido como copia dos dados inline no `index.html` para edicao manual conveniente. Se modificar o JSON, precisa copiar o array para dentro do `<script type="application/json">` no HTML.

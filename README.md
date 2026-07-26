# Warframe Farm Planner

Aplicação web 100% offline para acompanhar o farm de Warframes no Warframe.

## Como executar

Abra o arquivo `index.html` em qualquer navegador moderno. Nenhum servidor é necessário.

## Estrutura

```
warframe-farm/
├── index.html              # Página principal
├── css/tailwind.css        # Estilos customizados (tema dark)
├── js/
│   ├── app.js              # Inicialização
│   ├── storage.js          # LocalStorage
│   ├── render.js           # Renderização de cards
│   ├── filters.js          # Filtros
│   └── search.js           # Pesquisa
├── data/warframes.json     # Dados dos Warframes
├── assets/images/          # Imagens
└── README.md
```

## Funcionalidades

- Pesquisa em tempo real por nome, planeta, missão, tipo, requisitos
- Filtros por tipo de farm (Boss, Quest, Rotation, Granum Void, etc.)
- Agrupamento por planeta com seções recolhíveis
- Cards com informações completas e tabela de drops
- Marcação de conclusão com persistência automática (LocalStorage)
- Barra de progresso global
- Painel de estatísticas
- Exportar e importar progresso (JSON)
- Layout responsivo
- Tema escuro inspirado no Warframe

## Como adicionar Warframes

Edite `data/warframes.json` seguindo o formato existente.

## Como limpar o LocalStorage

Clique em "Limpar dados" no painel lateral ou execute no console:
```js
localStorage.removeItem('wfp_completed');
```

## Tecnologias

HTML5, JavaScript ES6+, CSS3 customizado. Sem dependências externas.

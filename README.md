# Brasil em Copas do Mundo

Site editorial da seleção brasileira masculina nas Copas de **1930 a 2022**, feito em HTML, CSS e JavaScript puros. Não há instalação de pacotes nem etapa de build.

## Abrir

Abra `index.html` diretamente no navegador. Para servir por HTTP, com Node.js instalado, abra o terminal nesta pasta e execute:

```sh
node servidor.cjs
```

Visite **http://127.0.0.1:4173**. Outra porta: `node servidor.cjs 8080`. Pare o servidor com **Ctrl+C**. Também funciona em qualquer servidor de arquivos estáticos. O servidor incluído é somente para prévia local.

Se preferir usar Python, execute nesta pasta:

```sh
python3 -m http.server 8000
```

No Windows, também pode usar `py -m http.server 8000`. Abra **http://localhost:8000** e encerre com **Ctrl+C**.

## Estrutura de pastas

```text
.
├── index.html          # Página única
├── css/
│   ├── style.css       # Estilos, temas e responsividade
│   └── legends-scroll.css # Layout e efeitos da seção de lendas
├── js/
│   ├── data.js         # Dados históricos, perguntas, imagens e créditos
│   ├── legends-scroll.js # Sticky, medidas, inércia e teclado das lendas
│   └── app.js          # Interações e renderização
├── assets/
│   └── img/           # Fotografias WebP, favicon e CREDITOS.json
├── servidor.cjs        # Servidor Node opcional para prévia
├── IMAGENS.md          # Autoria, contexto, licenças e fontes das imagens
├── VERIFICACAO.md      # Registro dos testes locais
└── README.md
```

## Editar

- **`js/data.js`**: todas as campanhas, técnicos, capitães, lendas, estatísticas, perguntas do quiz, imagens e fontes. Arquivo legível e comentado, disponível como `window.BRASIL_DATA`.
- **`index.html`**: estrutura, textos editoriais gerais, metadados e navegação.
- **`css/style.css`**: paleta, tipografia, espaçamento, componentes e responsividade. Os tokens estão no início do arquivo; as regras de movimento reduzido estão no final.
- **`js/app.js`**: renderização e interações, sem bibliotecas externas.
- **`assets/img/`**: fotografias WebP locais e favicon SVG original. Para trocar fotos, atualize também alt, dimensões, legenda, autoria, URL da fonte e licença em `data.js → images`. Veja `IMAGENS.md`.

Os títulos usam **Bebas Neue**, e os textos, **Inter**, via Google Fonts. Sem acesso à internet, o site usa fontes locais de fallback; os dados, fotografias e interações continuam disponíveis.

## Conteúdo e comportamento

- Hero com parallax, cinco estrelas e contadores animados.
- Linha do tempo com as 22 edições, filtros, campanha, resultado e último jogo. Tabs aceitam setas, Home e End.
- Cinco campanhas campeãs com finais, técnicos, capitães e destaques.
- Vices e momentos marcantes tratados com respeito.
- Seção de 13 lendas com scroll horizontal vinculado à rolagem vertical, sticky, inércia, destaque do card central e parallax nas fotos. Setas e teclado permitem percorrer a faixa.
- Gráficos CSS de títulos, artilheiros, distribuição dos resultados, aproveitamento e gols por edição.
- Galeria masonry com lightbox: setas, Escape, foco contido pelo diálogo nativo e retorno do foco à imagem.
- Quiz com oito perguntas, explicação, pontuação animada e reinício.
- Tema claro/escuro salvo em `localStorage`, menu móvel, navegação de seção ativa e progresso de rolagem.
- Animações por IntersectionObserver e parallax por transform. `prefers-reduced-motion` desliga os movimentos. Imagens com alt, dimensões e lazy loading; hero com prioridade alta e srcset.

### Como funciona a seção de lendas

Em janelas a partir de **768 px de largura e 680 px de altura**, a seção fica presa no topo durante o percurso horizontal. Sua altura é `altura da viewport + (largura da faixa − largura visível)`. Nenhum evento de wheel ou touch é interceptado; a página usa rolagem nativa e libera a próxima seção depois de exibir o último card inteiro.

`js/legends-scroll.js` calcula as medidas com ResizeObserver, após o carregamento das fotos e das fontes. O agendador de requestAnimationFrame de `app.js` atualiza a faixa e a inércia de fator 0,10. As imagens usam uma camada P&B e outra em cor, misturadas por opacidade, preservando o filtro de grayscale estático.

As setas da interface rolam a página até o card anterior/próximo. Cada card aceita foco: **Tab** percorre os jogadores; **←/→**, **Home** e **End** movem foco e faixa em conjunto. **Page Down**, **Espaço** e a rolagem continuam nativos. O card focado é mantido inteiramente visível.

Com `prefers-reduced-motion: reduce`, largura menor que 768 px ou altura menor que 680 px, o efeito pinned cede lugar ao carrossel horizontal nativo com snap. A preferência de movimento também pode ser alterada durante o uso. Os cards mantêm a mesma geometria, área de foto e altura; a escala de destaque é apenas visual.

## Recorte e método

Os totais e recordes têm corte explícito em **2022**: 22 participações, cinco títulos, 114 jogos, 76 vitórias, 19 empates, 19 derrotas, 237 gols marcados e 108 sofridos. Pênaltis decidem a classificação, mas contam como empate nas estatísticas; seus gols não entram nos totais. Aproveitamento: `(3 × vitórias + empates) / (3 × jogos)`.

A Copa de 1950 teve quadrangular final. Em 1982, a eliminação ocorreu na segunda fase de grupos. Em 2014, o último jogo brasileiro foi a disputa do terceiro lugar, após a derrota na semifinal. Ronaldo foi convocado em 1994, sem atuar: o card distingue convocação de partidas em campo.

Fontes FIFA, CBF e RSSSF, com links no rodapé e em `data.js → sources`; cada edição também contém seu próprio campo `source`.

Referências: [FIFA — história do Brasil em Copas](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/brazil-team-profile-history), [RSSSF — histórico das Copas](https://rsssf.github.io/tables/worldcup.html) e [RSSSF — estatísticas de 1930 a 2022](https://www.rsssf.org/tables/3002f.html).

## Créditos das imagens

As fotografias são arquivos locais provenientes do Wikimedia Commons, em domínio público ou sob licenças Creative Commons. A relação individual de autores, fontes, licenças e alterações está em [IMAGENS.md](IMAGENS.md), em `assets/img/CREDITOS.json` e no rodapé do site. Ao reutilizar uma fotografia, preserve os créditos e os termos de sua licença. Bebas Neue e Inter são distribuídas sob SIL Open Font License.

## GitHub Pages

O projeto é estático e usa caminhos relativos para CSS, JavaScript e imagens. No repositório, ative **Settings → Pages → Build and deployment → Source: Deploy from a branch → main → / (root) → Save**.

Endereço esperado após a publicação: **https://luk41400.github.io/site-9/**. O endereço só passa a servir o projeto após a ativação e a conclusão da publicação no GitHub Pages.

## Espaço de 2026

O objeto **`future`**, no início de `data.js`, controla o bloco reservado. Edite `host`, `status`, `text` e `result`. Ele está deliberadamente fora dos totais de 1930–2022. Para ampliar o recorte, acrescente a edição em `editions` e atualize também `totals`, `heroStats`, gráficos de títulos/artilheiros e os rótulos do recorte em `index.html`.

## Pendências

- **2026:** preenchimento manual reservado conforme solicitado; nenhum resultado dessa edição é presumido.
- **Imagens:** nenhuma ausente, sem placeholders. Algumas fotos de lendas são retratos posteriores às Copas, explicitamente identificados nos créditos e textos alternativos. As fotografias de 1994/2002 são de bastidores, e não das finais.
- **Dados históricos:** nenhum campo pendente de verificação no recorte publicado. Preserve a metodologia se atualizar os dados.

Este projeto independente de fãs não é afiliado à CBF ou à FIFA. As imagens mantêm suas licenças originais; veja os créditos no rodapé e `assets/img/CREDITOS.json`.

# Verificação local

Verificado em 11/11/2026, com Chromium/Playwright e servidor HTTP local.

- HTTP 200 e carregamento inicial.
- 22 edições, filtros, placares e tabs por teclado.
- Tema claro/escuro persistido após reload.
- Carrossel com 13 lendas.
- Lightbox, setas, Escape e retorno do foco.
- Quiz 8/8, resposta errada, bloqueio de respostas e reinício.
- Todas as fotografias locais carregadas.
- Responsividade sem overflow: 390px.
- Responsividade sem overflow: 320px.
- Responsividade sem overflow: 768px.
- prefers-reduced-motion: conteúdo visível, parallax desativado.
- Sintaxe JavaScript validada pelo Node.js.
- Somatórios de jogos, vitórias, empates, derrotas e gols conferidos contra as 22 edições.
- Cinco anos de títulos e todos os arquivos de imagem conferidos.
- Console do navegador: **0 erros**, incluindo exceções JavaScript.

Uma requisição de imagem foi cancelada pelo navegador durante a troca de página no teste (ERR_ABORTED); não foi erro de carregamento. Todas as fotografias foram verificadas carregadas.

A checagem de teclado e movimento reduzido cobre os fluxos principais; não é uma auditoria formal com leitores de tela. A fluidez depende do dispositivo e do navegador; o projeto usa transform/opacity e scroll passivo para os efeitos.

Checagens finais adicionais: abertura direta de index.html (file://), quiz nesse modo, tema claro e dez avanços de Tab com foco mantido no lightbox. Todos aprovados; console permaneceu com zero erros.

## Atualização: lendas com scroll horizontal vinculado à rolagem

Verificação local com Chromium/Playwright e HTTP 200, após a implementação de sticky:

- Altura externa igual à viewport mais o percurso horizontal; body com overflow-x: clip.
- Rolagem por wheel nos dois sentidos e posicionamento intermediário: sticky no topo, faixa reversível e próxima seção fora da viewport.
- No final do percurso, último card inteiramente visível com margem direita, progresso completo, seta final desabilitada e texto “CONTINUE ROLANDO”. A próxima seção entra na viewport somente depois desse ponto.
- 13 cards com topo, altura e área da fotografia iguais antes da escala de destaque; nenhum texto cortado nos tamanhos testados.
- Resize durante o percurso recalcula altura/distância. Fotos e fontes também invalidam as medidas.
- Setas da interface, Home, End, setas de teclado e Tab mantêm o card focado visível; Page Down e Espaço continuam rolando a página.
- Movimento reduzido ativa carrossel nativo com snap e desliga os efeitos, inclusive ao mudar a preferência durante o uso.
- Layouts testados: 1440 × 900, 1024 × 768, 768 × 680, 390 × 844, 320 × 740 e 1440 × 650. Sem overflow horizontal da página; telas estreitas/baixas usam o carrossel nativo.
- Galeria, tema claro, foco do lightbox, quiz e abertura direta de index.html continuam funcionando.
- Console do navegador: **0 erros**. Sintaxe dos dois scripts alterados/adicionados validada com Node.js.

A suavização compartilha o mesmo requestAnimationFrame dos demais efeitos de scroll. A transição P&B/cor usa opacidade entre duas camadas da mesma foto, sem animar o filtro a cada quadro. Nenhum evento wheel/touch é interceptado.

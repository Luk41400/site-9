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

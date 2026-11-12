/* Servidor de prévia local, sem dependências. Uso: node servidor.cjs [porta] */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.argv[2] || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server = http.createServer((request,response) => {
  let decoded;
  try { decoded = decodeURIComponent(new URL(request.url,'http://localhost').pathname); }
  catch { response.writeHead(400);response.end('Requisição inválida');return; }
  const file = path.resolve(root, '.' + (decoded.endsWith('/') ? decoded + 'index.html' : decoded));
  const relative = path.relative(root,file);
  if(relative.startsWith('..') || path.isAbsolute(relative)) {response.writeHead(403);response.end('Acesso negado');return;}
  fs.readFile(file,(error,content) => {
    if(error){response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Arquivo não encontrado');return;}
    response.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
    response.end(content);
  });
});
server.listen(port,'127.0.0.1',()=>console.log(`Brasil em Copas: http://127.0.0.1:${port}`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});

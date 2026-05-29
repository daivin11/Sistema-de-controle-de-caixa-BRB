/*
  =====================================================================
  CashFlow Control — server.js
  =====================================================================
  Este arquivo é o BACKEND da aplicação.
  Backend = o servidor que roda no seu computador, recebe as
  requisições do navegador e lida com os dados.

  Fluxo geral:
    Navegador (index.html)
        → fetch('/api/operacoes')
        → server.js recebe, processa, responde com JSON
        → Navegador lê o JSON e atualiza a tela

  Tecnologias usadas:
    - Node.js   → ambiente que executa JavaScript fora do navegador
    - Express   → framework que facilita criar rotas HTTP
    - fs        → módulo nativo do Node para ler/escrever arquivos
    - path      → módulo nativo para montar caminhos de arquivo
                  (funciona igual no Windows e Linux)

  Por que salvar em arquivo JSON e não num banco de dados?
    Para este projeto é suficiente e simples.
    Não precisa instalar MySQL, PostgreSQL etc.
    O arquivo data/operacoes.json é o "banco de dados".
  =====================================================================
*/


// =====================================================================
// IMPORTS — carrega os módulos necessários
// =====================================================================

/*
  require() é a forma do Node.js importar módulos.
  Equivale ao import do JavaScript moderno.

  express e cors são instalados via npm (estão no package.json).
  fs e path já vêm com o Node, não precisam ser instalados.
*/
const express = require('express'); // framework HTTP
const cors    = require('cors');    // permite requisições de outras origens
const fs      = require('fs');      // file system: ler e escrever arquivos
const path    = require('path');    // montar caminhos de arquivo


// =====================================================================
// CONFIGURAÇÃO DO SERVIDOR
// =====================================================================

const app  = express(); // cria a aplicação Express
const PORT = 3000;      // porta onde o servidor vai escutar

/*
  __dirname = caminho absoluto da pasta onde está o server.js
  Ex: C:\Users\daivi\Downloads\automatizacao

  path.join() monta um caminho juntando partes:
    path.join(__dirname, 'data')           → .../automatizacao/data
    path.join(__dirname, 'data', 'x.json') → .../automatizacao/data/x.json

  Usar path.join() em vez de strings com '/' ou '\' garante que
  funciona igual no Windows, Mac e Linux.
*/
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'operacoes.json');


// =====================================================================
// MIDDLEWARES — funções que processam toda requisição antes das rotas
// =====================================================================

/*
  app.use() registra um middleware (função intermediária).
  Todo request passa por eles antes de chegar nas rotas.

  cors() → permite que o navegador faça requisições para este servidor
           mesmo estando em origens diferentes (necessário em desenvolvimento)

  express.json() → lê o corpo das requisições POST/PUT em formato JSON
                   e coloca em req.body automaticamente

  express.static() → serve arquivos estáticos (HTML, CSS, imagens) da
                     pasta public/. Quando o navegador pede '/', ele
                     retorna o index.html desta pasta.
*/
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// =====================================================================
// INICIALIZAÇÃO DO ARQUIVO DE DADOS
// =====================================================================

/*
  Garante que a pasta data/ e o arquivo operacoes.json existem.
  Se não existirem, cria na primeira vez que o servidor sobe.

  fs.existsSync() → retorna true se o caminho existe, false se não existe
  fs.mkdirSync()  → cria uma pasta
    { recursive: true } → cria pastas intermediárias se necessário
  fs.writeFileSync() → escreve um arquivo (sobrescreve se já existir)
  JSON.stringify()   → converte objeto JS para string JSON
*/
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ operacoes: [], meta: 0 }));
}


// =====================================================================
// FUNÇÕES AUXILIARES
// =====================================================================

/*
  Lê e retorna o conteúdo do arquivo JSON como objeto JS.
  fs.readFileSync() → lê o arquivo de forma síncrona (espera terminar)
  'utf8' → codificação do texto (necessário para retornar string, não Buffer)
  JSON.parse() → converte string JSON para objeto JS
*/
function lerDados() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

/*
  Salva o objeto JS como JSON no arquivo.
  O segundo argumento null e o terceiro 2 formatam o JSON
  com indentação de 2 espaços — fica legível para abrir no bloco de notas.
*/
function salvarDados(dados) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2));
}

/*
  Retorna a data de hoje no formato YYYY-MM-DD.
  new Date().toISOString() → "2024-01-15T10:30:00.000Z"
  .split('T')[0]           → "2024-01-15"
*/
function dataHoje() {
  return new Date().toISOString().split('T')[0];
}


// =====================================================================
// ROTAS HTTP
// =====================================================================
/*
  Uma rota define o que acontece quando o navegador faz uma
  requisição para um caminho específico.

  Estrutura: app.MÉTODO(caminho, função)
    MÉTODO  = get, post, put, delete (verbos HTTP)
    caminho = a URL após localhost:3000
    função  = (req, res) => { ... }
      req = request  → dados que o navegador enviou
      res = response → o que o servidor vai responder

  Verbos HTTP e quando usar:
    GET    → buscar/ler dados (não envia corpo)
    POST   → criar/enviar dados (envia corpo com os dados)
    DELETE → deletar um recurso
    PUT    → atualizar um recurso
*/


// ---------------------------------------------------------------------
// GET /api/operacoes?data=YYYY-MM-DD
// Retorna lista de operações de uma data específica.
// ---------------------------------------------------------------------
app.get('/api/operacoes', (req, res) => {
  const dados = lerDados();

  /*
    req.query contém os parâmetros da URL após o '?'
    Ex: /api/operacoes?data=2024-01-15
        req.query.data === '2024-01-15'

    Se não passar data, usa hoje como padrão (|| = "ou").
  */
  const filtroData = req.query.data || dataHoje();

  /*
    Array.filter() retorna um novo array só com os elementos
    que passam no teste (função que retorna true/false).
    Aqui: só as operações cuja .data seja igual ao filtro.
  */
  const operacoes = dados.operacoes.filter(op => op.data === filtroData);

  /*
    res.json() converte o objeto para JSON e responde com status 200.
    O navegador recebe esse JSON e o JS do frontend lê com r.json().
  */
  res.json(operacoes);
});


// ---------------------------------------------------------------------
// POST /api/operacoes
// Recebe uma nova operação e salva no arquivo.
// ---------------------------------------------------------------------
app.post('/api/operacoes', (req, res) => {
  /*
    req.body contém o JSON enviado pelo frontend no fetch:
      body: JSON.stringify({ tipo, valor, descricao, operadora })
    O middleware express.json() já converteu para objeto JS.
  */
  const { tipo, valor, descricao, operadora } = req.body;

  /*
    Validação: se faltar tipo ou valor, responde com erro 400.
    400 = Bad Request (requisição inválida).
    return interrompe a função aqui para não continuar.
  */
  if (!tipo || !valor) {
    return res.status(400).json({ erro: 'tipo e valor obrigatorios' });
  }

  const dados = lerDados();

  /*
    Monta o objeto da nova operação.
    Date.now() retorna o timestamp atual em milissegundos —
    é único e crescente, perfeito para usar como ID simples.
    .toString() converte para string (IDs costumam ser strings).
  */
  const nova = {
    id: Date.now().toString(),
    tipo,
    valor: parseFloat(valor),   // garante que é número, não string
    descricao: descricao || '', // se não vier, usa string vazia
    operadora: operadora || '',
    data: dataHoje(),
    hora: new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }) // ex: "14:35"
  };

  dados.operacoes.push(nova); // adiciona ao array
  salvarDados(dados);          // salva no arquivo

  res.json(nova); // retorna a operação criada para o frontend
});


// ---------------------------------------------------------------------
// DELETE /api/operacoes/:id
// Remove uma operação pelo ID.
// ---------------------------------------------------------------------
app.delete('/api/operacoes/:id', (req, res) => {
  /*
    :id na rota é um parâmetro dinâmico.
    Ex: DELETE /api/operacoes/1705329600000
        req.params.id === '1705329600000'
  */
  const dados = lerDados();
  const antes = dados.operacoes.length;

  /*
    filter() cria um novo array SEM a operação com o ID informado.
    É a forma funcional de "deletar" de um array em JS.
  */
  dados.operacoes = dados.operacoes.filter(op => op.id !== req.params.id);

  // Se o tamanho não mudou, o ID não existia
  if (dados.operacoes.length === antes) {
    return res.status(404).json({ erro: 'nao encontrado' });
  }

  salvarDados(dados);
  res.json({ ok: true });
});


// ---------------------------------------------------------------------
// GET /api/resumo?data=YYYY-MM-DD
// Retorna os totais do dia agrupados por tipo de operação.
// ---------------------------------------------------------------------
app.get('/api/resumo', (req, res) => {
  const dados = lerDados();
  const filtroData = req.query.data || dataHoje();

  // Filtra só as operações do dia pedido
  const ops = dados.operacoes.filter(op => op.data === filtroData);

  const tipos = ['saque', 'deposito', 'boleto', 'recarga', 'outro'];
  const resumo = {};

  /*
    Para cada tipo, calcula:
    - quantidade: quantas operações desse tipo
    - total: soma dos valores

    Array.reduce() percorre o array acumulando um resultado.
    (acc, op) => acc + op.valor
      acc = acumulador (começa em 0)
      op  = elemento atual
    Resultado: soma de todos os valores
  */
  tipos.forEach(t => {
    const filtradas = ops.filter(op => op.tipo === t);
    resumo[t] = {
      quantidade: filtradas.length,
      total: filtradas.reduce((acc, op) => acc + op.valor, 0)
    };
  });

  res.json({
    data: filtroData,
    resumo,
    totalGeral: ops.reduce((acc, op) => acc + op.valor, 0),
    totalOps: ops.length,
    operacoes: ops
  });
});


// ---------------------------------------------------------------------
// GET /api/meta
// Retorna a meta diária salva.
// ---------------------------------------------------------------------
app.get('/api/meta', (req, res) => {
  const dados = lerDados();
  res.json({ meta: dados.meta || 0 }); // 0 se não tiver meta definida
});


// ---------------------------------------------------------------------
// POST /api/meta
// Salva uma nova meta diária.
// ---------------------------------------------------------------------
app.post('/api/meta', (req, res) => {
  const { meta } = req.body;

  /*
    isNaN() = "is Not a Number" → retorna true se não for número.
    Tripla validação: existe, é número, é positivo.
  */
  if (!meta || isNaN(meta) || meta <= 0) {
    return res.status(400).json({ erro: 'meta invalida' });
  }

  const dados = lerDados();
  dados.meta = parseFloat(meta); // salva como número
  salvarDados(dados);
  res.json({ meta: dados.meta });
});


// ---------------------------------------------------------------------
// GET /api/status-sistema
// Testa se um serviço externo responde — indicador de "sistema online".
// ---------------------------------------------------------------------
app.get('/api/status-sistema', (req, res) => {
  /*
    require() dentro de uma função é válido em Node.js.
    https é módulo nativo para fazer requisições HTTPS.
  */
  const https = require('https');
  const inicio = Date.now(); // marca o tempo antes de fazer o request

  /*
    https.get() faz uma requisição GET para a URL.
    Não usa fetch() pois fetch() é do navegador — no Node
    usa-se o módulo http/https nativo (ou bibliotecas como axios).

    (r) => { ... } é o callback chamado quando a resposta chega.
    r.statusCode → código HTTP da resposta (200, 404, 500, etc.)
  */
  const req2 = https.get('https://www.google.com/generate_204', (r) => {
    res.json({
      online: true,
      statusCode: r.statusCode,
      latencia: Date.now() - inicio // tempo de resposta em ms
    });
    req2.destroy(); // encerra a conexão (não precisa do corpo da resposta)
  });

  /*
    .on('error') captura erros de rede (sem internet, DNS falhou, etc.).
    Neste caso considera online=true pois o servidor local está ok —
    pode ser apenas que a rede da conveniência bloqueia requisições externas.
  */
  req2.on('error', () => {
    res.json({ online: true, statusCode: null, latencia: null, fonte: 'local' });
  });

  /*
    setTimeout na requisição: se demorar mais de 5 segundos,
    cancela e responde como online (mesmo motivo acima).
  */
  req2.setTimeout(5000, () => {
    req2.destroy();
    res.json({ online: true, erro: 'timeout', fonte: 'local' });
  });
});


// ---------------------------------------------------------------------
// GET /api/datas
// Retorna lista de datas que têm operações registradas.
// (Útil para futuramente listar dias anteriores)
// ---------------------------------------------------------------------
app.get('/api/datas', (req, res) => {
  const dados = lerDados();

  /*
    .map(op => op.data)   → extrai só as datas de cada operação
    new Set(...)          → remove duplicatas (Set só guarda valores únicos)
    [...Set]              → converte Set de volta para array (spread operator)
    .sort().reverse()     → ordena e inverte (mais recente primeiro)
  */
  const datas = [...new Set(dados.operacoes.map(op => op.data))]
    .sort()
    .reverse();

  res.json(datas);
});


// =====================================================================
// INICIAR O SERVIDOR
// =====================================================================

/*
  app.listen() coloca o servidor para escutar na porta definida.
  O callback é chamado quando o servidor estiver pronto.
  Só a partir daqui o servidor aceita requisições.
*/
app.listen(PORT, () => {
  console.log('\n CashFlow Control rodando em http://localhost:' + PORT + '\n');
});

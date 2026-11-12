const fs = require('fs')
const path = require('path')
const {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, HeadingLevel, ImageRun, LevelFormat, Packer,
  PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} = require('docx')

const PROJETO = process.env.PROJETO
const SAIDA = process.env.SAIDA
const PRINTS = path.join(__dirname, 'prints')
const FONT = 'Arial'
const PRETO = '000000'
const CINZA = 'D9D9D9'
const LARGURA_UTIL = 9071 // A4 com margens de 3 cm (esq./sup.) e 2 cm (dir./inf.), em DXA

// ---------- helpers ----------
function runs(texto) {
  return texto.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((t) =>
    t.startsWith('**') ? new TextRun({ text: t.slice(2, -2), bold: true })
      : t.startsWith('`') ? new TextRun({ text: t.slice(1, -1), font: 'Consolas', size: 22, color: PRETO })
        : new TextRun(t))
}
// Um parágrafo que termina em ':' apresenta o que vem logo abaixo, então fica na mesma página.
const p = (t) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 360 }, keepNext: t.trim().endsWith(':'), children: runs(t) })
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] })
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] })
const item = (t) => new Paragraph({ numbering: { reference: 'lista', level: 0 }, spacing: { after: 60, line: 360 }, alignment: AlignmentType.JUSTIFIED, children: runs(t) })
const legenda = (t) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 220 }, children: [new TextRun({ text: t, size: 20, color: PRETO })] })
const link = (rotulo, url) => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: rotulo + ' ', bold: true }), new ExternalHyperlink({ link: url, children: [new TextRun({ text: url, color: PRETO, underline: {} })] })] })
const espaco = () => new Paragraph({ spacing: { after: 100 }, children: [] })

function codigo(linhas, titulo) {
  const out = []
  if (titulo) out.push(new Paragraph({ spacing: { before: 80, after: 0 }, keepNext: true, shading: { type: ShadingType.CLEAR, fill: CINZA, color: 'auto' }, children: [new TextRun({ text: ' ' + titulo, font: 'Consolas', size: 16, bold: true, color: PRETO })] }))
  linhas.forEach((l, i) => out.push(new Paragraph({
    spacing: { after: 0, line: 250, before: i === 0 && !titulo ? 80 : 0 },
    keepNext: linhas.length < 25 && i < linhas.length - 1,
    shading: { type: ShadingType.CLEAR, fill: 'F4F4F4', color: 'auto' },
    children: [new TextRun({ text: l.length ? ' ' + l : ' ', font: 'Consolas', size: 17, color: PRETO })],
  })))
  out.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
  return out
}

const ler = (arquivo) => fs.readFileSync(path.join(PROJETO, arquivo), 'utf8').split('\n')

/** Código real do arquivo: da linha que começa com `de` até antes da linha que começa com `ate`. */
function trecho(arquivo, de, ate) {
  const linhas = ler(arquivo)
  const i = linhas.findIndex((l) => l.startsWith(de))
  if (i < 0) throw new Error(`não achei "${de}" em ${arquivo}`)
  let j = ate ? linhas.findIndex((l, k) => k > i && l.startsWith(ate)) : linhas.length
  if (j < 0) j = linhas.length
  const sel = linhas.slice(i, j)
  while (sel.length && !sel[sel.length - 1].trim()) sel.pop()
  return sel
}

/** Uma função de teste com os decoradores que vêm logo acima dela. */
function testeComDecoradores(arquivo, nome, proximo) {
  const linhas = ler(arquivo)
  const def = linhas.findIndex((l) => l.startsWith(`def ${nome}`))
  let ini = def
  while (ini > 0 && linhas[ini - 1].trim() !== '') ini--
  const fim = linhas.findIndex((l, k) => k > def && l.startsWith(proximo))
  const sel = linhas.slice(ini, fim)
  while (sel.length && !sel[sel.length - 1].trim()) sel.pop()
  return sel
}

function imagem(nome, largura) {
  largura = Math.min(largura, 590) // cabe na largura útil da página
  const buf = fs.readFileSync(path.join(PRINTS, nome))
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  return new ImageRun({ type: 'png', data: buf, transformation: { width: largura, height: Math.round((largura * h) / w) }, altText: { title: nome, description: nome, name: nome } })
}
const print = (nome, largura, texto) => [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 0 }, children: [imagem(nome, largura)] }), legenda(texto)]

/** Dois prints lado a lado, cada um com a sua legenda. */
function lado(a, b) {
  const sem = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const bordas = { top: sem, bottom: sem, left: sem, right: sem }
  const meia = LARGURA_UTIL / 2
  const cel = ([nome, txt, larg]) => new TableCell({
    width: { size: meia, type: WidthType.DXA }, borders: bordas,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [imagem(nome, Math.min(larg || 285, 285))] }), legenda(txt)],
  })
  return new Table({ width: { size: LARGURA_UTIL, type: WidthType.DXA }, columnWidths: [meia, meia], rows: [new TableRow({ cantSplit: true, children: [cel(a), cel(b)] })] })
}

function tabela(cab, linhas, larg) {
  const borda = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' }
  const bordas = { top: borda, bottom: borda, left: borda, right: borda }
  const cel = (t, i, c) => new TableCell({
    width: { size: larg[i], type: WidthType.DXA }, borders: bordas,
    shading: c ? { type: ShadingType.CLEAR, fill: CINZA, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [new Paragraph({ spacing: { after: 0 }, children: c ? [new TextRun({ text: t, bold: true, color: PRETO, size: 20 })] : runs(String(t)) })],
  })
  return new Table({
    width: { size: larg.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: larg,
    rows: [new TableRow({ tableHeader: true, children: cab.map((t, i) => cel(t, i, true)) }), ...linhas.map((l) => new TableRow({ cantSplit: true, children: l.map((t, i) => cel(t, i, false)) }))],
  })
}

// Page Object da sacola: só a parte que o exemplo de frete usa.
const sacolaPO = (() => {
  const t = trecho('tests/pages/loja.py', 'class Sacola:', 'class Login:')
  const manter = ['class Sacola', 'def __init__', 'self.page = page', 'self.subtotal', 'self.frete =', 'self.total', 'self.cep', 'self.calcular =', 'self.cupom =', 'self.aplicar =', 'def abrir', 'self.page.goto("sacola")', 'def calcular_frete', 'self.cep.fill', 'self.calcular.click', 'def aplicar_cupom', 'self.cupom.fill', 'self.aplicar.click']
  const out = []
  for (const l of t) {
    if (manter.some((m) => l.includes(m))) {
      if (/^\s{4}def /.test(l) && out.length) out.push('')
      out.push(l)
    }
  }
  return out
})()


const INTEGRANTES = ['ANDREY PORTO BRUMATTI', 'ENZO ARAUJO DUARTE', 'GUSTAVO BARBOSA DOS SANTOS']
const TITULO = 'ARMAZÉM FICÇÃO: UMA LOJA DE MENTIRA COM TESTES DE VERDADE'
const centro = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 360 }, children: [new TextRun({ text: t, bold: true, color: PRETO, ...o })] })
const vazio = (n) => Array.from({ length: n }, () => new Paragraph({ spacing: { after: 0, line: 360 }, children: [] }))
const capaEFolhaDeRosto = [
  centro('UNESC – CENTRO UNIVERSITÁRIO DO ESPÍRITO SANTO'),
  centro('CURSO DE SISTEMAS DE INFORMAÇÃO'),
  ...vazio(6),
  ...INTEGRANTES.map((nome) => centro(nome)),
  ...vazio(6),
  centro(TITULO, { size: 28 }),
  ...vazio(11),
  centro('COLATINA'),
  centro('2026'),
  new Paragraph({ pageBreakBefore: true, spacing: { after: 0 }, children: [] }),
  ...INTEGRANTES.map((nome) => centro(nome)),
  ...vazio(7),
  centro(TITULO, { size: 28 }),
  ...vazio(4),
  new Paragraph({ indent: { left: 4536 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 240 }, children: [new TextRun({ text: 'Trabalho apresentado à disciplina Qualidade e Teste de Software, do curso de Sistemas de Informação do UNESC, como avaliação do 2º bimestre.', size: 20, color: PRETO })] }),
  new Paragraph({ indent: { left: 4536 }, spacing: { after: 0, line: 240 }, children: [new TextRun({ text: 'Professor: Riciere Massariol', size: 20, color: PRETO })] }),
  ...vazio(10),
  centro('COLATINA'),
  centro('2026'),
]

// ---------- conteúdo ----------
const corpo = [
  h1('O que fizemos'),
  p('Fizemos uma loja virtual, o **Armazém Ficção**, e uma rotina de testes automatizados que confere se ela funciona. Os produtos são inventados (guarda-chuva de chuva interna, relógio que atrasa de propósito, gaveta para guardar silêncio), mas as regras da loja são reais: estoque, cupons, frete por CEP, **frete grátis a partir de R$ 300**, login com bloqueio e checkout com validação de cartão. São essas regras que dão o que testar.'),
  item('**Aplicação:** React + TypeScript, feita com Vite e publicada no GitHub Pages.'),
  item('**Ferramenta de teste:** Playwright para Python, rodando com pytest.'),
  item('**Rotina de teste:** 145 casos de teste, cada um executado em 3 navegadores (Chrome, Firefox e Safari/WebKit), num total de 435 execuções. Eles rodam sozinhos a cada alteração no código.'),
  espaco(),
  link('Site:', 'https://enzoaraujoduarte.github.io/armazem-ficcao/'),
  link('Código e testes:', 'https://github.com/EnzoAraujoDuarte/armazem-ficcao'),
  ...print('01-vitrine.png', 600, 'Página inicial. Cada produto é um folheto de cordel pendurado no barbante, com o botão Comprar.'),

  h1('A loja'),
  p('O cliente busca e filtra produtos, escolhe variações, monta a sacola, calcula o frete, aplica cupom, cria conta, paga e vê seus pedidos. Nada é cobrado e nenhum dado sai do navegador.'),
  lado(['02-catalogo.png', 'Catálogo filtrado por categoria e ordenado pelo maior preço. Os filtros ficam na URL.'], ['03-produto.png', 'Produto com variação: escolher "Família" soma R$ 40,00 ao preço.']),
  lado(['09-pedido.png', 'Pedido pago e carimbado no fim da compra.'], ['11-celular.png', 'A mesma loja no celular (iPhone 13).', 130]),

  h1('Como testamos'),
  h2('A ferramenta'),
  p('Escolhemos o **Playwright** porque ele abre um navegador de verdade e usa o site como uma pessoa usaria: clica, digita e espera a tela mudar. Além disso, ele:'),
  item('roda o mesmo teste no Chrome, no Firefox e no Safari;'),
  item('espera sozinho o elemento aparecer, então nenhum teste precisou de `sleep`;'),
  item('intercepta a rede (para simular a API fora do ar) e controla o relógio do navegador;'),
  item('encontra os elementos pelo nome que um leitor de tela lê (`get_by_role`, `get_by_label`). Se o teste acha o botão, o botão também está acessível.'),
  h2('Como os testes estão organizados'),
  ...codigo([
    'tests/',
    '├── conftest.py          # sobe o site, deixa a sacola pronta, faz login',
    '├── dados.py             # lê o catálogo e calcula os valores esperados',
    '├── pages/loja.py        # Page Objects: uma classe por tela',
    '├── test_catalogo.py     # busca, filtros, ordenação, paginação',
    '├── test_frete_gratis.py # a regra dos R$ 300',
    '├── test_checkout.py     # compra completa, cartão, endereço, parcelas',
    '└── ...                  # mais 9 arquivos (lista completa abaixo)',
  ]),
  p('Cada tela tem uma classe que guarda os seus elementos (padrão **Page Object**). O teste usa ações com nome de negócio, como `calcular_frete` e `aplicar_cupom`, sem precisar saber como o HTML foi feito:'),
  ...codigo(sacolaPO, 'tests/pages/loja.py (trecho)'),

  h2('Exemplo 1: frete grátis a partir de R$ 300'),
  p('Esse é o teste da regra de frete grátis. Usamos **análise de valor-limite**: testamos logo abaixo do limite, exatamente nele e acima dele, porque é na fronteira que o erro costuma aparecer (um `>` no lugar de `>=`). Achamos com um script as combinações de produtos que dão exatamente esses valores.'),
  ...codigo(trecho('tests/test_frete_gratis.py', '@pytest.mark.smoke', 'def test_sacola_avisa'), 'tests/test_frete_gratis.py'),
  lado(['04-sacola-29990.png', 'R$ 299,90: o frete de R$ 12,90 é cobrado.', 250], ['05-sacola-30000.png', 'R$ 300,00: frete grátis.', 250]),
  ...print('13-terminal-frete-ok.png', 620, 'Os 6 testes de frete grátis passando.'),

  h2('Exemplo 2: validação do cartão'),
  p('Aqui usamos **partição de equivalência**: cada tipo de erro é uma classe, e um caso de cada classe basta para cobri-la. A mesma função de teste roda 7 vezes, uma para cada `pytest.param`.'),
  ...codigo(testeComDecoradores('tests/test_checkout.py', 'test_validacao_do_cartao', 'def test_cartao_que_vence'), 'tests/test_checkout.py'),
  ...print('08-cartao-invalido.png', 560, 'Número, nome, validade e CVV errados: cada campo mostra o próprio erro.'),

  h2('Exemplo 3: e se a API cair?'),
  p('O Playwright intercepta a requisição do catálogo e devolve erro 500, sem mexer no código da loja. O teste confere que o cliente vê uma mensagem clara e que o botão "Tentar de novo" funciona quando a API volta.'),
  ...codigo(trecho('tests/test_resiliencia.py', 'def test_erro_500', 'def test_rede_lenta'), 'tests/test_resiliencia.py'),
  ...print('10-api-fora.png', 520, 'O que o cliente vê quando a API do catálogo está fora do ar.'),

  h2('Exemplo 4: bloqueio do login com relógio controlado'),
  p('Depois de 3 senhas erradas, a conta fica bloqueada por 30 segundos. Em vez de esperar 30 segundos de verdade, o teste adianta o relógio do navegador.'),
  ...codigo(trecho('tests/test_autenticacao.py', 'def test_conta_bloqueia', 'def test_sair_encerra'), 'tests/test_autenticacao.py'),
  ...print('07-login-bloqueado.png', 260, 'Conta bloqueada depois da terceira senha errada.'),

  h2('Exemplo 5: acessibilidade'),
  p('O axe-core (o mesmo motor do Lighthouse) roda em 8 páginas, e o teste falha se aparecer qualquer problema grave de acessibilidade, como texto com pouco contraste.'),
  ...codigo([...trecho('tests/test_acessibilidade.py', 'def violacoes_graves', '@pytest.mark.a11y'), '', ...(() => {
    const t = ler('tests/test_acessibilidade.py')
    const i = t.findIndex((l) => l.startsWith('def test_pagina_sem_violacoes'))
    return t.slice(i - 2, i + 4)
  })()], 'tests/test_acessibilidade.py'),

  h1('O que a suíte cobre'),
  tabela(['Arquivo', 'O que testa', 'Casos'], [
    ['test_vitrine.py', 'Página inicial, compra rápida, página 404', 7],
    ['test_catalogo.py', 'Busca sem acento, filtros, ordenação, paginação, filtros na URL', 19],
    ['test_produto.py', 'Variação de preço, quantidade mínima e máxima, produto esgotado', 13],
    ['test_sacola.py', 'Subtotal, editar e remover, sacola salva ao recarregar e entre abas', 8],
    ['test_cupons.py', 'Cupom válido, inválido, expirado, valor mínimo, um por compra', 11],
    ['test_frete_cep.py', 'Frete nas 8 regiões e CEPs inválidos', 13],
    ['test_frete_gratis.py', 'Frete grátis a partir de R$ 300', 6],
    ['test_autenticacao.py', 'Login, bloqueio, cadastro, páginas protegidas, redirecionamento seguro', 16],
    ['test_checkout.py', 'Compra completa, cartão recusado, cartão e endereço inválidos, parcelas, Pix, boleto', 23],
    ['test_resiliencia.py', 'API com erro, rede lenta, resposta inválida, catálogo vazio', 5],
    ['test_acessibilidade.py', 'axe-core, um título por página, compra só com teclado, menos movimento', 20],
    ['test_responsivo.py', 'Celular: toque, rolagem do barbante, sem rolagem lateral', 4],
    ['**Total**', '', '**145** (× 3 navegadores = 435)'],
  ], [2500, 5338, 1800]),
  espaco(),

  h1('Os testes pegam erro de verdade?'),
  p('Teste que nunca falha não prova nada. Então colocamos um bug de propósito na regra do frete grátis, trocando `>=` por `>`:'),
  ...codigo([
    '// src/domain/cart.ts',
    '- const freteGratis = subtotal >= FREE_SHIPPING_FROM || cupomDeFrete',
    '+ const freteGratis = subtotal >  FREE_SHIPPING_FROM || cupomDeFrete',
  ]),
  p('Rodamos os testes de novo. Falharam exatamente os casos de R$ 300,00, mostrando que o frete veio R$ 12,90 em vez de grátis. Os casos de R$ 299,90 e R$ 389,00 continuaram passando, como deveriam. Depois desfizemos o bug.'),
  ...print('14-terminal-mutacao.png', 620, 'Com o bug, 2 testes falham e mostram o valor que veio errado.'),

  h1('Rodando tudo'),
  p('No nosso computador, a suíte inteira roda em paralelo nos 3 navegadores em menos de um minuto:'),
  ...print('15-terminal-tudo.png', 470, '435 execuções, todas passando.'),
  p('No GitHub, cada envio de código dispara o pipeline: primeiro os testes rodam nos 3 navegadores; se tudo passar, o site é publicado; depois os testes principais rodam de novo contra o site publicado, para confirmar que a publicação deu certo.'),
  ...print('12-github-actions.png', 620, 'Pipeline no GitHub Actions: testes, publicação e teste em produção, tudo verde.'),

  h1('Problemas que os testes encontraram'),
  p('Enquanto desenvolvíamos, os testes acharam defeitos reais na loja:'),
  item('**Contraste baixo:** o número do folheto e o selo "Esgotado" ficavam com pouco contraste em alguns papéis coloridos. Quem pegou foi o teste de acessibilidade. Escurecemos o vermelho.'),
  item('**Filtro que "piscava":** ao clicar numa categoria, a opção voltava por um instante ao estado anterior antes de ficar marcada. O Playwright acusou que o clique não mudou o estado. Corrigimos para a URL ser atualizada na hora.'),
  item('**Catálogo largo demais no iPhone:** no Safari, o catálogo aparecia por um instante com 3 colunas e criava rolagem lateral. Quem pegou foi o teste de celular. Passamos a medir a tela antes de desenhar.'),

  h1('Como rodar'),
  ...codigo([
    'npm install && npm run build      # gera o site',
    'uv sync --group test              # instala pytest, Playwright e plugins',
    'uv run playwright install         # baixa os navegadores',
    'uv run pytest -v                  # roda todos os testes',
    '',
    '# para apresentar: navegador aberto e em câmera lenta',
    'uv run pytest tests/test_frete_gratis.py --headed --slowmo 600 -v',
  ]),
  p('Conta de teste: `demo@armazem.test` / `ficcao123`. Cartão aprovado: `4111 1111 1111 1111`. Cartão recusado: `4000 0000 0000 0002`.'),
]

const doc = new Document({
  creator: 'Andrey Porto Brumatti, Enzo Araujo Duarte e Gustavo Barbosa dos Santos',
  title: 'Armazém Ficção: uma loja de mentira com testes de verdade',
  styles: {
    default: { document: { run: { font: FONT, size: 24, color: PRETO } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 26, bold: true, color: PRETO, allCaps: true }, paragraph: { spacing: { before: 320, after: 120 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: PRETO }, paragraph: { spacing: { before: 220, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'lista', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1701, bottom: 1134, left: 1701, right: 1134 } } },
    children: capaEFolhaDeRosto,
  }, {
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1701, bottom: 1134, left: 1701, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, color: PRETO })] })] }) },
    children: corpo,
  }],
})

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(SAIDA, buf); console.log('ok', SAIDA) })

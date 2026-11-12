# Armazém Ficção

Loja virtual de **objetos que não existem**, vendidos com toda a seriedade, e uma suíte de testes automatizados que prova que ela funciona.

Trabalho da disciplina **Qualidade e Teste de Software** (Sistemas de Informação, UNESC Colatina).

- **Site em produção:** https://enzoaraujoduarte.github.io/armazem-ficcao/
- **Ferramenta de teste:** [Playwright para Python](https://playwright.dev/python/) com pytest
- **Aplicação:** React 19 + TypeScript + Vite + React Router
- **Relatório do trabalho (Word):** [docs/Relatorio_Armazem_Ficcao.docx](docs/Relatorio_Armazem_Ficcao.docx)

> Nada aqui é real: nenhum produto existe, nada é cobrado e nada é entregue. Tudo o que a loja guarda (sacola, conta, pedidos) fica só no navegador de quem usa.

## O que a loja faz

| Área | Regras que os testes verificam |
| --- | --- |
| Catálogo | Busca que ignora acentos e maiúsculas, filtro por categoria, ordenação, "só em estoque", paginação de 12 em 12, filtros na URL |
| Produto | Variações com acréscimo no preço, quantidade de 1 até o estoque (máx. 10 por pedido), produto esgotado |
| Sacola | Subtotal, alterar e remover itens, sacola salva no navegador e sincronizada entre abas |
| Cupons | `FICCAO10` (10%), `PRIMEIRACOMPRA` (R$ 25 a partir de R$ 100), `FRETEGRATIS` (a partir de R$ 150), `VERAO2020` (expirado) |
| Frete | Valor e prazo pela região do CEP; **frete grátis a partir de R$ 300,00** |
| Conta | Cadastro com validação, login, bloqueio de 30 s após 3 senhas erradas, páginas protegidas |
| Checkout | Endereço, cartão (Luhn, validade, CVV), parcelas de no mínimo R$ 20, Pix, boleto, cartão recusado |

Conta de demonstração: `demo@armazem.test` / `ficcao123`.
Cartões de teste: `4111 1111 1111 1111` (aprovado) e `4000 0000 0000 0002` (recusado).

## Rodar a loja

```bash
npm install
npm run dev
```

Abre em http://localhost:5173/armazem-ficcao/.

## Rodar os testes

Pré-requisito: [uv](https://docs.astral.sh/uv/) (gerenciador de Python).

```bash
uv sync --group test
uv run playwright install chromium
npm run build
uv run pytest -v
```

Sem `--base-url`, os testes sobem sozinhos o build local (`vite preview`). Outras formas úteis:

```bash
# Mostrar um teste rodando no navegador, devagar (bom para apresentar)
uv run pytest tests/test_frete_gratis.py --headed --slowmo 600 -v

# Rodar em paralelo nos três motores de navegador (suba o site antes com `npm run preview`)
uv run pytest -n auto --browser chromium --browser firefox --browser webkit

# Gerar relatório HTML
uv run pytest --html relatorio/relatorio.html --self-contained-html

# Rodar só o caminho principal contra o site em produção
uv run pytest -m smoke --base-url https://enzoaraujoduarte.github.io/armazem-ficcao/
```

## Como os testes estão organizados

```
tests/
├── conftest.py            fixtures: servidor, sacola pronta, cliente logado
├── dados.py               oráculo: lê o catálogo e calcula os valores esperados
├── pages/loja.py          Page Objects (uma classe por tela)
├── test_vitrine.py        página inicial e compra rápida
├── test_catalogo.py       busca, filtros, ordenação e paginação
├── test_produto.py        variações, limites de quantidade, esgotado
├── test_sacola.py         cálculo, edição, persistência, sincronização entre abas
├── test_cupons.py         partição de equivalência e valor-limite dos cupons
├── test_frete_cep.py      frete por região do CEP e CEPs inválidos
├── test_frete_gratis.py   valor-limite do frete grátis (R$ 299,90 / 300,00 / 389,00)
├── test_autenticacao.py   login, cadastro, bloqueio, rotas protegidas, open redirect
├── test_checkout.py       compra completa, validação de cartão e endereço, parcelas
├── test_resiliencia.py    API fora do ar, rede lenta, JSON quebrado (interceptação de rede)
├── test_acessibilidade.py axe-core (WCAG 2.1 AA), teclado, movimento reduzido
└── test_responsivo.py     iPhone 13: rolagem, toque, sem rolagem horizontal
```

Os testes de regra de negócio seguem o formato **Dado / Quando / Então** nos comentários, e os seletores usam papéis e nomes acessíveis (`get_by_role`, `get_by_label`), como um leitor de tela enxerga a página.

## Integração contínua

A cada push em `main`, o GitHub Actions:

1. roda a suíte inteira no Chromium, no Firefox e no WebKit;
2. publica o site no GitHub Pages só se tudo passar;
3. roda os testes `smoke` contra o site já publicado.

Os relatórios HTML e os traces das falhas ficam como artefatos de cada execução.

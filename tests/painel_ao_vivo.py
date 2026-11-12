"""Painel ao vivo para apresentar os testes.

Com `--painel`, abre à esquerda da tela uma janela com a lista de todos os testes, e o
navegador que roda os testes fica à direita. Cada teste fica amarelo enquanto roda e verde
(ou vermelho) quando termina. O painel só observa: nenhum teste muda de comportamento.

A janela do painel é aberta no mesmo navegador do Playwright, mas a lista é lida de um
servidorzinho local. Assim, atualizar o painel não passa pelo Playwright e não fica mais
lento com o --slowmo.
"""

import json
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

PAGINA = Path(__file__).with_name("painel_ao_vivo.html")
NAVEGADOR = r"(chromium|firefox|webkit)"

# Feito para a tela do MacBook Air (1470 x 956 pontos): painel de 455 à esquerda e a loja
# em 1000 x 760 à direita. 1000 px ainda é o layout de desktop da loja (o celular é < 760).
LARGURA_PAINEL = 455
TELA_DOS_TESTES = {"width": 1000, "height": 760}
TOPO = 25  # abaixo da barra de menus do macOS

GRUPOS = {
    "test_vitrine.py": "Vitrine",
    "test_catalogo.py": "Catálogo",
    "test_produto.py": "Produto",
    "test_sacola.py": "Sacola",
    "test_cupons.py": "Cupons",
    "test_frete_cep.py": "Frete por CEP",
    "test_frete_gratis.py": "Frete grátis a partir de R$ 300",
    "test_autenticacao.py": "Login e cadastro",
    "test_checkout.py": "Checkout",
    "test_resiliencia.py": "API fora do ar e rede lenta",
    "test_acessibilidade.py": "Acessibilidade",
    "test_responsivo.py": "Celular",
}


# Nomes de função não têm acento; o painel devolve os acentos para ficar legível.
ACENTOS = {
    "acessivel": "acessível", "acrescimo": "acréscimo", "alfabetica": "alfabética", "apos": "após",
    "ate": "até", "cartao": "cartão", "catalogo": "catálogo", "conferencia": "conferência",
    "demonstracao": "demonstração", "disponiveis": "disponíveis", "endereco": "endereço",
    "gratis": "grátis", "icone": "ícone", "invalido": "inválido", "ja": "já", "la": "lá",
    "maiusculas": "maiúsculas", "mantem": "mantém", "mes": "mês", "minima": "mínima",
    "minimo": "mínimo", "nao": "não", "numero": "número", "ordenacao": "ordenação",
    "pagina": "página", "preco": "preço", "preferencia": "preferência", "procedencia": "procedência",
    "regiao": "região", "sessao": "sessão", "so": "só", "titulo": "título", "ultima": "última",
    "unico": "único", "validacao": "validação", "valido": "válido", "variacao": "variação",
    "variacoes": "variações", "ve": "vê", "violacoes": "violações",
}


def nome_legivel(funcao: str) -> str:
    palavras = funcao.removeprefix("test_").split("_")
    texto = " ".join(ACENTOS.get(p, p) for p in palavras).replace("s n", "s/n")
    return texto[:1].upper() + texto[1:]


class Painel:
    def __init__(self):
        self.estado = {"testes": [], "fim": False}
        self.por_id: dict[str, dict] = {}
        self.inicio: dict[str, float] = {}
        self.url = ""

    def montar_lista(self, itens):
        navegadores = {m.group(1) for i in itens if (m := re.search(NAVEGADOR, i.nodeid))}
        for indice, item in enumerate(itens):
            arquivo, _, resto = item.nodeid.partition("::")
            funcao, _, parametros = resto.partition("[")
            navegador = re.search(NAVEGADOR, parametros)
            caso = re.sub(NAVEGADOR + "-?", "", parametros.rstrip("]"))
            if navegador and len(navegadores) > 1:
                caso = " · ".join(filter(None, [caso, navegador.group(1)]))
            teste = {
                "indice": indice,
                "grupo": GRUPOS.get(Path(arquivo).name, Path(arquivo).name),
                "nome": nome_legivel(funcao),
                "caso": caso,
                "status": "pendente",
                "duracao": None,
                "erro": None,
            }
            self.estado["testes"].append(teste)
            self.por_id[item.nodeid] = teste

    def servir(self):
        painel = self

        class Respostas(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path.startswith("/estado.json"):
                    corpo, tipo = json.dumps(painel.estado).encode(), "application/json"
                else:
                    corpo, tipo = PAGINA.read_bytes(), "text/html; charset=utf-8"
                self.send_response(200)
                self.send_header("Content-Type", tipo)
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(corpo)

            def log_message(self, *args):
                pass

        servidor = ThreadingHTTPServer(("127.0.0.1", 0), Respostas)
        threading.Thread(target=servidor.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{servidor.server_port}/"

    def comecou(self, nodeid):
        teste = self.por_id.get(nodeid)
        if teste:
            teste["status"] = "rodando"
            self.inicio[nodeid] = time.monotonic()

    def resultado(self, relatorio):
        teste = self.por_id.get(relatorio.nodeid)
        if not teste:
            return
        if relatorio.failed:
            teste["status"] = "falhou"
            linhas = [l[1:].strip() for l in relatorio.longreprtext.splitlines() if l.startswith("E ")]
            teste["erro"] = "\n".join(linhas[:3]) or relatorio.longreprtext.strip().splitlines()[-1]
        elif relatorio.skipped and teste["status"] == "rodando":
            teste["status"] = "pulou"
        elif relatorio.when == "call" and relatorio.passed:
            teste["status"] = "passou"
        if relatorio.when in ("call", "teardown"):
            teste["duracao"] = time.monotonic() - self.inicio.get(relatorio.nodeid, time.monotonic())


_painel: Painel | None = None


# ---------- ganchos do pytest (importados pelo conftest.py) ----------

def pytest_addoption(parser):
    parser.addoption("--painel", action="store_true", help="Mostra um painel ao vivo com os testes ao lado do navegador.")


def pytest_configure(config):
    global _painel
    if config.getoption("--painel") and not hasattr(config, "workerinput"):
        _painel = Painel()


def pytest_collection_finish(session):
    if _painel:
        _painel.montar_lista(session.items)
        _painel.servir()


def pytest_runtest_logstart(nodeid, location):
    if _painel:
        _painel.comecou(nodeid)


def pytest_runtest_logreport(report):
    if _painel:
        _painel.resultado(report)


def argumentos_do_navegador(argumentos: dict) -> dict:
    """Com o painel, o navegador dos testes abre aberto na tela, à direita do painel."""
    if not _painel:
        return argumentos
    posicao = f"--window-position={LARGURA_PAINEL + 7},{TOPO}"
    return {**argumentos, "headless": False, "args": [*argumentos.get("args", []), posicao]}


def tamanho_da_tela(padrao: dict) -> dict:
    """Com o painel, a loja abre menor para caber ao lado dele."""
    return TELA_DOS_TESTES if _painel else padrao


@pytest.fixture(scope="session", autouse=True)
def painel_ao_vivo(request, browser):
    """Abre a janela do painel no começo e, no fim, deixa ela aberta até apertar Enter."""
    if not _painel:
        yield
        return

    contexto = browser.new_context(no_viewport=True)
    pagina = contexto.new_page()
    pagina.goto(_painel.url)
    if browser.browser_type.name == "chromium":
        cdp = contexto.new_cdp_session(pagina)
        janela = cdp.send("Browser.getWindowForTarget")["windowId"]
        altura = pagina.evaluate("screen.availHeight")
        cdp.send("Browser.setWindowBounds", {"windowId": janela, "bounds": {"left": 0, "top": 0, "width": LARGURA_PAINEL, "height": altura}})

    yield

    _painel.estado["fim"] = True
    time.sleep(1)  # o painel busca o estado a cada 0,3 s
    if sys.stdin.isatty():
        captura = request.config.pluginmanager.getplugin("capturemanager")
        with captura.global_and_fixture_disabled():
            input("\n\n  Testes terminados. O painel continua aberto: aperte Enter para fechar o navegador.\n")
    else:
        time.sleep(5)
    contexto.close()

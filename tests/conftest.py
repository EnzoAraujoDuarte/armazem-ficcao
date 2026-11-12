import json
import os
import shutil
import socket
import subprocess
import time
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import Page, expect

from tests.dados import USUARIO_DEMO, linha_sacola
from tests.pages.loja import Loja
from tests.painel_ao_vivo import (  # noqa: F401  ganchos e fixture do painel ao vivo (--painel)
    argumentos_do_navegador,
    painel_ao_vivo,
    tamanho_da_tela,
    pytest_addoption,
    pytest_collection_finish,
    pytest_configure,
    pytest_runtest_logreport,
    pytest_runtest_logstart,
)

RAIZ = Path(__file__).parent.parent
URL_LOCAL = "http://127.0.0.1:4173/armazem-ficcao/"

expect.set_options(timeout=7_000)


def _porta_aberta(host: str, porta: int) -> bool:
    try:
        socket.create_connection((host, porta), timeout=0.5).close()
        return True
    except OSError:
        return False


@pytest.fixture(scope="session")
def base_url(pytestconfig) -> str:
    """Usa --base-url ou BASE_URL (ex.: o site em produção). Sem nada informado, sobe o
    build local com `vite preview`, igual ao que é publicado no GitHub Pages."""
    url = pytestconfig.getoption("base_url") or os.environ.get("BASE_URL")
    if url:
        yield url if url.endswith("/") else f"{url}/"
        return

    alvo = urlparse(URL_LOCAL)
    if _porta_aberta(alvo.hostname, alvo.port):
        yield URL_LOCAL
        return

    if not (RAIZ / "dist" / "index.html").exists():
        subprocess.run([shutil.which("npm") or "npm", "run", "build"], cwd=RAIZ, check=True)
    servidor = subprocess.Popen(
        [shutil.which("npx") or "npx", "vite", "preview"],
        cwd=RAIZ,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(60):
        if _porta_aberta(alvo.hostname, alvo.port):
            break
        time.sleep(0.25)
    else:
        servidor.kill()
        pytest.exit("O servidor de preview não subiu na porta 4173.")
    yield URL_LOCAL
    servidor.terminate()


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return argumentos_do_navegador(browser_type_launch_args)


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {**browser_context_args, "locale": "pt-BR", "timezone_id": "America/Sao_Paulo", "viewport": tamanho_da_tela({"width": 1366, "height": 900})}


@pytest.fixture
def loja(page: Page) -> Loja:
    return Loja(page)


@pytest.fixture
def com_sacola(page: Page):
    """Arranjo rápido: deixa a sacola pronta no localStorage (no mesmo formato que a loja usa)
    para testar as regras do carrinho sem repetir o caminho de compra em cada teste.

    O script roda antes de qualquer código da loja na próxima navegação, e só uma vez por
    aba, para a loja não sobrescrever a sacola nem o teste apagar o que o cliente fizer depois."""

    def preparar(*itens: tuple, cupom: dict | None = None):
        linhas = [linha_sacola(*item) for item in itens]
        sacola = json.dumps({"linhas": linhas, "cupom": cupom})
        page.add_init_script(
            f"""
            if (!sessionStorage.getItem('teste:sacola-pronta')) {{
              localStorage.setItem('armazem:carrinho', {json.dumps(sacola)});
              sessionStorage.setItem('teste:sacola-pronta', '1');
            }}
            """
        )
        return linhas

    return preparar


@pytest.fixture
def logado(page: Page, loja: Loja):
    """Entra com a conta de demonstração pela própria tela de login."""
    loja.login.abrir()
    loja.login.entrar(USUARIO_DEMO["email"], USUARIO_DEMO["senha"])
    expect(loja.cabecalho.saudacao).to_have_text("Olá, Cliente")
    return USUARIO_DEMO

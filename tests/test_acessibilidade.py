"""
Acessibilidade (WCAG 2.1 AA).

Ferramenta: axe-core, o mesmo motor do Lighthouse, rodando dentro do Playwright.
Além da varredura automática, testamos o uso só com teclado e a preferência por
menos movimento.
"""

import sys

import pytest
from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, expect

from tests.pages.loja import Loja

axe = Axe()

PAGINAS = [
    pytest.param("./", id="vitrine"),
    pytest.param("folhetos", id="catalogo"),
    pytest.param("folhetos?pagina=2", id="catalogo-pagina-2"),
    pytest.param("folheto/guarda-chuva-de-chuva-interna", id="produto"),
    pytest.param("sacola", id="sacola"),
    pytest.param("entrar", id="login"),
    pytest.param("cadastro", id="cadastro"),
    pytest.param("nao-existe", id="404"),
]


def violacoes_graves(page: Page) -> list[str]:
    resultado = axe.run(page, options={"runOnly": {"type": "tag", "values": ["wcag2a", "wcag2aa", "wcag21aa"]}})
    return [
        f"{v['id']} ({v['impact']}): {v['help']} -> {[n['target'] for n in v['nodes']][:3]}"
        for v in resultado.response["violations"]
        if v["impact"] in ("serious", "critical")
    ]


@pytest.mark.a11y
@pytest.mark.parametrize("caminho", PAGINAS)
def test_pagina_sem_violacoes_graves_de_acessibilidade(page: Page, caminho: str):
    page.goto(caminho)
    expect(page.get_by_role("heading", level=1)).to_be_visible()
    assert violacoes_graves(page) == []


@pytest.mark.a11y
def test_sacola_com_itens_sem_violacoes_graves(page: Page, com_sacola):
    com_sacola(("relogio-que-atrasa-de-proposito", 1))
    page.goto("sacola")
    expect(page.get_by_test_id("linha-sacola")).to_have_count(1)
    assert violacoes_graves(page) == []


@pytest.mark.a11y
@pytest.mark.parametrize("caminho", [p.values[0] for p in PAGINAS])
def test_cada_pagina_tem_um_unico_titulo_principal(page: Page, caminho: str):
    page.goto(caminho)
    expect(page.get_by_role("heading", level=1)).to_have_count(1)


@pytest.mark.a11y
def test_comprar_usando_so_o_teclado(loja: Loja, browser_name: str):
    # No Safari (WebKit no macOS), Tab só passa por campos de formulário; links e botões usam Option+Tab.
    tab = "Alt+Tab" if browser_name == "webkit" and sys.platform == "darwin" else "Tab"
    loja.vitrine.abrir()
    expect(loja.vitrine.folhetos).to_have_count(5)

    # O primeiro Tab mostra o atalho "Pular para o conteúdo"
    loja.page.keyboard.press(tab)
    expect(loja.page.get_by_role("link", name="Pular para o conteúdo")).to_be_focused()

    # Navega com Tab até o botão Comprar e confirma com Enter
    botao = loja.page.get_by_role("button", name="Comprar Guarda-chuva de Chuva Interna")
    for _ in range(30):
        if botao.evaluate("el => el === document.activeElement"):
            break
        loja.page.keyboard.press(tab)
    expect(botao).to_be_focused()
    loja.page.keyboard.press("Enter")

    expect(loja.cabecalho.contador).to_have_text("1")


@pytest.mark.a11y
def test_quem_prefere_menos_movimento_nao_ve_o_folheto_voando(loja: Loja):
    loja.page.emulate_media(reduced_motion="reduce")
    loja.vitrine.abrir()

    loja.vitrine.comprar("Gaveta para Guardar Silêncio")

    expect(loja.cabecalho.contador).to_have_text("1")
    expect(loja.page.locator(".folheto-fantasma")).to_have_count(0)


def test_sem_preferencia_o_folheto_voa_ate_a_sacola(loja: Loja):
    loja.page.emulate_media(reduced_motion="no-preference")
    loja.vitrine.abrir()

    loja.vitrine.comprar("Gaveta para Guardar Silêncio")

    expect(loja.page.locator(".folheto-fantasma")).to_have_count(1)
    expect(loja.page.locator(".folheto-fantasma")).to_have_count(0)

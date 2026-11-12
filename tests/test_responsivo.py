"""Celular: a mesma compra precisa funcionar numa tela de 390 px, com toque."""

import pytest
from playwright.sync_api import Browser, expect

from tests.pages.loja import Loja


@pytest.fixture
def celular(browser: Browser, playwright, base_url: str):
    iphone = {k: v for k, v in playwright.devices["iPhone 13"].items() if k != "default_browser_type"}
    contexto = browser.new_context(**iphone, base_url=base_url, locale="pt-BR")
    pagina = contexto.new_page()
    yield Loja(pagina)
    contexto.close()


def test_no_celular_o_barbante_rola_de_lado(celular: Loja):
    celular.vitrine.abrir()
    varal = celular.page.locator(".varal--rolavel")
    largura_visivel, largura_total = varal.evaluate("el => [el.clientWidth, el.scrollWidth]")
    assert largura_total > largura_visivel

    # O último folheto fica fora da tela até o cliente rolar até ele
    ultimo = celular.vitrine.folhetos.last
    expect(ultimo).not_to_be_in_viewport()
    ultimo.scroll_into_view_if_needed()
    expect(ultimo).to_be_in_viewport()


def test_no_celular_a_sacola_mostra_so_o_icone_mas_continua_acessivel(celular: Loja):
    celular.vitrine.abrir()
    expect(celular.page.locator(".sacola-rotulo")).to_be_hidden()
    expect(celular.cabecalho.sacola).to_have_accessible_name("Sacola, 0 itens")


def test_no_celular_da_para_comprar_com_toque(celular: Loja):
    celular.produto.abrir("termometro-de-climao")
    celular.produto.mais.tap()
    celular.produto.adicionar.tap()

    expect(celular.cabecalho.contador).to_have_text("2")
    celular.cabecalho.sacola.tap()
    expect(celular.sacola.linhas).to_have_count(1)


def test_no_celular_a_pagina_nao_tem_rolagem_horizontal(celular: Loja):
    for caminho in ["./", "folhetos", "folheto/termometro-de-climao", "entrar"]:
        celular.page.goto(caminho)
        expect(celular.page.get_by_role("heading", level=1)).to_be_visible()
        largura = celular.page.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        assert largura[0] <= largura[1], f"{caminho} rola na horizontal: {largura}"

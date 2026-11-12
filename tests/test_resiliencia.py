"""
Resiliência: o que a loja faz quando a "API" do catálogo falha.

Técnica usada: INTERCEPTAÇÃO DE REDE. O Playwright intercepta a requisição de
produtos.json e devolve erro, atraso ou dados vazios, sem mexer no código da loja.
"""

import json

from playwright.sync_api import Route, expect

from tests.dados import CATALOGO, PRODUTOS, TAMANHO_PAGINA
from tests.pages.loja import Loja

API = "**/api/produtos.json"


def test_erro_500_mostra_aviso_e_permite_tentar_de_novo(loja: Loja):
    # Dado que a API do catálogo está fora do ar
    loja.page.route(API, lambda route: route.fulfill(status=500, body="erro"))

    # Quando o cliente abre o catálogo
    loja.page.goto("folhetos")

    # Então vê uma mensagem clara, em vez de uma tela quebrada
    expect(loja.page.get_by_role("alert")).to_contain_text("O vento levou os folhetos.")
    expect(loja.page.get_by_role("alert")).to_contain_text("HTTP 500")

    # E quando a API volta, "Tentar de novo" carrega os produtos
    loja.page.unroute(API)
    loja.page.get_by_role("button", name="Tentar de novo").click()
    expect(loja.catalogo.folhetos).to_have_count(TAMANHO_PAGINA)


def test_rede_lenta_mostra_carregamento(loja: Loja):
    liberar = []

    def segurar(route: Route):
        liberar.append(route)

    # Dado uma rede que demora a responder
    loja.page.route(API, segurar)
    loja.page.goto("folhetos")

    # Então aparece o estado de carregamento
    expect(loja.page.get_by_role("status", name="Carregando folhetos")).to_be_visible()

    # E quando a resposta chega, os folhetos aparecem
    liberar[0].continue_()
    expect(loja.catalogo.folhetos).to_have_count(TAMANHO_PAGINA)
    expect(loja.page.get_by_role("status", name="Carregando folhetos")).to_have_count(0)


def test_json_malformado_e_tratado_como_erro(loja: Loja):
    loja.page.route(API, lambda route: route.fulfill(status=200, body="{não é json", content_type="application/json"))
    loja.page.goto("folhetos")
    expect(loja.page.get_by_role("alert")).to_contain_text("O vento levou os folhetos.")


def test_catalogo_vazio_mostra_estado_vazio(loja: Loja):
    vazio = {"categorias": CATALOGO["categorias"], "produtos": []}
    loja.page.route(API, lambda route: route.fulfill(json=vazio))

    loja.page.goto("folhetos")

    expect(loja.catalogo.contagem).to_have_text("0 folhetos")
    expect(loja.catalogo.vazio).to_be_visible()


def test_loja_mostra_o_que_a_api_mandar(loja: Loja):
    # Prova de que a tela vem dos dados: trocamos o preço de um produto na resposta.
    alterado = json.loads(json.dumps(CATALOGO))
    alterado["produtos"][0]["preco"] = 1234.5
    loja.page.route(API, lambda route: route.fulfill(json=alterado))

    loja.produto.abrir(PRODUTOS[0]["slug"])

    expect(loja.produto.preco).to_have_text("R$ 1.234,50")

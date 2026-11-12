"""Sacola: cálculo de subtotal, alteração de quantidade, remoção e persistência."""

from playwright.sync_api import expect

from tests.dados import brl, preco
from tests.pages.loja import Loja


def test_sacola_vazia_convida_a_escolher_folhetos(loja: Loja):
    loja.sacola.abrir()
    expect(loja.sacola.vazia).to_be_visible()
    loja.page.get_by_role("link", name="Escolher folhetos").click()
    expect(loja.catalogo.contagem).to_be_visible()


def test_subtotal_soma_preco_vezes_quantidade(loja: Loja, com_sacola):
    # Dado 2 relógios e 3 réguas
    com_sacola(("relogio-que-atrasa-de-proposito", 2), ("regua-de-medir-paciencia", 3))

    # Quando o cliente abre a sacola
    loja.sacola.abrir()

    # Então cada linha e o subtotal batem com o preço vezes a quantidade
    esperado = 2 * preco("relogio-que-atrasa-de-proposito") + 3 * preco("regua-de-medir-paciencia")
    expect(loja.sacola.linha("Relógio que Atrasa de Propósito").get_by_test_id("total-linha")).to_have_text(brl(298.00))
    expect(loja.sacola.subtotal).to_have_text(brl(esperado))
    expect(loja.page.get_by_text("Subtotal (5 itens)")).to_be_visible()
    expect(loja.sacola.frete).to_have_text("Informe o CEP")


def test_alterar_quantidade_recalcula_tudo(loja: Loja, com_sacola):
    com_sacola(("sino-de-avisar-que-ja-sabia", 1))
    loja.sacola.abrir()

    loja.sacola.linha("Sino de Avisar que Já Sabia").get_by_role("button", name="Aumentar quantidade").click()

    expect(loja.sacola.subtotal).to_have_text(brl(2 * preco("sino-de-avisar-que-ja-sabia")))
    expect(loja.cabecalho.contador).to_have_text("2")


def test_remover_um_item(loja: Loja, com_sacola):
    com_sacola(("sino-de-avisar-que-ja-sabia", 1), ("mapa-de-lugares-esquecidos", 1))
    loja.sacola.abrir()

    loja.sacola.remover("Sino de Avisar que Já Sabia")

    expect(loja.sacola.linhas).to_have_count(1)
    expect(loja.sacola.subtotal).to_have_text(brl(preco("mapa-de-lugares-esquecidos")))


def test_esvaziar_a_sacola(loja: Loja, com_sacola):
    com_sacola(("sino-de-avisar-que-ja-sabia", 1), ("mapa-de-lugares-esquecidos", 1))
    loja.sacola.abrir()

    loja.sacola.esvaziar.click()

    expect(loja.sacola.vazia).to_be_visible()
    expect(loja.cabecalho.contador).to_have_text("0")


def test_sacola_continua_la_depois_de_recarregar_a_pagina(loja: Loja):
    # Dado um item colocado na sacola pela interface
    loja.produto.abrir("bussola-que-aponta-pra-geladeira")
    loja.produto.adicionar.click()

    # Quando o cliente recarrega a página
    loja.page.reload()

    # Então o item continua lá (fica guardado no navegador)
    expect(loja.cabecalho.contador).to_have_text("1")


def test_sacola_sincroniza_entre_abas(loja: Loja, context):
    # Dado duas abas abertas na loja
    loja.vitrine.abrir()
    outra_aba = context.new_page()
    outra_aba.goto(loja.page.url)

    # Quando o cliente compra em uma aba
    loja.vitrine.comprar("Gaveta para Guardar Silêncio")

    # Então o contador da outra aba também atualiza
    expect(outra_aba.get_by_test_id("contador-sacola")).to_have_text("1")


def test_dados_corrompidos_no_navegador_nao_quebram_a_loja(loja: Loja):
    loja.vitrine.abrir()
    loja.page.evaluate("localStorage.setItem('armazem:carrinho', '{isso não é json')")

    loja.page.reload()

    expect(loja.vitrine.titulo).to_be_visible()
    expect(loja.cabecalho.contador).to_have_text("0")

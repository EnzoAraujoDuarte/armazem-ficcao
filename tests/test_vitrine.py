"""Vitrine (página inicial): a oferta precisa estar clara e a compra precisa funcionar
já no primeiro viewport."""

import re

import pytest
from playwright.sync_api import Page, expect

from tests.dados import PRODUTOS
from tests.pages.loja import Loja

DESTAQUES = [p for p in PRODUTOS if p.get("destaque")][:5]


@pytest.mark.smoke
def test_vitrine_apresenta_a_loja_e_os_destaques(loja: Loja):
    loja.vitrine.abrir()

    expect(loja.vitrine.titulo).to_have_text("Objetos que não existem, vendidos com toda a seriedade.")
    expect(loja.vitrine.aviso_ficticio).to_be_visible()
    expect(loja.vitrine.folhetos).to_have_count(len(DESTAQUES))
    for produto in DESTAQUES:
        expect(loja.page.get_by_role("heading", name=produto["nome"])).to_be_visible()


@pytest.mark.smoke
def test_comprar_na_vitrine_leva_o_folheto_para_a_sacola(loja: Loja):
    loja.vitrine.abrir()
    expect(loja.cabecalho.contador).to_have_text("0")

    loja.vitrine.comprar("Relógio que Atrasa de Propósito")

    expect(loja.cabecalho.contador).to_have_text("1")
    expect(loja.cabecalho.sacola).to_have_accessible_name("Sacola, 1 item")
    expect(loja.aviso.texto).to_have_text("Relógio que Atrasa de Propósito foi para a sacola.")

    loja.aviso.ver_sacola.click()
    expect(loja.page).to_have_url(re.compile(r"/sacola$"))
    expect(loja.sacola.linhas).to_have_count(1)


def test_comprar_duas_vezes_soma_na_mesma_linha(loja: Loja):
    loja.vitrine.abrir()
    loja.vitrine.comprar("Cadeira de Esperar Sentado")
    loja.vitrine.comprar("Cadeira de Esperar Sentado")

    expect(loja.cabecalho.sacola).to_have_accessible_name("Sacola, 2 itens")
    loja.sacola.abrir()
    expect(loja.sacola.linhas).to_have_count(1)


def test_aviso_de_compra_pode_ser_fechado(loja: Loja):
    loja.vitrine.abrir()
    loja.vitrine.comprar("Gaveta para Guardar Silêncio")
    expect(loja.aviso.texto).to_be_visible()

    loja.page.get_by_role("button", name="Fechar aviso").click()
    expect(loja.aviso.texto).to_be_hidden()


def test_folheto_da_vitrine_abre_a_pagina_do_produto(loja: Loja):
    loja.vitrine.abrir()
    loja.page.get_by_role("link", name=re.compile("Caneca de Esfriar na Hora Certa")).first.click()

    expect(loja.page).to_have_url(re.compile(r"/folheto/caneca-de-esfriar-na-hora-certa$"))
    expect(loja.produto.titulo).to_have_text("Caneca de Esfriar na Hora Certa")


def test_link_ver_todos_leva_ao_catalogo(loja: Loja):
    loja.vitrine.abrir()
    loja.vitrine.ver_todos.click()
    expect(loja.page).to_have_url(re.compile(r"/folhetos$"))
    expect(loja.catalogo.contagem).to_have_text(f"{len(PRODUTOS)} folhetos")


def test_pagina_inexistente_mostra_404(page: Page, loja: Loja):
    page.goto("nao-existe/de-jeito-nenhum")
    expect(page.get_by_role("heading", name="Folheto não encontrado")).to_be_visible()
    page.get_by_role("main").get_by_role("link", name="Ver todos os folhetos").click()
    expect(page).to_have_url(re.compile(r"/folhetos$"))

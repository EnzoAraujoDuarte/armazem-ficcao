"""Catálogo: busca, filtros, ordenação e paginação conferidos contra o oráculo (o JSON do
catálogo lido pelo próprio teste)."""

import re

import pytest
from playwright.sync_api import expect

from tests.dados import CATEGORIAS, PRODUTOS, TAMANHO_PAGINA, buscar
from tests.pages.loja import Loja


def test_catalogo_pagina_de_12_em_12(loja: Loja):
    loja.catalogo.abrir()

    expect(loja.catalogo.contagem).to_have_text(f"{len(PRODUTOS)} folhetos")
    expect(loja.catalogo.folhetos).to_have_count(TAMANHO_PAGINA)
    expect(loja.catalogo.paginacao.get_by_role("button", name="Página 1")).to_have_attribute("aria-current", "page")

    loja.catalogo.ir_para_pagina(2)

    expect(loja.page).to_have_url(re.compile(r"pagina=2"))
    expect(loja.catalogo.folhetos).to_have_count(len(PRODUTOS) - TAMANHO_PAGINA)
    assert loja.catalogo.nomes()[0].lower() == PRODUTOS[TAMANHO_PAGINA]["nome"].lower()


@pytest.mark.parametrize(
    "termo",
    [
        pytest.param("chuva", id="palavra-simples"),
        pytest.param("cafe", id="sem-acento-acha-com-acento"),
        pytest.param("BÚSSOLA", id="maiusculas-e-acento"),
        pytest.param("  silêncio  ", id="espacos-nas-pontas"),
        pytest.param("madrugada", id="acha-pelo-resumo"),
    ],
)
def test_busca_ignora_acentos_e_maiusculas(loja: Loja, termo: str):
    esperados = buscar(termo)
    assert esperados, "o caso de teste precisa ter resultado"

    loja.catalogo.abrir()
    loja.catalogo.buscar(termo)

    expect(loja.catalogo.folhetos).to_have_count(len(esperados))
    assert sorted(n.lower() for n in loja.catalogo.nomes()) == sorted(p["nome"].lower() for p in esperados)


def test_busca_sem_resultado_mostra_estado_vazio_e_permite_limpar(loja: Loja):
    loja.catalogo.abrir()
    loja.catalogo.buscar("unicórnio de garagem")

    expect(loja.catalogo.vazio).to_be_visible()
    expect(loja.catalogo.contagem).to_have_text("0 folhetos para “unicórnio de garagem”")

    loja.catalogo.limpar.click()
    expect(loja.catalogo.folhetos).to_have_count(TAMANHO_PAGINA)
    expect(loja.catalogo.busca).to_have_value("")


@pytest.mark.parametrize("categoria", CATEGORIAS, ids=[c["slug"] for c in CATEGORIAS])
def test_filtro_por_categoria(loja: Loja, categoria: dict):
    esperados = [p for p in PRODUTOS if p["categoria"] == categoria["slug"]]

    loja.catalogo.abrir()
    loja.catalogo.filtrar_categoria(categoria["nome"])

    expect(loja.page).to_have_url(re.compile(rf"categoria={categoria['slug']}"))
    expect(loja.catalogo.folhetos).to_have_count(len(esperados))
    expect(loja.catalogo.contagem).to_contain_text(f"em {categoria['nome']}")


@pytest.mark.parametrize(
    ("rotulo", "chave", "decrescente"),
    [
        ("Menor preço", lambda p: p["preco"], False),
        ("Maior preço", lambda p: p["preco"], True),
    ],
    ids=["menor-preco", "maior-preco"],
)
def test_ordenacao_por_preco(loja: Loja, rotulo, chave, decrescente):
    esperado = sorted((p["preco"] for p in PRODUTOS), reverse=decrescente)[:TAMANHO_PAGINA]

    loja.catalogo.abrir()
    loja.catalogo.ordenar(rotulo)

    expect(loja.catalogo.folhetos).to_have_count(TAMANHO_PAGINA)
    assert loja.catalogo.precos() == esperado


def test_ordenacao_alfabetica(loja: Loja):
    loja.catalogo.abrir()
    loja.catalogo.ordenar("Nome (A–Z)")

    nomes = loja.catalogo.nomes()
    assert nomes[0].lower().startswith("borracha")
    assert nomes == sorted(nomes, key=lambda n: n.lower().replace("ú", "u").replace("é", "e"))


def test_so_disponiveis_esconde_esgotados(loja: Loja):
    disponiveis = [p for p in PRODUTOS if p["estoque"] > 0]

    loja.catalogo.abrir()
    loja.catalogo.so_disponiveis.check()

    expect(loja.catalogo.contagem).to_have_text(f"{len(disponiveis)} folhetos")
    loja.catalogo.ir_para_pagina(2)
    expect(loja.page.get_by_text("Esgotado", exact=True)).to_have_count(0)


def test_filtros_ficam_na_url_e_podem_ser_compartilhados(loja: Loja):
    esperados = sorted(
        (p for p in PRODUTOS if p["categoria"] == "tempo-e-clima"), key=lambda p: p["preco"], reverse=True
    )

    loja.catalogo.abrir("?categoria=tempo-e-clima&ordem=maior-preco")

    expect(loja.page.get_by_role("radio", name="Tempo & Clima")).to_be_checked()
    expect(loja.catalogo.ordem).to_have_value("maior-preco")
    assert loja.catalogo.precos() == [p["preco"] for p in esperados]


def test_trocar_filtro_volta_para_a_primeira_pagina(loja: Loja):
    loja.catalogo.abrir("?pagina=2")
    loja.catalogo.filtrar_categoria("Casa Improvável")
    expect(loja.page).not_to_have_url(re.compile("pagina="))


def test_pagina_fora_do_intervalo_cai_na_ultima(loja: Loja):
    loja.catalogo.abrir("?pagina=99")
    expect(loja.catalogo.folhetos).to_have_count(len(PRODUTOS) - TAMANHO_PAGINA)

"""Página do produto: variações mudam o preço e a quantidade respeita estoque e limite por pedido."""

import pytest
from playwright.sync_api import expect

from tests.dados import LIMITE_POR_ITEM, POR_SLUG, brl, preco
from tests.pages.loja import Loja


def test_produto_mostra_nome_preco_e_procedencia(loja: Loja):
    produto = POR_SLUG["relogio-que-atrasa-de-proposito"]

    loja.produto.abrir(produto["slug"])

    expect(loja.produto.titulo).to_have_text(produto["nome"])
    expect(loja.produto.preco).to_have_text(brl(produto["preco"]))
    expect(loja.produto.procedencia.filter(has_text=produto["procedencia"]["inventor"])).to_be_visible()
    expect(loja.produto.procedencia.filter(has_text=produto["procedencia"]["cidade"])).to_be_visible()


@pytest.mark.parametrize(
    ("slug", "opcao"),
    [
        ("guarda-chuva-de-chuva-interna", "Família"),
        ("caneca-de-esfriar-na-hora-certa", "Esmaltada"),
        ("pote-de-vento-encanado", "Ventania"),
    ],
)
def test_variacao_com_acrescimo_muda_o_preco(loja: Loja, slug: str, opcao: str):
    # Dado a página do produto com a opção padrão
    loja.produto.abrir(slug)
    expect(loja.produto.preco).to_have_text(brl(preco(slug)))

    # Quando o cliente escolhe uma opção mais cara
    loja.produto.escolher_opcao(opcao)

    # Então o preço soma o acréscimo da opção
    expect(loja.produto.preco).to_have_text(brl(preco(slug, opcao)))


@pytest.mark.parametrize(
    ("slug", "maximo"),
    [
        pytest.param("gaveta-para-guardar-silencio", 3, id="estoque-3-limita-em-3"),
        pytest.param("regua-de-medir-paciencia", LIMITE_POR_ITEM, id="estoque-100-limita-em-10"),
    ],
)
def test_quantidade_vai_de_1_ate_o_limite(loja: Loja, slug: str, maximo: int):
    loja.produto.abrir(slug)

    # Limite inferior: começa em 1 e não deixa diminuir
    expect(loja.produto.quantidade).to_have_value("1")
    expect(loja.produto.menos).to_be_disabled()

    # Limite superior: aumenta até o máximo e trava
    for _ in range(maximo - 1):
        loja.produto.mais.click()
    expect(loja.produto.quantidade).to_have_value(str(maximo))
    expect(loja.produto.mais).to_be_disabled()


def test_digitar_quantidade_acima_do_limite_fica_no_limite(loja: Loja):
    loja.produto.abrir("gaveta-para-guardar-silencio")
    loja.produto.definir_quantidade(50)
    expect(loja.produto.quantidade).to_have_value("3")


def test_adicionar_varias_unidades_de_uma_vez(loja: Loja):
    loja.produto.abrir("sino-de-avisar-que-ja-sabia")
    loja.produto.mais.click()
    loja.produto.mais.click()

    loja.produto.adicionar.click()

    expect(loja.cabecalho.contador).to_have_text("3")
    expect(loja.aviso.texto).to_have_text("3 × Sino de Avisar que Já Sabia foi para a sacola.")


def test_ao_atingir_o_estoque_na_sacola_nao_deixa_comprar_mais(loja: Loja):
    # Dado um produto com só 2 unidades em estoque
    loja.produto.abrir("cadeira-de-esperar-sentado")

    # Quando o cliente coloca as 2 na sacola
    loja.produto.mais.click()
    loja.produto.adicionar.click()

    # Então a loja avisa que não dá para levar mais
    expect(loja.produto.limite_atingido).to_be_visible()
    expect(loja.produto.adicionar).to_have_count(0)
    expect(loja.produto.estoque).to_contain_text("2 já na sacola")


@pytest.mark.parametrize("slug", ["lampada-de-ideias-ja-tidas", "vela-de-apagao-programado"])
def test_produto_esgotado_nao_pode_ser_comprado(loja: Loja, slug: str):
    loja.produto.abrir(slug)
    expect(loja.produto.esgotado).to_be_visible()
    expect(loja.produto.adicionar).to_have_count(0)


def test_variacoes_diferentes_viram_linhas_diferentes_na_sacola(loja: Loja):
    loja.produto.abrir("caneca-de-esfriar-na-hora-certa")
    loja.produto.adicionar.click()
    loja.produto.escolher_opcao("Anil")
    loja.produto.adicionar.click()

    loja.sacola.abrir()
    expect(loja.sacola.linhas).to_have_count(2)
    expect(loja.sacola.linhas.filter(has_text="Barro")).to_have_count(1)
    expect(loja.sacola.linhas.filter(has_text="Anil")).to_have_count(1)


def test_produto_inexistente_mostra_404(loja: Loja):
    loja.produto.abrir("teletransportador-de-bolso")
    expect(loja.page.get_by_role("heading", name="Folheto não encontrado")).to_be_visible()
    expect(loja.page.get_by_text("Esse folheto não está em nenhum barbante.")).to_be_visible()

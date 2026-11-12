"""
Cupons de desconto.

Técnica usada: PARTIÇÃO DE EQUIVALÊNCIA. Cada caso representa uma classe de entrada
(válido, minúsculo, com espaços, inexistente, expirado, vazio) e um representante
de cada classe basta para cobri-la. O cupom PRIMEIRACOMPRA tem valor mínimo, então ali
também entra VALOR-LIMITE (R$ 99,90 e R$ 100,00).
"""

import pytest
from playwright.sync_api import expect

from tests.dados import brl
from tests.pages.loja import Loja

# Bússola (R$ 99,90) e Tesoura + 4 sais (R$ 100,00): os dois lados do mínimo de R$ 100.
ABAIXO_DE_100 = [("bussola-que-aponta-pra-geladeira", 1)]
EXATAMENTE_100 = [("tesoura-de-cortar-assunto", 1), ("sal-para-conversa-sem-graca", 4)]


@pytest.mark.parametrize(
    "digitado",
    [
        pytest.param("FICCAO10", id="valido"),
        pytest.param("ficcao10", id="minusculo"),
        pytest.param("  FICCAO10  ", id="com-espacos"),
    ],
)
def test_cupom_valido_da_10_por_cento(loja: Loja, com_sacola, digitado: str):
    # Dado uma sacola de R$ 149,00
    com_sacola(("relogio-que-atrasa-de-proposito", 1))
    loja.sacola.abrir()

    # Quando o cliente aplica o cupom
    loja.sacola.aplicar_cupom(digitado)

    # Então ganha 10% de desconto
    expect(loja.sacola.cupom_ativo).to_contain_text("FICCAO10")
    expect(loja.sacola.desconto).to_have_text(f"− {brl(14.90)}")
    expect(loja.sacola.total).to_have_text(brl(134.10))


@pytest.mark.parametrize(
    ("digitado", "mensagem"),
    [
        pytest.param("NAOEXISTE", "O cupom NAOEXISTE não existe.", id="inexistente"),
        pytest.param("VERAO2020", "O cupom VERAO2020 expirou.", id="expirado"),
        pytest.param("", "Digite um cupom.", id="vazio"),
    ],
)
def test_cupom_invalido_e_recusado_com_motivo(loja: Loja, com_sacola, digitado: str, mensagem: str):
    com_sacola(("relogio-que-atrasa-de-proposito", 1))
    loja.sacola.abrir()

    loja.sacola.aplicar_cupom(digitado)

    expect(loja.sacola.alertas).to_have_text(mensagem)
    expect(loja.sacola.desconto).to_have_count(0)
    expect(loja.sacola.total).to_have_text(brl(149.00))


def test_primeiracompra_recusado_abaixo_de_100_reais(loja: Loja, com_sacola):
    com_sacola(*ABAIXO_DE_100)
    loja.sacola.abrir()

    loja.sacola.aplicar_cupom("PRIMEIRACOMPRA")

    expect(loja.sacola.alertas).to_have_text("O cupom PRIMEIRACOMPRA vale para compras a partir de R$ 100,00.")


def test_primeiracompra_aceito_com_exatamente_100_reais(loja: Loja, com_sacola):
    com_sacola(*EXATAMENTE_100)
    loja.sacola.abrir()
    expect(loja.sacola.subtotal).to_have_text("R$ 100,00")

    loja.sacola.aplicar_cupom("PRIMEIRACOMPRA")

    expect(loja.sacola.desconto).to_have_text(f"− {brl(25.00)}")
    expect(loja.sacola.total).to_have_text(brl(75.00))


def test_cupom_deixa_de_valer_se_o_subtotal_cair_abaixo_do_minimo(loja: Loja, com_sacola):
    # Dado o PRIMEIRACOMPRA aplicado numa sacola de R$ 100,00
    com_sacola(*EXATAMENTE_100)
    loja.sacola.abrir()
    loja.sacola.aplicar_cupom("PRIMEIRACOMPRA")
    expect(loja.sacola.desconto).to_be_visible()

    # Quando o cliente tira um sal (subtotal vai para R$ 84,50)
    loja.sacola.alterar_quantidade("Sal para Conversa sem Graça", 3)

    # Então o desconto some e a loja explica o porquê
    expect(loja.sacola.desconto).to_have_count(0)
    expect(loja.sacola.cupom_ativo).to_contain_text("só vale a partir de R$ 100,00")


def test_cupom_fretegratis_zera_o_frete_a_partir_de_150(loja: Loja, com_sacola):
    # Régua x3 + Borracha x7 = R$ 150,00
    com_sacola(("regua-de-medir-paciencia", 3), ("borracha-de-arrependimentos-leves", 7))
    loja.sacola.abrir()
    loja.sacola.calcular_frete("01310-100")
    expect(loja.sacola.frete).to_have_text(brl(18.90))

    loja.sacola.aplicar_cupom("FRETEGRATIS")

    expect(loja.sacola.frete).to_have_text("Grátis")
    expect(loja.sacola.total).to_have_text("R$ 150,00")


def test_so_um_cupom_por_compra(loja: Loja, com_sacola):
    com_sacola(("relogio-que-atrasa-de-proposito", 1))
    loja.sacola.abrir()
    loja.sacola.aplicar_cupom("FICCAO10")

    expect(loja.sacola.cupom).to_have_count(0)
    loja.sacola.remover_cupom.click()
    expect(loja.sacola.cupom).to_be_visible()
    expect(loja.sacola.desconto).to_have_count(0)

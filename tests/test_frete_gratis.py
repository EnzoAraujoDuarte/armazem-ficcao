"""
REGRA DE NEGÓCIO: pedidos a partir de R$ 300,00 têm frete grátis.

Técnica usada: ANÁLISE DE VALOR-LIMITE.
Os erros costumam morar na fronteira (um ">" no lugar de ">="), então testamos
exatamente nela e logo ao lado dela:

    R$ 299,90  ->  paga frete      (dez centavos abaixo do limite)
    R$ 300,00  ->  frete grátis    (exatamente no limite)
    R$ 389,00  ->  frete grátis    (bem acima do limite)

O CEP usado é de Colatina (ES), onde o frete normal custa R$ 12,90.
"""

import pytest
from playwright.sync_api import expect

from tests.dados import brl
from tests.pages.loja import Loja

CEP_COLATINA = "29700-000"
FRETE_ES = 12.90


@pytest.mark.smoke
@pytest.mark.parametrize(
    ("itens", "subtotal", "frete_esperado"),
    [
        pytest.param(
            [("caneca-de-esfriar-na-hora-certa", 1), ("bule-de-cha-de-cadeira", 2)],
            299.90,
            brl(FRETE_ES),
            id="R$299,90-abaixo-do-limite-paga-frete",
        ),
        pytest.param(
            [("pote-de-vento-encanado", 4), ("tesoura-de-cortar-assunto", 5)],
            300.00,
            "Grátis",
            id="R$300,00-no-limite-frete-gratis",
        ),
        pytest.param(
            [("cadeira-de-esperar-sentado", 1)],
            389.00,
            "Grátis",
            id="R$389,00-acima-do-limite-frete-gratis",
        ),
    ],
)
def test_frete_gratis_a_partir_de_300_reais(loja: Loja, com_sacola, itens, subtotal, frete_esperado):
    # Dado uma sacola com este subtotal
    com_sacola(*itens)
    loja.sacola.abrir()
    expect(loja.sacola.subtotal).to_have_text(brl(subtotal))

    # Quando o cliente calcula o frete para Colatina
    loja.sacola.calcular_frete(CEP_COLATINA)

    # Então o frete é cobrado ou sai de graça, conforme o limite
    expect(loja.sacola.frete).to_have_text(frete_esperado)
    frete = 0 if frete_esperado == "Grátis" else FRETE_ES
    expect(loja.sacola.total).to_have_text(brl(subtotal + frete))


def test_sacola_avisa_quanto_falta_para_o_frete_gratis(loja: Loja, com_sacola):
    # Dado uma sacola de R$ 299,90
    com_sacola(("caneca-de-esfriar-na-hora-certa", 1), ("bule-de-cha-de-cadeira", 2))

    # Quando o cliente abre a sacola
    loja.sacola.abrir()

    # Então a loja avisa que faltam só R$ 0,10
    expect(loja.sacola.falta_frete_gratis).to_have_text("Faltam R$ 0,10 para o frete grátis.")


def test_aumentar_a_quantidade_libera_o_frete_gratis(loja: Loja, com_sacola):
    # Dado 3 potes (R$ 82,50) + 5 tesouras (R$ 190,00) = R$ 272,50, com frete calculado
    com_sacola(("pote-de-vento-encanado", 3), ("tesoura-de-cortar-assunto", 5))
    loja.sacola.abrir()
    loja.sacola.calcular_frete(CEP_COLATINA)
    expect(loja.sacola.frete).to_have_text(brl(FRETE_ES))

    # Quando ele leva mais um pote e o subtotal chega a R$ 300,00
    loja.sacola.alterar_quantidade("Pote de Vento Encanado", 4)

    # Então o frete passa a ser grátis na hora, sem recalcular
    expect(loja.sacola.subtotal).to_have_text("R$ 300,00")
    expect(loja.sacola.frete).to_have_text("Grátis")
    expect(loja.sacola.frete_gratis_garantido).to_be_visible()


def test_regra_do_frete_gratis_aparece_na_vitrine(loja: Loja):
    # Quando o cliente abre a loja, então a regra está escrita para ele ver
    loja.vitrine.abrir()
    expect(loja.page.get_by_text("Frete grátis a partir de R$ 300,00")).to_be_visible()

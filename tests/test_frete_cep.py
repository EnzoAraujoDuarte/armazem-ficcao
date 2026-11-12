"""
Cálculo de frete por CEP.

Técnica usada: PARTIÇÃO DE EQUIVALÊNCIA. CEPs válidos são divididos por região (cada
região é uma classe com preço e prazo próprios) e CEPs inválidos por tipo de erro.
"""

import pytest
from playwright.sync_api import expect

from tests.dados import brl
from tests.pages.loja import Loja


@pytest.mark.parametrize(
    ("cep", "regiao", "valor", "prazo"),
    [
        ("29700-000", "Espírito Santo", 12.90, 2),
        ("20040-020", "Rio de Janeiro", 16.90, 3),
        ("01310-100", "São Paulo", 18.90, 3),
        ("30130-010", "Minas Gerais", 17.90, 4),
        ("40010-000", "Nordeste", 24.90, 6),
        ("69005-000", "Norte e Ceará", 32.90, 9),
        ("70040-010", "Centro-Oeste", 22.90, 5),
        ("80010-000", "Sul", 21.90, 5),
        ("29700000", "Espírito Santo", 12.90, 2),
    ],
    ids=["ES", "RJ", "SP", "MG", "Nordeste", "Norte", "Centro-Oeste", "Sul", "ES-sem-hifen"],
)
def test_frete_por_regiao(loja: Loja, com_sacola, cep, regiao, valor, prazo):
    com_sacola(("relogio-que-atrasa-de-proposito", 1))
    loja.sacola.abrir()

    loja.sacola.calcular_frete(cep)

    expect(loja.sacola.cotacao).to_have_text(f"{regiao}: {brl(valor)}, entrega em {prazo} dias úteis.")
    expect(loja.sacola.frete).to_have_text(brl(valor))
    expect(loja.sacola.total).to_have_text(brl(149.00 + valor))


@pytest.mark.parametrize(
    ("cep", "mensagem"),
    [
        pytest.param("2970000", "O CEP precisa ter 8 dígitos.", id="7-digitos"),
        pytest.param("", "O CEP precisa ter 8 dígitos.", id="vazio"),
        pytest.param("2970A-000", "O CEP só pode ter números.", id="com-letra"),
        pytest.param("00000-000", "Esse CEP não existe.", id="so-zeros"),
    ],
)
def test_cep_invalido_mostra_erro(loja: Loja, com_sacola, cep: str, mensagem: str):
    com_sacola(("relogio-que-atrasa-de-proposito", 1))
    loja.sacola.abrir()

    loja.sacola.calcular_frete(cep)

    expect(loja.sacola.alertas).to_have_text(mensagem)
    expect(loja.sacola.cep).to_have_attribute("aria-invalid", "true")
    expect(loja.sacola.frete).to_have_text("Informe o CEP")

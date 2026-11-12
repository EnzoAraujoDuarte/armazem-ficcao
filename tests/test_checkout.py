"""Fechamento do pedido: o fluxo completo de compra e as validações de endereço e cartão."""

import re
from datetime import date

import pytest
from playwright.sync_api import expect

from tests.dados import CARTAO_APROVADO, CARTAO_RECUSADO, USUARIO_DEMO, brl
from tests.pages.loja import Loja


@pytest.mark.smoke
def test_compra_completa_do_produto_ate_o_pedido_pago(loja: Loja):
    """O caminho inteiro de um cliente, só pela interface, do jeito que ele faria."""
    # Dado um cliente que escolhe um produto na vitrine
    loja.vitrine.abrir()
    loja.vitrine.comprar("Gaveta para Guardar Silêncio")

    # E calcula o frete na sacola
    loja.sacola.abrir()
    loja.sacola.calcular_frete("29700-000")
    expect(loja.sacola.total).to_have_text(brl(219.00 + 12.90))

    # Quando fecha o pedido, a loja pede login e depois volta para o checkout
    loja.sacola.fechar_pedido.click()
    expect(loja.page).to_have_url(re.compile(r"/entrar\?volta=%2Ffinalizar$"))
    loja.login.entrar(USUARIO_DEMO["email"], USUARIO_DEMO["senha"])
    expect(loja.checkout.titulo_etapa).to_have_text("Entrega")

    # E preenche endereço e cartão
    loja.checkout.preencher_endereco()
    expect(loja.checkout.titulo_etapa).to_have_text("Pagamento")
    loja.checkout.preencher_cartao(CARTAO_APROVADO, parcelas=2)
    expect(loja.checkout.resumo_pagamento).to_have_text("Cartão Visa final 1111, em 2x sem juros")

    # E confirma
    loja.checkout.confirmar.click()
    expect(loja.checkout.processando).to_be_disabled()

    # Então o pedido é registrado, pago e carimbado
    expect(loja.pedido.titulo).to_have_text(re.compile(r"^Pedido AF-\d{6}$"))
    numero = loja.pedido.titulo.inner_text().removeprefix("Pedido ")
    expect(loja.pedido.carimbo).to_have_text("Pago")
    expect(loja.pedido.total).to_have_text(brl(231.90))
    expect(loja.cabecalho.contador).to_have_text("0")

    # E aparece em "Meus pedidos"
    loja.page.get_by_role("link", name="Ver meus pedidos").click()
    linha = loja.page.get_by_role("row", name=re.compile(numero))
    expect(linha).to_contain_text("Pago")
    expect(linha).to_contain_text(brl(231.90))


def test_cartao_recusado_mantem_o_cliente_na_conferencia(loja: Loja, logado, com_sacola):
    com_sacola(("mapa-de-lugares-esquecidos", 1))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco()
    loja.checkout.preencher_cartao(CARTAO_RECUSADO)

    loja.checkout.confirmar.click()

    expect(loja.checkout.alerta).to_have_text(re.compile("Pagamento recusado pela operadora"))
    expect(loja.checkout.titulo_etapa).to_have_text("Conferência")
    expect(loja.cabecalho.contador).to_have_text("1")


def _mes_passado() -> str:
    hoje = date.today()
    mes, ano = (12, hoje.year - 1) if hoje.month == 1 else (hoje.month - 1, hoje.year)
    return f"{mes:02d}/{ano % 100:02d}"


def _mes_atual() -> str:
    hoje = date.today()
    return f"{hoje.month:02d}/{hoje.year % 100:02d}"


@pytest.mark.parametrize(
    ("campo", "valores", "mensagem"),
    [
        pytest.param("Número do cartão", {"numero": "4111 1111 1111 1112"}, "Número de cartão inválido.", id="luhn-invalido"),
        pytest.param("Número do cartão", {"numero": "4111 1111 111"}, "Número de cartão inválido.", id="numero-curto"),
        pytest.param("Nome impresso no cartão", {"nome": "Maria"}, "Digite o nome como está no cartão.", id="nome-sem-sobrenome"),
        pytest.param("Validade (MM/AA)", {"validade": _mes_passado()}, "Cartão vencido.", id="vencido-mes-passado"),
        pytest.param("Validade (MM/AA)", {"validade": "13/30"}, "Mês inválido.", id="mes-13"),
        pytest.param("CVV", {"cvv": "12"}, "O CVV tem 3 dígitos.", id="cvv-curto"),
        pytest.param("CVV", {"numero": "3782 822463 10005", "cvv": "123"}, "O CVV tem 4 dígitos.", id="amex-pede-4-digitos"),
    ],
)
def test_validacao_do_cartao(loja: Loja, logado, com_sacola, campo, valores, mensagem):
    com_sacola(("mapa-de-lugares-esquecidos", 1))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco()

    dados = {"numero": CARTAO_APROVADO, "nome": "Maria da Feira", "validade": "12/30", "cvv": "123"} | valores
    loja.checkout.preencher_cartao(**dados)

    expect(loja.checkout.titulo_etapa).to_have_text("Pagamento")
    entrada = loja.page.get_by_label(campo, exact=True)
    expect(entrada).to_have_attribute("aria-invalid", "true")
    expect(entrada).to_have_accessible_description(mensagem)


def test_cartao_que_vence_este_mes_ainda_vale(loja: Loja, logado, com_sacola):
    com_sacola(("mapa-de-lugares-esquecidos", 1))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco()
    loja.checkout.preencher_cartao(CARTAO_APROVADO, validade=_mes_atual())
    expect(loja.checkout.titulo_etapa).to_have_text("Conferência")


@pytest.mark.parametrize(
    ("item", "parcelas_esperadas"),
    [
        pytest.param(
            "peixe-para-aquario-imaginario",
            ["À vista, R$ 22,80"],
            id="total-R$22,80-so-a-vista",
        ),
        pytest.param(
            "caneca-de-esfriar-na-hora-certa",
            ["À vista, R$ 72,80", "2x de R$ 36,40 sem juros", "3x de R$ 24,27 sem juros"],
            id="total-R$72,80-ate-3x",
        ),
        pytest.param(
            "cadeira-de-esperar-sentado",
            [
                "À vista, R$ 389,00",
                "2x de R$ 194,50 sem juros",
                "3x de R$ 129,67 sem juros",
                "4x de R$ 97,25 sem juros",
                "5x de R$ 77,80 sem juros",
                "6x de R$ 64,83 sem juros",
            ],
            id="total-R$389,00-ate-6x",
        ),
    ],
)
def test_parcela_minima_de_20_reais(loja: Loja, logado, com_sacola, item, parcelas_esperadas):
    """Até 6x sem juros, mas cada parcela tem que ser de pelo menos R$ 20,00.
    O total já inclui o frete para Colatina (R$ 12,90); a cadeira tem frete grátis."""
    # Dado um produto na sacola e o endereço preenchido
    com_sacola((item, 1))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco()

    # Então só aparecem as parcelas de R$ 20,00 ou mais
    expect(loja.checkout.parcelas.locator("option")).to_have_text(parcelas_esperadas)


@pytest.mark.parametrize(("metodo", "carimbo"), [("Pix", "Aguardando pagamento"), ("Boleto", "Aguardando pagamento")])
def test_pix_e_boleto_ficam_aguardando_pagamento(loja: Loja, logado, com_sacola, metodo, carimbo):
    com_sacola(("chave-de-portas-que-nao-existem", 2))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco()

    loja.checkout.escolher_metodo(metodo)
    loja.checkout.revisar.click()
    loja.checkout.confirmar.click()

    expect(loja.pedido.carimbo).to_have_text(carimbo)
    if metodo == "Pix":
        expect(loja.pedido.pix).to_have_value(re.compile(r"^00020126ARMAZEMFICCAOAF\d{6}"))


@pytest.mark.parametrize(
    ("campo", "valores", "mensagem"),
    [
        pytest.param("CEP", {"cep": "2970"}, "O CEP precisa ter 8 dígitos.", id="cep-curto"),
        pytest.param("CEP", {"cep": "00000-000"}, "Esse CEP não existe.", id="cep-inexistente"),
        pytest.param("Número", {"numero": "abc"}, "Digite o número (ou s/n).", id="numero-invalido"),
        pytest.param("Rua", {"rua": ""}, "Digite a rua.", id="rua-vazia"),
        pytest.param("Estado", {"uf": ""}, "Escolha o estado.", id="sem-estado"),
    ],
)
def test_validacao_do_endereco(loja: Loja, logado, com_sacola, campo, valores, mensagem):
    com_sacola(("mapa-de-lugares-esquecidos", 1))
    loja.checkout.abrir()

    loja.checkout.preencher_endereco(**valores)

    expect(loja.checkout.titulo_etapa).to_have_text("Entrega")
    entrada = loja.page.get_by_label(campo, exact=True)
    expect(entrada).to_have_attribute("aria-invalid", "true")
    expect(entrada).to_have_accessible_description(mensagem)


def test_numero_s_n_e_aceito(loja: Loja, logado, com_sacola):
    com_sacola(("mapa-de-lugares-esquecidos", 1))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco(numero="s/n")
    expect(loja.checkout.titulo_etapa).to_have_text("Pagamento")


def test_checkout_com_sacola_vazia_volta_para_a_sacola(loja: Loja, logado):
    loja.checkout.abrir()
    expect(loja.page).to_have_url(re.compile(r"/sacola$"))
    expect(loja.sacola.vazia).to_be_visible()


def test_pedido_de_outra_conta_nao_aparece(loja: Loja, com_sacola, logado):
    # Dado um pedido feito pela conta de demonstração
    com_sacola(("mapa-de-lugares-esquecidos", 1))
    loja.checkout.abrir()
    loja.checkout.preencher_endereco()
    loja.checkout.preencher_cartao(CARTAO_APROVADO)
    loja.checkout.confirmar.click()
    expect(loja.pedido.carimbo).to_have_text("Pago")
    url_do_pedido = loja.page.url

    # Quando outra pessoa entra com outra conta e tenta abrir o mesmo endereço
    loja.cabecalho.sair.click()
    loja.cadastro.abrir()
    loja.cadastro.cadastrar("Outra Pessoa", "outra@exemplo.test", "segredo123")
    loja.page.goto(url_do_pedido)

    # Então não vê o pedido
    expect(loja.page.get_by_text("Não achamos esse pedido na sua conta.")).to_be_visible()

"""Login, cadastro, bloqueio por tentativas e proteção de rotas."""

import re

import pytest
from playwright.sync_api import expect

from tests.dados import USUARIO_DEMO
from tests.pages.loja import Loja


@pytest.mark.smoke
def test_login_com_a_conta_de_demonstracao(loja: Loja):
    loja.login.abrir()

    loja.login.entrar(USUARIO_DEMO["email"], USUARIO_DEMO["senha"])

    expect(loja.page).to_have_url(re.compile(r"/armazem-ficcao/?$"))
    expect(loja.cabecalho.saudacao).to_have_text("Olá, Cliente")
    expect(loja.cabecalho.meus_pedidos).to_be_visible()


@pytest.mark.parametrize(
    ("email", "senha", "mensagem"),
    [
        pytest.param(USUARIO_DEMO["email"], "senhaerrada1", "E-mail ou senha incorretos. Restam 2 tentativas.", id="senha-errada"),
        pytest.param("ninguem@armazem.test", "qualquer123", "E-mail ou senha incorretos. Restam 2 tentativas.", id="email-desconhecido"),
        pytest.param("", "", "Preencha e-mail e senha.", id="campos-vazios"),
    ],
)
def test_login_invalido_mostra_erro(loja: Loja, email: str, senha: str, mensagem: str):
    loja.login.abrir()
    loja.login.entrar(email, senha)
    expect(loja.login.erro).to_have_text(mensagem)
    expect(loja.cabecalho.entrar).to_be_visible()


def test_conta_bloqueia_apos_3_erros_e_libera_depois_de_30_segundos(loja: Loja):
    # O relógio do navegador é controlado pelo teste, então não precisamos esperar 30 s de verdade.
    loja.page.clock.install()
    loja.login.abrir()

    # Dado 3 tentativas com a senha errada
    loja.login.entrar(USUARIO_DEMO["email"], "errada-1")
    expect(loja.login.erro).to_have_text("E-mail ou senha incorretos. Restam 2 tentativas.")
    loja.login.entrar(USUARIO_DEMO["email"], "errada-2")
    expect(loja.login.erro).to_have_text("E-mail ou senha incorretos. Resta 1 tentativa.")
    loja.login.entrar(USUARIO_DEMO["email"], "errada-3")

    # Então a conta fica bloqueada e o botão desabilita
    expect(loja.login.bloqueio).to_contain_text("Tente de novo em 30 s")
    expect(loja.login.botao).to_be_disabled()

    # Quando passam 31 segundos
    loja.page.clock.fast_forward("00:31")

    # Então o cliente consegue entrar com a senha certa
    expect(loja.login.botao).to_be_enabled()
    loja.login.entrar(USUARIO_DEMO["email"], USUARIO_DEMO["senha"])
    expect(loja.cabecalho.saudacao).to_have_text("Olá, Cliente")


def test_sair_encerra_a_sessao(loja: Loja, logado):
    loja.cabecalho.sair.click()
    expect(loja.cabecalho.entrar).to_be_visible()
    loja.page.goto("pedidos")
    expect(loja.page).to_have_url(re.compile(r"/entrar\?volta="))


def test_cadastro_cria_a_conta_e_ja_entra(loja: Loja):
    loja.cadastro.abrir()
    loja.cadastro.cadastrar("Joana Teste", "joana@exemplo.test", "segredo123")

    expect(loja.cabecalho.saudacao).to_have_text("Olá, Joana")

    # E a conta nova funciona no login depois de sair
    loja.cabecalho.sair.click()
    loja.login.abrir()
    loja.login.entrar("joana@exemplo.test", "segredo123")
    expect(loja.cabecalho.saudacao).to_have_text("Olá, Joana")


@pytest.mark.parametrize(
    ("nome", "email", "senha", "confirmacao", "campo", "mensagem"),
    [
        pytest.param("Jo", "jo@ex.test", "segredo123", None, "Nome", "Digite seu nome (mínimo 3 letras).", id="nome-curto"),
        pytest.param("Joana", "joana@", "segredo123", None, "E-mail", "Digite um e-mail válido.", id="email-invalido"),
        pytest.param("Joana", "joana@ex.test", "abc12", None, "Senha", "A senha precisa ter pelo menos 8 caracteres.", id="senha-curta"),
        pytest.param("Joana", "joana@ex.test", "somenteletras", None, "Senha", "Use letras e números na senha.", id="senha-sem-numero"),
        pytest.param("Joana", "joana@ex.test", "segredo123", "segredo124", "Confirmar senha", "As senhas não são iguais.", id="confirmacao-diferente"),
        pytest.param("Joana", USUARIO_DEMO["email"], "segredo123", None, "E-mail", "Já existe uma conta com esse e-mail.", id="email-ja-usado"),
    ],
)
def test_cadastro_invalido_aponta_o_campo_com_erro(loja: Loja, nome, email, senha, confirmacao, campo, mensagem):
    loja.cadastro.abrir()
    loja.cadastro.cadastrar(nome, email, senha, confirmacao)

    entrada = loja.page.get_by_label(campo, exact=True)
    expect(entrada).to_have_attribute("aria-invalid", "true")
    expect(entrada).to_have_accessible_description(mensagem)
    expect(loja.cabecalho.entrar).to_be_visible()


def test_pagina_protegida_pede_login_e_volta_para_ela(loja: Loja):
    # Quando um visitante sem login tenta abrir "Meus pedidos"
    loja.page.goto("pedidos")

    # Então vai para o login, que lembra para onde voltar
    expect(loja.page).to_have_url(re.compile(r"/entrar\?volta=%2Fpedidos$"))
    loja.login.entrar(USUARIO_DEMO["email"], USUARIO_DEMO["senha"])
    expect(loja.page).to_have_url(re.compile(r"/pedidos$"))
    expect(loja.page.get_by_role("heading", name="Meus pedidos")).to_be_visible()


@pytest.mark.parametrize("destino", ["https://site-malicioso.test", "//site-malicioso.test"])
def test_login_nao_redireciona_para_outro_site(loja: Loja, destino: str):
    # Segurança: o parâmetro "volta" não pode levar o usuário para fora da loja (open redirect).
    loja.login.abrir(f"?volta={destino}")
    loja.login.entrar(USUARIO_DEMO["email"], USUARIO_DEMO["senha"])
    expect(loja.page).to_have_url(re.compile(r"/armazem-ficcao/?$"))
    assert "site-malicioso" not in loja.page.url

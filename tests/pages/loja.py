"""Page Objects: cada classe esconde os seletores de uma tela e expõe ações do negócio.
Os seletores usam papéis e nomes acessíveis (get_by_role/get_by_label), os mesmos que um
leitor de tela usa, então um teste que passa também confirma que a tela é acessível."""

import re

from playwright.sync_api import Locator, Page, expect


class Cabecalho:
    def __init__(self, page: Page):
        self.page = page
        self.sacola = page.get_by_role("link", name=re.compile(r"^Sacola, \d+ ite"))
        self.contador = page.get_by_test_id("contador-sacola")
        self.saudacao = page.locator(".letreiro-usuario")
        self.entrar = page.get_by_role("navigation", name="Principal").get_by_role("link", name="Entrar")
        self.sair = page.get_by_role("button", name="Sair")
        self.meus_pedidos = page.get_by_role("link", name="Meus pedidos")

    def quantidade_na_sacola(self) -> int:
        return int(self.contador.inner_text())


class Aviso:
    def __init__(self, page: Page):
        self.regiao = page.get_by_role("status").filter(has=page.locator(".aviso"))
        self.texto = page.locator(".aviso p")
        self.ver_sacola = page.locator(".aviso").get_by_role("link", name="Ver sacola")


class Vitrine:
    def __init__(self, page: Page):
        self.page = page
        self.titulo = page.get_by_role("heading", level=1)
        self.folhetos = page.get_by_test_id("folheto")
        self.aviso_ficticio = page.get_by_text("Loja fictícia para fins de estudo")
        self.ver_todos = page.get_by_role("link", name="Ver os 20 folhetos")

    def abrir(self):
        self.page.goto("./")

    def comprar(self, nome: str):
        self.page.get_by_role("button", name=f"Comprar {nome}").click()


class Catalogo:
    def __init__(self, page: Page):
        self.page = page
        self.folhetos = page.get_by_test_id("folheto")
        self.contagem = page.locator("#contagem")
        self.busca = page.get_by_role("searchbox", name="Buscar folheto")
        self.botao_buscar = page.get_by_role("button", name="Buscar", exact=True)
        self.ordem = page.get_by_label("Ordenar por")
        self.so_disponiveis = page.get_by_label("Só o que tem em estoque")
        self.vazio = page.get_by_role("heading", name="Nenhum folheto no barbante.")
        self.limpar = page.get_by_role("button", name="Limpar filtros")
        self.paginacao = page.get_by_role("navigation", name="Paginação")

    def abrir(self, query: str = ""):
        self.page.goto(f"folhetos{query}")
        expect(self.contagem).to_be_visible()

    def buscar(self, termo: str):
        self.busca.fill(termo)
        self.botao_buscar.click()

    def filtrar_categoria(self, nome: str):
        self.page.get_by_role("radio", name=nome, exact=True).check()

    def ordenar(self, rotulo: str):
        self.ordem.select_option(label=rotulo)

    def ir_para_pagina(self, numero: int):
        self.paginacao.get_by_role("button", name=f"Página {numero}").click()

    def nomes(self) -> list[str]:
        return self.folhetos.locator(".folheto-titulo").all_inner_texts()

    def precos(self) -> list[float]:
        textos = self.folhetos.get_by_test_id("preco").all_inner_texts()
        return [float(re.sub(r"[^\d,]", "", t).replace(",", ".")) for t in textos]


class Produto:
    def __init__(self, page: Page):
        self.page = page
        self.titulo = page.get_by_role("heading", level=1)
        self.preco = page.get_by_test_id("preco-produto")
        self.estoque = page.get_by_test_id("estoque")
        self.quantidade = page.get_by_role("spinbutton", name="Quantidade")
        self.mais = page.get_by_role("button", name="Aumentar quantidade")
        self.menos = page.get_by_role("button", name="Diminuir quantidade")
        self.adicionar = page.get_by_role("button", name="Adicionar à sacola")
        self.esgotado = page.get_by_text("Esgotado. Não dá para comprar")
        self.limite_atingido = page.get_by_text("Você já tem o máximo permitido")
        self.procedencia = page.get_by_role("definition")

    def abrir(self, slug: str):
        self.page.goto(f"folheto/{slug}")

    def escolher_opcao(self, rotulo: str):
        self.page.get_by_role("radio", name=re.compile(rf"^{re.escape(rotulo)}")).check()

    def definir_quantidade(self, quantidade: int):
        self.quantidade.fill(str(quantidade))


class Sacola:
    def __init__(self, page: Page):
        self.page = page
        self.linhas = page.get_by_test_id("linha-sacola")
        self.vazia = page.get_by_role("heading", name="Sua sacola está vazia")
        self.subtotal = page.get_by_test_id("subtotal")
        self.desconto = page.get_by_test_id("desconto")
        self.frete = page.get_by_test_id("frete")
        self.total = page.get_by_test_id("total")
        self.falta_frete_gratis = page.get_by_test_id("falta-frete-gratis")
        self.frete_gratis_garantido = page.get_by_text("Frete grátis garantido.")
        self.cep = page.get_by_label("Calcular frete")
        self.calcular = page.get_by_role("button", name="Calcular")
        self.cotacao = page.get_by_test_id("cotacao-frete")
        self.cupom = page.get_by_label("Cupom de desconto")
        self.aplicar = page.get_by_role("button", name="Aplicar")
        self.cupom_ativo = page.get_by_test_id("cupom-ativo")
        self.remover_cupom = page.get_by_role("button", name="Remover cupom")
        self.esvaziar = page.get_by_role("button", name="Esvaziar sacola")
        self.fechar_pedido = page.get_by_role("button", name="Fechar pedido")
        self.alertas = page.get_by_role("alert")

    def abrir(self):
        self.page.goto("sacola")

    def linha(self, nome: str) -> Locator:
        return self.linhas.filter(has=self.page.get_by_role("heading", name=nome))

    def alterar_quantidade(self, nome: str, quantidade: int):
        self.linha(nome).get_by_role("spinbutton", name="Quantidade").fill(str(quantidade))

    def remover(self, nome: str):
        self.page.get_by_role("button", name=f"Remover {nome} da sacola").click()

    def calcular_frete(self, cep: str):
        self.cep.fill(cep)
        self.calcular.click()

    def aplicar_cupom(self, codigo: str):
        self.cupom.fill(codigo)
        self.aplicar.click()


class Login:
    def __init__(self, page: Page):
        self.page = page
        self.email = page.get_by_label("E-mail")
        self.senha = page.get_by_label("Senha")
        self.botao = page.get_by_role("main").get_by_role("button", name="Entrar")
        self.erro = page.get_by_role("alert")
        self.bloqueio = page.get_by_test_id("bloqueio")

    def abrir(self, query: str = ""):
        self.page.goto(f"entrar{query}")

    def entrar(self, email: str, senha: str):
        self.email.fill(email)
        self.senha.fill(senha)
        self.botao.click()


class Cadastro:
    def __init__(self, page: Page):
        self.page = page
        self.nome = page.get_by_label("Nome")
        self.email = page.get_by_label("E-mail")
        self.senha = page.get_by_label("Senha", exact=True)
        self.confirmacao = page.get_by_label("Confirmar senha")
        self.botao = page.get_by_role("button", name="Criar conta")

    def abrir(self):
        self.page.goto("cadastro")

    def cadastrar(self, nome: str, email: str, senha: str, confirmacao: str | None = None):
        self.nome.fill(nome)
        self.email.fill(email)
        self.senha.fill(senha)
        self.confirmacao.fill(senha if confirmacao is None else confirmacao)
        self.botao.click()


class Checkout:
    def __init__(self, page: Page):
        self.page = page
        self.titulo_etapa = page.get_by_role("heading", level=1)
        self.etapa_atual = page.locator(".etapa[aria-current='step']")
        self.cep = page.get_by_label("CEP")
        self.rua = page.get_by_label("Rua")
        self.numero = page.get_by_label("Número", exact=True)
        self.complemento = page.get_by_label("Complemento (opcional)")
        self.cidade = page.get_by_label("Cidade")
        self.uf = page.get_by_label("Estado")
        self.continuar = page.get_by_role("button", name="Continuar para pagamento")
        self.numero_cartao = page.get_by_label("Número do cartão")
        self.nome_cartao = page.get_by_label("Nome impresso no cartão")
        self.validade = page.get_by_label("Validade (MM/AA)")
        self.cvv = page.get_by_label("CVV")
        self.parcelas = page.get_by_label("Parcelas")
        self.revisar = page.get_by_role("button", name="Revisar pedido")
        self.confirmar = page.get_by_role("button", name=re.compile(r"^Confirmar pedido de"))
        self.processando = page.get_by_role("button", name="Processando pagamento…")
        self.alerta = page.get_by_role("alert")
        self.resumo_pagamento = page.get_by_test_id("resumo-pagamento")
        self.total = page.get_by_test_id("total")

    def abrir(self):
        self.page.goto("finalizar")

    def preencher_endereco(self, cep="29700-000", rua="Rua da Feira", numero="42", cidade="Colatina", uf="ES"):
        self.cep.fill(cep)
        self.rua.fill(rua)
        self.numero.fill(numero)
        self.cidade.fill(cidade)
        if uf:
            self.uf.select_option(uf)
        self.continuar.click()

    def escolher_metodo(self, rotulo: str):
        self.page.get_by_role("radio", name=rotulo).check()

    def preencher_cartao(self, numero: str, nome="Maria da Feira", validade="12/30", cvv="123", parcelas: int | None = None):
        self.numero_cartao.fill(numero)
        self.nome_cartao.fill(nome)
        self.validade.fill(validade)
        self.cvv.fill(cvv)
        if parcelas:
            self.parcelas.select_option(str(parcelas))
        self.revisar.click()

    def erro_do_campo(self, rotulo: str) -> Locator:
        campo = self.page.get_by_label(rotulo, exact=True)
        return self.page.locator(f"#{campo.get_attribute('aria-describedby').split()[0]}")


class Pedido:
    def __init__(self, page: Page):
        self.page = page
        self.titulo = page.get_by_role("heading", level=1)
        self.carimbo = page.get_by_test_id("carimbo")
        self.total = page.get_by_test_id("total-pedido")
        self.pix = page.get_by_label("Pix copia e cola")


class Loja:
    def __init__(self, page: Page):
        self.page = page
        self.cabecalho = Cabecalho(page)
        self.aviso = Aviso(page)
        self.vitrine = Vitrine(page)
        self.catalogo = Catalogo(page)
        self.produto = Produto(page)
        self.sacola = Sacola(page)
        self.login = Login(page)
        self.cadastro = Cadastro(page)
        self.checkout = Checkout(page)
        self.pedido = Pedido(page)

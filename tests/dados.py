"""Oráculo de teste: lê o mesmo catálogo que a loja publica e reimplementa, de forma
independente, as regras que os testes conferem (busca, preço, formatação em reais)."""

import json
import unicodedata
from pathlib import Path

CATALOGO = json.loads((Path(__file__).parent.parent / "public" / "api" / "produtos.json").read_text(encoding="utf-8"))
PRODUTOS = CATALOGO["produtos"]
CATEGORIAS = CATALOGO["categorias"]
POR_SLUG = {p["slug"]: p for p in PRODUTOS}

USUARIO_DEMO = {"nome": "Cliente Demonstração", "email": "demo@armazem.test", "senha": "ficcao123"}

CARTAO_APROVADO = "4111 1111 1111 1111"
CARTAO_RECUSADO = "4000 0000 0000 0002"

TAMANHO_PAGINA = 12
LIMITE_POR_ITEM = 10
FRETE_GRATIS_A_PARTIR = 300.00


def normalizar(texto: str) -> str:
    sem_acento = "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")
    return sem_acento.lower().strip()


def buscar(termo: str) -> list[dict]:
    t = normalizar(termo)
    return [p for p in PRODUTOS if t in normalizar(f"{p['nome']} {p['resumo']}")]


def brl(valor: float) -> str:
    """Formata como a loja: R$ 1.234,56."""
    inteiro, centavos = f"{valor:,.2f}".split(".")
    return f"R$ {inteiro.replace(',', '.')},{centavos}"


def preco(slug: str, opcao: str | None = None) -> float:
    produto = POR_SLUG[slug]
    acrescimo = 0
    if opcao and produto.get("opcoes"):
        acrescimo = next(v["acrescimo"] for v in produto["opcoes"]["valores"] if v["rotulo"] == opcao)
    return round(produto["preco"] + acrescimo, 2)


def linha_sacola(slug: str, quantidade: int, opcao: str | None = None) -> dict:
    """Uma linha no formato que a loja guarda no localStorage."""
    produto = POR_SLUG[slug]
    if opcao is None and produto.get("opcoes"):
        opcao = produto["opcoes"]["valores"][0]["rotulo"]
    return {
        "produtoId": produto["id"],
        "slug": slug,
        "nome": produto["nome"],
        "ilustracao": produto["ilustracao"],
        "opcao": opcao,
        "precoUnitario": preco(slug, opcao),
        "quantidade": quantidade,
        "estoque": produto["estoque"],
    }

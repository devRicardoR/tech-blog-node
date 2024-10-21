/*
Este arquivo define as rotas administrativas da aplicação usando o Express Router.
Funções principais:

- Renderiza páginas para visualizar, adicionar e editar categorias.
- Manipula dados de categorias, incluindo criação e edição, com validação de formulários.
- Conecta-se ao banco de dados MongoDB usando o Mongoose para interagir com o modelo `Categoria`.
- Usa Flash Messages para exibir mensagens de sucesso ou erro.

/*
Este arquivo define as rotas administrativas da aplicação usando o Express Router.
Funções principais:

- Renderiza páginas para visualizar, adicionar e editar categorias.
- Manipula dados de categorias, incluindo criação e edição, com validação de formulários.
- Conecta-se ao banco de dados MongoDB usando o Mongoose para interagir com o modelo `Categoria`.
- Usa Flash Messages para exibir mensagens de sucesso ou erro.

As principais rotas incluem:
- "/" para o painel principal.
- "/categorias" para listar categorias.
- "/categorias/add" para a página de criação de categoria.
- "/categorias/edit/:id" para edição de uma categoria específica.

Esse roteador é exportado para ser usado em outras partes da aplicação.
*/

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin");

// Rota principal do painel de admin
router.get("/", eAdmin, (req, res) => {
    res.render("admin/index", { eAdmin: req.user.eAdmin }); // Passando eAdmin
});

// Rota para listar categorias
router.get("/categorias", eAdmin, async (req, res) => {
    try {
        const categorias = await Categoria.find().lean().sort({ date: "desc" });
        res.render("admin/categorias", { categorias: categorias });
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao listar as categorias!");
        res.redirect("/admin");
    }
});

// Rota para adicionar nova categoria
router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias");
});

// Rota para processar a criação de nova categoria
router.post("/categorias/nova", eAdmin, async (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido." });
    }

    if (req.body.nome && req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno." });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido." });
    }

    if (erros.length > 0) {
        return res.render("admin/addcategorias", { erros: erros });
    }

    try {
        const slugExistente = await Categoria.findOne({ slug: req.body.slug });
        if (slugExistente) {
            req.flash("error_msg", "Já existe uma categoria com esse slug!");
            return res.redirect("/admin/categorias/add");
        }

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug,
        };

        await new Categoria(novaCategoria).save();
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!");
        res.redirect("/admin");
    }
});

// Rota para editar uma categoria específica
router.get("/categorias/edit/:id", eAdmin, async (req, res) => {
    try {
        const categoria = await Categoria.findOne({ _id: req.params.id }).lean();
        res.render("admin/editcategorias", { categoria: categoria });
    } catch (erro) {
        req.flash("error_msg", "Esta categoria não existe!");
        res.redirect("/admin/categorias");
    }
});

// Rota para processar a edição de uma categoria
router.post("/categorias/edit", eAdmin, async (req, res) => {
    try {
        const categoria = await Categoria.findOne({ _id: req.body.id });

        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        await categoria.save();
        req.flash("success_msg", "Categoria editada com sucesso!");
        res.redirect("/admin/categorias");
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao editar a categoria!");
        res.redirect("/admin/categorias");
    }
});

// Rota para deletar uma categoria
router.post("/categorias/deletar", eAdmin, async (req, res) => {
    try {
        await Categoria.deleteOne({ _id: req.body.id });
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao deletar a categoria");
        res.redirect("/admin/categorias");
    }
});

// Rota para visualizar postagens com categorias
router.get("/postagens", eAdmin, async (req, res) => {
    try {
        const postagens = await Postagem.find().populate("categoria").sort({ data: "desc" }).lean();
        res.render("admin/postagens", { postagens: postagens });
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/admin");
    }
});

// Rota para adicionar nova postagem com categorias
router.get("/postagens/add", eAdmin, async (req, res) => {
    try {
        const categorias = await Categoria.find().lean();
        res.render("admin/addpostagem", { categorias: categorias });
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao carregar o formulário!");
        res.redirect("/admin");
    }
});

// Processa a nova postagem
router.post("/postagens/nova", eAdmin, async (req, res) => {
    let erros = [];

    if (req.body.categoria == 0) {
        erros.push({ texto: "Categoria inválida, registre uma categoria" });
    }

    if (erros.length > 0) {
        return res.render("admin/addpostagem", { erros: erros });
    }

    try {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
        };

        await new Postagem(novaPostagem).save();
        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");
    } catch (erro) {
        req.flash("error_msg", "Houve um erro durante o salvamento da postagem");
        res.redirect("/admin/postagens");
    }
});

// Rota para carregar o formulário de edição de uma postagem
router.get("/postagens/edit/:id", eAdmin, async (req, res) => {
    try {
        const postagem = await Postagem.findOne({ _id: req.params.id }).lean();
        const categorias = await Categoria.find().lean();
        
        if (!postagem) {
            req.flash("error_msg", "Postagem não encontrada.");
            return res.redirect("/admin/postagens");
        }

        res.render("admin/editpostagens", { postagem: postagem, categorias: categorias });
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição.");
        res.redirect("/admin/postagens");
    }
});

// Rota para processar a edição de uma postagem
router.post("/postagens/edit", eAdmin, async (req, res) => {
    try {
        const postagem = await Postagem.findOne({ _id: req.body.id });

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        await postagem.save();
        req.flash("success_msg", "Postagem editada com sucesso!");
        res.redirect("/admin/postagens");
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao salvar a edição da postagem.");
        res.redirect("/admin/postagens");
    }
});

// Rota para deletar uma postagem
router.post("/postagens/deletar", eAdmin, async (req, res) => {
    try {
        await Postagem.deleteOne({ _id: req.body.id });
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    } catch (erro) {
        req.flash("error_msg", "Houve um erro ao deletar a postagem.");
        res.redirect("/admin/postagens");
    }
});

module.exports = router;
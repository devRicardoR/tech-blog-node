/*
Este arquivo configura e inicia o servidor Express para uma aplicação Node.js. 
Funções principais:

- Configura o servidor usando o Express, integrando o template engine Handlebars para renderização de views dinâmicas.
- Utiliza o Mongoose para conectar a um banco de dados MongoDB.
- Define middlewares, como o Body-Parser para manipulação de dados de formulários e o Flash para exibir mensagens temporárias entre redirecionamentos.
- Configura uma pasta pública para servir arquivos estáticos.
- Define algumas rotas, como uma rota principal e a inclusão de um módulo de rotas específico (`/admin`).
- Inicia o servidor na porta 8081.
*/

// Carregando os módulos
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const admin = require("./routes/admin"); // Importando o arquivo admin da pasta routes
const path = require("path"); // Carregando modelo que serve para manipular pastas
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);
const Handlebars = require("handlebars"); // Adicionando Handlebars para helpers
require('dotenv').config(); // Carregando variáveis de ambiente

// Configurações
// Body-parser e Sessões
app.use(session({
    secret: process.env.SESSION_SECRET || "defaultSecret", // Usando variável de ambiente para o secret
    resave: true,
    saveUninitialized: true
}));

// Configuração do Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash()); // Deve ser usado após as sessões

app.use(express.urlencoded({ extended: true })); // Substitui o body-parser
app.use(express.json());

// Middleware para mensagens flash e autenticação
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;

    // Verifica se o usuário está logado e se é admin
    if (req.user) {
        res.locals.eAdmin = req.user.eAdmin;
    } else {
        res.locals.eAdmin = null;
    }

    next();
});

// Registrando o helper 'ifEquals' no Handlebars
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Handlebars
app.engine("handlebars", engine({
    defaultLayout: "main",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
}));
app.set("view engine", "handlebars");

// Mongoose - Conexão com MongoDB
const dbURI = process.env.MONGO_URI || "mongodb://localhost/blogapp"; // Usando variável de ambiente para a URI
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado ao MongoDB.");
}).catch((erro) => {
    console.log("Erro ao conectar ao MongoDB: " + erro);
});

// Public - Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get("/", (req, res) => {
    Postagem.find()
        .populate("categoria")
        .sort({ data: "desc" })
        .lean()
        .then((postagens) => {
            res.render("index", { postagens: postagens });
        })
        .catch((erro) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/404");
        });
});

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug })
        .populate("categoria")
        .lean()
        .then((postagem) => {
            if (postagem) {
                res.render("postagem/index", { postagem: postagem });
            } else {
                req.flash("error_msg", "Esta postagem não existe");
                res.redirect("/");
            }
        })
        .catch((erro) => {
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        });
});

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", { categorias: categorias });
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias!");
        res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render("categorias/postagens", { postagens: postagens, categoria: categoria });
            }).catch((erro) => {
                req.flash("error_msg", "Houve um erro ao listar os posts!");
                res.redirect("/");
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe!");
            res.redirect("/");
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página da categoria!");
        res.redirect("/");
    });
});

app.get("/404", (req, res) => {
    res.send("Erro 404!");
});

// Adicionando as rotas
app.use("/admin", admin);
app.use("/usuarios", usuarios);

// Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

// Rota para renderizar a página de registro
router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

// Rota para processar o registro do usuário
router.post("/registro", (req, res) => {
    var erros = []

    // Verifica se o nome é válido
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 2) {
        erros.push({ texto: "Nome inválido! Deve ter pelo menos 2 caracteres." })
    }

    // Verifica se o e-mail é válido
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido!" })
    }

    // Verifica se a senha é válida
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida!" })
    }

    // Verifica se a senha tem pelo menos 4 caracteres
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta! Deve ter pelo menos 4 caracteres." })
    }

    // Verifica se as senhas digitadas conferem
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "Senhas não conferem, tente novamente." })
    }

    // Se houver erros, renderiza a página de registro com os erros
    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros })
    } else {
        // Verifica se já existe um usuário com o mesmo e-mail
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail cadastrada em nosso sistema")
                res.redirect("/usuarios/registro")
            } else {
                // Criação de um novo usuário
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                // Hash da senha
                bcrypt.genSalt(10, (erro, salt) => {
                    if (erro) {
                        req.flash("error_msg", "Erro ao gerar o salt para hash")
                        return res.redirect("/usuarios/registro")
                    }

                    // Fazendo o hash da senha
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            return res.redirect("/")
                        }

                        // Substitui a senha pela versão hash
                        novoUsuario.senha = hash

                        // Salva o novo usuário no banco de dados
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((erro) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/")
        })
    }
})

// Rota para renderizar a página de login
router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

// Rota para processar o login do usuário
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

// Rota para deslogar o usuário
router.get("/logout", (req, res) => {
    req.logout((erro) => {
        if (erro) {
            req.flash("error_msg", "Erro ao deslogar, tente novamente!")
            return res.redirect("/")
        }
        req.flash("success_msg", "Deslogado com sucesso!")
        res.redirect("/")
    })
})

module.exports = router
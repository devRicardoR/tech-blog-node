const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Model de usuário
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function(passport) {
    // Configurando a estratégia de autenticação
    passport.use(new localStrategy({
        usernameField: "email", 
        passwordField: "senha"
    }, (email, senha, done) => {
        // Verificações de campos
        if (!email || typeof email === 'undefined' || email === null || email.length === 0) {
            return done(null, false, { message: "E-mail inválido!" });
        }

        if (!senha || typeof senha === 'undefined' || senha === null || senha.length === 0) {
            return done(null, false, { message: "Senha inválida!" });
        }

        // Verificar se o usuário existe
        Usuario.findOne({ email: email }).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe!" });
            }

            // Comparar senha
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuario); // Senha correta
                } else {
                    return done(null, false, { message: "Senha incorreta!" }); // Senha errada
                }
            });

        }).catch(erro => done(erro)); // Caso haja algum erro ao buscar o usuário
    }));

    // Serializando o usuário para manter a sessão ativa
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id); // Salva o ID do usuário na sessão
    });

    // Desserializando o usuário para obter os dados completos a partir da sessão
    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id); // Usando async/await para buscar o usuário
            done(null, usuario); // Retorna o usuário a partir do ID
        } catch (err) {
            done(err);
        }
    });
}
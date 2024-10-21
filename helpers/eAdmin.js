module.exports = {
    eAdmin: function(req, res, next) {
        // Verifica se o usuário está autenticado e se ele é um administrador (eAdmin == 1)
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            // Se o usuário estiver autenticado e for administrador, permite continuar para a próxima função (next)
            return next();
        }

        // Caso o usuário não esteja autenticado ou não seja administrador, exibe uma mensagem de erro
        req.flash("error_msg", "Você precisa ser um Admin!");

        // Redireciona o usuário para a página principal
        res.redirect("/");
    }
}
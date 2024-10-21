const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Definindo o esquema (Schema) do usuário
const usuario = new Schema({
    nome: {
        type: String, // O campo 'nome' será do tipo String
        required: true // Este campo é obrigatório
    },
    email: {
        type: String,
        required: true 
    },
    eAdmin: {
        type: Number, 
        default: 0 
    },
    senha: {
        type: String,
        required: true 
    }
})

// Registrando o modelo 'usuarios' com o esquema 'usuario' no mongoose
mongoose.model("usuarios", usuario)
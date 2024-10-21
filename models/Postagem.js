// Este arquivo define o esquema do Mongoose para a coleção "Postagem" no MongoDB.
// O esquema contém os campos: título, slug, descrição, conteúdo, e a categoria associada à postagem.
// Cada postagem deve estar associada a uma categoria, representada por um ObjectId.
// O esquema também garante que os campos essenciais, como título, slug, descrição e conteúdo, sejam obrigatórios.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true 
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model("postagens", Postagem);
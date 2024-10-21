/*
Este arquivo define o modelo `Categoria` para o banco de dados MongoDB usando o Mongoose.

O esquema `Categoria` inclui os seguintes campos:
- `nome`: Um campo de texto obrigatório que armazena o nome da categoria.
- `slug`: Um campo de texto obrigatório que armazena uma versão amigável da URL da categoria.
- `date`: Armazena a data de criação da categoria, com valor padrão sendo a data e hora atual.
O modelo é exportado para que possa ser utilizado em outras partes da aplicação.
*/

const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now // Caso o usuario não passe nenhum valor ele recebe o valor passado na hora que o registro foi feito
    }

})

mongoose.model("categorias", Categoria)
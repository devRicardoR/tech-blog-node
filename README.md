tech-blog-node
Projeto de um blog desenvolvido com Node.js, Express, e Mongoose, de uma plataforma onde os usuários podem compartilhar e gerenciar postagens e categorias voltadas para o mundo da tecnologia. O projeto inclui funcionalidades de autenticação, sistema de CRUD completo, sessões, mensagens flash e divisão de acesso entre usuários e administradores.
Funcionalidades

- Cadastro de usuários com senhas protegidas utilizando hashing.
- Login e autenticação com sessões gerenciadas pelo Passport.js.
- Mensagens flash para feedback de ações (como erros e sucessos).
- CRUD completo (criação, leitura, atualização e exclusão) de postagens e categorias.
- Sistema de administração** com permissões diferentes para administradores e usuários.
- Utilização do Handlebars como template engine para renderizar as páginas.
- Conexão com o MongoDB utilizando Mongoose para armazenamento de dados.
- Sistema de categorias onde é possível classificar postagens por temas diversos ligados à tecnologia.

Tecnologias Utilizadas

- Node.js: Plataforma para desenvolvimento backend.
- Express: Framework para a construção do servidor e roteamento.
- Mongoose: ODM para MongoDB.
- Passport.js: Para autenticação de usuários.
  Handlebars: Template engine para renderização de páginas.
- Session e Flash Messages: Para gerenciamento de sessões e feedback ao usuário.

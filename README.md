# Trabalho 01 - Programação Orientada a Eventos
## Tema: Sistema de Pedidos em Lanchonete (com tempo de preparo)

Este projeto implementa uma aplicação web em tempo real que simula o sistema de pedidos de uma lanchonete, utilizando o paradigma de programação orientada a eventos.

**Membros do Grupo:**
- Desenvolvido por: Gabriel Renzi
- Desenvolvido por: Anderson Nilton de Souza

---

### Como Instalar e Executar

1.  **Pré-requisitos:** É necessário ter o [Node.js](https://nodejs.org/) instalado.
2.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_NO_GITHUB]
    ```
3.  **Navegue até a pasta do projeto:**
    ```bash
    cd lanchonete-eventos
    ```
4.  **Instale as dependências:**
    ```bash
    npm install
    ```
5.  **Execute o servidor:**
    ```bash
    node server.js
    ```
6.  Abra um navegador e acesse a **visão do cliente** em `http://localhost:3000` e a **visão do administrador** em `http://localhost:3000/admin.html`.

---

### Respostas aos Critérios do Trabalho

#### [cite_start]Quais eventos o seu sistema emite e escuta? [cite: 56]

O sistema utiliza a biblioteca Socket.IO para uma comunicação bidirecional. [cite_start]Os nomes seguem a estrutura `objeto.acao`[cite: 43].

**Eventos Emitidos pelo Cliente (e escutados pelo Servidor):**
* `lanchonete.abrir`: (Admin) Solicita a abertura da lanchonete, iniciando o sistema.
* `pedido.criar`: (Cliente) Envia os dados de um novo pedido para o servidor.
* `pedido.retirar`: (Admin) Informa que um pedido que estava 'Pronto' foi entregue ao cliente.

**Eventos Emitidos pelo Servidor (e escutados pelos Clientes):**
* `estado.atual`: Enviado para um cliente assim que ele se conecta, contendo o estado completo da aplicação (se está aberta, lista de pedidos, etc.).
* `lanchonete.aberta`: Notifica todos os clientes que a lanchonete foi aberta e está pronta para receber pedidos.
* `pedido.empreparo`: Notifica todos os clientes que um novo pedido foi aceito e seu preparo foi iniciado.
* `pedido.pronto`: Notifica todos que o tempo de preparo de um pedido terminou.
* `pedido.retirado`: Notifica todos que um pedido foi finalizado e entregue.
* `erro.operacao`: Enviado para um cliente específico quando uma ação falha (ex: pedir com a lanchonete fechada).

#### [cite_start]Como o sistema sabe quando deve atualizar os outros usuários? [cite: 57]

[cite_start]O sistema atualiza todos os usuários conectados sempre que uma ação relevante modifica o **estado central da aplicação**, que é mantido no servidor (`server.js`). [cite: 16]

O fluxo é o seguinte:
1.  Um cliente (participante ou admin) emite um evento para o servidor (ex: `pedido.criar`).
2.  O servidor escuta (`socket.on`) este evento, processa a lógica de negócio e atualiza a variável `lanchoneteState`.
3.  Imediatamente após alterar o estado, o servidor **emite um novo evento** para **todos os clientes conectados** usando `io.emit()`.
4.  [cite_start]Todos os clientes, ao receberem este evento, executam uma função que redesenha a interface com os dados atualizados, garantindo a sincronização em tempo real. [cite: 25]

#### [cite_start]Que parte do código mostra claramente o uso do paradigma orientado a eventos? [cite: 58]

O uso do paradigma é mais evidente no arquivo **`server.js`**, dentro do bloco `io.on('connection', (socket) => { ... });`.

Esta seção é a essência do paradigma:
- **Escuta de Eventos (`socket.on`):** O servidor não segue um fluxo linear, mas fica em um estado de "espera", pronto para reagir quando um evento (como `'pedido.criar'`) chega de um cliente.
- **Reação a Eventos:** Dentro de cada `socket.on`, o código processa a informação recebida.
- **Emissão de Eventos (`io.emit`):** Como consequência da reação, o servidor emite novos eventos para notificar outros sistemas (neste caso, todos os clientes) sobre a mudança de estado, propagando a informação.

[cite_start]Este ciclo de **escutar -> reagir -> emitir** é a demonstração prática da programação orientada a eventos. [cite: 9]

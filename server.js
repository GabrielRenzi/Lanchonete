// Bibliotecas necessárias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Inicialização servidor
const app = express();
const server = http.createServer(app);

// Integração do Socket.IO ao servidor HTTP
const io = socketIo(server);

// Configura o Express para servir os arquivos estáticos da pasta 'public'
app.use(express.static('public'));

let lanchoneteState = {
  aberta: false,
  pedidos: []
};
let proximoIdPedido = 1;

// Logicas
io.on('connection', (socket) => {
  console.log('Um novo usuário se conectou:', socket.id);

  // 1. EVENTO INICIAL: Envia o estado atual para o novo usuário conectado
  socket.emit('estado.atual', lanchoneteState);

  // 2. ESCUTA DO EVENTO: onde escuta o evento lanchonete abrir do adm
  socket.on('lanchonete.abrir', () => {
    lanchoneteState.aberta = true;
    console.log('A lanchonete foi aberta.');
    io.emit('lanchonete.aberta', lanchoneteState);
  });

  // ESCUTA DO EVENTO: escuta o evento lanchonete fechar do adm
  socket.on('lanchonete.fechar', () => {
    lanchoneteState.aberta = false;
    // Limpa os pedidos ao fechar
    lanchoneteState.pedidos = [];
    proximoIdPedido = 1;
    console.log('A lanchonete foi fechada.');
    
    // EMISSÃO DE EVENTO: Notifica a todos que o sistema foi encerrado.
    io.emit('lanchonete.fechada', lanchoneteState);
  });


  // 3. ESCUTA DO EVENTO: escuta o evento pedido criar do cliente
  socket.on('pedido.criar', (novoPedido) => {
    if (!lanchoneteState.aberta) {
      socket.emit('erro.operacao', { message: 'A lanchonete está fechada!' });
      return;
    }

    const tempoPreparoMs = 20000;
    const pedido = {
      id: proximoIdPedido++,
      item: novoPedido.item,
      cliente: novoPedido.cliente,
      status: 'Em preparo',
      horaCriacao: Date.now(),
      tempoPreparo: tempoPreparoMs
    };
    lanchoneteState.pedidos.push(pedido);
    io.emit('pedido.empreparo', lanchoneteState);
    console.log('Novo pedido criado:', pedido);

    setTimeout(() => {
      const pedidoPronto = lanchoneteState.pedidos.find(p => p.id === pedido.id);
      if (pedidoPronto) {
        pedidoPronto.status = 'Pronto';
        io.emit('pedido.pronto', lanchoneteState);
        console.log('Pedido pronto:', pedidoPronto);
      }
    }, tempoPreparoMs);
  });

  // 5. ESCUTA DO EVENTO: escuta o evento pedido retirar do cliente
  socket.on('pedido.retirar', (idPedido) => {
    const pedidoRetirado = lanchoneteState.pedidos.find(p => p.id === idPedido);
    if (pedidoRetirado && pedidoRetirado.status === 'Pronto') {
      pedidoRetirado.status = 'Retirado';
      io.emit('pedido.retirado', lanchoneteState);
      console.log('Pedido retirado:', pedidoRetirado);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}. Acesse http://localhost:${PORT} para o cliente e http://localhost:${PORT}/admin.html para o admin.`);
});
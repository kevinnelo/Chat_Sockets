const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let mensajes = []; // Aquí se guardan los mensajes

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Envía el historial al nuevo cliente
  socket.emit('chat history', mensajes);

  // Escucha nuevos mensajes
  socket.on('chat message', (msg) => {
    mensajes.push(msg); // Guarda el mensaje
    io.emit('chat message', msg); // Envía a todos
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en *:3000');
});

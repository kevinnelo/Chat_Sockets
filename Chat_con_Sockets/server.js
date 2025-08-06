const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Reenvía el mensaje a todos
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

http.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

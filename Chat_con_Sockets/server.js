const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { maxHttpBufferSize: 10e6 }); // 10 MB

const mensajes = [];
const archivos = []; // [{ fileName, fileType, filePath }]

app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crea la carpeta uploads si no existe
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Envía historial de mensajes y archivos al conectar
  socket.emit('chat history', mensajes);
  socket.emit('file history', archivos);

  socket.on('chat message', (msg) => {
    mensajes.push(msg);
    io.emit('chat message', msg);
  });

  socket.on('chat file', (data) => {
    const filePath = path.join('uploads', Date.now() + '_' + data.fileName);
    fs.writeFileSync(filePath, Buffer.from(new Uint8Array(data.fileData)));
    const fileInfo = {
      fileName: data.fileName,
      fileType: data.fileType,
      filePath: '/' + filePath
    };
    archivos.push(fileInfo);
    io.emit('chat file', fileInfo);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en *:3000');
});

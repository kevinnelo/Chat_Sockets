const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
  maxHttpBufferSize: 1000e6 // 1 GB
});
let mensajes = []; // Aquí se guardan los mensajes

app.use(express.static(__dirname));

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');
  // Notifica a los clientes que hay un nuevo archivo
  io.emit('chat file', {
    fileName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype
  });
  res.status(200).send('File uploaded');
  // Opcional: elimina el archivo después de X segundos
  setTimeout(() => {
    fs.unlink(path.join(__dirname, 'uploads', file.filename), () => {});
  }, 60000); // 1 minuto
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Envía el historial al nuevo cliente
  socket.emit('chat history', mensajes);

  // Escucha nuevos mensajes
  socket.on('chat message', (msg) => {
    mensajes.push(msg); // Guarda el mensaje
    io.emit('chat message', msg); // Envía a todos
  });

  socket.on('chat file', (data) => {
    io.emit('chat file', data); // retransmite el archivo a todos
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en *:3000');
});

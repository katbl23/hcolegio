// Importar las dependencias
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

// Crear la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost', // o la dirección IP de tu servidor MySQL
  user: 'root',      // tu usuario de MySQL
  password: 'Purpura2018', // tu contraseña de MySQL
  database: 'préstamos' // nombre de la base de datos
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Ruta para obtener todos los préstamos
app.get('/loans', (req, res) => {
  const query = 'SELECT * FROM loans';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener los préstamos');
      return;
    }
    res.json(results);
  });
});

// Ruta para agregar un nuevo préstamo
app.post('/loans', (req, res) => {
  const { computer, user, date, returned } = req.body;
  const query = 'INSERT INTO loans (computer, user, date, returned) VALUES (?, ?, ?, ?)';
  db.query(query, [computer, user, date, returned], (err, results) => {
    if (err) {
      res.status(500).send('Error al agregar el préstamo');
      return;
    }
    res.status(201).send('Préstamo agregado');
  });
});

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

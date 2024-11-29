// Importar las dependencias
const express = require('express');
const { Client } = require('pg'); // Usar pg para conectarse a PostgreSQL
const bodyParser = require('body-parser');
const cors = require('cors');

// Crear la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos PostgreSQL
const db = new Client({
  connectionString: 'postgresql://computadores_nv9i_user:WTyihN4JFg8bfOOEqCr96NG34zaRcnWd@dpg-ct4gjd08fa8c73bp5k0g-a/computadores_nv9i', 
  ssl: {
    rejectUnauthorized: false // Habilitar SSL para la conexión en Render
  }
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos PostgreSQL');
  }
});

// Ruta para obtener todos los préstamos
app.get('/loans', (req, res) => {
  const query = 'SELECT * FROM loans';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener los préstamos:', err);
      res.status(500).send('Error al obtener los préstamos');
      return;
    }
    console.log('Préstamos obtenidos:', result.rows); // Verifica que los datos se estén obteniendo
    res.json(result.rows); // En PostgreSQL los resultados se encuentran en result.rows
  });
});

// Ruta para agregar un nuevo préstamo
app.post('/loans', (req, res) => {
  const { computer, user, date, returned } = req.body;
  const query = 'INSERT INTO loans (computer, user, date, returned) VALUES ($1, $2, $3, $4)';
  
  console.log('Datos del préstamo recibido:', { computer, user, date, returned }); // Verifica que los datos sean los correctos

  db.query(query, [computer, user, date, returned], (err, result) => {
    if (err) {
      console.error('Error al agregar el préstamo:', err);
      res.status(500).send('Error al agregar el préstamo');
      return;
    }
    console.log('Préstamo agregado exitosamente');
    res.status(201).send('Préstamo agregado');
  });
});

// Iniciar el servidor
const port = process.env.PORT || 3000; // El puerto será dinámico si está en producción
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


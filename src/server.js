// Importar las dependencias
const express = require('express');
const { Client } = require('pg'); // Usar pg para conectarse a PostgreSQL
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Crear la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
// Configuración de la base de datos PostgreSQL
const db = new Client({
  connectionString: 'postgresql://computadores_nv9i_user:WTyihN4JFg8bfOOEqCr96NG34zaRcnWd@dpg-ct4gjd08fa8c73bp5k0g-a:5432/computadores_nv9i', 
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

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

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
app.post('/loans', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body); 
    const { computer, usuario, date, returned } = req.body;

    // Verificar si los campos son correctos
    if (!computer || !usuario || !date) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Aquí va la lógica para insertar en la base de datos
    const result = await db.query(
      'INSERT INTO loans (computer, usuario, date, returned) VALUES ($1, $2, $3, $4) RETURNING *',
      [computer, usuario, date, returned]
    );

    // Responder con el nuevo préstamo
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error al registrarlo préstamo:', error);
    res.status(500).json({ message: 'Error al registrarlo el préstamo', error: error.message });
  }
});

// Ruta para servir el archivo HTML (si no se usa en la ruta principal)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
const port = process.env.PORT || 3000; // El puerto será dinámico si está en producción
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Importar las dependencias
const express = require('express');
const { Client } = require('pg'); // Usar pg para conectarse a PostgreSQL
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Crear la aplicación Express
const app = express();
app.use(express.json());
// Configurar middleware
app.use(cors());
app.use(bodyParser.json());

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
// Ruta para agregar un nuevo préstamo
app.post('/loans', async (req, res) => {
  const { computer, usuario, date, returned } = req.body;

  // Verificar que los datos estén presentes
  if (!computer || !usuario || !date || returned === undefined) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  console.log("Datos recibidos:", { computer, usuario, date, returned });

  try {
    const query = `
      INSERT INTO loans (computer, usuario, date, returned)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [computer, usuario, date, returned];

    // Ejecutar la consulta con la conexión `db`
    const result = await db.query(query, values); // Cambié 'pool' a 'db'

    res.status(201).json(result.rows[0]); // Retorna el préstamo recién creado
  } catch (error) {
    console.error('Error al registrar préstamo:', error);
    res.status(500).json({ message: 'Error al agregar préstamo', error: error.message });
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

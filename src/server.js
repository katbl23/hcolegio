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
  connectionString: 'postgresql://computer_2tsb_user:InafLOZ7cayzIxNeQlzH0okMGc82EUkq@dpg-ctoag4popnds73fgr4rg-a:5432/computer_2tsb', 
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

// Desconectar de la base de datos al cerrar el servidor
process.on('SIGINT', async () => {
  await db.end();
  console.log('Conexión a la base de datos cerrada');
  process.exit(0);
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use('/static', express.static(path.join(__dirname, '../public')));

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

// Ruta para marcar un préstamo como devuelto
app.put('/loans/:id', async (req, res) => {
  const { id } = req.params;
  const { returned } = req.body;

  // Validar que el ID es un número válido
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  // Validar que el campo "returned" esté presente
  if (returned === undefined) {
    return res.status(400).json({ message: 'El campo "returned" es obligatorio' });
  }

  try {
    const query = `
      UPDATE loans SET returned = $1 WHERE id = $2 RETURNING *;
    `;
    const values = [returned, id];

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    res.status(200).json(result.rows[0]); // Devuelve el préstamo actualizado
  } catch (error) {
    console.error('Error al actualizar el préstamo:', error);
    res.status(500).json({ message: 'Error al actualizar el préstamo', error: error.message });
  }
});

// Ruta para agregar un nuevo préstamo
app.post('/loans', async (req, res) => {
  const { computer, usuario, propietario, ejeprestamo, date, returned } = req.body;

  // Verificar que los datos estén presentes
  if (!computer || !usuario || !propietario || !ejeprestamo || !date) {
    return res.status(400).json({ message: 'Faltan campos requeridos: computer, usuario, propietario, ejeprestamo o date.' });
  }

  console.log("Datos recibidos:", { computer, usuario, propietario, ejeprestamo, date, returned });

  try {
    const query = `
      INSERT INTO loans (computer, usuario, propietario, ejeprestamo, date, returned)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [computer, usuario, propietario, ejeprestamo, date, returned];

    // Ejecutar la consulta con la conexión `db`
    const result = await db.query(query, values);

    // Asegurémonos de que `result.rows` contiene datos antes de enviarlos al cliente
    if (result.rows.length === 0) {
      console.log('No se obtuvo ningún resultado de la base de datos');
      return res.status(500).json({ message: 'Error al agregar el préstamo' });
    }

    console.log('Préstamo creado:', result.rows[0]);

    res.status(201).json(result.rows[0]); // Retorna el préstamo recién creado
  } catch (error) {
    console.error('Error al registrar préstamo:', error);
    res.status(500).json({ message: 'Error al agregar préstamo', error: error.message });
  }
});

// Ruta para servir el archivo HTML (si no se usa en la ruta principal)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar el servidor
const port = process.env.PORT || 3000; // El puerto será dinámico si está en producción
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

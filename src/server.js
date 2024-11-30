const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de la base de datos
const pool = new Pool({
  connectionString: "postgresql://computadores_nv9i_user:WTyihN4JFg8bfOOEqCr96NG34zaRcnWd@dpg-ct4gjd08fa8c73bp5k0g-a.oregon-postgres.render.com/computadores_nv9i",
  ssl: { rejectUnauthorized: false },
});

// Ruta para agregar un préstamo
app.post("/loans", async (req, res) => {
  try {
    const { computer, usuario, date, returned } = req.body;
    if (!computer || !usuario || !date) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    const result = await pool.query(
      "INSERT INTO loans (computer, usuario, date, returned) VALUES ($1, $2, $3, $4) RETURNING *",
      [computer, usuario, date, returned]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar el préstamo:", error.message);
    res.status(500).send("Error al agregar el préstamo.");
  }
});

// Ruta para obtener todos los préstamos
app.get("/loans", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM loans");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los préstamos:", error.message);
    res.status(500).send("Error al obtener los préstamos.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

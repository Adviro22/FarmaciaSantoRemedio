import express from "express";
import dotenv from "dotenv";
import connection, { dbConfig } from "./database/db.js";

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("¡Hola, mundo desde Express!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



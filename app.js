import express from "express";
import { auth } from "./auth.js";
import dotenv from "dotenv";
import connection, { dbConfig } from "./database/db.js";
import cookieSession from "cookie-session";
import bcryptjs from "bcryptjs";
import { DateTime } from "luxon";

const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use("/resources", express.static("public"));
app.use("/resources", express.static(import.meta.url + "/public"));

app.set("view engine", "ejs");

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"], // Claves de cifrado, cámbialas por valores secretos
    maxAge: 24 * 60 * 60 * 1000, // Tiempo de vida de la cookie en milisegundos (1 día)
  })
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/",auth, (req, res) => {
  res.render("index");
});

//Register
app.post("/register", async (req, res) => {
  const nombre = req.body.nombre;
  const apellido = req.body.apellido;
  const cedula = req.body.cedula;
  const telefono = req.body.telefono;
  const correo = req.body.correo;
  const pass = req.body.pass;
  const passwordHash = await bcryptjs.hash(pass, 8);

  connection.query(
    "INSERT INTO Usuario SET ?",
    {
      nombre: nombre,
      apellido: apellido,
      cedula: cedula,
      telefono: telefono,
      correo: correo,
      contraseña: passwordHash,
    },
    (error, results) => {
      if (error) {
        console.log(error);
        res.render("register", {
          alert: true,
          alertTitle: "Error",
          alertMessage: "Hubo un problema en el registro",
          alertIcon: "error",
          showConfirmButton: true,
          timer: false,
          ruta: "register",
        });
      } else {
        res.render("login", {
          alert: true,
          alertTitle: "Éxito",
          alertMessage: "¡Registro exitoso!",
          alertIcon: "success",
          showConfirmButton: true,
          timer: 2000,
          ruta: "login",
        });
      }
    }
  );
});

// Dentro de tu ruta de autenticación ("/auth")
app.post("/auth", async (req, res) => {
  const correo = req.body.correo;
  const pass = req.body.pass;

  if (correo && pass) {
    connection.query(
      "SELECT * FROM Usuario WHERE correo = ?", // Cambié 'users' a 'Usuario' y dejé 'correo'
      [correo],
      async (error, results) => {
        if (
          results.length == 0 ||
          !(await bcryptjs.compare(pass, results[0].contraseña)) // Cambié 'pass' por 'contraseña' según la columna de la tabla
        ) {
          res.render("login", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Correo y/o contraseña incorrectas",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: "login",
          });
        } else {
          const userInfo = {
            id: results[0].id_usuario,
            nombre: results[0].nombre,
            apellido: results[0].apellido,
            correo: results[0].correo,
          };

          req.session.user = userInfo;
          req.session.loggedin = true;

          res.redirect("/");
        }
      }
    );
  } else {
    res.send("Por favor ingrese un correo y contraseña");
  }
});

// La ruta "/" ahora se encarga de la redirección después del inicio de sesión
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    // El usuario está autenticado, puedes redirigirlo a la página deseada, por ejemplo, "/menuprincipal"
    res.render("index", {
      login: true,
      name: req.session.user.nombre, // Cambié 'name' por 'nombre'
    });
  } else {
    // El usuario no está autenticado, muéstrale la página de inicio de sesión
    res.render("index", {
      login: false,
      name: "Debe iniciar sesión",
    });
  }
});


// La ruta "/" ahora se encarga de la redirección después del inicio de sesión
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    // El usuario está autenticado, puedes redirigirlo a la página deseada, por ejemplo, "/menuprincipal"
    res.render("index", {
      login: true,
      name: req.session.user.name,
    });
  } else {
    // El usuario no está autenticado, muéstrale la página de inicio de sesión
    res.render("index", {
      login: false,
      name: "Debe iniciar sesión",
    });
  }
});

// La ruta de cierre de sesión
app.get("/logout", function (req, res) {
  req.session = null; // Destruye la sesión eliminándola
  res.redirect("/"); // Redirige al inicio u otra página después de cerrar sesión
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

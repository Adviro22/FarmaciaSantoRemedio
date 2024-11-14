import express from "express";
import { auth } from "./auth.js";
import dotenv from "dotenv";
import connection, { dbConfig } from "./database/db.js";
import cookieSession from "cookie-session";
import bcryptjs from "bcryptjs";
import { DateTime } from "luxon";

const app = express();
const PORT = process.env.PORT;
dotenv.config();

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

// Ruta GET para mostrar el formulario de agregar producto
app.get('/agregar-producto', auth, (req, res) => {
  res.render('agregar-producto', {
    alert: false,  // Asegúrate de pasar `alert` por defecto como `false`
    alertTitle: "",
    alertMessage: "",
    alertIcon: ""
  });
});

// Ruta para mostrar todos los clientes
app.get('/clientes', auth, (req, res) => {
  const query = `
    SELECT Cliente.id_cliente, Cliente.nombre, Cliente.apellido, Cliente.cedula, 
           Cliente.telefono, Cliente.email, Ciudad.nombre AS ciudad
    FROM Cliente
    LEFT JOIN Ciudad ON Cliente.id_ciudad = Ciudad.id_ciudad
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.log(error);
      return res.render('clientes', {
        alert: true,
        alertTitle: 'Error',
        alertMessage: 'Hubo un problema al cargar los clientes',
        alertIcon: 'error',
        showConfirmButton: true,
        timer: false,
      });
    }

    res.render('clientes', { clientes: results });
  });
});

// En tu ruta para registrar clientes
app.get('/registrar-cliente', auth, (req, res) => {
  connection.query('SELECT * FROM Ciudad', (error, results) => {
      if (error) {
          // Manejar el error
      } else {
          res.render('registrar-cliente', { ciudades: results });
      }
  });
});

app.get('/clientes/nuevo', auth, (req, res) => {
  // Realizar la consulta para obtener las ciudades
  connection.query('SELECT * FROM Ciudad', (error, ciudades) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error al obtener las ciudades');
    }
    // Renderizar la vista y pasar las ciudades obtenidas
    res.render('nuevoCliente', { ciudades });
  });
});

app.get('/clientes/editar/:id', auth, (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM Cliente WHERE id_cliente = ?', [id], (error, results) => {
    if (error || results.length === 0) {
      console.log(error);
      res.redirect('/clientes');
    } else {
      res.render('editarCliente', { cliente: results[0] }); // Vista `editarCliente.ejs`
    }
  });
});


//POST

app.post('/clientes', auth, (req, res) => {
  const { nombre, apellido, cedula, telefono, email, id_ciudad } = req.body;
  const query = `
    INSERT INTO Cliente (nombre, apellido, cedula, telefono, email, id_ciudad)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  connection.query(query, [nombre, apellido, cedula, telefono, email, id_ciudad], (error) => {
    if (error) {
      console.log(error);
      res.redirect('/clientes'); // O muestra un mensaje de error
    } else {
      res.redirect('/clientes');
    }
  });
});

app.post('/clientes/editar/:id', auth, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, cedula, telefono, email, id_ciudad } = req.body;
  const query = `
    UPDATE Cliente SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, email = ?, id_ciudad = ?
    WHERE id_cliente = ?
  `;
  connection.query(query, [nombre, apellido, cedula, telefono, email, id_ciudad, id], (error) => {
    if (error) {
      console.log(error);
      res.redirect('/clientes'); // O muestra un mensaje de error
    } else {
      res.redirect('/clientes');
    }
  });
});

app.get('/clientes/eliminar/:id', auth, (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM Cliente WHERE id_cliente = ?', [id], (error) => {
    if (error) {
      console.log(error);
    }
    res.redirect('/clientes');
  });
});


app.post('/registrar-cliente', auth, (req, res) => {
  const { nombre, apellido, cedula, telefono, email, id_ciudad } = req.body;

  // Validación de datos (opcional)

  connection.query(
      'INSERT INTO Cliente SET ?',
      {
          nombre,
          apellido,
          cedula,
          telefono,
          email,
          id_ciudad
      },
      (error, results) => {
          if (error) {
              console.log(error);
              // Manejar el error, por ejemplo, mostrar un mensaje al usuario
              res.render('registrar-cliente', { error: 'Error al registrar el cliente' });
          } else {
              res.redirect('/clientes');
          }
      }
  );
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

// Mostrar todos los productos
app.get("/producto", auth, (req, res) => {
  connection.query("SELECT * FROM Producto", (error, results) => {
    if (error) {
      console.log(error);
      return res.render("producto", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Hubo un problema al cargar los productos",
        alertIcon: "error",
        showConfirmButton: true,
        timer: false,
      });
    }

    // Verifica los resultados obtenidos de la base de datos
    console.log("Resultados de la consulta:", results);

    // Renderiza la vista pasando los resultados como la variable "productos"
    res.render("producto", { productos: results });
  });
});

// Ruta POST para agregar un nuevo producto
app.post('/agregar-producto', (req, res) => {
  const { descripcion, precio_venta, precio_compra, stock, fecha_elaboracion, fecha_vencimiento } = req.body;

  // Consulta para insertar el nuevo producto en la base de datos
  connection.query(
    "INSERT INTO Producto (descripcion, precio_venta, precio_compra, stock, fecha_elaboracion, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?)",
    [descripcion, precio_venta, precio_compra, stock, fecha_elaboracion, fecha_vencimiento],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.render("agregar-producto", {
          alert: true,
          alertTitle: "Error",
          alertMessage: "Hubo un problema al agregar el producto",
          alertIcon: "error",
          showConfirmButton: true,
          timer: false,
        });
      }

      // Si todo salió bien, redirige a la página de productos
      res.redirect('/producto'); // O redirige a cualquier otra página que desees
    }
  );
});


//Ruta Editar Producto
app.get('/editar-producto/:id', (req, res) => {
  const id_producto = req.params.id;

  // Obtener los detalles del producto por ID desde la base de datos
  connection.query("SELECT * FROM Producto WHERE id_producto = ?", [id_producto], (err, result) => {
    if (err) {
      console.log(err);
      return res.render("editar-producto", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Hubo un problema al cargar los datos del producto",
        alertIcon: "error",
        showConfirmButton: true,
        timer: false,
      });
    }

    // Si se encuentra el producto, renderizamos la vista de edición con los datos
    if (result.length > 0) {
      const producto = result[0]; // Tomamos el primer resultado
      res.render("editar-producto", {
        producto: producto, // Pasamos los datos del producto a la vista
      });
    } else {
      res.render("editar-producto", {
        alert: true,
        alertTitle: "Producto no encontrado",
        alertMessage: "El producto que intentas editar no existe.",
        alertIcon: "error",
        showConfirmButton: true,
        timer: false,
      });
    }
  });
});

//Actualizar Productos
app.post('/actualizar-producto/:id', (req, res) => {
  const id_producto = req.params.id;
  const { descripcion, precio_venta, precio_compra, stock, fecha_elaboracion, fecha_vencimiento } = req.body;

  // Realizamos la actualización con una consulta SQL
  connection.query(
    "UPDATE Producto SET descripcion = ?, precio_venta = ?, precio_compra = ?, stock = ?, fecha_elaboracion = ?, fecha_vencimiento = ? WHERE id_producto = ?",
    [descripcion, precio_venta, precio_compra, stock, fecha_elaboracion, fecha_vencimiento, id_producto],
    (error, results) => {
      if (error) {
        console.log(error);
        res.send('Error al actualizar el producto');
      } else {
        res.redirect('/producto'); // Redirigir después de la actualización
      }
    }
  );
});

//Eliminar Productos
app.get('/eliminar-producto/:id', (req, res) => {
  const id_producto = req.params.id;

  // Realizamos la eliminación con una consulta SQL
  connection.query(
    "DELETE FROM Producto WHERE id_producto = ?",
    [id_producto],
    (error, results) => {
      if (error) {
        console.log(error);
        res.send('Error al eliminar el producto');
      } else {
        res.redirect('/producto'); // Redirigir a la lista de productos
      }
    }
  );
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

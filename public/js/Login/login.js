function verificarPalabras() {
  const input = document.getElementById("inputTexto");
  const mensajeError = document.getElementById("mensajeError");
  const palabras = input.value.trim().split(/\s+/);

  if (palabras.length > 10) {
    mensajeError.style.display = "block";
    input.value = palabras.slice(0, 10).join(" ");
  } else {
    mensajeError.style.display = "none";
  }
}

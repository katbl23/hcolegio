// URL del servidor
const serverUrl = "https://hcolegio.onrender.com/loans";

// Función para llenar el desplegable de computadores
function populateComputers() {
  const computerSelect = document.getElementById("computer");
  computerSelect.innerHTML = '<option value="">Selecciona un computador</option>'; // Opción predeterminada

  // Generar 25 opciones de computadores
  for (let i = 1; i <= 25; i++) {
    const option = document.createElement("option");
    option.value = `Computador ${i}`;
    option.textContent = `Computador ${i}`;
    computerSelect.appendChild(option);
  }
}

// Función para registrar préstamo
async function addLoan() {
  const computer = document.getElementById("computer").value;
  const usuario = document.getElementById("usuario").value; // Cambiado a "usuario"

  if (!computer || !usuario) {
    showError("Por favor, completa todos los campos.");
    return;
  }

  const loan = {
    computer: computer,
    usuario: usuario, // Cambiado a "usuario"
    date: new Date().toLocaleString(),
    returned: false,
  };

  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loan),
    });

    if (!response.ok) {
      throw new Error("Error al agregar el préstamo" +response.statusText);
    }

    const result = await response.json();
    console.log("Préstamo registrado:", result);
    alert("Préstamo registrado con éxito.");
    loadLoans(); // Actualizar la lista
  } catch (error) {
    console.error("Error al registrar el préstamo:", error.message);
    res.status(500).json({ message: 'Error al registrar el préstamo', error: error.message });
    showError(error.message);
  }
}

// Función para mostrar mensajes de error
function showError(message) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 3000);
}

// Función para cargar préstamos desde el servidor
async function loadLoans() {
  try {
    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error("Error al cargar los préstamos");
    }

    const loans = await response.json();
    populateLoanTable(loans);
  } catch (error) {
    console.error("Error al cargar los préstamos:", error.message);
    showError(error.message);
  }
}

// Función para llenar la tabla de préstamos
function populateLoanTable(loans) {
  const tableBody = document.querySelector("#loanTable tbody");
  tableBody.innerHTML = ""; // Limpiar la tabla

  loans.forEach((loan, index) => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${loan.computer}</td>
      <td>${loan.usuario}</td> <!-- Cambiado a "usuario" -->
      <td>${loan.date}</td>
      <td>${loan.returned ? "Devuelto" : "En préstamo"}</td>
      <td>
        ${!loan.returned ? `<button onclick="returnLoan(${loan.id})">Devolver</button>` : ""}
      </td>
    `;
  });
}

// Inicializar
document.getElementById("addLoan").addEventListener("click", addLoan);
populateComputers(); // Llenar el desplegable
loadLoans(); // Cargar los préstamos al inicio

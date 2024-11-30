// URL del servidor
const serverUrl = "https://hcolegio.onrender.com/loans";

// Función para registrar préstamo
async function addLoan() {
  const computer = document.getElementById("computer").value;
  const user = document.getElementById("user").value;

  if (!computer || !user) {
    showError("Por favor, completa todos los campos.");
    return;
  }

  const loan = {
    computer: computer,
    user: user,
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
      throw new Error("Error al agregar el préstamo");
    }

    const result = await response.json();
    console.log("Préstamo registrado:", result);
    alert("Préstamo registrado con éxito.");
    loadLoans(); // Actualizar la lista
  } catch (error) {
    console.error("Error al registrar el préstamo:", error.message);
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
      <td>${loan.user}</td>
      <td>${loan.date}</td>
      <td>${loan.returned ? "Devuelto" : "En préstamo"}</td>
      <td>
        ${!loan.returned ? `<button onclick="returnLoan(${loan.id})">Devolver</button>` : ""}
      </td>
    `;
  });
}

// Función para devolver un préstamo
async function returnLoan(loanId) {
  try {
    const response = await fetch(`${serverUrl}/${loanId}`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw new Error("Error al devolver el préstamo");
    }

    alert("Préstamo devuelto con éxito.");
    loadLoans(); // Actualizar la lista
  } catch (error) {
    console.error("Error al devolver el préstamo:", error.message);
    showError(error.message);
  }
}

// Inicializar
document.getElementById("addLoan").addEventListener("click", addLoan);
loadLoans();

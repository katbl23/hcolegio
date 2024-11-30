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

// Función para devolver un préstamo
async function returnLoan(loanId) {
  try {
    // Hacer la solicitud para marcar el préstamo como devuelto
    const response = await fetch(`${serverUrl}/${loanId}}`, {
      method: 'PUT', // O 'PATCH' dependiendo de cómo manejes las actualizaciones
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ returned: true }), // Cambiar el estado a 'true'
    });

    // Comprobar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error(`Error al devolver el préstamo: ${response.statusText}`);
    }

    // Parsear la respuesta JSON
    const result = await response.json();
    console.log('Préstamo devuelto:', result);

    // Actualizar la interfaz de usuario (por ejemplo, recargar la lista de préstamos)
    loadLoans(); // Suponiendo que tienes una función loadLoans que actualiza la lista
    alert('El préstamo ha sido devuelto con éxito.');
  } catch (error) {
    console.error('Error al devolver el préstamo:', error.message);
    showError(`Hubo un problema al devolver el préstamo: ${error.message}`);
  }
}


async function addLoan() {
  const computer = document.getElementById("computer").value;
  const usuario = document.getElementById("usuario").value;

  // Verificar si los campos son vacíos
  if (!computer || !usuario) {
    showError("Por favor, completa todos los campos.");
    return;
  }

  // Crear el objeto de préstamo
  const loan = {
    computer: computer,
    usuario: usuario,
    date: new Date().toISOString(),
    returned: false,
  };
  console.log("Datos del préstamo:", loan);

  try {
    // Realizar la solicitud a la API
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loan),
    });

    // Verificar si la respuesta fue exitosa
    console.log('Response Status:', response.status);

    if (!response.ok) {
      // Si la respuesta no es exitosa, capturamos el cuerpo del error
      const errorDetails = await response.text(); // Captura el texto de error
      throw new Error(`Error al agregar el préstamo: ${response.statusText}, Detalles: ${errorDetails}`);
    }

    // Parsear la respuesta JSON
    const result = await response.json();
    console.log("Préstamo registrado:", result);
    alert("Préstamo registrado con éxito.");
    loadLoans(); // Actualizar la lista de préstamos

  } catch (error) {
    // Capturar y mostrar cualquier error en el proceso
    console.error("Error al registrar el préstamo:", error.message);

    // Mostrar el error al usuario
    showError(`Hubo un problema al registrar el préstamo: ${error.message}`);
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

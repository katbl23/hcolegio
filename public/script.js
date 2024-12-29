const serverUrl = "https://hcolegio.onrender.com/loans";

let computers = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Computador ${i + 1}`,
  isLoaned: false // Inicializa todos como no prestados
}));

// Función para llenar el desplegable de computadores con su estado (prestado o no)
function populateComputers() {
  const computerSelect = document.getElementById("computer");
  computerSelect.innerHTML = '<option value="">Selecciona un computador</option>'; // Opción predeterminada

  // Llenar el desplegable con los computadores disponibles y deshabilitar los prestados
  computers.forEach(computer => {
    const option = document.createElement("option");
    option.value = computer.id; // Usa el ID para manejar la lógica internamente
    option.textContent = computer.name;

    // Deshabilitar si el computador está prestado
    if (computer.isLoaned) {
      option.disabled = true;
    } else {
      option.disabled = false;
    }

    computerSelect.appendChild(option);
  });
}

// Función para agregar un préstamo
async function addLoan() {
  const computerSelect = document.getElementById("computer");
  const usuario = document.getElementById("usuario").value;
  const propietario = document.getElementById("propietario").value; // Obtener el valor del propietario
  const ejePrestamo = document.getElementById("ejePrestamo").value;
  const computer = computerSelect.value; // Obtiene el valor del computador seleccionado

  // Verificar si los campos son vacíos
  if (!computer || !usuario || !propietario || !ejePrestamo) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Verificar si el computador está en préstamo
  const selectedComputer = computers.find(c => c.id === parseInt(computer)); // Encuentra el computador seleccionado

  if (selectedComputer && selectedComputer.isLoaned) {
    alert("Este computador ya está en préstamo.");
    return;
  }

  // Crear el objeto de préstamo
  const loan = {
    computer: selectedComputer.name, // Usamos el nombre o ID según tu preferencia
    usuario: usuario,
    propietario: propietario, // Agregar propietario
    ejePrestamo: ejePrestamo, // Agregar eje gestor
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
    if (!response.ok) {
      const errorDetails = await response.text(); // Captura el texto de error
      throw new Error(`Error al agregar el préstamo: ${response.statusText}, Detalles: ${errorDetails}`);
    }

    // Parsear la respuesta JSON
    const result = await response.json();
    console.log("Préstamo registrado:", result);
    alert("Préstamo registrado con éxito.");
    
    // Actualizar el estado del computador en la interfaz (marcarlo como prestado)
    selectedComputer.isLoaned = true;
    populateComputers(); // Actualiza las opciones del desplegable

    // Actualizar la lista de préstamos
    loadLoans();
  } catch (error) {
    console.error("Error al registrar el préstamo:", error.message);
    alert(`Hubo un problema al registrar el préstamo: ${error.message}`);
  }
}

// Función para devolver un préstamo
async function returnLoan(loanId) {
  const securityCode = document.getElementById('securityCode').value;

  if (!securityCode) {
    // Mostrar mensaje de advertencia
    alert('Ingresa código de seguridad en la parte de arriba');
    return; // No continuar si el código está vacío
  }

  // Validar el código de seguridad
  const validCode = '1234'; // Código de seguridad predefinido
  if (securityCode !== validCode) {
    alert('Código de seguridad incorrecto');
    return;
  }

  try {
    // Hacer la solicitud para marcar el préstamo como devuelto
    const response = await fetch(`${serverUrl}/${loanId}`, {
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

    // Actualizar el estado del computador (habilitarlo de nuevo)
    const returnedLoan = result; // Suponemos que la respuesta contiene información del préstamo devuelto
    const returnedComputerId = returnedLoan.computerId; // ID del computador asociado al préstamo

    const computer = computers.find(c => c.id === returnedComputerId);
    if (computer) {
      computer.isLoaned = false; // Marcar el computador como disponible
    }

    // Actualizar la interfaz de usuario
    alert('El préstamo ha sido devuelto con éxito.');
    loadLoans(); // Cargar la lista actualizada de préstamos
    populateComputers(); // Actualizar el desplegable con los computadores disponibles

  } catch (error) {
    console.error('Error al devolver el préstamo:', error.message);
    alert(`Hubo un problema al devolver el préstamo: ${error.message}`);
  }
}

// Función para cargar la lista de préstamos (historial de préstamos)
async function loadLoans() {
  try {
    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error("Error al cargar los préstamos.");
    }

    const loans = await response.json();
    console.log("Préstamos cargados:", loans);

    // Aquí podrías actualizar la tabla de historial de préstamos
    // Ejemplo para mostrarlo en una tabla (dependiendo de cómo esté estructurado tu HTML)
    const loanTable = document.getElementById("loanHistoryTable");
    loanTable.innerHTML = ''; // Limpiar tabla antes de agregar los nuevos datos

    loans.forEach(loan => {
      const row = loanTable.insertRow();
      row.innerHTML = `
        <td>${loan.computer}</td>
        <td>${loan.usuario}</td>
        <td>${loan.propietario}</td>
        <td>${loan.ejePrestamo}</td>
        <td>${loan.date}</td>
        <td>${loan.returned ? "Devuelto" : "En préstamo"}</td>
        <td>
          <button onclick="returnLoan(${loan.id})" ${loan.returned ? 'disabled' : ''}>Devolver</button>
        </td>
      `;
    });

  } catch (error) {
    console.error("Error al cargar los préstamos:", error.message);
    alert(`Hubo un problema al cargar los préstamos: ${error.message}`);
  }
}

// Llamar a loadLoans para cargar los préstamos al iniciar la página
loadLoans();


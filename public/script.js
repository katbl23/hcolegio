// Referencias a los elementos HTML
const computerInput = document.getElementById('computer');
const userInput = document.getElementById('user');
const addLoanButton = document.getElementById('addLoan');
const searchInput = document.getElementById('search');
const loanTableBody = document.querySelector('#loanTable tbody');
const codeModal = document.getElementById('codeModal');
const returnCodeInput = document.getElementById('returnCode');
const confirmReturnButton = document.getElementById('confirmReturn');
const cancelReturnButton = document.getElementById('cancelReturn');

// Array para almacenar los préstamos
let loans = [];
let currentLoanId = null;

// === FUNCIONES DE LA APLICACIÓN ===

// Función para generar las opciones de los computadores en el select
function generateComputerOptions() {
  const select = document.getElementById('computer');
  for (let i = 1; i <= 25; i++) {
    const option = document.createElement('option');
    option.value = `Computador ${i}`;
    option.textContent = `Computador ${i}`;
    select.appendChild(option);
  }
}

// Función para agregar un préstamo a la base de datos
function addLoan() {
  const computer = computerInput.value.trim();
  const user = userInput.value.trim();

  if (!computer || !user) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  const newLoan = {
    computer: computer,
    user: user,
    date: new Date().toLocaleString(),
    returned: false,
  };

  console.log('Enviando préstamo al servidor:', newLoan); // Verifica que se envíe correctamente

  // Solicitud POST para agregar el préstamo al servidor
  fetch('/loans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLoan),
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text); }); // Manejar respuestas no exitosas
      }
      return response.json(); // Intentar convertir a JSON si la respuesta es válida
    })
    .then(() => {
      computerInput.value = '';
      userInput.value = '';
      alert('Préstamo registrado con éxito');
      getLoans(); // Obtener la lista actualizada de préstamos
    })
    .catch(error => {
      console.error('Error al registrar el préstamo:', error.message);
      showError('Hubo un problema al registrar el préstamo. Inténtalo de nuevo.');
    });
}

// Función para obtener todos los préstamos desde el servidor
function getLoans() {
  fetch('/loans') // Usa una URL relativa
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener los préstamos.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Préstamos obtenidos del servidor:', data); // Verifica los datos recibidos
      loans = data;
      updateTable();
    })
    .catch(error => {
      console.error('Error al obtener los préstamos:', error);
      showError('Hubo un problema al obtener los préstamos.'+error.message);
    });
}

// Función para eliminar un préstamo por ID
function deleteLoan(id) {
  loans = loans.filter(loan => loan.id !== id);
  updateTable();
}

// Función para mostrar el modal de código de devolución
function showReturnCodeModal(id) {
  currentLoanId = id;
  codeModal.style.display = 'block';
}

// Función para marcar un préstamo como devuelto
function toggleReturned(id) {
  showReturnCodeModal(id);
}

// Función para procesar el código de devolución
const validReturnCode = "12345"; // Código de devolución válido

function processReturnCode() {
  const code = returnCodeInput.value.trim();

  // Verificar si el código ingresado es correcto
  if (code !== validReturnCode) {
    alert('Código de devolución incorrecto.');
    return;
  }

  // Si el código es correcto, marcamos el préstamo como devuelto
  const loan = loans.find(loan => loan.id === currentLoanId);
  if (!loan) {
    alert('Préstamo no encontrado.');
    return;
  }

  loan.returned = true;
  updateTable();

  // Limpiar el código y cerrar el modal
  returnCodeInput.value = '';
  codeModal.style.display = 'none';
}

// Función para cancelar la operación de devolución
function cancelReturn() {
  returnCodeInput.value = '';
  codeModal.style.display = 'none';
}

// Función para actualizar la tabla HTML con los préstamos
function updateTable(filteredLoans = loans) {
  loanTableBody.innerHTML = '';

  filteredLoans.forEach(loan => {
    const row = document.createElement('tr');
    row.className = loan.returned ? 'returned' : ''; // Aplicar estilo si está devuelto

    row.innerHTML = `
      <td>${loan.id}</td>
      <td>${loan.computer}</td>
      <td>${loan.user}</td>
      <td>${loan.date}</td>
      <td>${loan.returned ? 'Devuelto' : 'Pendiente'}</td>
      <td>
        <button onclick="toggleReturned(${loan.id})">
          ${loan.returned ? 'Marcar como Pendiente' : 'Marcar como Devuelto'}
        </button>
      </td>
    `;

    loanTableBody.appendChild(row);
  });
}

// Función para filtrar préstamos por búsqueda
function filterLoans() {
  const query = searchInput.value.toLowerCase().trim();

  const filteredLoans = loans.filter(loan =>
    loan.computer.toLowerCase().includes(query) ||
    loan.user.toLowerCase().includes(query)
  );

  updateTable(filteredLoans);
}

// Función para mostrar mensajes de error
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// === EVENTOS ===

// Asignar eventos a los botones
addLoanButton.addEventListener('click', addLoan);
searchInput.addEventListener('input', filterLoans);
confirmReturnButton.addEventListener('click', processReturnCode);
cancelReturnButton.addEventListener('click', cancelReturn);

// === INICIALIZACIÓN ===

// Llamar a la función para generar las opciones de computadores
generateComputerOptions();

// Cargar los préstamos al cargar la página
getLoans();

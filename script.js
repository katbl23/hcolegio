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

// Función para generar las opciones de los computadores
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
  
    // Hacer una solicitud POST para agregar el préstamo al servidor
    fetch('http://localhost:3000/loans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLoan),
    })
      .then(response => response.json())
      .then(() => {
        computerInput.value = '';
        userInput.value = '';
        alert('Préstamo registrado con éxito');
        getLoans(); // Obtener la lista actualizada de préstamos
      })
      .catch(error => {
        console.error('Error al registrar el préstamo:', error);
      });
  }
  
  // Función para obtener todos los préstamos desde el servidor
  function getLoans() {
    fetch('http://localhost:3000/loans')
      .then(response => response.json())
      .then(data => {
        loans = data;
        updateTable();
      })
      .catch(error => {
        console.error('Error al obtener los préstamos:', error);
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
function processReturnCode() {
  const code = returnCodeInput.value.trim();

  if (code === '') {
    alert('Por favor, ingresa el código de devolución.');
    return;
  }

  const loan = loans.find(loan => loan.id === currentLoanId);
  if (loan) {
    loan.returned = true;
    updateTable();
  }

  // Limpiar el código y cerrar el modal
  returnCodeInput.value = '';
  codeModal.style.display = 'none';
}

// Función para cancelar la operación de devolución
function cancelReturn() {
  returnCodeInput.value = '';
  codeModal.style.display = 'none';
}

// Función para actualizar la tabla HTML
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
// Código de devolución válido
const validReturnCode = "12345";

// Función para procesar el código de devolución
function processReturnCode() {
  const code = returnCodeInput.value.trim();

  // Verificar si el código ingresado es correcto
  if (code !== validReturnCode) {
    alert('Código de devolución incorrecto.');
    return;
  }

  // Si el código es correcto, marcamos el préstamo como devuelto
  const loan = loans.find(loan => loan.id === currentLoanId);
  if (loan) {
    loan.returned = true;
    updateTable();
  }

  // Limpiar el código y cerrar el modal
  returnCodeInput.value = '';
  codeModal.style.display = 'none';
}

// Eventos
addLoanButton.addEventListener('click', addLoan);
searchInput.addEventListener('input', filterLoans);
confirmReturnButton.addEventListener('click', processReturnCode);
cancelReturnButton.addEventListener('click', cancelReturn);

// Llamar a la función para generar las opciones de computadores
generateComputerOptions();

const API_URL = "http://127.0.0.1:5000";

const addBookBtn = document.getElementById("addBookBtn");
const updateBookBtn = document.getElementById("updateBookBtn");
const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const sortSelect = document.getElementById("sort");
const countSpan = document.getElementById("count");
const darkModeToggle = document.getElementById("darkModeToggle");
const alertBox = document.getElementById("alertBox");

let editingTitle = null;

// ✅ Show alert
function showAlert(message, type = "success") {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 2000);
}

// ✅ Load books
async function loadBooks() {
  const res = await fetch(`${API_URL}/books`);
  let books = await res.json();

  const sortBy = sortSelect.value;
  if (sortBy) {
    books.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }

  displayBooks(books);
}

function displayBooks(books) {
  bookList.innerHTML = "";
  countSpan.textContent = books.length;

  books.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <h3>${book.title}</h3>
      <p><b>Author:</b> ${book.author}</p>
      <p><b>Genre:</b> ${book.genre}</p>
      <p><b>Added:</b> ${book.timestamp || "N/A"}</p>
      <button onclick="editBook('${book.title}')">Edit</button>
      <button onclick="deleteBook('${book.title}')">Delete</button>
    `;
    bookList.appendChild(card);
  });
}

addBookBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const genre = document.getElementById("genre").value.trim();

  if (!title || !author || !genre) {
    showAlert("Please fill all fields!", "error");
    return;
  }

  const res = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({title, author, genre})
  });

  if (res.ok) {
    showAlert("✅ Book added successfully!");
  } else {
    showAlert("❌ Failed to add book", "error");
  }

  clearForm();
  loadBooks();
});

async function deleteBook(title) {
  const res = await fetch(`${API_URL}/delete`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({title})
  });

  if (res.ok) showAlert("🗑️ Book deleted successfully!");
  else showAlert("❌ Error deleting book", "error");

  loadBooks();
}

function editBook(title) {
  editingTitle = title;
  fetch(`${API_URL}/books`)
    .then(res => res.json())
    .then(books => {
      const book = books.find(b => b.title === title);
      if (book) {
        document.getElementById("title").value = book.title;
        document.getElementById("author").value = book.author;
        document.getElementById("genre").value = book.genre;

        addBookBtn.style.display = "none";
        updateBookBtn.style.display = "inline-block";
      }
    });
}

updateBookBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const genre = document.getElementById("genre").value.trim();

  const res = await fetch(`${API_URL}/update`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({oldTitle: editingTitle, title, author, genre})
  });

  if (res.ok) showAlert("✅ Book updated!");
  else showAlert("❌ Failed to update", "error");

  clearForm();
  loadBooks();
});

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("genre").value = "";
  addBookBtn.style.display = "inline-block";
  updateBookBtn.style.display = "none";
  editingTitle = null;
}

searchInput.addEventListener("input", async (e) => {
  const value = e.target.value.toLowerCase();
  const res = await fetch(`${API_URL}/books`);
  const books = await res.json();
  const filtered = books.filter(b => b.title.toLowerCase().includes(value) || b.author.toLowerCase().includes(value));
  displayBooks(filtered);
});

sortSelect.addEventListener("change", loadBooks);

// ✅ Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkModeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

loadBooks();

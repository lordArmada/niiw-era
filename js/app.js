// 🔍 SEARCH FILTER
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const hamburger = document.querySelector('.hamburger');
const searchToggle = document.querySelector('.search-toggle');
const themeToggle = document.querySelector('.theme-toggle');

// Add event listeners for accessibility buttons
hamburger.addEventListener('click', toggleMenu);
searchToggle.addEventListener('click', toggleSearch);
themeToggle.addEventListener('click', toggleTheme);

function applySearchFilter() {
  const query = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll(".product-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const name = card.querySelector(".product-name").textContent.toLowerCase();
    if (name.includes(query)) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  document.getElementById(
    "product-count"
  ).textContent = `Showing ${visibleCount} products`;
}

searchInput.addEventListener("input", applySearchFilter);
searchButton.addEventListener("click", applySearchFilter);

function toggleSearch() {
  const searchBar = document.getElementById("header-search");
  const isVisible = searchBar.style.display === "flex";
  searchBar.style.display = isVisible ? "none" : "flex";
}

function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update theme icon
  const themeIcon = document.getElementById('theme-icon');
  themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeIcon = document.getElementById('theme-icon');
  themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';


  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  function applySearchFilter() {
    const query = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".product-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = card
        .querySelector(".product-name")
        .textContent.toLowerCase();
      if (name.includes(query)) {
        card.style.display = "block";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    document.getElementById(
      "product-count"
    ).textContent = `Showing ${visibleCount} products`;
  }

  searchButton.addEventListener("click", applySearchFilter);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applySearchFilter();
  });
});

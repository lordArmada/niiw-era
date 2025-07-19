// 🔍 SEARCH FILTER
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

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

document.addEventListener("DOMContentLoaded", () => {
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

 function toggleTheme() {
   const root = document.documentElement;
   const icon = document.getElementById("theme-icon");
   const current = root.getAttribute("data-theme") || "dark";
   const next = current === "light" ? "dark" : "light";
   root.setAttribute("data-theme", next);
   icon.className = next === "light" ? "fas fa-sun" : "fas fa-moon";
   localStorage.setItem("theme", next);
 }

 function toggleMenu() {
   const nav = document.getElementById("mobile-nav");
   nav.classList.toggle("active");
 }

 document.addEventListener("DOMContentLoaded", () => {
   const saved = localStorage.getItem("theme");
   if (saved) {
     document.documentElement.setAttribute("data-theme", saved);
     document.getElementById("theme-icon").className =
       saved === "light" ? "fas fa-sun" : "fas fa-moon";
   }
 });
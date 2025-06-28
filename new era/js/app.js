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

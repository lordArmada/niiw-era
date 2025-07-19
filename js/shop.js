document.addEventListener("DOMContentLoaded", function () {
  const productsContainer = document.getElementById("products-container");
  const productCount = document.getElementById("product-count");
  const pagination = document.getElementById("pagination");
  const categoryLinks = document.querySelectorAll(".filter-list a");
  const priceRange = document.getElementById("price-range");
  const priceValue = document.getElementById("price-value");
  const sortSelect = document.getElementById("sort-by");
  const searchInput = document.getElementById("search-input");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("nav");
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  const sampleProducts = [
    {
      id: 1,
      name: "Classic White Tee",
      price: 29.99,
      old_price: 39.99,
      image: "../images/shop/product1.jpg",
      category: "tops",
      badge: "New",
      featured: true,
    },
    {
      id: 2,
      name: "Black Slim Jeans",
      price: 59.99,
      image: "../images/shop/product2.jpg",
      category: "bottoms",
    },
    {
      id: 3,
      name: "Summer Floral Dress",
      price: 79.99,
      old_price: 99.99,
      image: "../images/shop/product3.jpg",
      category: "dresses",
      badge: "Sale",
    },
    {
      id: 4,
      name: "Leather Crossbody Bag",
      price: 89.99,
      image: "../images/shop/product4.jpg",
      category: "accessories",
    },
    {
      id: 5,
      name: "Striped Button-Up Shirt",
      price: 49.99,
      image: "../images/shop/product5.jpg",
      category: "tops",
    },
    {
      id: 6,
      name: "High-Waisted Shorts",
      price: 39.99,
      old_price: 49.99,
      image: "../images/shop/product6.jpg",
      category: "bottoms",
      badge: "Sale",
    },
    {
      id: 7,
      name: "Maxi Wrap Dress",
      price: 89.99,
      image: "../images/shop/product7.jpg",
      category: "dresses",
      badge: "New",
    },
    {
      id: 8,
      name: "Gold Hoop Earrings",
      price: 24.99,
      image: "../images/shop/product8.jpg",
      category: "accessories",
    },
    {
      id: 9,
      name: "Oversized Sweater",
      price: 69.99,
      old_price: 89.99,
      image: "../images/shop/product9.jpg",
      category: "tops",
      badge: "Sale",
    },
  ];

  function renderProducts(products) {
    productsContainer.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = products.slice(start, start + itemsPerPage);

    paginated.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.dataset.category = product.category;
      productCard.dataset.price = product.price;

      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
          ${
            product.badge
              ? `<span class="product-badge">${product.badge}</span>`
              : ""
          }
          <button class="wishlist-btn" data-id="${
            product.id
          }"><i class="far fa-heart"></i></button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">
            ${
              product.old_price
                ? `<span class="old-price">$${product.old_price}</span>`
                : ""
            }
            <span class="current-price">$${product.price}</span>
          </div>
        </div>
      `;
      productsContainer.appendChild(productCard);
    });

    productCount.textContent = `Showing ${paginated.length} of ${products.length} products`;
    renderPagination(products.length);
    attachWishlistHandlers();
  }

  function renderPagination(total) {
    if (!pagination) return;
    pagination.innerHTML = "";
    const totalPages = Math.ceil(total / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        currentPage = i;
        applyFilters();
      });
      pagination.appendChild(btn);
    }
  }

  function attachWishlistHandlers() {
    document.querySelectorAll(".wishlist-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        alert(`Added product ${id} to wishlist 💖`);
      });
    });
  }

  function applyFilters() {
    const activeCategory =
      document.querySelector(".filter-list a.active")?.dataset.category ||
      "all";
    const maxPrice = parseFloat(priceRange.value) || 999;
    const searchTerm = searchInput?.value.toLowerCase() || "";
    const sortBy = sortSelect?.value || "newest";

    let filtered = allProducts.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchesPrice = product.price <= maxPrice;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesPrice && matchesSearch;
    });

    // Sorting
    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);

    renderProducts(filtered);
  }

  function setupListeners() {
    // Category
    categoryLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        categoryLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        currentPage = 1;
        applyFilters();
      });
    });

    // Price range
    priceRange?.addEventListener("input", () => {
      priceValue.textContent = `$${priceRange.value}`;
      currentPage = 1;
      applyFilters();
    });

    // Sort
    sortSelect?.addEventListener("change", () => {
      currentPage = 1;
      applyFilters();
    });

    // Search
    searchInput?.addEventListener("input", () => {
      currentPage = 1;
      applyFilters();
    });

    // Hamburger menu
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => {
        nav.classList.toggle("open");
      });
    }

    // Theme toggle
    if (themeToggle && themeIcon) {
      themeToggle.addEventListener("click", () => {
        const root = document.documentElement;
        const current = root.getAttribute("data-theme") || "dark";
        const next = current === "light" ? "dark" : "light";
        root.setAttribute("data-theme", next);
        themeIcon.className = next === "light" ? "fas fa-sun" : "fas fa-moon";
        localStorage.setItem("theme", next);
      });
    }

    // Load saved theme
    const saved = localStorage.getItem("theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
      themeIcon.className = saved === "light" ? "fas fa-sun" : "fas fa-moon";
    }
  }

  // Init
  function init() {
    allProducts = sampleProducts;
    setupListeners();
    applyFilters();
  }

  init();
});
function toggleMenu() {
  const nav = document.getElementById("mobile-nav");
  nav.classList.toggle("open");
}

const modal = document.querySelector(".quick-view-modal");
const modalClose = modal.querySelector(".modal-close");
const modalImg = modal.querySelector(".modal-image img");
const modalTitle = modal.querySelector(".modal-title");
const modalPrice = modal.querySelector(".modal-price");
const modalDesc = modal.querySelector(".modal-description");

// Your full product data
const productDetails = {
  1: {
    title: "Clover Expression Shirt",
    price: "$54.99",
    image: "./assets/images/IMG_4855.PNG",
    desc: `Step confidently into your journey with our "Clover Expression" shirt...`,
  },
  2: {
    title: "Fela Halftone Tee",
    price: "$59.99",
    image: "./assets/images/IMG_4856.PNG",
    desc: `Unleash your inner strength with our striking "Niiw Era" shirt...`,
  },
  3: {
    title: "Awolowo Tribute Tee",
    price: "$64.99",
    image: "./assets/images/IMG_4861.PNG",
    desc: `Wear your pride and history with our "Halftone of Awolowo" shirt...`,
  },
};

document.querySelectorAll(".btn-quick-view").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-id");
    const product = productDetails[id];

    modalImg.src = product.image;
    modalTitle.textContent = product.title;
    modalPrice.textContent = product.price;
    modalDesc.textContent = product.desc;

    modal.style.display = "flex";
  });
});

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("quick-view-modal")) {
    modal.style.display = "none";
  }
});

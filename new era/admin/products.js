document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
        return;
    }
    
    // API base URL
    const API_URL = 'http://localhost:5000/api';
    
    // Set up headers for API requests
    const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token
    };
    
    // Get user info
    fetch(`${API_URL}/auth/me`, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Not authorized');
            }
            return response.json();
        })
        .then(user => {
            if (user.role !== 'admin') {
                throw new Error('Admin access required');
            }
            
            // Set user name in header
            document.getElementById('user-name').textContent = user.name;
            
            // Load products
            loadProducts();
        })
        .catch(error => {
            console.error('Auth error:', error);
            localStorage.removeItem('token');
            window.location.href = '../pages/login.html';
        });
    
    // Logout
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '../pages/login.html';
    });
    
    // Products functions
    function loadProducts(page = 1) {
        const searchQuery = document.getElementById('search-products').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const sortBy = document.getElementById('sort-products').value;
        
        let url = `${API_URL}/shop/products?page=${page}&limit=10&sort=${sortBy}`;
        
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        if (categoryFilter !== 'all') {
            url += `&category=${categoryFilter}`;
        }
        
        if (statusFilter !== 'all') {
            if (statusFilter === 'in-stock') {
                url += '&min_stock=1';
            } else if (statusFilter === 'out-of-stock') {
                url += '&max_stock=0';
            } else if (statusFilter === 'featured') {
                url += '&featured=true';
            }
        }
        
        fetch(url, { headers })
            .then(res => res.json())
            .then(data => {
                const productsTable = document.getElementById('products-table');
                productsTable.innerHTML = '';
                
                if (data.products.length === 0) {
                    productsTable.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center">No products found</td>
                        </tr>
                    `;
                    return;
                }
                
                data.products.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="product-image-small">
                                <img src="${product.image ? `${API_URL}/${product.image}` : '../images/placeholder.jpg'}" alt="${product.name}">
                            </div>
                        </td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.stock > 0 ? `<span class="badge badge-success">${product.stock}</span>` : '<span class="badge badge-danger">Out of stock</span>'}</td>
                        <td>${product.featured ? '<span class="badge badge-featured">Featured</span>' : 'No'}</td>
                        <td>
                            <button class="btn btn-sm btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    productsTable.appendChild(row);
                });
                
                // Generate pagination
                generatePagination(data.total_pages, data.current_page, 'products-pagination');
                
                // Add event listeners to edit/delete buttons
                addProductActionListeners();
            })
            .catch(error => {
                console.error('Error loading products:', error);
                // For demo purposes, load sample products if API fails
                loadSampleProducts();
            });
    }
    
    function loadSampleProducts() {
        const sampleProducts = [
            {
                id: 1,
                name: 'Classic White Tee',
                category: 'tops',
                price: 29.99,
                old_price: 39.99,
                stock: 25,
                featured: true,
                image: '../images/shop/product1.jpg'
            },
            {
                id: 2,
                name: 'Black Slim Jeans',
                category: 'bottoms',
                price: 59.99,
                old_price: null,
                stock: 15,
                featured: false,
                image: '../images/shop/product2.jpg'
            },
            {
                id: 3,
                name: 'Summer Floral Dress',
                category: 'dresses',
                price: 79.99,
                old_price: 99.99,
                stock: 10,
                featured: true,
                image: '../images/shop/product3.jpg'
            },
            {
                id: 4,
                name: 'Leather Crossbody Bag',
                category: 'accessories',
                price: 89.99,
                old_price: null,
                stock: 5,
                featured: false,
                image: '../images/shop/product4.jpg'
            },
            {
                id: 5,
                name: 'Striped Button-Up Shirt',
                category: 'tops',
                price: 49.99,
                old_price: null,
                stock: 0,
                featured: false,
                image: '../images/shop/product5.jpg'
            }
        ];
        
        const productsTable = document.getElementById('products-table');
        productsTable.innerHTML = '';
        
        sampleProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="product-image-small">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock > 0 ? `<span class="badge badge-success">${product.stock}</span>` : '<span class="badge badge-danger">Out of stock</span>'}</td>
                <td>${product.featured ? '<span class="badge badge-featured">Featured</span>' : 'No'}</td>
                <td>
                    <button class="btn btn-sm btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productsTable.appendChild(row);
        });
        
        // Add event listeners to edit/delete buttons
        addProductActionListeners();
        
        // Generate sample pagination
        generatePagination(3, 1, 'products-pagination');
    }
    
    function addProductActionListeners() {
        // Edit product buttons
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                openProductModal('edit', productId);
            });
        });
        
        // Delete product buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                openConfirmModal(productId);
            });
        });
    }
    
    // Add new product button
    document.getElementById('add-product-btn').addEventListener('click', function() {
        openProductModal('add');
    });
    
    // Search, filter, and sort
    document.getElementById('search-products').addEventListener('input', debounce(function() {
        loadProducts();
    }, 500));
    
    document.getElementById('category-filter').addEventListener('change', function() {
        loadProducts();
    });
    
    document.getElementById('status-filter').addEventListener('change', function() {
        loadProducts();
    });
    
    document.getElementById('sort-products').addEventListener('change', function() {
        loadProducts();
    });
    
    function openProductModal(mode, productId = null) {
        const modal = document.getElementById('product-modal');
        const modalTitle = document.getElementById('product-modal-title');
        const form = document.getElementById('product-form');
        const imagePreview = document.getElementById('image-preview');
        
        // Reset form
        form.reset();
        imagePreview.innerHTML = '';
        
        // Set modal title
        modalTitle.textContent = mode === 'add' ? 'Add New Product' : 'Edit Product';
        
        // If editing, load product data
        if (mode === 'edit' && productId) {
            fetch(`${API_URL}/shop/products/${productId}`, { headers })
                .then(res => res.json())
                .then(product => {
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name').value = product.name;
                    document.getElementById('product-slug').value = product.slug;
                    document.getElementById('product-description').value = product.description;
                    document.getElementById('product-price').value = product.price;
                    document.getElementById('product-old-price').value = product.old_price || '';
                    document.getElementById('product-category').value = product.category;
                    document.getElementById('product-stock').value = product.stock;
                    document.getElementById('product-badge').value = product.badge || '';
                    document.getElementById('product-featured').checked = product.featured;
                    
                    // Show image preview
                    if (product.image) {
                        const img = document.createElement('img');
                        img.src = `${API_URL}/${product.image}`;
                        img.alt = 'Product image';
                        img.className = 'preview-image';
                        imagePreview.appendChild(img);
                    }
                })
                .catch(error => {
                    console.error('Error loading product data:', error);
                    
                    // For demo purposes, load sample product if API fails
                    const sampleProduct = {
                        id: productId,
                        name: 'Sample Product',
                        slug: 'sample-product',
                        description: 'This is a sample product description.',
                        price: 49.99,
                        old_price: 59.99,
                        category: 'tops',
                        stock: 10,
                        badge: 'New',
                        featured: true,
                        image: '../images/shop/product1.jpg'
                    };
                    
                    document.getElementById('product-id').value = sampleProduct.id;
                    document.getElementById('product-name').value = sampleProduct.name;
                    document.getElementById('product-slug').value = sampleProduct.slug;
                    document.getElementById('product-description').value = sampleProduct.description;
                    document.getElementById('product-price').value = sampleProduct.price;
                    document.getElementById('product-old-price').value = sampleProduct.old_price;
                    document.getElementById('product-category').value = sampleProduct.category;
                    document.getElementById('product-stock').value = sampleProduct.stock;
                    document.getElementById('product-badge').value = sampleProduct.badge;
                    document.getElementById('product-featured').checked = sampleProduct.featured;
                    
                    // Show image preview
                    const img = document.createElement('img');
                    img.src = sampleProduct.image;
                    img.alt = 'Product image';
                    img.className =
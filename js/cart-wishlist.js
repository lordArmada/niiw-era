// Cart and Wishlist Functionality

// Update cart count in header
function updateCartCount() {
    fetch('/php/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=count'
    })
    .then(response => response.json())
    .then(data => {
        const cartCount = document.querySelector('.cart span');
        cartCount.textContent = data.count || '0';
    });
}

// Update cart count
function updateCartCount() {
    fetch('/php/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=get'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.error) {
            cartCount.textContent = data.count;
        }
    });
}

// Add to cart
function addToCart(productId, quantity = 1) {
    fetch('/php/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=add&product_id=${productId}&quantity=${quantity}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount();
            showNotification(data.message, 'success');
        } else {
            showNotification(data.error, 'error');
        }
    });
}

// Toggle wishlist
function toggleWishlist(button, productId) {
    fetch('/php/wishlist.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=toggle&product_id=${productId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const icon = button.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            showNotification(data.message, 'success');
        } else {
            showNotification(data.error, 'error');
        }
    });
}

// Check wishlist status
function checkWishlistStatus(productId) {
    return fetch('/php/wishlist.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=check&product_id=${productId}`
    })
    .then(response => response.json())
    .then(data => data.in_wishlist);
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize wishlist buttons
wishlistButtons.forEach(button => {
    const productId = button.closest('form').querySelector('[name="product_id"]').value;
    
    // Check initial wishlist status
    checkWishlistStatus(productId).then(inWishlist => {
        const icon = button.querySelector('i');
        if (inWishlist) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
    });
    
    // Add click event
    button.addEventListener('click', (e) => {
        e.preventDefault();
        toggleWishlist(button, productId);
    });
});

// Initialize cart count
updateCartCount();
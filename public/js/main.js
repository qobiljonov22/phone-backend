// API Base URL
const API_BASE = window.location.origin;

// Load featured products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Mahsulotlar yuklanmoqda...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/featured`);
        const data = await response.json();
        
        if (data.phones && data.phones.length > 0) {
            container.innerHTML = data.phones.map(phone => {
                const discount = phone.discount || (phone.originalPriceInSom && phone.priceInSom ? 
                    Math.round(((phone.originalPriceInSom - phone.priceInSom) / phone.originalPriceInSom) * 100) : 0);
                const displayPrice = phone.priceFormatted || phone.priceInSom?.toLocaleString('uz-UZ') + ' so\'m' || phone.price?.toLocaleString('uz-UZ') + ' so\'m';
                const displayOriginalPrice = phone.originalPriceFormatted || phone.originalPriceInSom?.toLocaleString('uz-UZ') + ' so\'m' || phone.originalPrice?.toLocaleString('uz-UZ') + ' so\'m';
                
                return `
                <div class="product-card" onclick="viewProduct('${phone.id}')">
                    <div class="product-image">
                        <img src="${phone.mainImage || phone.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                             alt="${phone.displayName || phone.brand + ' ' + phone.model}" 
                             onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${phone.displayName || phone.brand + ' ' + phone.model}</h3>
                        <div class="product-price">
                            ${phone.originalPriceInSom && phone.originalPriceInSom > phone.priceInSom ? 
                                `<span class="old-price">${displayOriginalPrice}</span>` : ''}
                            <span class="current-price">${displayPrice}</span>
                        </div>
                        <div class="product-rating">
                            <span>⭐ ${phone.rating || 0}</span>
                            <span>(${phone.reviews || 0} ta sharh)</span>
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${phone.id}', '${phone.displayName || phone.brand + ' ' + phone.model}', ${phone.priceInSom || phone.price || 0})">
                            <i class="fas fa-shopping-cart"></i> Savatga
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            container.innerHTML = '<p>Hozircha mahsulotlar mavjud emas</p>';
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        const container = document.getElementById('featuredProducts');
        if (container) {
            container.innerHTML = '<p>Mahsulotlarni yuklashda xatolik yuz berdi</p>';
        }
    }
}

// Load categories
async function loadCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Kategoriyalar yuklanmoqda...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
            container.innerHTML = data.categories.map(category => `
                <div class="category-card" onclick="filterByCategory('${category.id}')">
                    <div class="category-icon">${category.icon || '📱'}</div>
                    <h3>${category.name}</h3>
                    <p>${category.count || 0} ta mahsulot</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Kategoriyalar mavjud emas</p>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        const container = document.getElementById('categoriesGrid');
        if (container) {
            container.innerHTML = '<p>Kategoriyalarni yuklashda xatolik yuz berdi</p>';
        }
    }
}

// Load brands
async function loadBrands() {
    const container = document.getElementById('brandsGrid');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Brendlar yuklanmoqda...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/brands`);
        const data = await response.json();
        
        if (data.brands && data.brands.length > 0) {
            container.innerHTML = data.brands.map(brand => `
                <div class="brand-card" onclick="filterByBrand('${brand}')">
                    <h3>${brand}</h3>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Brendlar mavjud emas</p>';
        }
    } catch (error) {
        console.error('Error loading brands:', error);
        const container = document.getElementById('brandsGrid');
        if (container) {
            container.innerHTML = '<p>Brendlarni yuklashda xatolik yuz berdi</p>';
        }
    }
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Load data on page load
    loadFeaturedProducts();
    loadCategories();
    loadBrands();
    loadCartCount();
});

// Perform search
async function performSearch() {
    const query = document.getElementById('searchInput')?.value;
    if (!query) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        // Redirect to catalog with search results
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
    } catch (error) {
        console.error('Search error:', error);
        alert('Qidiruvda xatolik yuz berdi');
    }
}

// Filter by brand
function filterByBrand(brand) {
    window.location.href = `catalog.html?brand=${encodeURIComponent(brand)}`;
}

// Filter by category
function filterByCategory(category) {
    window.location.href = `catalog.html?category=${encodeURIComponent(category)}`;
}

// View product
function viewProduct(phoneId) {
    window.location.href = `product.html?id=${phoneId}`;
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function addToCart(phoneId, name, price) {
    const existingItem = cart.find(item => item.phoneId === phoneId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            phoneId,
            name,
            price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartCount();
    
    // Show notification
    showNotification('Mahsulot savatga qo\'shildi!');
}

function loadCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function openCart() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;
    
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Savatcha bo\'sh</p>';
        if (cartTotal) cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toLocaleString()} so'm x ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateCartItem('${item.phoneId}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItem('${item.phoneId}', ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart('${item.phoneId}')" class="remove-btn">🗑️</button>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = total.toLocaleString();
    }
    
    modal.style.display = 'block';
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateCartItem(phoneId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(phoneId);
        return;
    }
    
    const item = cart.find(item => item.phoneId === phoneId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        openCart();
        loadCartCount();
    }
}

function removeFromCart(phoneId) {
    cart = cart.filter(item => item.phoneId !== phoneId);
    localStorage.setItem('cart', JSON.stringify(cart));
    openCart();
    loadCartCount();
}

function openProfile() {
    alert('Profil sahifasi tez orada qo\'shiladi');
}

// Notification function
function showNotification(message) {
    // Simple notification - you can enhance this with a toast library
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const cartModal = document.getElementById('cartModal');
    if (event.target === cartModal) {
        closeCart();
    }
}

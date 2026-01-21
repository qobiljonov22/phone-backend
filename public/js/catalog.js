// Catalog page functionality
const API_BASE = window.location.origin;

let currentPage = 1;
let currentFilters = {
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: ''
};

// Load brands for filter
async function loadBrands() {
    try {
        const response = await fetch(`${API_BASE}/api/brands`);
        const data = await response.json();
        
        const brandFilter = document.getElementById('brandFilter');
        if (brandFilter && data.brands) {
            data.brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

// Load products
async function loadProducts(page = 1) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Mahsulotlar yuklanmoqda...</div>';
    
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 12
        });
        
        if (currentFilters.brand) params.append('brand', currentFilters.brand);
        if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
        if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
        if (currentFilters.sort) params.append('sort', currentFilters.sort);
        
        const response = await fetch(`${API_BASE}/api/phones?${params}`);
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
            
            // Update pagination
            updatePagination(data.pagination);
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">Mahsulotlar topilmadi</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Mahsulotlarni yuklashda xatolik yuz berdi</p>';
    }
}

// Update pagination
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer || !pagination) return;
    
    if (pagination.pages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '<div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;">';
    
    // Previous button
    if (pagination.page > 1) {
        html += `<button onclick="loadProducts(${pagination.page - 1})" style="padding: 8px 15px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">Oldingi</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            html += `<button style="padding: 8px 15px; border: 1px solid #2196F3; background: #2196F3; color: white; border-radius: 5px; cursor: pointer;">${i}</button>`;
        } else {
            html += `<button onclick="loadProducts(${i})" style="padding: 8px 15px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">${i}</button>`;
        }
    }
    
    // Next button
    if (pagination.page < pagination.pages) {
        html += `<button onclick="loadProducts(${pagination.page + 1})" style="padding: 8px 15px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">Keyingi</button>`;
    }
    
    html += '</div>';
    paginationContainer.innerHTML = html;
}

// Apply filters
function applyFilters() {
    currentFilters.brand = document.getElementById('brandFilter')?.value || '';
    currentFilters.minPrice = document.getElementById('minPrice')?.value || '';
    currentFilters.maxPrice = document.getElementById('maxPrice')?.value || '';
    currentFilters.sort = document.getElementById('sortFilter')?.value || '';
    
    currentPage = 1;
    loadProducts(currentPage);
}

// Filter by brand
function filterByBrand(brand) {
    if (document.getElementById('brandFilter')) {
        document.getElementById('brandFilter').value = brand;
    }
    applyFilters();
}

// Filter by category
function filterByCategory(category) {
    // You can add category filter logic here
    loadProducts(1);
}

// View product
function viewProduct(phoneId) {
    window.location.href = `product.html?id=${phoneId}`;
}

// Check URL parameters
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const search = urlParams.get('search');
    if (search) {
        document.getElementById('searchInput').value = search;
        performSearch();
        return;
    }
    
    const brand = urlParams.get('brand');
    if (brand) {
        filterByBrand(brand);
        return;
    }
    
    const category = urlParams.get('category');
    if (category) {
        filterByCategory(category);
        return;
    }
    
    // Load products if no filters
    loadProducts();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadBrands();
    checkUrlParams();
    
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
});

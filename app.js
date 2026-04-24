/**
 * ============================================
 * ZIGZEX MART - Advanced Application Logic
 * Feature: Profile Editing, Real-Time Search, Cinematic UI, WhatsApp Checkout
 * ============================================
 */

// --- 1. GLOBAL STATE & DATABASE ---
let AppState = {
    products: window.ZigzexData ? window.ZigzexData.products : [],
    filteredProducts: [],
    currentUser: null,
    cart: [],
    wishlist: [],
    orderHistory: []
};

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadDataFromStorage();
    AppState.filteredProducts = [...AppState.products];
    
    updateNavbarUI();
    renderTrendingProducts();
    renderNewArrivals();
    renderCart();
    populateBrandFilter();
    updateCartBadges();
    updateWishlistBadges();
    startFlashSaleTimer();
    initScrollAnimations();
    
    setupEventListeners();
    showPage('home');
}

// --- 3. UI UTILITIES & ANIMATIONS ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toastIcon.className = type === 'error' ? 'fas fa-exclamation-circle toast-icon text-danger' : 'fas fa-check-circle toast-icon text-success';
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showLoader(show = true) {
    const loader = document.getElementById('loadingOverlay');
    if(loader) show ? loader.classList.remove('hidden') : loader.classList.add('hidden');
}

function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }
function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-text');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-anim').forEach(el => observer.observe(el));
}

// --- 4. SPA ROUTING ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (pageId === 'products') applyFilters(); 
    else if (pageId === 'cart') renderCart();
    else if (pageId === 'profile') {
        if (!AppState.currentUser) return showPage('login');
        renderProfilePage(); // <--- This will now build the whole form safely!
    } else if (pageId === 'orders') {
        if (!AppState.currentUser) return showPage('login');
        renderOrders();
    } else if (pageId === 'wishlist') {
        if (!AppState.currentUser) return showPage('login');
        renderWishlist();
    }
}

function goBack() { showPage('products'); }

// --- 5. AUTHENTICATION & STORAGE ---
function loadDataFromStorage() {
    const storedUser = localStorage.getItem('zigzex_currentUser');
    if (storedUser) {
        AppState.currentUser = JSON.parse(storedUser);
        const userCart = localStorage.getItem(`zigzex_cart_${AppState.currentUser.email}`);
        const userWishlist = localStorage.getItem(`zigzex_wishlist_${AppState.currentUser.email}`);
        const userOrders = localStorage.getItem(`zigzex_orders_${AppState.currentUser.email}`);
        
        if (userCart) AppState.cart = JSON.parse(userCart);
        if (userWishlist) AppState.wishlist = JSON.parse(userWishlist);
        if (userOrders) AppState.orderHistory = JSON.parse(userOrders);
    }
}

function saveDataToStorage() {
    if (AppState.currentUser) {
        localStorage.setItem(`zigzex_cart_${AppState.currentUser.email}`, JSON.stringify(AppState.cart));
        localStorage.setItem(`zigzex_wishlist_${AppState.currentUser.email}`, JSON.stringify(AppState.wishlist));
        localStorage.setItem(`zigzex_orders_${AppState.currentUser.email}`, JSON.stringify(AppState.orderHistory));
    }
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const mobile = document.getElementById('signupMobile').value;
    const password = document.getElementById('signupPassword').value;
    
    let users = JSON.parse(localStorage.getItem('zigzex_users')) || [];
    if (users.find(u => u.email === email)) return showToast('Email already registered! Please log in.', 'error');
    
    users.push({ name, email, mobile, password, joinDate: new Date().toISOString() });
    localStorage.setItem('zigzex_users', JSON.stringify(users));
    
    document.getElementById('signupForm').reset();
    showToast('Account created successfully! Please log in.');
    showPage('login');
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    let users = JSON.parse(localStorage.getItem('zigzex_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        AppState.currentUser = { name: user.name, email: user.email, mobile: user.mobile };
        localStorage.setItem('zigzex_currentUser', JSON.stringify(AppState.currentUser));
        
        document.getElementById('loginForm').reset();
        loadDataFromStorage(); 
        updateNavbarUI();
        updateCartBadges();
        updateWishlistBadges();
        showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
        showPage('home');
    } else {
        showToast('Invalid email or password', 'error');
    }
}

function handleLogout() {
    saveDataToStorage(); 
    localStorage.removeItem('zigzex_currentUser');
    AppState.currentUser = null;
    AppState.cart = []; AppState.wishlist = []; AppState.orderHistory = [];
    
    updateNavbarUI(); updateCartBadges(); updateWishlistBadges();
    showToast('Logged out successfully');
    showPage('home');
}

function updateNavbarUI() {
    const isLogged = !!AppState.currentUser;
    const name = isLogged ? AppState.currentUser.name.split(' ')[0] : 'Sign In';
    
    document.getElementById('userDropdownLoggedOut').classList.toggle('hidden', isLogged);
    document.getElementById('userDropdownLoggedIn').classList.toggle('hidden', !isLogged);
    document.getElementById('userNameDisplay').textContent = name;
    if(isLogged) document.getElementById('greetingName').textContent = name;
    
    // Mobile Nav
    document.getElementById('mobileUserLoggedOut').classList.toggle('hidden', isLogged);
    document.getElementById('mobileUserLoggedIn').classList.toggle('hidden', !isLogged);
    document.getElementById('mobileLogoutBtn').classList.toggle('hidden', !isLogged);
    if(isLogged) document.getElementById('mobileGreetingName').textContent = AppState.currentUser.name;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    const icon = input.nextElementSibling;
    icon.classList.toggle('fa-eye'); icon.classList.toggle('fa-eye-slash');
}

// --- 6. ADVANCED PROFILE EDITING (COMPLETELY FIXED) ---
function renderProfilePage() {
    const container = document.getElementById('profileContentArea');
    if(!container) return;

    container.innerHTML = `
        <div class="text-center mb-4">
            <div class="avatar-lg mx-auto mb-3" style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <i class="fas fa-user"></i>
            </div>
            <h2 class="mt-3">${AppState.currentUser.name}</h2>
            <p class="text-secondary">${AppState.currentUser.email}</p>
            <p class="text-secondary">+91 ${AppState.currentUser.mobile}</p>
        </div>

        <div class="text-left" style="border-top: 1px solid var(--border-color); padding-top: 2rem; margin-top: 2rem;">
            <h3 class="mb-4 pb-2" style="border-bottom: 1px solid var(--border-color);">Edit Profile Information</h3>
            <form id="editProfileForm" class="modern-form" onsubmit="handleProfileUpdate(event)">
                <div class="form-row-2">
                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" id="editName" class="glass-input" value="${AppState.currentUser.name}" required>
                    </div>
                    <div class="input-group">
                        <label>Mobile Number</label>
                        <input type="tel" id="editMobile" class="glass-input" value="${AppState.currentUser.mobile}" pattern="[0-9]{10}" required>
                    </div>
                </div>
                <button type="submit" class="action-btn primary mt-3"><i class="fas fa-save"></i> Save Changes</button>
            </form>

            <h3 class="mt-5 mb-4 pb-2" style="border-bottom: 1px solid var(--border-color);">Change Password</h3>
            <form id="changePasswordForm" class="modern-form" onsubmit="handlePasswordChange(event)">
                <div class="form-row-2">
                    <div class="input-group">
                        <label>Current Password</label>
                        <input type="password" id="currentPwd" class="glass-input" required>
                    </div>
                    <div class="input-group">
                        <label>New Password</label>
                        <input type="password" id="newPwd" class="glass-input" minlength="6" placeholder="Min 6 chars" required>
                    </div>
                </div>
                <button type="submit" class="action-btn secondary mt-3"><i class="fas fa-key"></i> Update Password</button>
            </form>
        </div>
        
        <div class="mt-5 flex-center gap-3" style="border-top: 1px solid var(--border-color); padding-top: 2rem;">
            <button class="action-btn secondary" onclick="showPage('orders')">View Orders</button>
            <button class="action-btn secondary text-danger" onclick="handleLogout()">Logout</button>
        </div>
    `;
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = document.getElementById('editName').value;
    const newMobile = document.getElementById('editMobile').value;
    
    AppState.currentUser.name = newName;
    AppState.currentUser.mobile = newMobile;
    localStorage.setItem('zigzex_currentUser', JSON.stringify(AppState.currentUser));
    
    let users = JSON.parse(localStorage.getItem('zigzex_users'));
    let userIndex = users.findIndex(u => u.email === AppState.currentUser.email);
    if(userIndex > -1) {
        users[userIndex].name = newName;
        users[userIndex].mobile = newMobile;
        localStorage.setItem('zigzex_users', JSON.stringify(users));
    }
    
    updateNavbarUI();
    renderProfilePage(); 
    showToast('Profile updated successfully!');
}

function handlePasswordChange(e) {
    e.preventDefault();
    const currentPwd = document.getElementById('currentPwd').value;
    const newPwd = document.getElementById('newPwd').value;
    
    let users = JSON.parse(localStorage.getItem('zigzex_users'));
    let userIndex = users.findIndex(u => u.email === AppState.currentUser.email);
    
    if(userIndex > -1) {
        if(users[userIndex].password !== currentPwd) return showToast('Current password is incorrect!', 'error');
        
        users[userIndex].password = newPwd;
        localStorage.setItem('zigzex_users', JSON.stringify(users));
        document.getElementById('changePasswordForm').reset();
        showToast('Password changed successfully!');
    }
}

// --- 7. EVENT LISTENERS & TIMERS ---
function setupEventListeners() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('mainNavbar');
        if (window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if(searchInput) searchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value, 'searchResultsDropdown'));
    if(mobileSearchInput) mobileSearchInput.addEventListener('input', (e) => handleLiveSearch(e.target.value, 'mobileSearchResultsDropdown'));
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-section')) document.getElementById('userDropdown').classList.remove('active');
        if (!e.target.closest('.navbar-search')) document.getElementById('searchResultsDropdown').classList.remove('active');
        if (!e.target.closest('.mobile-search-bar')) document.getElementById('mobileSearchResultsDropdown').classList.remove('active');
    });
}

function toggleUserMenu() { document.getElementById('userDropdown').classList.toggle('active'); }
function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('active'); document.getElementById('mobileMenuToggle').classList.toggle('active'); }
function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('active'); document.getElementById('mobileMenuToggle').classList.remove('active'); }

function startFlashSaleTimer() {
    let time = 12 * 3600 + 45 * 60 + 30; 
    setInterval(() => {
        time--;
        const hEl = document.getElementById('hours');
        if(hEl) {
            hEl.textContent = Math.floor(time / 3600).toString().padStart(2, '0');
            document.getElementById('minutes').textContent = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
            document.getElementById('seconds').textContent = (time % 60).toString().padStart(2, '0');
        }
    }, 1000);
}

// --- 8. ADVANCED REAL-TIME SEARCH ---
function handleLiveSearch(query, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!query.trim()) {
        dropdown.classList.remove('active');
        return;
    }
    
    const term = query.toLowerCase();
    const results = AppState.products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    ).slice(0, 6); 
    
    if (results.length === 0) {
        dropdown.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary);"><i class="fas fa-search" style="font-size:2rem; color:var(--border-color); margin-bottom:10px; display:block;"></i>No products found</div>';
    } else {
        const { formatCurrency } = window.ZigzexData;
        dropdown.innerHTML = results.map(p => `
            <div class="search-result-item" onclick="openProductDetail('${p.id}'); document.getElementById('${dropdownId}').classList.remove('active');">
                <img src="${p.image}" class="search-result-img" alt="${p.name}">
                <div class="search-result-info">
                    <h4>${p.name}</h4>
                    <p class="text-primary">${formatCurrency(p.currentPrice)} <span style="font-size:0.75rem; color:var(--text-tertiary); margin-left:5px; text-decoration:line-through;">${p.discount > 0 ? formatCurrency(p.originalPrice) : ''}</span></p>
                </div>
            </div>
        `).join('');
        dropdown.innerHTML += `
            <div class="view-all-results" onclick="performSearch('${query}')">
                See all results for "${query}" <i class="fas fa-arrow-right" style="margin-left:5px;"></i>
            </div>
        `;
    }
    dropdown.classList.add('active');
}

function performSearch(forcedQuery = null) {
    const inputId = window.innerWidth > 768 ? 'searchInput' : 'mobileSearchInput';
    const query = forcedQuery || document.getElementById(inputId).value;
    
    document.getElementById('searchResultsDropdown').classList.remove('active');
    document.getElementById('mobileSearchResultsDropdown').classList.remove('active');
    
    clearAllFilters(false); 
    
    const term = query.toLowerCase();
    AppState.filteredProducts = AppState.products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
    
    showPage('products');
    renderProductsGrid();
}

// --- 9. PRODUCT RENDERING & FILTERS ---
function renderProductCard(product) {
    const { formatCurrency } = window.ZigzexData;
    const isWishlisted = AppState.wishlist.some(item => item.id === product.id);
    
    return `
        <div class="product-card glass-panel">
            <div class="card-badges">
                ${product.isNew ? '<span class="card-badge new">New</span>' : ''}
                ${product.discount > 0 ? `<span class="card-badge discount pulse-anim">-${product.discount}%</span>` : ''}
            </div>
            <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${product.id}', event)">
                <i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i>
            </button>
            <div class="card-image-wrapper" onclick="openProductDetail('${product.id}')">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-info">
                <span class="card-brand">${product.brand}</span>
                <h3 class="card-title" onclick="openProductDetail('${product.id}')">${product.name}</h3>
                <div class="card-rating">
                    <div class="stars">${generateStars(product.rating)}</div>
                    <span>(${product.reviews})</span>
                </div>
                <div class="card-price-row">
                    <span class="card-price">${formatCurrency(product.currentPrice)}</span>
                    ${product.discount > 0 ? `<span class="card-price-old">${formatCurrency(product.originalPrice)}</span>` : ''}
                </div>
                <button class="card-add-btn" onclick="addToCart('${product.id}')">
                    <i class="fas fa-cart-plus"></i> Add
                </button>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) starsHtml += '<i class="fas fa-star"></i>';
        else if (i === fullStars && hasHalfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
        else starsHtml += '<i class="far fa-star"></i>';
    }
    return starsHtml;
}

function renderTrendingProducts() {
    const container = document.getElementById('trendingGrid');
    if(!container) return;
    const trending = [...AppState.products].sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews)).slice(0, 8);
    container.innerHTML = trending.map(p => renderProductCard(p)).join('');
}

function renderNewArrivals() {
    const container = document.getElementById('newArrivalsGrid');
    if(!container) return;
    const newItems = AppState.products.filter(p => p.isNew).slice(0, 8);
    container.innerHTML = newItems.map(p => renderProductCard(p)).join('');
}

function populateBrandFilter() {
    const { brandMap } = window.ZigzexData;
    const container = document.getElementById('brandFilterOptions');
    if(!container) return;
    
    let allBrands = [];
    Object.values(brandMap).forEach(brands => allBrands = [...allBrands, ...brands]);
    container.innerHTML = allBrands.map(brand => `
        <label class="custom-checkbox">
            <input type="checkbox" value="${brand}" class="brand-checkbox" onchange="applyFilters()">
            <span class="checkmark"></span> ${brand}
        </label>
    `).join('');
}

function filterByCategory(category) {
    clearAllFilters(false);
    const categoryCheckboxes = document.querySelectorAll(`input[value="${category}"]`);
    categoryCheckboxes.forEach(cb => { 
        if(cb.closest('.filter-group').querySelector('h4').textContent.includes('Category')) cb.checked = true; 
    });
    applyFilters();
    showPage('products');
}

function toggleFilters() { document.getElementById('filtersSidebar').classList.toggle('show'); }

function clearAllFilters(reRender = true) {
    document.querySelectorAll('.custom-checkbox input').forEach(cb => cb.checked = false);
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'relevance';
    if(reRender) applyFilters();
}

function applyFilters() {
    let result = [...AppState.products];
    const checkedCategories = Array.from(document.querySelectorAll('input[value="Electronics"], input[value="Fashion"], input[value="Home"], input[value="Accessories"]')).filter(cb => cb.checked).map(cb => cb.value);
    if (checkedCategories.length > 0) result = result.filter(p => checkedCategories.includes(p.category));
    
    const checkedBrands = Array.from(document.querySelectorAll('.brand-checkbox')).filter(cb => cb.checked).map(cb => cb.value);
    if (checkedBrands.length > 0) result = result.filter(p => checkedBrands.includes(p.brand));
    
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || 9999999;
    result = result.filter(p => p.currentPrice >= minPrice && p.currentPrice <= maxPrice);
    
    AppState.filteredProducts = result;
    sortProducts(document.getElementById('sortSelect').value, false);
    renderProductsGrid();
}

function sortProducts(sortType, reRender = true) {
    let arr = AppState.filteredProducts;
    switch(sortType) {
        case 'price-low': arr.sort((a, b) => a.currentPrice - b.currentPrice); break;
        case 'price-high': arr.sort((a, b) => b.currentPrice - a.currentPrice); break;
        case 'rating': arr.sort((a, b) => b.rating - a.rating); break;
        default: arr.sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1])); break;
    }
    if(reRender) renderProductsGrid();
}

function renderProductsGrid() {
    const grid = document.getElementById('allProductsGrid');
    const noResults = document.getElementById('noResults');
    const countDisplay = document.getElementById('resultsCount');
    
    if(!grid) return;
    countDisplay.textContent = AppState.filteredProducts.length;
    
    if (AppState.filteredProducts.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
    } else {
        grid.classList.remove('hidden');
        noResults.classList.add('hidden');
        grid.innerHTML = AppState.filteredProducts.map(p => renderProductCard(p)).join('');
    }
}

// --- 10. PRODUCT DETAIL PAGE & API REVIEWS ---
async function openProductDetail(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    showLoader(true);
    
    try {
        const reviews = await window.ZigzexData.fetchProductReviewsAPI(productId);
        const { formatCurrency } = window.ZigzexData;
        const isWishlisted = AppState.wishlist.some(item => item.id === product.id);
        
        const container = document.getElementById('productDetailContent');
        container.innerHTML = `
            <div class="pd-grid glass-panel">
                <div class="pd-img-box">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="pd-info-sec">
                    <span class="pd-brand">${product.brand}</span>
                    <h1 class="pd-title">${product.name}</h1>
                    <div class="pd-rating">
                        <div class="stars" style="font-size: 1.2rem;">${generateStars(product.rating)}</div>
                        <span style="font-weight: 700; color: var(--text-primary);">${product.rating}</span>
                        <span class="text-secondary">(${product.reviews} verified ratings)</span>
                    </div>
                    <div class="pd-price-wrap">
                        <span class="pd-price">${formatCurrency(product.currentPrice)}</span>
                        ${product.discount > 0 ? `
                            <span class="pd-old-price">${formatCurrency(product.originalPrice)}</span>
                            <span class="pd-discount-badge pulse-anim">${product.discount}% OFF</span>
                        ` : ''}
                    </div>
                    <p class="pd-desc">${product.description}</p>
                    <div class="pd-action-row">
                        <button class="action-btn primary pd-cart-btn" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                        <button class="pd-wish-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${product.id}', event)">
                            <i class="fa${isWishlisted ? 's' : 'r'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="pd-features">
                        ${product.features.map(f => `<div class="pd-feature"><i class="fas fa-check-circle text-success"></i><span>${f}</span></div>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="reviews-section glass-panel mt-5" style="padding: 2rem;">
                <h3 style="font-size: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom:1rem;">Customer Reviews</h3>
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    ${reviews.map(rev => `
                        <div class="review-item border-bottom pb-2">
                            <div class="review-header flex-between mb-2">
                                <div class="reviewer flex-center gap-3">
                                    <div class="reviewer-initial avatar-sm" style="background:var(--bg-alt); color:var(--primary); font-weight:bold;">${rev.user.charAt(0)}</div>
                                    <div>
                                        <h5 style="margin: 0; font-size: 1rem;">${rev.user} ${rev.verifiedPurchase ? '<i class="fas fa-check-circle text-success" style="font-size: 0.8rem; margin-left: 5px;"></i>' : ''}</h5>
                                        <div class="stars" style="font-size: 0.8rem;">${generateStars(rev.rating)}</div>
                                    </div>
                                </div>
                                <span class="text-tertiary" style="font-size: 0.85rem;">${rev.date}</span>
                            </div>
                            <p class="text-secondary">${rev.text}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Render Related Products
        const relatedContainer = document.getElementById('relatedProductsGrid');
        const related = AppState.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
        if(relatedContainer) relatedContainer.innerHTML = related.map(p => renderProductCard(p)).join('');
        
        showLoader(false);
        showPage('productDetail');
    } catch (error) {
        showLoader(false);
        showToast('Failed to load product details', 'error');
    }
}

// --- 11. CART & WISHLIST LOGIC ---
function addToCart(productId) {
    if (!AppState.currentUser) return openModal('loginModal');
    
    const product = AppState.products.find(p => p.id === productId);
    const existingItem = AppState.cart.find(item => item.id === productId);
    
    if (existingItem) existingItem.qty += 1;
    else AppState.cart.push({ ...product, qty: 1 });
    
    saveDataToStorage();
    updateCartBadges();
    showToast(`${product.name} added to cart!`);
}

function updateQuantity(productId, delta) {
    const itemIndex = AppState.cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        AppState.cart[itemIndex].qty += delta;
        if (AppState.cart[itemIndex].qty <= 0) {
            removeFromCart(productId);
            return;
        }
        saveDataToStorage();
        updateCartBadges();
        renderCart(); 
    }
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    saveDataToStorage();
    updateCartBadges();
    renderCart();
    showToast('Item removed from cart');
}

function updateCartBadges() {
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartBadge').textContent = totalItems;
    document.getElementById('mobileMenuCartBadge').textContent = totalItems;
}

function toggleWishlist(productId, event) {
    event.stopPropagation(); 
    if (!AppState.currentUser) return openModal('loginModal');
    
    const index = AppState.wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        AppState.wishlist.splice(index, 1);
        showToast('Removed from Wishlist');
    } else {
        AppState.wishlist.push(AppState.products.find(p => p.id === productId));
        showToast('Added to Wishlist');
    }
    
    saveDataToStorage();
    updateWishlistBadges();
    
    if (document.getElementById('productsPage').classList.contains('active')) renderProductsGrid();
    if (document.getElementById('homePage').classList.contains('active')) { renderTrendingProducts(); renderNewArrivals(); }
    if (document.getElementById('wishlistPage').classList.contains('active')) renderWishlist();
    if (document.getElementById('productDetailPage').classList.contains('active')) {
        const relatedContainer = document.getElementById('relatedProductsGrid');
        if(relatedContainer) {
            const btns = relatedContainer.querySelectorAll(`[onclick*="${productId}"]`);
            btns.forEach(btn => {
                if(btn.classList.contains('card-wishlist-btn')) {
                    btn.classList.toggle('active');
                    btn.querySelector('i').className = btn.classList.contains('active') ? 'fas fa-heart' : 'far fa-heart';
                }
            });
        }
    }
}

function updateWishlistBadges() {
    const total = AppState.wishlist.length;
    document.getElementById('wishlistBadge').textContent = total;
    document.getElementById('mobileMenuWishlistBadge').textContent = total;
}

function renderCart() {
    const { formatCurrency } = window.ZigzexData;
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const listContainer = document.getElementById('cartItemsList');
    
    if (AppState.cart.length === 0) {
        emptyCart.classList.remove('hidden');
        cartItems.classList.add('hidden');
        cartSummary.classList.add('hidden');
        return;
    }
    
    emptyCart.classList.add('hidden');
    cartItems.classList.remove('hidden');
    cartSummary.classList.remove('hidden');
    
    let subtotalOriginal = 0; let subtotalCurrent = 0; let totalItems = 0;
    
    listContainer.innerHTML = AppState.cart.map(item => {
        subtotalOriginal += (item.originalPrice * item.qty);
        subtotalCurrent += (item.currentPrice * item.qty);
        totalItems += item.qty;
        
        return `
            <div class="cart-item glass-panel">
                <div class="cart-img-box"><img src="${item.image}" alt="${item.name}"></div>
                <div class="cart-item-details">
                    <div class="flex-between" style="align-items:flex-start;">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">${formatCurrency(item.currentPrice * item.qty)}</div>
                    </div>
                    <div style="color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 1rem;">${formatCurrency(item.currentPrice)} / each</div>
                    <div class="cart-controls">
                        <div class="qty-selector">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <input type="text" class="qty-val" value="${item.qty}" readonly>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-btn action-btn secondary" style="padding:0.4rem 0.8rem; border-color:var(--danger); color:var(--danger);" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const discount = subtotalOriginal - subtotalCurrent;
    const delivery = subtotalCurrent > 1000 ? 0 : 99; 
    const totalPayable = subtotalCurrent + delivery;
    
    document.getElementById('cartItemsCount').textContent = totalItems;
    document.getElementById('cartSubtotal').textContent = formatCurrency(subtotalOriginal);
    document.getElementById('cartDiscount').textContent = `-${formatCurrency(discount)}`;
    document.getElementById('deliveryCharges').textContent = delivery === 0 ? 'FREE' : formatCurrency(delivery);
    document.getElementById('cartTotal').textContent = formatCurrency(totalPayable);
    
    const savingsEl = document.getElementById('savingsInfo');
    if (discount > 0) {
        savingsEl.classList.remove('hidden');
        document.getElementById('totalSavings').textContent = formatCurrency(discount);
    } else {
        savingsEl.classList.add('hidden');
    }
}

function renderWishlist() {
    const emptyWishlist = document.getElementById('emptyWishlist');
    const wishlistGrid = document.getElementById('wishlistGrid');
    
    if (AppState.wishlist.length === 0) {
        emptyWishlist.classList.remove('hidden');
        wishlistGrid.classList.add('hidden');
        return;
    }
    
    emptyWishlist.classList.add('hidden');
    wishlistGrid.classList.remove('hidden');
    wishlistGrid.innerHTML = AppState.wishlist.map(p => renderProductCard(p)).join('');
}

// --- 12. CHECKOUT & WHATSAPP INTEGRATION ---
let CheckoutState = { deliveryDate: null, totalPayable: 0, address: null };

function proceedToCheckout() {
    if (AppState.cart.length === 0) return;
    
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 4);
    CheckoutState.deliveryDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    
    document.getElementById('deliveryName').value = AppState.currentUser.name;
    document.getElementById('deliveryMobile').value = AppState.currentUser.mobile;
    
    updateCheckoutSidebar();
    goToCheckoutStep(1);
    showPage('checkout');
}

function goToCheckoutStep(stepNumber) {
    if (stepNumber === 2 && !document.getElementById('addressForm').checkValidity()) {
        document.getElementById('addressForm').reportValidity();
        return;
    }
    
    if (stepNumber === 2) {
        CheckoutState.address = {
            name: document.getElementById('deliveryName').value,
            mobile: document.getElementById('deliveryMobile').value,
            line1: document.getElementById('deliveryAddress1').value,
            line2: document.getElementById('deliveryAddress2').value,
            city: document.getElementById('deliveryCity').value,
            state: document.getElementById('deliveryState').value,
            pincode: document.getElementById('deliveryPincode').value
        };
    }
    
    document.querySelectorAll('.checkout-step').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.step-body').classList.add('hidden');
    });
    
    const targetStep = document.getElementById(`checkoutStep${stepNumber}`);
    targetStep.classList.add('active');
    targetStep.querySelector('.step-body').classList.remove('hidden');
}

function updateCheckoutSidebar() {
    const { formatCurrency } = window.ZigzexData;
    let subtotalOriginal = 0; let subtotalCurrent = 0; let totalItems = 0;
    
    AppState.cart.forEach(item => {
        subtotalOriginal += (item.originalPrice * item.qty);
        subtotalCurrent += (item.currentPrice * item.qty);
        totalItems += item.qty;
    });
    
    const discount = subtotalOriginal - subtotalCurrent;
    const delivery = subtotalCurrent > 1000 ? 0 : 99;
    CheckoutState.totalPayable = subtotalCurrent + delivery;
    
    document.getElementById('sidebarItemsCount').textContent = totalItems;
    document.getElementById('sidebarSubtotal').textContent = formatCurrency(subtotalOriginal);
    document.getElementById('sidebarDiscount').textContent = `-${formatCurrency(discount)}`;
    document.getElementById('sidebarDelivery').textContent = delivery === 0 ? 'FREE' : formatCurrency(delivery);
    document.getElementById('sidebarTotal').textContent = formatCurrency(CheckoutState.totalPayable);
}

function placeOrder() {
    showLoader(true);
    
    setTimeout(() => {
        const orderId = 'OD' + Math.floor(Math.random() * 9000000000 + 1000000000);
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const { formatCurrency } = window.ZigzexData;
        
        const newOrder = {
            id: orderId,
            date: new Date().toISOString(),
            items: [...AppState.cart],
            total: CheckoutState.totalPayable,
            payment: paymentMethod,
            status: 'Processing',
            deliveryDate: CheckoutState.deliveryDate,
            address: CheckoutState.address
        };
        
        AppState.orderHistory.unshift(newOrder); 
        AppState.cart = [];
        saveDataToStorage();
        updateCartBadges();
        
        document.getElementById('confirmationOrderId').textContent = orderId;
        document.getElementById('confirmationTotal').textContent = formatCurrency(CheckoutState.totalPayable);
        document.getElementById('confirmationPayment').textContent = paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod;
        document.getElementById('confirmationDelivery').textContent = CheckoutState.deliveryDate;
        
        showLoader(false);
        showPage('orderConfirmation');
        
        sendWhatsAppOrder(newOrder);
        
    }, 1500); 
}

function sendWhatsAppOrder(order) {
    const { formatCurrency } = window.ZigzexData;
    
    let text = `⚡ *ZIGZEX MART - NEW ORDER* ⚡\n\n`;
    text += `*Order ID:* ${order.id}\n`;
    text += `*Customer:* ${order.address.name}\n`;
    text += `*Mobile:* +91 ${order.address.mobile}\n\n`;
    
    text += `📦 *Order Items:*\n`;
    order.items.forEach((item, index) => {
        text += `${index + 1}. ${item.name}\n`;
        text += `   Qty: ${item.qty} | Price: ${formatCurrency(item.currentPrice * item.qty)}\n`;
    });
    
    text += `\n💰 *Payment Details:*\n`;
    text += `*Total Amount:* ${formatCurrency(order.total)}\n`;
    text += `*Method:* ${order.payment === 'COD' ? 'Cash on Delivery' : order.payment}\n\n`;
    
    text += `📍 *Delivery Address:*\n`;
    text += `${order.address.line1}, ${order.address.line2 ? order.address.line2 + ', ' : ''}\n`;
    text += `${order.address.city}, ${order.address.state} - ${order.address.pincode}\n\n`;
    
    text += `🚚 *Expected Delivery:* ${order.deliveryDate}\n`;
    text += `-----------------------------------`;

    const encodedText = encodeURIComponent(text);
    const targetNumber = '916304963771';
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
}

// --- 13. ORDER HISTORY ---
function renderOrders() {
    const { formatCurrency } = window.ZigzexData;
    const emptyOrders = document.getElementById('emptyOrders');
    const ordersList = document.getElementById('ordersList');
    
    if (AppState.orderHistory.length === 0) {
        emptyOrders.classList.remove('hidden');
        ordersList.classList.add('hidden');
        return;
    }
    
    emptyOrders.classList.add('hidden');
    ordersList.classList.remove('hidden');
    
    ordersList.innerHTML = AppState.orderHistory.map(order => {
        const orderDate = new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        
        return `
            <div class="order-card glass-panel" style="margin-bottom: 1.5rem;">
                <div class="order-header" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; color: var(--text-primary); margin-bottom:0.2rem;">${order.id}</div>
                        <div style="color: var(--text-secondary); font-size: 0.85rem;">Placed on ${orderDate}</div>
                    </div>
                    <div class="order-status" style="background: var(--primary); color: white; padding: 0.3rem 0.8rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 700;">
                        ${order.status}
                    </div>
                </div>
                <div class="order-items-wrapper" style="padding: 1.5rem;">
                    ${order.items.map(item => `
                        <div style="display:flex; gap:1rem; margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px dashed var(--border-color);">
                            <img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; border-radius:var(--radius-sm); border:1px solid var(--border-color); object-fit:contain; padding:2px; background:white;">
                            <div style="flex:1;">
                                <h4 style="font-size:0.95rem; margin-bottom:0.2rem;">${item.name}</h4>
                                <div style="color: var(--text-tertiary); font-size:0.85rem;">Qty: ${item.qty}</div>
                            </div>
                            <div style="font-weight:700; color:var(--primary);">${formatCurrency(item.currentPrice * item.qty)}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="padding:1rem 1.5rem; background:rgba(0,0,0,0.02); display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color);">
                    <span style="color:var(--text-secondary);">Total Paid (${order.payment === 'COD' ? 'Cash on Delivery' : order.payment})</span>
                    <span style="font-size:1.2rem; font-weight:800; color:var(--text-primary);">${formatCurrency(order.total)}</span>
                </div>
            </div>
        `;
    }).join('');
}
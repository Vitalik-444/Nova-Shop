let catalogProducts = [];
let currentCategory = "all";
let filteredProducts = [];
let catalogPage = 1;
const CATALOG_PAGE_SIZE = 12;

async function loadCatalog() {
    const container = document.querySelector(".catalog-products");
    if (!container) return;
    catalogProducts = await getProducts(100);

    // Support global search param `q` (from header)
    const q = getQueryParam('q');
    const searchEl = document.querySelector('.catalog-search');
    console.log('loadCatalog q=', q, 'searchEl=', !!searchEl);
    if(q && searchEl){
        searchEl.value = q;
    }

    applyFilters();
    loadCategories();
}

function renderCatalog(products){
    const container=document.querySelector(".catalog-products");
    if(!container) return;
    const favorites = getFavorites();
    container.innerHTML="";
    products.forEach(product=>{
        container.innerHTML += `\n        <div class="product-card">\n        <div class="product-image">\n        <img src="${product.thumbnail}">\n        <button class="favorite-btn ${favorites.some(item => item.id === product.id) ? "favorite-active" : ""}" data-id="${product.id}">\n        <i class="${favorites.some(item => item.id === product.id) ? "fa-solid" : "fa-regular"} fa-heart"></i>\n        </button>\n        </div>\n        <div class="product-info">\n        <span class="product-category">\n        ${product.category}\n        </span>\n        <h3 class="product-title">\n        ${product.title}\n        </h3>\n        <div class="product-rating">\n        <i class="fa-solid fa-star"></i>\n        ${product.rating}\n        </div>\n        <div class="product-bottom">\n        <div class="price">\n        ${product.price}$\n        </div>\n        <button class="cart-btn" data-id="${product.id}">\n        <i class="fa-solid fa-cart-shopping"></i>\n        </button>\n        </div>\n        </div>\n        </div>\n        `;
    });
}

async function loadCategories(){
    const list=document.querySelector(".categories-list");
    if(!list) return;
    const categories=await getCategories();
    list.innerHTML=`\n        <div class="category-filter active" data-category="all">\n        Все товары\n        </div>\n        `;
    categories.forEach(category=>{
        list.innerHTML +=`\n        <div class="category-filter" data-category="${category.slug}">\n        ${category.name}\n        </div>\n        `;
    });
}

function renderCatalogPage(){
    const total = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    if(catalogPage < 1) catalogPage = 1;
    if(catalogPage > totalPages) catalogPage = totalPages;
    const start = (catalogPage - 1) * CATALOG_PAGE_SIZE;
    const end = start + CATALOG_PAGE_SIZE;
    const pageItems = filteredProducts.slice(start, end);
    renderCatalog(pageItems);
    renderCatalogPagination(totalPages);
}

function renderCatalogPagination(totalPages){
    const content = document.querySelector('.catalog-content');
    if(!content) return;
    let pager = content.querySelector('.catalog-pagination');
    if(!pager){
        pager = document.createElement('div');
        pager.className = 'catalog-pagination';
        pager.style.marginTop = '24px';
        pager.style.display = 'flex';
        pager.style.gap = '8px';
        pager.style.alignItems = 'center';
        content.appendChild(pager);
    }
    pager.innerHTML = '';
    const createBtn = (label, page, disabled = false) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = label;
        if(disabled) btn.disabled = true;
        btn.dataset.page = page;
        return btn;
    };
    pager.appendChild(createBtn('« Назад', Math.max(1, catalogPage - 1), catalogPage === 1));
    const maxButtons = 7;
    let startPage = Math.max(1, catalogPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    if(endPage > totalPages){
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    for(let p = startPage; p <= endPage; p++){
        const numBtn = createBtn(p.toString(), p, false);
        if(p === catalogPage){
            numBtn.style.background = 'var(--green)';
            numBtn.style.color = '#fff';
        }
        pager.appendChild(numBtn);
    }
    pager.appendChild(createBtn('Вперёд »', Math.min(totalPages, catalogPage + 1), catalogPage === totalPages));
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if(!btn) return;
    const page = Number(btn.dataset.page);
    if(Number.isNaN(page)) return;
    catalogPage = page;
    renderCatalogPage();
});

function applyFilters() {
    let products = [...catalogProducts];
    if (currentCategory !== "all") {
        products = products.filter(product =>
            product.category === currentCategory
        );
    }
    const search = document.querySelector(".catalog-search");
    if (search) {
        const value = search.value.trim().toLowerCase();
        if (value) {
            products = products.filter(product =>
                product.title.toLowerCase().includes(value)
            );
        }
    }
    const sort = document.querySelector(".catalog-sort");
    if (sort) {
        switch (sort.value) {
            case "priceAsc":
                products.sort((a, b) => a.price - b.price);
                break;
            case "priceDesc":
                products.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                products.sort((a, b) => b.rating - a.rating);
                break;
            case "title":
                products.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
    }
    filteredProducts = products;
    catalogPage = 1;
    renderCatalogPage();
}

document.addEventListener("input", event => {
    if (event.target.classList.contains("catalog-search")) {
        applyFilters();
    }
});

document.addEventListener("change", event => {
    if (event.target.classList.contains("catalog-sort")) {
        applyFilters();
    }
});

document.addEventListener("click", event => {
    const category = event.target.closest(".category-filter");
    if (!category) return;
    document.querySelectorAll(".category-filter").forEach(item => item.classList.remove("active"));
    category.classList.add("active");
    currentCategory = category.dataset.category;
    applyFilters();
});

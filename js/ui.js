function renderHeader(){
    const header = document.querySelector(".header");
    if(!header) return;
    header.innerHTML = `

<div class="header-top">

<div class="container header-row">

<a href="index.html" class="logo">NovaShop</a>

<a href="catalog.html" class="catalog-btn">
<i class="fa-solid fa-bars"></i>
<span>Каталог</span>
</a>

<div class="search">
<input id="globalSearchInput" type="text" placeholder="Поиск товаров...">
<button id="globalSearchBtn"><i class="fa-solid fa-magnifying-glass"></i></button>
</div>

<div class="header-actions">

<a href="favorites.html" class="action-btn">
<i class="fa-regular fa-heart"></i>
<span class="badge favorite-count">0</span>
</a>

<a href="cart.html" class="action-btn">
<i class="fa-solid fa-cart-shopping"></i>
<span class="badge cart-count">0</span>
</a>

<button class="action-btn" id="themeBtn">
<i class="fa-solid fa-moon"></i>
</button>

${
        getCurrentUser()
            ? `<a href="profile.html" class="action-btn" title="Профиль"><i class="fa-solid fa-user-check"></i></a>`
            : `<a href="login.html" class="action-btn" title="Войти"><i class="fa-regular fa-user"></i></a>`
    }

</div>

</div>

</div>

`;

    const themeBtn = header.querySelector("#themeBtn");

    if(themeBtn){
        themeBtn.addEventListener("click", toggleTheme);
    }

    // Header search handlers
    const searchInput = header.querySelector('#globalSearchInput') || document.querySelector('#globalSearchInput');
    const searchBtn = header.querySelector('#globalSearchBtn') || document.querySelector('#globalSearchBtn');

    if(searchBtn){
        searchBtn.addEventListener('click', ()=>{
            const q = searchInput ? searchInput.value.trim() : '';
            console.log('Header search click, q="' + q + '"');
            if(q) {
                location.href = `catalog.html?q=${encodeURIComponent(q)}`;
            } else {
                location.href = 'catalog.html';
            }
        });
    }

    if(searchInput){
        searchInput.addEventListener('keydown', (e)=>{
            if(e.key === 'Enter'){
                e.preventDefault();
                const q = searchInput.value.trim();
                console.log('Header search enter, q="' + q + '"');
                if(searchBtn) searchBtn.click();
            }
        });
    }
}


function renderFooter(){
    const footer = document.querySelector(".footer");
    if(!footer) return;
    footer.innerHTML = `

<div class="container">

<div class="footer-grid">

<div>

<div class="footer-logo">

NovaShop

</div>

<p>

Современный интернет-магазин.

</p>

</div>

<div>

<h3 class="footer-title">

Покупателям

</h3>

<div class="footer-links">

<a href="#">

Доставка

</a>

<a href="#">

Оплата

</a>

<a href="#">

Гарантия

</a>

</div>

</div>

<div>

<h3 class="footer-title">

Компания

</h3>

<div class="footer-links">

<a href="#">

О нас

</a>

<a href="#">

Контакты

</a>

<a href="#">

Новости

</a>

</div>

</div>

<div>

<h3 class="footer-title">

Контакты

</h3>

<div class="footer-links">

<a href="#">

+380 XX XXX XX XX

</a>

<a href="#">

info@novashop.ua

</a>

</div>

</div>

</div>

<div class="footer-bottom">

<p>

© 2026 NovaShop

</p>

<p>

Все права защищены

</p>

</div>

</div>

`;
}

function createLoader(){
    if(document.querySelector(".loader")) return;
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = `
        <div class="loader-spinner"></div>
    `;
    document.body.append(loader);
}

function showLoader(){
    const loader = document.querySelector(".loader");
    if(!loader) return;
    loader.classList.remove("hide");
}

function hideLoader(){
    const loader = document.querySelector(".loader");
    if(!loader) return;
    setTimeout(()=>{
        loader.classList.add("hide");
    },300);
}

function showToast(message,type="success"){
    let toast=document.querySelector(".toast");
    if(!toast){
        toast=document.createElement("div");
        toast.className="toast";
        document.body.append(toast);
    }
    toast.textContent=message;
    toast.classList.remove("show","error","success");
    toast.classList.add(type);
    requestAnimationFrame(()=>{
        toast.classList.add("show");
    });
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>{
        toast.classList.remove("show");
    },3000);
}

function initTheme(){
    const theme=getTheme() || "light";
    document.body.classList.toggle(
        "dark",
        theme === "dark"
    );
    const btn = document.querySelector("#themeBtn");
    if(btn){
        btn.innerHTML = theme === "dark"
            ? `<i class="fa-solid fa-sun"></i>`
            : `<i class="fa-solid fa-moon"></i>`;
    }
}

function toggleTheme(){
    const isDark=document.body.classList.contains(
        "dark"
    );
    const next=isDark
        ? "light"
        : "dark";
    document.body.classList.toggle(
        "dark",
        next === "dark"
    );
    saveTheme(next);
    const btn = document.querySelector("#themeBtn");
    if(btn){
        btn.innerHTML = next === "dark"
            ? `<i class="fa-solid fa-sun"></i>`
            : `<i class="fa-solid fa-moon"></i>`;
    }
}

function initScrollButton(){
    if(document.querySelector(".scroll-top")) return;
    const button=document.createElement("div");
    button.className="scroll-top";
    button.innerHTML=`<i class="fa-solid fa-arrow-up"></i>`;
    document.body.append(button);
    window.addEventListener("scroll",()=>{
        if(window.scrollY>400){
            button.classList.add("show");
        }
        else{
            button.classList.remove("show");
        }
    });
    button.addEventListener("click",()=>{
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    });
}

function updateCartCount(){
    const badge=document.querySelector(".cart-count");
    if(!badge) return;
    badge.textContent=getCart().length;
}

function updateFavoriteCount(){
    const badge=document.querySelector(".favorite-count");
    if(!badge) return;
    badge.textContent=getFavorites().length;
}

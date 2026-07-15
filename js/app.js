const header = document.querySelector(".header");
const App = {

    products: [],
    categories: [],

    cart: [],
    favorites: [],

    currentUser: null,

    theme: "light",

    loader: null,

    async init() {

        this.loadStorage();

        this.cache();

        renderHeader();

        renderFooter();

        initTheme();

        createLoader();

        updateCartCount();

        updateFavoriteCount();

        initScrollButton();

        await this.initCurrentPage();

        hideLoader();

    },

    cache(){

        this.loader = document.querySelector(".loader");

    },

    loadStorage(){

        this.cart = getCart();

        this.favorites = getFavorites();

        this.currentUser = getCurrentUser();

        this.theme = getTheme();

    },

    async initCurrentPage(){

        const page = window.location.pathname
            .split("/")
            .pop();

        switch(page){

            case "":

            case "index.html":

                await loadPopularProducts();

                break;

            case "catalog.html":

                await loadCatalog();

                break;

            case "product.html":

                await loadProductPage();

                break;

            case "cart.html":

                renderCart();

                break;

            case "checkout.html":

                initCheckout();

                break;

            case "favorites.html":

                renderFavorites();

                break;

            case "login.html":

                initLogin();

                break;

            case "register.html":

                initRegister();

                break;

            case "profile.html":

                loadProfile();

                break;

        }

    }

};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
/* header moved to js/ui.js (renderHeader) */
/* footer moved to js/ui.js (renderFooter) */

document.addEventListener("DOMContentLoaded", () => {

    loadPopularProducts();
    renderFavorites();

    updateCartCount();
    updateFavoriteCount();

});

async function loadPopularProducts() {
    console.log('loadPopularProducts called');

    const productsContainer = document.querySelector(
        ".popular .products-grid"
    );

    if(!productsContainer) return;

    const products = await getProducts(8);
    const favorites = getFavorites();

    productsContainer.innerHTML = "";

    products.forEach(product => {

        productsContainer.innerHTML += `

                <div class="product-card">

                    <div class="product-image">

                        <img
                        src="${product.thumbnail}"
                        alt="${product.title}"
                        >

                        <button
                            class="favorite-btn ${favorites.some(item => item.id === product.id) ? "favorite-active" : ""}"
                            data-id="${product.id}"
                        >
                            <i class="${favorites.some(item => item.id === product.id) ? "fa-solid" : "fa-regular"} fa-heart"></i>
                        </button>

                    </div>

                    <div class="product-info">

                        <span class="product-category">

                            ${product.category}

                        </span>

                        <h3 class="product-title">

                            ${product.title}

                        </h3>

                        <div class="product-rating">

                            <i class="fa-solid fa-star"></i>

                            <span>
                                ${product.rating}
                            </span>

                        </div>

                        <div class="product-bottom">

                            <div>

                                <div class="price">

                                    ${product.price} $

                                </div>

                            </div>

                            <button
                            class="cart-btn"
                            data-id="${product.id}"
                            >

                                <i class="fa-solid fa-cart-shopping"></i>

                            </button>

                        </div>

                    </div>

                </div>

                `;

    });

}

document.addEventListener(
    "click",
    function(event){

        const button = event.target.closest(".cart-btn");

        if(!button) return;

        const productId = Number(
            button.dataset.id
        );

        addToCart(productId);

    }
);

async function addToCart(id){

    const product = await getProduct(id);

    if(!product) return;

    const cart = getCart();

    const exists = cart.find(
        item => item.id === id
    );

    if(exists){

        exists.quantity++;

    }
    else {

        cart.push({

            ...product,

            quantity:1

        });

    }

    saveCart(cart);

    updateCartCount();

    showToast(
        "Товар добавлен в корзину"
    );

}

function updateCartCount(){

    const cart = getCart();

    const count = cart.reduce(
        (sum,item)=>sum + item.quantity,
        0
    );

    document.querySelectorAll(".cart-count").forEach(badge => {
        badge.textContent = count;
    });

}

function showToast(message){

    const toast = document.createElement(
        "div"
    );

    toast.className = "toast";

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },3000);

}

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        renderCart();

    });

function renderCart(){

    const container = document.querySelector(
        ".cart-items"
    );

    if(!container) return;

    const cart = getCart();

    container.innerHTML="";

    if(cart.length===0){

        container.innerHTML=`

        <h2>
        Корзина пустая
        </h2>

        `;

        updateCartSummary();

        return;

    }

    cart.forEach(product=>{

        container.innerHTML += `

        <div class="cart-item">

        <img src="${product.thumbnail}">

        <div class="cart-item-info">

        <h3 class="cart-item-title">

        ${product.title}

        </h3>

        <div class="cart-item-price">

        ${product.price}$

        </div>

        </div>

        <div class="quantity">

        <button onclick="changeQuantity(${product.id},-1)">
        -
        </button>

        <span>
        ${product.quantity}
        </span>

        <button onclick="changeQuantity(${product.id},1)">
        +
        </button>

        </div>

        <button
        class="remove-cart"
        onclick="removeFromCart(${product.id})">

        <i class="fa-solid fa-trash"></i>

        </button>

        </div>

        `;

    });

    updateCartSummary();

}

function changeQuantity(id,value){

    const cart=getCart();

    const product=cart.find(
        item=>item.id===id
    );

    if(!product) return;

    product.quantity += value;

    if(product.quantity<=0){

        product.quantity=1;

    }

    saveCart(cart);

    renderCart();

    updateCartCount();

}

function removeFromCart(id){

    let cart=getCart();

    cart=cart.filter(
        item=>item.id!==id
    );

    saveCart(cart);

    renderCart();

    updateCartCount();

    showToast(
        "Товар удален"
    );

}

function updateCartSummary(){

    const cart=getCart();

    const count=document.querySelector(
        ".cart-total-count"
    );

    const price=document.querySelector(
        ".cart-total-price"
    );

    if(!count || !price)
        return;

    let totalCount=0;

    let totalPrice=0;

    cart.forEach(item=>{

        totalCount += item.quantity;

        totalPrice += item.price * item.quantity;

    });

    count.textContent=totalCount;

    price.textContent=
        totalPrice.toFixed(2)+" $";

}

const themeBtn = document.querySelector("#themeBtn");

function initTheme(){

    const theme = getTheme();

    if(theme === "dark"){

        document.body.classList.add("dark");

        if(themeBtn){

            themeBtn.innerHTML =
                `<i class="fa-solid fa-sun"></i>`;

        }

    }

}

if(themeBtn){

    themeBtn.addEventListener(
        "click",
        ()=>{

            document.body.classList.toggle(
                "dark"
            );

            const isDark =
                document.body.classList.contains(
                    "dark"
                );

            saveTheme(
                isDark ? "dark" : "light"
            );

            themeBtn.innerHTML = isDark

                ? `<i class="fa-solid fa-sun"></i>`

                : `<i class="fa-solid fa-moon"></i>`;

        }
    );

}

initTheme();

document.addEventListener(
    "click",
    async function(event){

        const button = event.target.closest(
            ".favorite-btn"
        );

        if(!button) return;

        const id = Number(
            button.dataset.id
        );

        toggleFavorite(id, button);

    });

async function toggleFavorite(id, button){

    const product = await getProduct(id);

    if(!product) return;

    let favorites = getFavorites();

    const exists = favorites.find(
        item=>item.id===id
    );

    if(exists){

        favorites = favorites.filter(
            item=>item.id!==id
        );

        showToast(
            "Удалено из избранного"
        );

        if(button){
            button.classList.remove("favorite-active");
            button.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        }

    }
    else{

        favorites.push(product);

        showToast(
            "Добавлено в избранное"
        );

        if(button){
            button.classList.add("favorite-active");
            button.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        }

    }

    saveFavorites(
        favorites
    );

    updateFavoriteCount();
    renderFavorites();

}

function updateFavoriteCount(){

    document.querySelectorAll(".favorite-count").forEach(badge => {
        badge.textContent = getFavorites().length;
    });

}

function renderFavorites(){

    const container =
        document.querySelector(
            ".favorites-grid"
        );

    if(!container) return;

    const favorites =
        getFavorites();

    container.innerHTML="";

    if(favorites.length===0){

        container.innerHTML=`

        <h2 class="empty-message">
        Нет избранных товаров
        </h2>

        `;

        return;

    }

    favorites.forEach(product=>{

        container.innerHTML += `

        <div class="product-card">

        <div class="product-image">

        <img src="${product.thumbnail}">

        <button
        class="favorite-btn favorite-active"
        data-id="${product.id}">

        <i class="fa-solid fa-heart"></i>

        </button>

        </div>

        <div class="product-info">

        <h3 class="product-title">

        ${product.title}

        </h3>

        <div class="price">

        ${product.price}$

        </div>

        <button
        class="cart-btn"
        data-id="${product.id}">

        <i class="fa-solid fa-cart-shopping"></i>

        </button>

        </div>

        </div>

        `;

    });

}

// Catalog logic moved to js/catalog.js
// (removed duplicate declarations and functions)

App.initPage = function () {

    const page = location.pathname.split("/").pop();

    switch (page) {

        case "":
        case "index.html":

            loadPopularProducts();
            break;

        case "catalog.html":

            loadCatalog();
            break;

        case "product.html":

            loadProductPage();
            break;

        case "cart.html":

            renderCart();
            break;

        case "checkout.html":

            initCheckout();
            break;

        case "favorites.html":

            renderFavorites();
            break;

        case "login.html":

            initLogin();
            break;

        case "register.html":

            initRegister();
            break;

        case "profile.html":

            loadProfile();
            break;

    }

};

App.initEvents = function () {

    document.addEventListener("click", this.handleClick.bind(this));

    document.addEventListener("input", this.handleInput.bind(this));

    document.addEventListener("change", this.handleChange.bind(this));

};

App.handleClick = function (event) {

    const cartBtn = event.target.closest(".cart-btn");

    if (cartBtn) {

        addToCart(Number(cartBtn.dataset.id));

        return;

    }

    const favoriteBtn = event.target.closest(".favorite-btn");

    if (favoriteBtn) {

        toggleFavorite(Number(favoriteBtn.dataset.id));

        return;

    }

    const themeBtn = event.target.closest("#themeBtn");

    if (themeBtn) {

        toggleTheme();

        return;

    }

};

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
<input type="text" placeholder="Поиск товаров...">
<button><i class="fa-solid fa-magnifying-glass"></i></button>
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

function formatPrice(price){

    return new Intl.NumberFormat(

        "ru-RU"

    ).format(price);

}

function getQueryParam(name){

    return new URLSearchParams(

        window.location.search

    ).get(name);

}

function goToProduct(id){

    location.href=`product.html?id=${id}`;

}

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        App.init();

    }

);

function initRegister(){

    const form=document.querySelector(

        "#registerForm"

    );

    if(!form) return;

    if(form.dataset.authBound === "true") return;

    form.dataset.authBound = "true";

    form.addEventListener(

        "submit",

        registerUser

    );

}

function registerUser(event){

    event.preventDefault();

    const form = event.currentTarget;

    const name=document.querySelector(

        "#registerName"

    ).value.trim();

    const email=document.querySelector(

        "#registerEmail"

    ).value.trim().toLowerCase();

    const password = document.querySelector("#registerPassword").value;

    const repeat=document.querySelector(

        "#registerPasswordRepeat"

    ).value;

    if(

        !name ||

        !email ||

        !password ||

        !repeat

    ){

        showToast(

            "Заполните все поля",

            "error"

        );

        return;

    }

    if(password!==repeat){

        showToast(

            "Пароли не совпадают",

            "error"

        );

        return;

    }

    if(password.length<6){

        showToast(

            "Минимум 6 символов",

            "error"

        );

        return;

    }

    let users=getUsers();

    const exists=users.find(

        user=>user.email===email

    );

    if(exists){

        showToast(

            "Email уже зарегистрирован",

            "error"

        );

        return;

    }

    const newUser={

        id:Date.now(),

        name,

        email,

        password,

        createdAt:new Date().toISOString()

    };

    users.push(newUser);

    saveUsers(users);

    saveCurrentUser({
        id:newUser.id,
        name:newUser.name,
        email:newUser.email
    });

    form.reset();

    showToast(

        "Регистрация успешна"

    );

    setTimeout(()=>{

        location.href="profile.html";

    },1000);

}

function initLogin(){

    const form=document.querySelector("#loginForm");

    if(!form) return;

    if(form.dataset.authBound === "true") return;

    form.dataset.authBound = "true";

    form.addEventListener(

        "submit",

        loginUser

    );

}

function loginUser(event){

    event.preventDefault();

    const email=document
        .querySelector("#loginEmail")
        .value
        .trim()
        .toLowerCase();

    const password=document
        .querySelector("#loginPassword")
        .value;

    if(!email || !password){

        showToast(

            "Заполните все поля",

            "error"

        );

        return;

    }

    const users=getUsers();

    const user=users.find(item=>

        item.email===email &&

        item.password===password

    );

    if(!user){

        showToast(

            "Неверный Email или пароль",

            "error"

        );

        return;

    }

    saveCurrentUser({
        id:user.id,
        name:user.name,
        email:user.email
    });

    showToast(

        "Добро пожаловать, " + user.name

    );

    setTimeout(()=>{

        location.href="profile.html";

    },1000);

}

function initLogout(){

    const button=document.querySelector(".logout-btn");

    if(!button) return;

    if(button.dataset.authBound === "true") return;

    button.dataset.authBound = "true";

    button.addEventListener("click",()=>{

        logout();

        showToast("Вы вышли из аккаунта");

        setTimeout(()=>{

            location.href="login.html";

        },800);

    });

}

function loadProfile(){

    const user=getCurrentUser();

    if(!user){

        location.href="login.html";

        return;

    }

    document.querySelector("#profileName").textContent=user.name;

    document.querySelector("#profileEmail").textContent=user.email;

    document.querySelector("#profileCartCount").textContent=

        getCart().length + " товаров";

    document.querySelector("#profileFavoriteCount").textContent=

        getFavorites().length + " товаров";

    initLogout();

}

function requireAuth(){

    const user=getCurrentUser();

    if(!user){

        location.href="login.html";

        return false;

    }

    return true;

}

function initCheckout(){

    const form=document.querySelector("#checkoutForm");

    if(!form) return;

    const total=document.querySelector(".checkout-total-price");

    if(total){
        const cart=getCart();
        const totalPrice=cart.reduce(
            (sum,item)=>sum + item.price * item.quantity,
            0
        );

        total.textContent=totalPrice.toFixed(2) + " $";
    }

    const user=getCurrentUser();

    if(user){
        const name=document.querySelector("#checkoutName");
        const email=document.querySelector("#checkoutEmail");

        if(name && !name.value) name.value=user.name;
        if(email && !email.value) email.value=user.email;
    }

    if(form.dataset.checkoutBound === "true") return;

    form.dataset.checkoutBound = "true";

    form.addEventListener("submit", submitCheckout);

}

function submitCheckout(event){

    event.preventDefault();

    const cart=getCart();

    if(cart.length===0){
        showToast("Корзина пустая", "error");
        return;
    }

    event.currentTarget.reset();
    saveCart([]);
    updateCartCount();

    showToast("Заказ оформлен");

    setTimeout(()=>{
        location.href="profile.html";
    },1000);

}



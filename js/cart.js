async function addToCart(id){
    const product = await getProduct(id);
    if(!product) return;
    const cart = getCart();
    const exists = cart.find(item => item.id === id);
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
    showToast("Товар добавлен в корзину");
}

function renderCart(){
    const container = document.querySelector(".cart-items");
    if(!container) return;
    const cart = getCart();
    container.innerHTML="";
    if(cart.length===0){
        container.innerHTML=`\n        <h2>\n        Корзина пустая\n        </h2>\n        `;
        updateCartSummary();
        return;
    }
    cart.forEach(product=>{
        container.innerHTML += `\n        <div class="cart-item">\n        <img src="${product.thumbnail}">\n        <div class="cart-item-info">\n        <h3 class="cart-item-title">\n        ${product.title}\n        </h3>\n        <div class="cart-item-price">\n        ${product.price}$\n        </div>\n        </div>\n        <div class="quantity">\n        <button onclick="changeQuantity(${product.id},-1)">-</button>\n        <span>\n        ${product.quantity}\n        </span>\n        <button onclick="changeQuantity(${product.id},1)">+</button>\n        </div>\n        <button class="remove-cart" onclick="removeFromCart(${product.id})">\n        <i class="fa-solid fa-trash"></i>\n        </button>\n        </div>\n        `;
    });
    updateCartSummary();
}

function changeQuantity(id,value){
    const cart=getCart();
    const product=cart.find(item=>item.id===id);
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
    cart=cart.filter(item=>item.id!==id);
    saveCart(cart);
    renderCart();
    updateCartCount();
    showToast("Товар удален");
}

function updateCartSummary(){
    const cart=getCart();
    const count=document.querySelector(".cart-total-count");
    const price=document.querySelector(".cart-total-price");
    if(!count || !price) return;
    let totalCount=0;
    let totalPrice=0;
    cart.forEach(item=>{
        totalCount += item.quantity;
        totalPrice += item.price * item.quantity;
    });
    count.textContent=totalCount;
    price.textContent= totalPrice.toFixed(2)+" $";
}

// Delegate click for add-to-cart buttons (supports dynamically generated cards)
document.addEventListener('click', function(event){
    const button = event.target.closest('.cart-btn');
    if(!button) return;
    addToCart(Number(button.dataset.id));
});

function renderFavorites(){
    const container = document.querySelector(".favorites-grid");
    if(!container) return;
    const favorites = getFavorites();
    container.innerHTML="";
    if(favorites.length===0){
        container.innerHTML=`\n        <h2 class="empty-message">\n        Нет избранных товаров\n        </h2>\n        `;
        return;
    }
    favorites.forEach(product=>{
        container.innerHTML += `\n        <div class="product-card">\n        <div class="product-image">\n        <img src="${product.thumbnail}">\n        <button class="favorite-btn favorite-active" data-id="${product.id}">\n        <i class="fa-solid fa-heart"></i>\n        </button>\n        </div>\n        <div class="product-info">\n        <h3 class="product-title">\n        ${product.title}\n        </h3>\n        <div class="price">\n        ${product.price}$\n        </div>\n        <button class="cart-btn" data-id="${product.id}">\n        <i class="fa-solid fa-cart-shopping"></i>\n        </button>\n        </div>\n        </div>\n        `;
    });
}

async function toggleFavorite(id, button){
    const product = await getProduct(id);
    if(!product) return;
    let favorites = getFavorites();
    const exists = favorites.find(item=>item.id===id);
    if(exists){
        favorites = favorites.filter(item=>item.id!==id);
        showToast("Удалено из избранного");
        if(button){
            button.classList.remove("favorite-active");
            button.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        }
    }
    else{
        favorites.push(product);
        showToast("Добавлено в избранное");
        if(button){
            button.classList.add("favorite-active");
            button.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        }
    }
    saveFavorites(favorites);
    updateFavoriteCount();
    renderFavorites();
}

// Delegate favorite button clicks
document.addEventListener('click', async function(event){
    const button = event.target.closest('.favorite-btn');
    if(!button) return;
    const id = Number(button.dataset.id);
    toggleFavorite(id, button);
});

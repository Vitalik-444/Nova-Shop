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

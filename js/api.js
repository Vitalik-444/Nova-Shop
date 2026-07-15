const API_URL = "https://dummyjson.com";

async function getProducts(limit = 200) {

    try {

        const response = await fetch(
            `${API_URL}/products?limit=${limit}`
        );

        const data = await response.json();

        return data.products;

    } catch(error) {

        console.error("Ошибка загрузки товаров:", error);

        return [];

    }

}

async function getProduct(id) {

    try {

        const response = await fetch(
            `${API_URL}/products/${id}`
        );

        const product = await response.json();

        return product;

    } catch(error) {

        console.error("Ошибка загрузки товара:", error);

        return null;

    }

}

async function getCategories() {

    try {

        const response = await fetch(
            `${API_URL}/products/categories`
        );

        return await response.json();

    } catch (error) {

        console.error(error);

        return [];

    }

}


const STORAGE_KEYS = {
    cart: "cart",
    favorites: "favorites",
    users: "users",
    currentUser: "currentUser",
    theme: "theme"
};

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getStorage(key, fallback = null) {
    const data = localStorage.getItem(key);

    if (!data) {
        return fallback;
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error(`Ошибка чтения localStorage: ${key}`, error);
        return fallback;
    }
}

function removeStorage(key) {
    localStorage.removeItem(key);
}

function getCart() {
    return getStorage(STORAGE_KEYS.cart, []);
}

function saveCart(cart) {
    setStorage(STORAGE_KEYS.cart, cart);
}

function getFavorites() {
    return getStorage(STORAGE_KEYS.favorites, []);
}

function saveFavorites(favorites) {
    setStorage(STORAGE_KEYS.favorites, favorites);
}

function getUsers() {
    return getStorage(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    setStorage(STORAGE_KEYS.users, users);
}

function getCurrentUser() {
    return getStorage(STORAGE_KEYS.currentUser, null);
}

function saveCurrentUser(user) {
    setStorage(STORAGE_KEYS.currentUser, user);
}

function logout() {
    removeStorage(STORAGE_KEYS.currentUser);
}

function getTheme() {
    return getStorage(STORAGE_KEYS.theme, "light");
}

function saveTheme(theme) {
    setStorage(STORAGE_KEYS.theme, theme);
}


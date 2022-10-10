export function getToken() {
    return localStorage.getItem("token");
}

export function setToken(token: string) {
    localStorage.setItem("token", token);
}

export function loggedIn(): boolean {
    return !!localStorage.getItem("token") || !!localStorage.getItem("username") || !!localStorage.getItem("full_name");
}

export function deleteToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("full_name");
}

export function getCurrentUser() {
    return localStorage.getItem("full_name");
}

export function getUsername() {
    return localStorage.getItem("username");
}

export function setUsername(username: string) {
    localStorage.setItem("username", username);
}

export function setFullName(full_name: string) {
    localStorage.setItem("full_name", full_name);
}
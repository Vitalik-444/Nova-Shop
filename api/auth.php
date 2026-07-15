<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

function jsonResponse(array $payload, $status = 200)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function requestData()
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);

    return is_array($data) ? $data : [];
}

function publicUser(array $user)
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
    ];
}

try {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action === 'register') {
        $data = requestData();
        $name = trim((string) (isset($data['name']) ? $data['name'] : ''));
        $email = strtolower(trim((string) (isset($data['email']) ? $data['email'] : '')));
        $password = (string) (isset($data['password']) ? $data['password'] : '');

        if ($name === '' || $email === '' || $password === '') {
            jsonResponse(['success' => false, 'message' => 'Заполните все поля'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['success' => false, 'message' => 'Введите корректный Email'], 422);
        }

        if (strlen($password) < 6) {
            jsonResponse(['success' => false, 'message' => 'Минимум 6 символов'], 422);
        }

        $pdo = db();
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);

        if ($stmt->fetch()) {
            jsonResponse(['success' => false, 'message' => 'Email уже зарегистрирован'], 409);
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
        $stmt->execute([$name, $email, $passwordHash]);

        $user = [
            'id' => (int) $pdo->lastInsertId(),
            'name' => $name,
            'email' => $email,
        ];

        $_SESSION['user_id'] = $user['id'];

        jsonResponse(['success' => true, 'user' => $user]);
    }

    if ($action === 'login') {
        $data = requestData();
        $email = strtolower(trim((string) (isset($data['email']) ? $data['email'] : '')));
        $password = (string) (isset($data['password']) ? $data['password'] : '');

        if ($email === '' || $password === '') {
            jsonResponse(['success' => false, 'message' => 'Заполните все поля'], 422);
        }

        $stmt = db()->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonResponse(['success' => false, 'message' => 'Неверный Email или пароль'], 401);
        }

        $_SESSION['user_id'] = (int) $user['id'];

        jsonResponse(['success' => true, 'user' => publicUser($user)]);
    }

    if ($action === 'me') {
        if (empty($_SESSION['user_id'])) {
            jsonResponse(['success' => true, 'user' => null]);
        }

        $stmt = db()->prepare('SELECT id, name, email FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([(int) $_SESSION['user_id']]);
        $user = $stmt->fetch();

        jsonResponse(['success' => true, 'user' => $user ? publicUser($user) : null]);
    }

    if ($action === 'logout') {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                (bool) $params['secure'],
                (bool) $params['httponly']
            );
        }

        session_destroy();

        jsonResponse(['success' => true]);
    }

    jsonResponse(['success' => false, 'message' => 'Неизвестное действие'], 404);
} catch (Exception $error) {
    jsonResponse([
        'success' => false,
        'message' => 'Ошибка сервера. Проверьте подключение к MySQL и импорт database.sql',
    ], 500);
}


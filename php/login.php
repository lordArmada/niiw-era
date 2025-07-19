<?php
session_start();
require_once '/php/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email']);
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, name, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($id, $name, $hashed, $role);

    if ($stmt->fetch() && password_verify($password, $hashed)) {
        $_SESSION['user_id'] = $id;
        $_SESSION['username'] = $name;
        $_SESSION['role'] = $role;

        if ($role === 'admin') {
            header("Location: ../admin/dashboard.php");
        } else {
            header("Location: ../index.html");
        }
    } else {
        $_SESSION['error'] = 'Invalid email or password';
        header('Location: ../pages/login.html');
    }
}
?>

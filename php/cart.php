<?php
session_start();
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Please login to continue']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'add':
        $product_id = $_POST['product_id'] ?? 0;
        $quantity = $_POST['quantity'] ?? 1;
        
        if (!$product_id) {
            echo json_encode(['error' => 'Invalid product']);
            exit;
        }
        
        // Check if product exists
        $stmt = $conn->prepare("SELECT id, price FROM products WHERE id = ?");
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode(['error' => 'Product not found']);
            exit;
        }
        
        // Check if product is already in cart
        $stmt = $conn->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update quantity
            $row = $result->fetch_assoc();
            $new_quantity = $row['quantity'] + $quantity;
            
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->bind_param("iii", $new_quantity, $user_id, $product_id);
            $stmt->execute();
        } else {
            // Add new item to cart
            $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $user_id, $product_id, $quantity);
            $stmt->execute();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Product added to cart'
        ]);
        break;
        
    case 'update':
        $product_id = $_POST['product_id'] ?? 0;
        $quantity = $_POST['quantity'] ?? 1;
        
        if (!$product_id) {
            echo json_encode(['error' => 'Invalid product']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("iii", $quantity, $user_id, $product_id);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Cart updated'
        ]);
        break;
        
    case 'remove':
        $product_id = $_POST['product_id'] ?? 0;
        
        if (!$product_id) {
            echo json_encode(['error' => 'Invalid product']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Product removed from cart'
        ]);
        break;
        
    case 'get':
        $stmt = $conn->prepare("
            SELECT c.*, p.name, p.price, p.image,
                   (p.price * c.quantity) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $items = [];
        $total = 0;
        
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['product_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'quantity' => (int)$row['quantity'],
                'image' => $row['image'],
                'subtotal' => (float)$row['subtotal']
            ];
            $total += $row['subtotal'];
        }
        
        echo json_encode([
            'items' => $items,
            'total' => $total
        ]);
        break;
        
    case 'count':
        $stmt = $conn->prepare("SELECT SUM(quantity) as count FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        echo json_encode([
            'count' => (int)$row['count'] ?? 0
        ]);
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

$conn->close();

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Please login to continue']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'add':
        $product_id = (int)$_POST['product_id'];
        $quantity = (int)($_POST['quantity'] ?? 1);
        
        // Check if product exists in cart
        $stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update quantity
            $row = $result->fetch_assoc();
            $new_quantity = $row['quantity'] + $quantity;
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
            $stmt->bind_param("ii", $new_quantity, $row['id']);
        } else {
            // Add new item
            $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $user_id, $product_id, $quantity);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Product added to cart']);
        } else {
            echo json_encode(['error' => 'Failed to add product to cart']);
        }
        break;
        
    case 'update':
        $product_id = (int)$_POST['product_id'];
        $quantity = (int)$_POST['quantity'];
        
        if ($quantity <= 0) {
            // Remove item if quantity is 0 or negative
            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
            $stmt->bind_param("ii", $user_id, $product_id);
        } else {
            // Update quantity
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->bind_param("iii", $quantity, $user_id, $product_id);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Cart updated']);
        } else {
            echo json_encode(['error' => 'Failed to update cart']);
        }
        break;
        
    case 'remove':
        $product_id = (int)$_POST['product_id'];
        
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Product removed from cart']);
        } else {
            echo json_encode(['error' => 'Failed to remove product from cart']);
        }
        break;
        
    case 'get':
        $stmt = $conn->prepare("SELECT c.*, p.name, p.price, p.image FROM cart c 
                               JOIN products p ON c.product_id = p.id 
                               WHERE c.user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $cart_items = [];
        $total = 0;
        
        while ($row = $result->fetch_assoc()) {
            $item = [
                'id' => $row['product_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'quantity' => (int)$row['quantity'],
                'image' => $row['image'],
                'subtotal' => (float)$row['price'] * (int)$row['quantity']
            ];
            $cart_items[] = $item;
            $total += $item['subtotal'];
        }
        
        echo json_encode([
            'items' => $cart_items,
            'total' => $total,
            'count' => count($cart_items)
        ]);
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
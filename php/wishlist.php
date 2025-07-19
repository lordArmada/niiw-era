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
    case 'toggle':
        $product_id = $_POST['product_id'] ?? 0;
        
        if (!$product_id) {
            echo json_encode(['error' => 'Invalid product']);
            exit;
        }
        
        // Check if product exists
        $stmt = $conn->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode(['error' => 'Product not found']);
            exit;
        }
        
        // Check if product is already in wishlist
        $stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Remove from wishlist
            $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
            $stmt->bind_param("ii", $user_id, $product_id);
            $stmt->execute();
            
            echo json_encode([
                'success' => true,
                'action' => 'removed',
                'message' => 'Product removed from wishlist'
            ]);
        } else {
            // Add to wishlist
            $stmt = $conn->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $user_id, $product_id);
            $stmt->execute();
            
            echo json_encode([
                'success' => true,
                'action' => 'added',
                'message' => 'Product added to wishlist'
            ]);
        }
        break;
        
    case 'remove':
        $product_id = $_POST['product_id'] ?? 0;
        
        if (!$product_id) {
            echo json_encode(['error' => 'Invalid product']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Product removed from wishlist'
        ]);
        break;
        
    case 'get':
        $stmt = $conn->prepare("
            SELECT w.*, p.name, p.price, p.image
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'id' => $row['product_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'image' => $row['image']
            ];
        }
        
        echo json_encode([
            'items' => $items
        ]);
        break;
        
    case 'check':
        $product_id = $_POST['product_id'] ?? 0;
        
        if (!$product_id) {
            echo json_encode(['error' => 'Invalid product']);
            exit;
        }
        
        $stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        echo json_encode([
            'in_wishlist' => $result->num_rows > 0
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
    case 'toggle':
        $product_id = (int)$_POST['product_id'];
        
        // Check if product exists in wishlist
        $stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Remove from wishlist
            $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
            $stmt->bind_param("ii", $user_id, $product_id);
            $message = 'Product removed from wishlist';
        } else {
            // Add to wishlist
            $stmt = $conn->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $user_id, $product_id);
            $message = 'Product added to wishlist';
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => $message]);
        } else {
            echo json_encode(['error' => 'Failed to update wishlist']);
        }
        break;
        
    case 'get':
        $stmt = $conn->prepare("SELECT w.*, p.name, p.price, p.image FROM wishlist w 
                               JOIN products p ON w.product_id = p.id 
                               WHERE w.user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $wishlist_items = [];
        while ($row = $result->fetch_assoc()) {
            $wishlist_items[] = [
                'id' => $row['product_id'],
                'name' => $row['name'],
                'price' => (float)$row['price'],
                'image' => $row['image']
            ];
        }
        
        echo json_encode([
            'items' => $wishlist_items,
            'count' => count($wishlist_items)
        ]);
        break;
        
    case 'check':
        $product_id = (int)$_POST['product_id'];
        
        $stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        echo json_encode([
            'in_wishlist' => $result->num_rows > 0
        ]);
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
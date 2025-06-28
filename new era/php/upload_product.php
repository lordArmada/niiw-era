<?php
// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

// Database connection
require_once 'config.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

// Get form data
$product_id = isset($_POST['product_id']) ? $_POST['product_id'] : null;
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$slug = isset($_POST['slug']) ? trim($_POST['slug']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';
$price = isset($_POST['price']) ? (float)$_POST['price'] : 0;
$old_price = isset($_POST['old_price']) && !empty($_POST['old_price']) ? (float)$_POST['old_price'] : null;
$category = isset($_POST['category']) ? trim($_POST['category']) : '';
$stock = isset($_POST['stock']) ? (int)$_POST['stock'] : 0;
$badge = isset($_POST['badge']) ? trim($_POST['badge']) : null;
$featured = isset($_POST['featured']) && $_POST['featured'] === 'true' ? 1 : 0;

// Validate required fields
if (empty($name) || empty($slug) || empty($description) || $price <= 0 || empty($category) || $stock < 0) {
    echo json_encode(['error' => 'Please fill all required fields with valid values']);
    exit;
}

// Generate slug if not provided
if (empty($slug)) {
    $slug = strtolower(str_replace(' ', '-', $name));
    $slug = preg_replace('/[^a-z0-9-]/', '', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
}

// Check if slug already exists (for new products)
if (!$product_id) {
    $check_slug_query = "SELECT id FROM products WHERE slug = ?";
    $check_stmt = $conn->prepare($check_slug_query);
    $check_stmt->bind_param("s", $slug);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        echo json_encode(['error' => 'A product with this slug already exists. Please choose a different slug.']);
        exit;
    }
}

// Handle image upload
$image_path = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../uploads/products/';
    
    // Create directory if it doesn't exist
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Get file info
    $file_name = $_FILES['image']['name'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_size = $_FILES['image']['size'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    
    // Allowed file extensions
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    // Check file extension
    if (!in_array($file_ext, $allowed_extensions)) {
        echo json_encode(['error' => 'Only JPG, JPEG, PNG, and WEBP files are allowed']);
        exit;
    }
    
    // Check file size (5MB max)
    if ($file_size > 5 * 1024 * 1024) {
        echo json_encode(['error' => 'File size must be less than 5MB']);
        exit;
    }
    
    // Generate unique filename
    $new_file_name = $slug . '-' . time() . '.' . $file_ext;
    $upload_path = $upload_dir . $new_file_name;
    
    // Move uploaded file
    if (move_uploaded_file($file_tmp, $upload_path)) {
        $image_path = 'uploads/products/' . $new_file_name;
    } else {
        echo json_encode(['error' => 'Failed to upload image']);
        exit;
    }
}

try {
    // Begin transaction
    $conn->begin_transaction();
    
    if ($product_id) {
        // Update existing product
        $query = "UPDATE products SET 
                  name = ?, 
                  slug = ?, 
                  description = ?, 
                  price = ?, 
                  old_price = ?, 
                  category = ?, 
                  stock = ?, 
                  badge = ?, 
                  featured = ?, 
                  updated_at = NOW()";
        
        $params = [$name, $slug, $description, $price, $old_price, $category, $stock, $badge, $featured];
        $types = "sssdssiis"; // string, string, string, double, double/null, string, integer, string/null, integer
        
        // Add image to update if uploaded
        if ($image_path) {
            $query .= ", image = ?";
            $params[] = $image_path;
            $types .= "s"; // string
        }
        
        $query .= " WHERE id = ?";
        $params[] = $product_id;
        $types .= "i"; // integer
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception("Product not found or no changes made");
        }
        
        $message = "Product updated successfully";
    } else {
        // Insert new product
        $query = "INSERT INTO products (name, slug, description, price, old_price, category, stock, badge, featured, image, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $params = [$name, $slug, $description, $price, $old_price, $category, $stock, $badge, $featured, $image_path];
        $types = "sssdssiiss"; // string, string, string, double, double/null, string, integer, string/null, integer, string/null
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        
        $product_id = $conn->insert_id;
        $message = "Product added successfully";
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => $message,
        'product_id' => $product_id
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    // Return error response
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
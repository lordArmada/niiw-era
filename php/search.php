<?php
// Database connection
require_once 'config.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get search query
$query = isset($_GET['query']) ? $_GET['query'] : '';

// If no query provided, return empty results
if (empty($query)) {
    echo json_encode(['products' => [], 'posts' => []]);
    exit;
}

// Search products
$product_query = "SELECT id, name, slug, price, image, category FROM products 
                 WHERE name LIKE ? OR description LIKE ? 
                 ORDER BY name ASC LIMIT 5";
$product_params = ["%$query%", "%$query%"];
$product_types = "ss"; // string, string

// Search blog posts
$post_query = "SELECT id, title, slug, excerpt, image, category_id FROM posts 
              WHERE title LIKE ? OR content LIKE ? 
              ORDER BY title ASC LIMIT 5";
$post_params = ["%$query%", "%$query%"];
$post_types = "ss"; // string, string

try {
    // Search products
    $product_stmt = $conn->prepare($product_query);
    $product_stmt->bind_param($product_types, ...$product_params);
    $product_stmt->execute();
    $product_result = $product_stmt->get_result();
    
    $products = [];
    while ($row = $product_result->fetch_assoc()) {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'price' => (float)$row['price'],
            'image' => $row['image'],
            'category' => $row['category'],
            'type' => 'product'
        ];
    }
    
    // Search blog posts
    $post_stmt = $conn->prepare($post_query);
    $post_stmt->bind_param($post_types, ...$post_params);
    $post_stmt->execute();
    $post_result = $post_stmt->get_result();
    
    $posts = [];
    while ($row = $post_result->fetch_assoc()) {
        // Get category name
        $cat_query = "SELECT name FROM categories WHERE id = ?";
        $cat_stmt = $conn->prepare($cat_query);
        $cat_stmt->bind_param("i", $row['category_id']);
        $cat_stmt->execute();
        $cat_result = $cat_stmt->get_result();
        $cat_row = $cat_result->fetch_assoc();
        $category_name = $cat_row ? $cat_row['name'] : 'Uncategorized';
        
        $posts[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'excerpt' => $row['excerpt'],
            'image' => $row['image'],
            'category' => $category_name,
            'type' => 'post'
        ];
    }
    
    // Return combined results
    echo json_encode([
        'products' => $products,
        'posts' => $posts
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
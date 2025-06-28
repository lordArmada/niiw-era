<?php
// Database connection
require_once 'config.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get query parameters
$category = isset($_GET['category']) ? $_GET['category'] : 'all';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'newest';
$search = isset($_GET['search']) ? $_GET['search'] : '';
$min_price = isset($_GET['min_price']) ? (float)$_GET['min_price'] : 0;
$max_price = isset($_GET['max_price']) ? (float)$_GET['max_price'] : 1000;

// Calculate offset for pagination
$offset = ($page - 1) * $limit;

// Build the base query
$query = "SELECT * FROM products WHERE price BETWEEN ? AND ?";
$params = [$min_price, $max_price];
$types = "dd"; // double, double

// Add category filter if not 'all'
if ($category !== 'all') {
    $query .= " AND category = ?";
    $params[] = $category;
    $types .= "s"; // string
}

// Add search filter if provided
if (!empty($search)) {
    $query .= " AND (name LIKE ? OR description LIKE ?)";
    $search_param = "%$search%";
    $params[] = $search_param;
    $params[] = $search_param;
    $types .= "ss"; // string, string
}

// Add sorting
switch ($sort) {
    case 'price-low':
        $query .= " ORDER BY price ASC";
        break;
    case 'price-high':
        $query .= " ORDER BY price DESC";
        break;
    case 'popular':
        $query .= " ORDER BY sales_count DESC";
        break;
    default: // newest
        $query .= " ORDER BY created_at DESC";
        break;
}

// Add pagination
$query .= " LIMIT ?, ?";
$params[] = $offset;
$params[] = $limit;
$types .= "ii"; // integer, integer

// Count total products for pagination
$count_query = "SELECT COUNT(*) as total FROM products WHERE price BETWEEN ? AND ?";
$count_params = [$min_price, $max_price];
$count_types = "dd"; // double, double

// Add category filter to count query if not 'all'
if ($category !== 'all') {
    $count_query .= " AND category = ?";
    $count_params[] = $category;
    $count_types .= "s"; // string
}

// Add search filter to count query if provided
if (!empty($search)) {
    $count_query .= " AND (name LIKE ? OR description LIKE ?)";
    $search_param = "%$search%";
    $count_params[] = $search_param;
    $count_params[] = $search_param;
    $count_types .= "ss"; // string, string
}

try {
    // Prepare and execute count query
    $count_stmt = $conn->prepare($count_query);
    $count_stmt->bind_param($count_types, ...$count_params);
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $count_row = $count_result->fetch_assoc();
    $total_products = $count_row['total'];
    $total_pages = ceil($total_products / $limit);
    
    // Prepare and execute main query
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Fetch all products
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Format product data
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'description' => $row['description'],
            'price' => (float)$row['price'],
            'old_price' => $row['old_price'] ? (float)$row['old_price'] : null,
            'image' => $row['image'],
            'category' => $row['category'],
            'stock' => (int)$row['stock'],
            'featured' => (bool)$row['featured'],
            'badge' => $row['badge'],
            'created_at' => $row['created_at']
        ];
    }
    
    // Return JSON response
    echo json_encode([
        'products' => $products,
        'total_products' => $total_products,
        'total_pages' => $total_pages,
        'current_page' => $page
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
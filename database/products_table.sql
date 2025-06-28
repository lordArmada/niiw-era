CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `badge` varchar(20) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
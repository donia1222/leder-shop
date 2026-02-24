-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql24j11.db.hostpoint.internal
-- Erstellungszeit: 07. Jul 2025 um 20:00
-- Server-Version: 10.6.22-MariaDB-log
-- PHP-Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `owoxogis_hotbbq`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_first_name` varchar(100) NOT NULL,
  `customer_last_name` varchar(100) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_address` text NOT NULL,
  `customer_city` varchar(100) NOT NULL,
  `customer_postal_code` varchar(10) NOT NULL,
  `customer_canton` varchar(50) NOT NULL,
  `customer_notes` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'paypal',
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `customer_first_name`, `customer_last_name`, `customer_email`, `customer_phone`, `customer_address`, `customer_city`, `customer_postal_code`, `customer_canton`, `customer_notes`, `total_amount`, `shipping_cost`, `status`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(45, NULL, 'ORDER_20250623_66FE50', 'dss', 'dcsd', 'info@lweb.ch', '3432452352345', 'fdsfdsfs', 'svfdsv', '1234', 'dfvdfv', 'bvdfv\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-23 14:25:26', '2025-06-23 14:25:26'),
(46, NULL, 'ORDER_20250624_3E8592', 'dss', 'dcsd', 'infosee@lweb.ch', '3432452352345', 'fdsfdsfs', 'svfdsv', '1234', 'dfvdfv', 'bvdfv\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-24 13:56:19', '2025-06-24 13:56:19'),
(47, NULL, 'ORDER_20250625_66A253', 'dss', 'dcsd', 'infosee@lweb.ch', '3432452352345', 'fdsfdsfs', 'svfdsv', '1234', 'dfvdfv', 'bvdfv\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-24 22:52:54', '2025-06-24 22:52:54'),
(48, NULL, 'ORDER_20250629_A37052', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr', 12.84, 0.00, 'completed', 'paypal', 'completed', '2025-06-29 09:15:06', '2025-06-29 09:15:06'),
(50, NULL, 'ORDER_20250629_EB31DF', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr', 28.00, 0.00, 'completed', 'paypal', 'completed', '2025-06-29 20:32:46', '2025-06-29 20:32:46'),
(51, NULL, 'ORDER_20250629_5BF41B', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr', 14.00, 0.00, 'completed', 'paypal', 'completed', '2025-06-29 20:39:01', '2025-06-29 20:39:01'),
(52, NULL, 'ORDER_20250629_C1FDC5', 'dq', 'qwdqw', 'infoddsssd@lweb.ch', '4123SS43243', 'fwfwf', 'dqdq', '3333', 'qweqw', 'qwdqewd\nKauf auf Rechnung - Rechnung wird per Post gesendet', 14.00, 0.00, 'pending', 'invoice', 'pending', '2025-06-29 20:46:36', '2025-06-29 20:46:36'),
(53, NULL, 'ORDER_20250629_94BB45', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet', 1.10, 0.00, 'pending', 'invoice', 'pending', '2025-06-29 21:04:09', '2025-06-29 21:04:09'),
(54, NULL, 'ORDER_20250630_583023', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet', 1.10, 0.00, 'pending', 'invoice', 'pending', '2025-06-29 23:24:53', '2025-06-29 23:24:53'),
(55, NULL, 'ORDER_20250630_3D7730', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-29 23:38:11', '2025-06-29 23:38:11'),
(56, NULL, 'ORDER_20250630_9E14E2', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-29 23:43:37', '2025-06-29 23:43:37'),
(57, NULL, 'ORDER_20250630_3D8407', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-29 23:49:07', '2025-06-29 23:49:07'),
(58, NULL, 'ORDER_20250630_33F742', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet', 1.10, 0.00, 'pending', 'invoice', 'pending', '2025-06-29 23:49:39', '2025-06-29 23:49:39'),
(59, NULL, 'ORDER_20250630_1090D9', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-30 00:05:21', '2025-06-30 00:05:21'),
(60, NULL, 'ORDER_20250630_BC9380', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet', 1.10, 0.00, 'pending', 'invoice', 'pending', '2025-06-30 00:07:55', '2025-06-30 00:07:55'),
(61, NULL, 'ORDER_20250630_7F0C92', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-30 10:41:11', '2025-06-30 10:41:11'),
(62, NULL, 'ORDER_20250630_FD4AAC', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzu', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-30 11:12:31', '2025-06-30 11:12:31'),
(63, NULL, 'ORDER_20250630_F8A478', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet', 1.10, 0.00, 'pending', 'invoice', 'pending', '2025-06-30 11:33:51', '2025-06-30 11:33:51'),
(64, NULL, 'ORDER_20250630_01CCB7', 'ewef', 'eww', 'infdsssdssscccccao@lweb.ch', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', 'Kauf auf Rechnung - Rechnung wird per Post gesendet', 14.00, 0.00, 'pending', 'invoice', 'pending', '2025-06-30 18:30:56', '2025-06-30 18:30:56'),
(65, NULL, 'ORDER_20250630_1CFE26', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-30 18:58:57', '2025-06-30 18:58:57'),
(66, NULL, 'ORDER_20250630_9E8FCB', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet', 14.00, 0.00, 'pending', 'invoice', 'pending', '2025-06-30 21:39:53', '2025-06-30 21:39:53'),
(67, NULL, 'ORDER_20250630_D24EC0', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr\nPayPal Payer ID: 93HTF2N2ST564', 1.10, 0.00, 'completed', 'paypal', 'completed', '2025-06-30 21:40:45', '2025-06-30 21:40:45'),
(68, NULL, 'ORDER_20250702_793E49', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr', 14.00, 0.00, 'completed', 'stripe', 'completed', '2025-07-01 23:43:19', '2025-07-01 23:43:19'),
(69, NULL, 'ORDER_20250702_33A95B', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr', 14.00, 0.00, 'completed', 'stripe', 'completed', '2025-07-01 23:53:07', '2025-07-01 23:53:07'),
(70, NULL, 'ORDER_20250702_991134', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr\nPago con tarjeta de crédito (Stripe) - Pago completado', 14.00, 0.00, 'completed', 'stripe', 'completed', '2025-07-01 23:57:45', '2025-07-01 23:57:45'),
(71, NULL, 'ORDER_20250702_E245EC', 'efwf', 'wefewf', 'info@lweb.ch', 'zututz', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr', 14.00, 0.00, 'completed', 'stripe', 'completed', '2025-07-01 23:59:10', '2025-07-01 23:59:10'),
(72, NULL, 'ORDER_20250702_24E7B9', 'ewef', 'eww', 'infdsssdssscccccao@lweb.ch', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', 1.10, 0.00, 'completed', 'stripe', 'completed', '2025-07-02 12:00:18', '2025-07-02 12:00:18'),
(73, NULL, 'ORDER_20250702_381D79', 'ewef', 'eww', 'infdsssdssscccccao@lweb.ch', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', 42.00, 0.00, 'completed', 'stripe', 'completed', '2025-07-02 12:17:55', '2025-07-02 12:17:55'),
(74, NULL, 'ORDER_20250704_8D0726', 'ewef', 'eww', 'infdsssdssscccccao@lweb.ch', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', 'Kauf auf Rechnung - Rechnung wird per Post gesendet\nStock actualizado: Garlic BBQ (-1)', 14.00, 0.00, 'pending', 'invoice', 'pending', '2025-07-04 13:29:28', '2025-07-04 13:29:28'),
(75, NULL, 'ORDER_20250707_29083C', 'Roberto', 'Salvador', 'info@lweb.ch', '08290202322', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr\nKauf auf Rechnung - Rechnung wird per Post gesendet\nStock actualizado: Garlic BBQ (-1)', 14.00, 0.00, 'pending', 'invoice', 'pending', '2025-07-07 00:00:18', '2025-07-07 00:00:18');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_description` text DEFAULT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `heat_level` int(11) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `badge` varchar(100) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_description`, `product_image`, `price`, `quantity`, `subtotal`, `heat_level`, `rating`, `badge`, `origin`, `created_at`) VALUES
(57, 45, 4, 'Big Red\'s Hot Sauce - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', '/images/original-sauce.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'Original', '2025-06-23 14:25:26'),
(58, 46, 4, 'Big Red\'s Hot Sauce - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', '/images/original-sauce.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'Original', '2025-06-24 13:56:19'),
(59, 47, 4, 'Big Red\'s Hot Sauce - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', '/images/original-sauce.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'Original', '2025-06-24 22:52:54'),
(60, 48, 2, 'Big Red\'s - Heat Wave', 'Eine Hitzewelle aus roten Chilis für wahre Schärfe-Liebhaber', 'https://web.lweb.ch/shop/uploads/685c7d48e63dd_1750891848.webp', 12.84, 1, 12.84, 5, 4.90, 'Hitzewelle', 'USA', '2025-06-29 09:15:06'),
(61, 50, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-06-29 20:32:46'),
(62, 50, 14, 'Coffee BBQ', 'Eine einzigartige Kombination aus geröstetem Kaffee und geheimen Gewürzen für anspruchsvolle Gaumen', 'https://web.lweb.ch/shop/uploads/685c8b904c29e_1750895504.webp', 14.00, 1, 14.00, 3, 4.70, 'Gourmet', 'USA', '2025-06-29 20:32:46'),
(63, 51, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-06-29 20:39:01'),
(64, 52, 16, 'Pineapple Papaya BBQ', 'Tropische Aromen, die Ihre Sinne in ein kulinarisches Paradies entführen', 'https://web.lweb.ch/shop/uploads/685c7cf6513bb_1750891766.webp', 14.00, 1, 14.00, 2, 4.60, 'Tropisch', 'USA', '2025-06-29 20:46:36'),
(65, 53, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-29 21:04:09'),
(66, 54, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-29 23:24:53'),
(67, 55, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-29 23:38:11'),
(68, 56, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-29 23:43:37'),
(69, 57, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-29 23:49:07'),
(70, 58, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-29 23:49:39'),
(71, 59, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 00:05:21'),
(72, 60, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 00:07:55'),
(73, 61, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 10:41:11'),
(74, 62, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 11:12:31'),
(75, 63, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 11:33:51'),
(76, 64, 16, 'Pineapple Papaya BBQ', 'Tropische Aromen, die Ihre Sinne in ein kulinarisches Paradies entführen', 'https://web.lweb.ch/shop/uploads/685c7cf6513bb_1750891766.webp', 14.00, 1, 14.00, 2, 4.60, 'Tropisch', 'USA', '2025-06-30 18:30:56'),
(77, 65, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 18:58:57'),
(78, 66, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-06-30 21:39:53'),
(79, 67, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-06-30 21:40:45'),
(80, 68, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-07-01 23:43:19'),
(81, 69, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-07-01 23:53:07'),
(82, 70, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-07-01 23:57:45'),
(83, 71, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.80, 'Intensiv', 'USA', '2025-07-01 23:59:10'),
(84, 72, 4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 'https://web.lweb.ch/shop/uploads/685c7d7713465_1750891895.webp', 1.10, 1, 1.10, 4, 4.60, 'Klassiker', 'USA', '2025-07-02 12:00:18'),
(85, 73, 14, 'Coffee BBQ', 'Eine einzigartige Kombination aus geröstetem Kaffee und geheimen Gewürzen für anspruchsvolle Gaumen', 'https://web.lweb.ch/shop/uploads/685c8b904c29e_1750895504.webp', 14.00, 3, 42.00, 3, 4.70, 'Gourmet', 'USA', '2025-07-02 12:17:55'),
(86, 74, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 4, 4.90, 'Intensiv', 'USA', '2025-07-04 13:29:28'),
(87, 75, 12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 'https://web.lweb.ch/shop/uploads/685c7cb9d36ea_1750891705.webp', 14.00, 1, 14.00, 1, 4.90, 'Intensiv', 'USA', '2025-07-07 00:00:18');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `heat_level` int(11) DEFAULT 1,
  `rating` decimal(3,2) DEFAULT 0.00,
  `badge` varchar(100) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `category` varchar(50) DEFAULT 'hot-sauce',
  `stock` int(11) NOT NULL DEFAULT 0,
  `image2` varchar(255) DEFAULT NULL,
  `image3` varchar(255) DEFAULT NULL,
  `image4` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image`, `heat_level`, `rating`, `badge`, `origin`, `created_at`, `updated_at`, `category`, `stock`, `image2`, `image3`, `image4`) VALUES
(1, 'Big Red\'s - Big Yella', 'Goldgelbe Schärfe mit sonnigem Geschmack und intensivem Kick', 14.90, '685c7d335c170_1750891827.webp', 4, 4.80, 'Sonnig', 'USA', '2025-06-25 21:31:10', '2025-07-07 10:33:16', 'hot-sauce', 0, '686ba26c8a141_1751884396_1.webp', NULL, NULL),
(2, 'Big Red\'s - Heat Wave', 'Eine Hitzewelle aus roten Chilis für wahre Schärfe-Liebhaber', 12.84, '686be19d9a1d0_1751900573.png', 5, 4.90, 'Hitzewelle', 'USA', '2025-06-25 21:31:10', '2025-07-07 15:02:53', 'hot-sauce', 6, NULL, NULL, NULL),
(3, 'Big Red\'s  - Green Chili', 'Frische grüne Chilis mit authentischem mexikanischem Geschmack', 11.24, '686bf10c530b3_1751904524.webp', 3, 5.00, 'Frisch', 'USA', '2025-06-25 21:31:10', '2025-07-07 16:08:44', 'hot-sauce', 12, '686ba57675a91_1751885174_1.png', '686b9ce72e4ba_1751882983_2.webp', NULL),
(4, 'Big Red\'s - Original Sauce', 'Die legendäre Originalrezept seit Generationen unverändert', 1.10, '685c7d7713465_1750891895.webp', 4, 4.60, 'Klassiker', 'USA', '2025-06-25 21:31:10', '2025-07-04 13:24:44', 'hot-sauce', 6, NULL, NULL, NULL),
(5, 'Big Red\'s  - Habanero', 'Authentische Habanero-Chilis für den ultimativen Schärfe-Genuss', 14.93, '686bf5f4a425b_1751905780.jpg', 3, 4.80, 'Habanero', 'USA', '2025-06-25 21:31:10', '2025-07-07 17:58:04', 'hot-sauce', 0, '686baad313071_1751886547_1.webp', '686bc96451efb_1751894372_2.png', NULL),
(11, 'Honey BBQ', 'Eine perfekte Mischung aus natürlichem Honig und rauchigen Gewürzen, die jeden Grillabend veredelt', 14.00, '685d3bbfd4b29_1750940607.webp', 3, 4.90, 'Süß', 'USA', '2025-06-25 21:42:18', '2025-07-04 13:24:24', 'bbq-sauce', 12, NULL, NULL, NULL),
(12, 'Garlic BBQ', 'Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert', 14.00, '685c7cb9d36ea_1750891705.webp', 1, 4.90, 'Intensiv', 'USA', '2025-06-25 21:42:18', '2025-07-07 00:00:18', 'bbq-sauce', 4, NULL, NULL, NULL),
(13, 'Carolina-Style BBQ', 'Traditionelles Südstaaten-Rezept, international preisgekrönt', 14.00, '685c7cc861e68_1750891720.webp', 5, 4.90, 'Preisgekrönt', 'USA', '2025-06-25 21:42:18', '2025-07-06 00:41:11', 'bbq-sauce', 4, NULL, NULL, NULL),
(14, 'Coffee BBQ', 'Eine einzigartige Kombination aus geröstetem Kaffee und geheimen Gewürzen für anspruchsvolle Gaumen', 14.00, '685c8b904c29e_1750895504.webp', 1, 4.00, 'Gourmet', 'USA', '2025-06-25 21:42:18', '2025-07-06 00:41:26', 'bbq-sauce', 12, NULL, NULL, NULL),
(15, 'Chipotle BBQ', 'Das perfekte Gleichgewicht zwischen Chipotle-Schärfe und traditionellem Rauchgeschmack', 14.00, '685c7cebd9c04_1750891755.webp', 2, 4.80, 'Scharf', 'USA', '2025-06-25 21:42:18', '2025-07-06 00:44:44', 'bbq-sauce', 10, NULL, NULL, NULL),
(16, 'Pineapple Papaya BBQ', 'Tropische Aromen, die Ihre Sinne in ein kulinarisches Paradies entführen', 14.00, '685c7cf6513bb_1750891766.webp', 2, 4.60, 'Tropisch', 'USA', '2025-06-25 21:42:18', '2025-07-04 13:24:31', 'bbq-sauce', 12, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `categories`
--

INSERT INTO `categories` (`id`, `slug`, `name`, `description`) VALUES
(1, 'hot-sauce', '🌶️ Hot Sauce', 'Scharfe Saucen aus frischen Chilis'),
(2, 'bbq-sauce', '🔥 BBQ Sauce', 'Rauchige Grillsaucen für perfektes BBQ');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `canton` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `address`, `city`, `postal_code`, `canton`, `notes`, `created_at`, `updated_at`, `last_login`, `is_active`) VALUES
(22, 'infsscccao@lweb.ch', '$2y$10$PT9MYpymVQjlULgcOW5rCOTjy7wFay2y9P1KqoPVPFVfhRg.rsheK', 'ewef', 'eww', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', '2025-06-24 12:19:47', '2025-06-24 12:19:47', NULL, 1),
(23, 'infsscccccao@lweb.ch', '$2y$10$cnTz4vBb4U75T0sXB.D/COCSWJAPOf56SRODd.hivSf298TqCvUdm', 'ewef', 'eww', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', '2025-06-24 12:19:50', '2025-06-24 12:19:50', NULL, 1),
(24, 'infddsscccccao@lweb.ch', '$2y$10$Maf1PqqQ5pFnOWrdbyp8zOq8jOmBFLqJ.Be6gyKYzFX0zqL/qR1qm', 'ewef', 'eww', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', '2025-06-24 12:20:00', '2025-06-24 12:20:00', NULL, 1),
(25, 'infddssscccccao@lweb.ch', '$2y$10$CHqpIyJDWCpX2z98vFK7tu4SIvRoJwu8IBktyJJgrdJRVA7WzHxkW', 'ewef', 'eww', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', '2025-06-24 12:23:21', '2025-06-24 12:23:21', NULL, 1),
(26, 'infdsssdssscccccao@lweb.ch', '$2y$10$R23fjBGspMPZjpTqgoMSxurWkH0kCHhOvOU0865v6Id6MEv2/sdV6', 'ewef', 'eww', '5435434', 'dfgdfgdf', 'dfgfd', '4444', 'dfgdfg', '', '2025-06-24 12:24:03', '2025-06-24 12:24:03', NULL, 1),
(27, 'infoddsssd@lweb.ch', '$2y$10$PKKfvKEZdrZESQwnMULf9OGL8PmDv6F/swAcylbXaIOhgAR3TymX.', 'dq', 'qwdqw', '4123SS43243', 'fwfwf', 'dqdq', '3333', 'qweqw', 'qwdqewd', '2025-06-24 12:32:23', '2025-06-24 12:32:23', NULL, 1),
(28, 'infosdcx2@lweb.ch', '$2y$10$mB2SNMXdQyHblyJkuK3AK.dOghrnoxQRkmkPyu0H0csA49jHvETEG', 'dsd', 'dvd', '3333333322222222222', 'dfsfsd', 'sdfdf', '2232', 'sdfs', '', '2025-06-24 12:43:09', '2025-06-24 12:43:09', NULL, 1),
(29, 'info@cantinatexmex.ch', '$2y$10$liS9jZZxjP1zav3s2F5eIuMPCaK3tJsm6mKwvK3WYnj3Sivdvi47e', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 12:45:25', '2025-06-24 12:45:25', NULL, 1),
(30, 'infoc@cantinatexmex.ch', '$2y$10$S4UQDPoucAW5nNp2Sb5UQe42FjhIMo80ON0YMoUMnB2Y0FBL05sBK', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 12:47:16', '2025-06-24 12:47:16', NULL, 1),
(31, 'infocc@cantinatexmex.ch', '$2y$10$Ncni3E9SMePurd06iPvszuNJEXSnRmlMlfH0QiVbc98O7ojBOgNPO', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 12:51:44', '2025-06-24 12:51:44', NULL, 1),
(32, 'infcocc@cantinatexmex.ch', '$2y$10$1yhWZNscaOVI909PBecNsOOo5fGK89DPIgr9iFq3e95DU5lzhMwnq', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 12:53:22', '2025-06-24 12:53:22', NULL, 1),
(33, 'infcocdc@cantinatexmex.ch', '$2y$10$u1oFSZ50wHD/2JuLmFmcteAhcAwSVoSnVr4GsN6NXR5v3esrSdjkG', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 12:57:49', '2025-06-24 12:57:49', NULL, 1),
(34, 'infcocssdc@cantinatexmex.ch', '$2y$10$20BRHYKtgeIXmE3dOiQkR.iERaAV0t5ifaTnlEuZHD8GclvUtmogi', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 13:00:56', '2025-06-24 13:00:56', NULL, 1),
(37, 'infcocsusdc@cantinatexmex.ch', '$2y$10$1QOxuHv0iLYpXf52bxjWse223WN6Ktxeov71uAkMm9wurpwcoc8PC', 'ddd', 'ddd', '457765', 'Rietliweg 1', 'Sevelen', '9475', 'ddddddd', '', '2025-06-24 13:09:06', '2025-06-24 13:09:06', NULL, 1),
(38, 'infsssso@lweb.ch', '$2y$10$h2xkLyHytIpn8S2a0rPDf.XEhMhcLeIAONXyc9Q5p6HD8NrwXQ.NG', 'ddd', 'ddd', '343243243242s', 'Rietliweg 1', 'Sevelen', '9475', 'dfdf', '', '2025-06-24 13:09:35', '2025-06-24 13:09:35', NULL, 1),
(39, 'infssssxo@lweb.ch', '$2y$10$O65doBBEllL9ugGiHcalCuD63qDjm0TtkhmEFOL.b5YmyQaaHVEZ.', 'Robertod', 'Salvador', '343243243242s', 'Rietliweg 1h', 'Sevelen', '9475', 'dfdf', '', '2025-06-24 13:15:20', '2025-06-24 13:26:12', '2025-06-24 13:16:06', 1),
(40, 'infosee@lweb.ch', '$2y$10$TVNyV5vxIzMeGBiL9xnU..W9W/6.eltE1nzcMICI2UC9bOYIGXiHu', 'dss', 'dcsd', '3432452352345', 'fdsfdsfs', 'svfdsv', '1234', 'dfvdfv', 'bvdfv', '2025-06-24 13:53:31', '2025-06-24 14:03:54', '2025-06-24 14:03:54', 1),
(41, 'infosese@lweb.ch', '$2y$10$Urcqi9HUpjQj1Mjg2oj5KuJyc9hggrW6CJ5dbJxzbxwARHbSh9meO', 'dss', 'dcsd', '3432452352345', 'fdsfdsfs', 'svfdsv', '1234', 'dfvdfv', 'bvdfv', '2025-06-24 14:04:24', '2025-06-24 14:07:06', '2025-06-24 14:07:06', 1),
(43, 'inforsdcx2@lweb.ch', '$2y$10$O7nB35epfO2fJdFnPvFLNe9CZyTCBIHKsE.PFTx7t1dZjclgH0YEa', 'efwf', 'wefewf', 'zututz', 'tzutzu', 'grtght', '1234', 'grtgtr', 'rthr', '2025-06-24 22:10:12', '2025-06-24 22:12:02', '2025-06-24 22:12:02', 1),
(44, 'info@lweb.ch', '$2y$10$uULnsEDGle7HziZ6fXDYjOYqT8blcDQdLyrxJirOFN/dTqQD91keS', 'Roberto', 'Salvador', '08290202322', 'tzutzuDDD', 'grtght', '1111', 'grtgtr', 'rthr', '2025-06-24 22:24:54', '2025-07-06 23:59:13', '2025-07-06 23:58:33', 1),
(45, 'infxo@lweb.ch', '$2y$10$YY3QxVtswxqKaLBC.y9kEOaouJW9YRkAS8UfP7ZxJWwclZZZtg8Fy', 'cdc', 'cds', '', '', '', '', '', '', '2025-06-30 23:37:24', '2025-06-30 23:37:24', NULL, 1),
(46, 'onfo@lweb.ch', '$2y$10$zrUjK0gAyYpCeS2.uPixj.tuAV7jrVVVvlLkEOwEeAVbsInw2whzG', 'ifghdf', 'fgh', '', '', '', '', '', '', '2025-06-30 23:38:10', '2025-06-30 23:39:30', '2025-06-30 23:39:30', 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_accessed` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `session_token`, `expires_at`, `created_at`, `last_accessed`) VALUES
(25, 22, '170a0f29daf244686f220e2dceb583ef596e0d12f942db54c7872585435d7882', '2025-07-24 12:57:10', '2025-06-24 12:19:47', '2025-06-24 12:57:10'),
(26, 23, 'b986dcebd11fcbbcf06ab74f874005f3fcb8f84c892008a0f49f06f9415c8392', '2025-07-24 12:57:10', '2025-06-24 12:19:50', '2025-06-24 12:57:10'),
(27, 24, '7813fab725546ea77b63441196a8ff2834635c52a20fa787c619f76d42a8f0bb', '2025-07-24 12:57:10', '2025-06-24 12:20:00', '2025-06-24 12:57:10'),
(28, 25, 'cc5c25d44f3c9f00ab81f67370ab91a351ff809d7bd7387d2fb571d0a7a8df79', '2025-07-24 12:57:10', '2025-06-24 12:23:21', '2025-06-24 12:57:10'),
(29, 26, 'ebbbf94eb897c4d59e2a7bec9de8a0482deee996ec6604bbe50d976b4d74a449', '2025-07-24 12:57:10', '2025-06-24 12:24:03', '2025-06-24 12:57:10'),
(30, 27, '68f9967af988b73bb58d4b0b50e96d22797915523a769c93439a5f6f89cfd937', '2025-07-24 12:57:10', '2025-06-24 12:32:23', '2025-06-24 12:57:10'),
(31, 28, '0def91994e66cdc0f62cae3a98eb930768064d81161b1846bb51ab22a2cca2f2', '2025-07-24 12:57:10', '2025-06-24 12:43:09', '2025-06-24 12:57:10'),
(32, 29, '55d0666e3ffbe50382944a9702681b66cdd46a2c002f59cb17140a4fd84d67f5', '2025-07-24 12:57:10', '2025-06-24 12:45:25', '2025-06-24 12:57:10'),
(33, 30, '091105871c7af4566d576377e19a71dc87006d62a2e4b66a1bef0aecf008c59c', '2025-07-24 12:57:10', '2025-06-24 12:47:16', '2025-06-24 12:57:10'),
(34, 31, '8bbf6e706480d2c9be2b6069706d6ac44ee40d552bf6f23ed6b70d40c074552e', '2025-07-24 12:57:10', '2025-06-24 12:51:44', '2025-06-24 12:57:10'),
(35, 32, '3e280e91dd03d8f630853349d1ac494772e3e6219bebf91e34bb3ae5642eae54', '2025-07-24 12:57:10', '2025-06-24 12:53:22', '2025-06-24 12:57:10'),
(36, 33, '1662d5b67b3c4f2a3cd061ff7976af177812b68ec7d29a6b578105e7fa44c9be', '2025-07-24 12:57:59', '2025-06-24 12:57:49', '2025-06-24 12:57:59'),
(37, 34, 'b452fe3ea8f75ff7d99f5ef467fd10e36929be6abf3ea57c2395dcdc60049197', '2025-07-24 13:01:11', '2025-06-24 13:00:56', '2025-06-24 13:01:11'),
(40, 37, 'f07f5e34bd4a87384d03453a3776f55e8a3216764d7ca0de8f111388da8e814e', '2025-08-06 14:04:19', '2025-06-24 13:09:06', '2025-07-07 14:04:19'),
(41, 38, 'b6a426a3c4b0257b329462da4836e2fa60272d8edaa1aaeff72c5dcd13422b75', '2025-07-24 13:14:44', '2025-06-24 13:09:35', '2025-06-24 13:14:44'),
(42, 39, '46adddbfe488fca49f2c3855a6171e18381590443501c7c94bfc6a7065403c33', '2025-07-24 13:15:34', '2025-06-24 13:15:20', '2025-06-24 13:15:34'),
(43, 39, 'c4ba95efa72c7020e9c0b55a555734565abc6f85e29910020acd2cd22866a072', '2025-07-24 23:00:21', '2025-06-24 13:16:06', '2025-06-24 23:00:21'),
(44, 40, 'c89fb6a3544468e7d3932f64a3de7b1f5da0524efc600b9a35e53ad08f5ce4cb', '2025-07-24 13:53:56', '2025-06-24 13:53:31', '2025-06-24 13:53:56'),
(45, 40, '2fb0ed54e19adb837669ea3df8320ff7c374283da3e777706c38be28a0a2dad3', '2025-07-24 22:51:54', '2025-06-24 13:54:08', '2025-06-24 22:51:54'),
(46, 40, '893cbdb74640fe098d8750dc288f92486457f8d5c629c1737c4da12e26016632', '2025-07-24 14:04:03', '2025-06-24 14:03:54', '2025-06-24 14:04:03'),
(47, 41, '15bb323e4163766233f8b8a8fddb1aec4fbb84bc994d8491e47f7a1555893277', '2025-07-24 14:04:31', '2025-06-24 14:04:24', '2025-06-24 14:04:31'),
(48, 41, 'bf274c70155847df44d4b6ac824785cd8357f8c71e425d79c38f707f47645e0e', '2025-07-24 14:06:27', '2025-06-24 14:06:27', '2025-06-24 14:06:27'),
(49, 41, 'd9eac9e6e4605cc8b3c93a1a73ba7fb7ee5bd64997419cc7f9575ba881045031', '2025-07-24 14:11:34', '2025-06-24 14:07:06', '2025-06-24 14:11:34'),
(53, 43, '1dfd467940ea6d6cd9cb309cff5ebc59a12e803f6f2202bf722387f2140e9a57', '2025-07-24 22:11:45', '2025-06-24 22:10:12', '2025-06-24 22:11:45'),
(54, 43, 'bac971c1d15e0679de8105969619fbd29dc324a49b735a7150cbfc1f4a295b34', '2025-07-24 22:12:02', '2025-06-24 22:12:02', '2025-06-24 22:12:02'),
(55, 44, '46bcf8ac2624dba8315394f5d3d999c4375d5bfd343a83db45ab25e472caa02f', '2025-06-29 20:54:42', '2025-06-24 22:24:54', '2025-06-24 22:24:54'),
(56, 44, 'f5ad06b8ed53dea7157591e15b4565e334cbb0543b249951a8858ce3f85f2ec3', '2025-06-29 20:54:42', '2025-06-24 22:30:17', '2025-06-24 22:31:39'),
(57, 44, 'cb91bf5f1b0526550842a6af98489c3c91bd28d1bac3f3bcdfd1603544510ecf', '2025-06-29 20:54:42', '2025-06-24 22:37:02', '2025-06-24 22:37:19'),
(58, 44, '50168d15aa5fb8489bc2b95ea4d5a359eb39fe5c630a40e9d9503d5bde5c8c73', '2025-06-29 20:54:42', '2025-06-24 22:37:35', '2025-06-24 22:49:04'),
(59, 44, '47e5426d1dfb16a5bb3413180b92eebfead99906d45ab0faa6511b9a9e2ac8db', '2025-06-29 20:54:42', '2025-06-24 22:51:35', '2025-06-24 23:22:02'),
(60, 44, '486226d5c43ca4adf4af5e613fff81e0bb0dbded29e89e8e9b5ecb574173a89e', '2025-06-29 20:54:42', '2025-06-24 22:52:09', '2025-06-24 22:56:25'),
(61, 44, 'f51005879ccbf97e7a8ca018d5ee9cb803ac21306d894da2d3f4f40b0dc7d719', '2025-06-29 20:54:42', '2025-06-24 22:56:51', '2025-06-25 23:53:32'),
(62, 44, '45be9809a72e6515b450cf5823c3a0dd93bab92a9694e6c0598700776dd14179', '2025-06-29 20:54:42', '2025-06-24 23:00:42', '2025-06-24 23:19:03'),
(63, 44, 'a164bc7ff215d8ff496c63becb6e5b8e51e5fe27b3582e512a19aa3bdd9ed655', '2025-06-29 20:54:42', '2025-06-25 13:33:06', '2025-06-29 20:38:59'),
(64, 44, '9c7f988fef83b11f079a191005ff20934577f2864381031b61f4a58818f9d84b', '2025-06-29 20:54:42', '2025-06-25 13:48:06', '2025-06-25 14:09:20'),
(65, 44, '8fb4d32fea180b116e6d70ab4caf1cbf7cea0a7598f2a702a8a1f234e5348c5e', '2025-06-29 20:54:42', '2025-06-25 14:09:42', '2025-06-29 13:49:55'),
(66, 44, 'fcaa188c7c082f9cf07da832c3a4585986eaef055d3ae37f774023db3bce688a', '2025-06-29 20:54:42', '2025-06-25 14:18:32', '2025-06-25 14:23:34'),
(67, 44, 'a980a074b535105420b43a47ae14a30be45d46b12c953af0c339b3c6c70931e0', '2025-07-30 22:18:21', '2025-06-29 20:54:22', '2025-06-30 22:18:21'),
(68, 44, '0ebdb47b719b39731aa12d93fda7942940a76d717433711215c08889589ed4d2', '2025-07-30 11:32:28', '2025-06-29 22:52:06', '2025-06-30 11:32:28'),
(69, 44, '698b122963825751fed337729cd0e0aad8b5c3caf43020a3f18b4c4abb089350', '2025-07-30 10:59:45', '2025-06-30 10:40:39', '2025-06-30 10:59:45'),
(70, 44, '2392b373baf6efbf83e1680fceb3167249ab225e0872474f4c13c2facc64a7d1', '2025-08-05 22:25:52', '2025-06-30 11:33:08', '2025-07-06 22:25:52'),
(71, 44, '594e2f474622da2dcf1de53712dcc6c9f4cda6221f0ffb2990f36fa574856af5', '2025-08-06 13:55:51', '2025-06-30 22:19:36', '2025-07-07 13:55:51'),
(72, 44, 'a6177e3c47a375165cee02b523cd1fb86c875f4b8fde576bb08ce40c86aedef2', '2025-08-06 14:50:16', '2025-06-30 22:47:48', '2025-07-07 14:50:16'),
(73, 44, '66f82f250f548baff612c16181e7a69438aef8f258ad585a1884c9c61dfa3e4f', '2025-07-30 23:31:08', '2025-06-30 23:27:15', '2025-06-30 23:31:08'),
(74, 45, '1a3e7406c62e5e321aa4e0974fbd092d1125e58fb7acfb6e87e0fd59b99fc176', '2025-07-30 23:37:24', '2025-06-30 23:37:24', '2025-06-30 23:37:24'),
(75, 46, 'ba7f18efef23f53b91c1d9381beb7c7194d099e7251345eca7ed783b68227889', '2025-07-30 23:39:08', '2025-06-30 23:38:10', '2025-06-30 23:39:08'),
(76, 46, 'd94746a3cd7ba6e9e6dca48bbb39d04ea5017b42ff2dda06f366e1e5709f1a9c', '2025-07-31 22:19:32', '2025-06-30 23:39:30', '2025-07-01 22:19:32'),
(77, 44, 'b2e217cb68d756c6c8e3537e474d1713d2091373377f4a81d58da21a6462afc3', '2025-08-05 01:06:26', '2025-07-01 14:49:52', '2025-07-06 01:06:26'),
(78, 44, 'f1fde31fc6651aef978d86a965c9830685d60f7792834a3bd4d4138e5416c2fd', '2025-08-06 13:52:19', '2025-07-01 22:20:02', '2025-07-07 13:52:19'),
(79, 44, 'd154434c817d044f0e1b7643683d14deb40cf6fad6c33801d5b171118cf1557f', '2025-08-01 00:02:15', '2025-07-01 23:31:58', '2025-07-02 00:02:15'),
(80, 44, 'b47a4c6c6bcb2af5c11fa3231e8dc4723a79b76520fb0db9c75612e9b405a289', '2025-08-06 15:24:44', '2025-07-06 00:27:10', '2025-07-07 15:24:44'),
(81, 44, '7ed0474a3a87ec2b49eafe14f0c4ca4653dbb5b40473e91e803c7e39316028ce', '2025-08-05 22:38:46', '2025-07-06 22:38:38', '2025-07-06 22:38:46'),
(82, 44, '78fa3e80b5a7a69232bf2b1e31134b36d422e636d6cfaf0d86063eabd7314d18', '2025-08-06 17:34:08', '2025-07-06 23:58:33', '2025-07-07 17:34:08');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indizes für die Tabelle `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_orders_email` (`customer_email`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_created_at` (`created_at`),
  ADD KEY `idx_orders_user_id` (`user_id`);

--
-- Indizes für die Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_id` (`order_id`);

--
-- Indizes für die Tabelle `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_created_at` (`created_at`);

--
-- Indizes für die Tabelle `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_sessions_token` (`session_token`),
  ADD KEY `idx_sessions_user_id` (`user_id`),
  ADD KEY `idx_user_sessions_token` (`session_token`),
  ADD KEY `idx_user_sessions_expires` (`expires_at`),
  ADD KEY `idx_user_sessions_user_id` (`user_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT für Tabelle `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT für Tabelle `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT für Tabelle `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints der Tabelle `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

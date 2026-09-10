-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 13, 2026 at 02:24 PM
-- Server version: 8.0.46-0ubuntu0.24.04.3
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ip_std6730202483`
--

-- --------------------------------------------------------

--
-- Table structure for table `psus`
--

CREATE TABLE `psus` (
  `psu_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `wattage` int NOT NULL,
  `efficiency_rating` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modular_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `psus`
--

INSERT INTO `psus` (`psu_id`, `name`, `brand`, `wattage`, `efficiency_rating`, `modular_type`, `price`, `stock`, `image`, `created_at`) VALUES
(1, 'Corsair RM850x', 'Corsair', 850, '80 Plus Gold', 'Full Modular', 4590.00, 10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQRMTjgBNCtbpxZSnrjWeaLJDeqGJ58GfNZRv7R0ORBg&s=10', '2026-07-23 03:24:48'),
(2, 'Seasonic Focus GX-750', 'Seasonic', 750, '80 Plus Gold', 'Full Modular', 3890.00, 5, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV2lXauMCh1KWf_PT3nz5uJh5HiSO3F_UsL31fyrBe9w&s=10', '2026-07-23 03:24:48'),
(11, 'AZZA PSAZ 550W Bronze', 'AZZA', 550, '80 Plus Bronze', 'Non-Modular', 990.00, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR07w9uEaD3vP0eZcZlhjL7d66wVwLh49G69Q&s=10', '2026-09-10 10:25:00'),
(12, 'FSP HV PRO 550W', 'FSP', 550, '80 Plus White', 'Non-Modular', 1290.00, 18, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqL_qU4bJgY9ZzQzY7wLh49G69Q&s=10', '2026-09-10 10:25:00'),
(13, 'MSI MAG A600DN 600W', 'MSI', 600, '80 Plus Standard', 'Non-Modular', 1590.00, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT65M6_621QZf_Xv8fK1_Lq4G69Q&s=10', '2026-09-10 10:25:00'),
(14, 'Cooler Master MWE Bronze 650W V2', 'Cooler Master', 650, '80 Plus Bronze', 'Non-Modular', 2190.00, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL8zQhZq_Xv8fK1_Lq4G69Q&s=10', '2026-09-10 10:25:00'),
(15, 'Thermaltake Toughpower GX1 700W', 'Thermaltake', 700, '80 Plus Gold', 'Non-Modular', 2790.00, 12, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqO9uEaD3vP0eZcZlhjL7d66wVw&s=10', '2026-09-10 10:25:00'),
(16, 'SilverStone DA650 Gold 650W', 'SilverStone', 650, '80 Plus Gold', 'Full Modular', 3290.00, 10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT65M6_621QZf_Xv8fK1_Lq4G69Q&s=10', '2026-09-10 10:25:00'),
(17, 'ASUS ROG Thor 850W Platinum', 'ASUS', 850, '80 Plus Platinum', 'Full Modular', 7490.00, 4, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL8zQhZq_Xv8fK1_Lq4G69Q&s=10', '2026-09-10 10:25:00'),
(18, 'be quiet! Dark Power Pro 12 1000W', 'be quiet!', 1000, '80 Plus Titanium', 'Full Modular', 8990.00, 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqO9uEaD3vP0eZcZlhjL7d66wVw&s=10', '2026-09-10 10:25:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `psus`
--
ALTER TABLE `psus`
  ADD PRIMARY KEY (`psu_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `psus`
--
ALTER TABLE `psus`
  MODIFY `psu_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

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
(2, 'Seasonic Focus GX-750', 'Seasonic', 750, '80 Plus Gold', 'Full Modular', 3890.00, 5, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV2lXauMCh1KWf_PT3nz5uJh5HiSO3F_UsL31fyrBe9w&s=10', '2026-07-23 03:24:48');

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

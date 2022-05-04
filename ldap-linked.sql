SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Database: `ldap-linked`
--

CREATE DATABASE `ldap-linked`;
USE `ldap-linked`;

-- --------------------------------------------------------

--
-- Table structure for table `gmail`
--

CREATE TABLE `gmail` (
  `ad_id` varchar(100) NOT NULL,
  `gmail_id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Gmails that''ve bin linked with active directory users.';

-- --------------------------------------------------------

--
-- Table structure for table `refresh_token`
--

CREATE TABLE `refresh_token` (
  `refresh_token` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='refresh tokens of users.';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `gmail`
--
ALTER TABLE `gmail`
  ADD PRIMARY KEY (`ad_id`);

--
-- Indexes for table `refresh_token`
--
ALTER TABLE `refresh_token`
  ADD UNIQUE KEY `refresh_token` (`refresh_token`) USING HASH;
COMMIT;

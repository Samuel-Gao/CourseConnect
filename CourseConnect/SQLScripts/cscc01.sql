-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: cscc01.cslvmb8azdb7.us-west-2.rds.amazonaws.com
-- Generation Time: Jul 03, 2017 at 10:52 PM
-- Server version: 5.6.27-log
-- PHP Version: 5.6.30

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cscc01`
--
CREATE DATABASE IF NOT EXISTS `cscc01` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `cscc01`;

-- --------------------------------------------------------

--
-- Table structure for table `Class`
--

DROP TABLE IF EXISTS `Class`;
CREATE TABLE IF NOT EXISTS `Class` (
  `c_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(80) NOT NULL,
  `description` varchar(160) DEFAULT NULL,
  `CourseCode` varchar(30) NOT NULL,
  `Semester` varchar(1) NOT NULL COMMENT 'F, S, Y',
  `Year` varchar(4) NOT NULL,
  `SchoolID` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`c_id`),
  KEY `SchoolID` (`SchoolID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Friends`
--

DROP TABLE IF EXISTS `Friends`;
CREATE TABLE IF NOT EXISTS `Friends` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `User1` int(11) DEFAULT NULL,
  `User2` int(11) DEFAULT NULL,
  `hasAccepted` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`f_id`),
  KEY `User1` (`User1`),
  KEY `User2` (`User2`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
CREATE TABLE IF NOT EXISTS `Message` (
  `m_id` int(11) NOT NULL AUTO_INCREMENT,
  `messageTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `message` varchar(255) NOT NULL,
  `ParticipantID` int(11) NOT NULL,
  PRIMARY KEY (`m_id`),
  KEY `Message_ibfk_1` (`ParticipantID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Participant`
--

DROP TABLE IF EXISTS `Participant`;
CREATE TABLE IF NOT EXISTS `Participant` (
  `p_id` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) DEFAULT NULL,
  `ClassID` int(11) DEFAULT NULL,
  `RoleID` int(11) DEFAULT NULL,
  PRIMARY KEY (`p_id`),
  KEY `UserID` (`UserID`),
  KEY `RoleID` (`RoleID`),
  KEY `ClassID` (`ClassID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
CREATE TABLE IF NOT EXISTS `Posts` (
  `po_id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(60) DEFAULT NULL,
  `postTime` datetime DEFAULT NULL,
  `description` varchar(160) DEFAULT NULL,
  `ParticipantID` int(11) DEFAULT NULL,
  `parent_po_id` int(11) DEFAULT NULL COMMENT 'If
   post is a follow-up, put its parent post id here',
  `solved` varchar(15) NOT NULL DEFAULT 'Unsolved',
  `solution` int(11) DEFAULT NULL COMMENT 'It is the
  id of follow-up for solution',
  PRIMARY KEY (`po_id`),
  KEY `ParticipantID` (`ParticipantID`),
  KEY `Posts_ibfk_2` (`parent_po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `PrivateMessage`
--

DROP TABLE IF EXISTS `PrivateMessage`;
CREATE TABLE IF NOT EXISTS `PrivateMessage` (
  `pm_id` int(11) NOT NULL AUTO_INCREMENT,
  `messageTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `message` varchar(255) NOT NULL,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  PRIMARY KEY (`pm_id`),
  KEY `PrivateMessage_ibfk_1` (`from_user_id`),
  KEY `PrivateMessage_ibfk_2` (`to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Resources`
--

DROP TABLE IF EXISTS `Resources`;
CREATE TABLE IF NOT EXISTS `Resources` (
  `r_id` int(11) NOT NULL AUTO_INCREMENT,
  `resourceTime` datetime DEFAULT NULL,
  `fileLocation` varchar(255) DEFAULT NULL,
  `ParticipantID` int(11) DEFAULT NULL,
  PRIMARY KEY (`r_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
CREATE TABLE IF NOT EXISTS `Roles` (
  `r_id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(60) NOT NULL,
  `Description` varchar(120) DEFAULT NULL,
  `sendMessage` tinyint(1) NOT NULL DEFAULT '1',
  `post` tinyint(1) NOT NULL DEFAULT '1',
  `uploadFile` tinyint(1) NOT NULL DEFAULT '1',
  `DeleteOwnMessage` tinyint(1) NOT NULL DEFAULT '1',
  `DeleteOwnPost` tinyint(1) NOT NULL DEFAULT '1',
  `DeleteOwnFile` tinyint(1) NOT NULL DEFAULT '1',
  `DeleteOtherMessage` tinyint(1) NOT NULL DEFAULT '0',
  `DeleteOtherPost` tinyint(1) NOT NULL DEFAULT '0',
  `DeleteOtherFile` tinyint(1) NOT NULL DEFAULT '0',
  `DeleteRoom` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`r_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Roles`
--

INSERT INTO `Roles` (`r_id`, `Name`, `Description`, `sendMessage`, `post`, `uploadFile`, `DeleteOwnMessage`, `DeleteOwnPost`, `DeleteOwnFile`, `DeleteOtherMessage`, `DeleteOtherPost`, `DeleteOtherFile`, `DeleteRoom`) VALUES
(1, 'Creator', 'Creator of the classroom', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
(2, 'Manager', NULL, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
(3, 'Teacher', NULL, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0),
(4, 'Student', NULL, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `School`
--

DROP TABLE IF EXISTS `School`;
CREATE TABLE IF NOT EXISTS `School` (
  `s_id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(80) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `contactName` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `PostalCode` char(8) DEFAULT NULL,
  PRIMARY KEY (`s_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `School`
--

INSERT INTO `School` (`s_id`, `Name`, `email`, `contactName`, `phone`, `PostalCode`) VALUES
(1, 'UTSC', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
CREATE TABLE IF NOT EXISTS `session` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session` varchar(45) NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE IF NOT EXISTS `Users` (
  `u_id` int(11) NOT NULL AUTO_INCREMENT,
  `LastName` varchar(15) NOT NULL,
  `FirstName` varchar(15) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `DisplayName` varchar(30) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `UTorId` varchar(10) DEFAULT NULL,
  `Password` varchar(10) NOT NULL,
  `SecurityQ1` varchar(20) DEFAULT NULL,
  `A1` varchar(15) DEFAULT NULL,
  `SecurityQ2` varchar(20) DEFAULT NULL,
  `A2` varchar(15) DEFAULT NULL,
  `SecurityQ3` varchar(20) DEFAULT NULL,
  `A3` varchar(15) DEFAULT NULL,
  `fileLocation` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`u_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Class`
--
ALTER TABLE `Class`
  ADD CONSTRAINT `Class_ibfk_1` FOREIGN KEY (`SchoolID`) REFERENCES `School` (`s_id`);

--
-- Constraints for table `Friends`
--
ALTER TABLE `Friends`
  ADD CONSTRAINT `Friends_ibfk_1` FOREIGN KEY (`User1`) REFERENCES `Users` (`u_id`),
  ADD CONSTRAINT `Friends_ibfk_2` FOREIGN KEY (`User2`) REFERENCES `Users` (`u_id`);

--
-- Constraints for table `Message`
--
ALTER TABLE `Message`
  ADD CONSTRAINT `Message_ibfk_1` FOREIGN KEY (`ParticipantID`) REFERENCES `Participant` (`p_id`);

--
-- Constraints for table `Participant`
--
ALTER TABLE `Participant`
  ADD CONSTRAINT `Participant_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`u_id`),
  ADD CONSTRAINT `Participant_ibfk_2` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`r_id`),
  ADD CONSTRAINT `Participant_ibfk_3` FOREIGN KEY (`ClassID`) REFERENCES `Class` (`c_id`);

--
-- Constraints for table `Posts`
--
ALTER TABLE `Posts`
  ADD CONSTRAINT `Posts_ibfk_1` FOREIGN KEY (`ParticipantID`) REFERENCES `Participant` (`p_id`),
  ADD CONSTRAINT `Posts_ibfk_2` FOREIGN KEY (`parent_po_id`) REFERENCES `Posts` (`po_id`);

--
-- Constraints for table `PrivateMessage`
--
ALTER TABLE `PrivateMessage`
  ADD CONSTRAINT `PrivateMessage_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `Users` (`u_id`),
  ADD CONSTRAINT `PrivateMessage_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `Users` (`u_id`);

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`u_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
SET FOREIGN_KEY_CHECKS=1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

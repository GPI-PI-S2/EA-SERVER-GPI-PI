-- MariaDB dump 10.18  Distrib 10.5.8-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: GPIPI
-- ------------------------------------------------------
-- Server version	10.5.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Analysis`
--

DROP TABLE IF EXISTS `Analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Analysis` (
  `_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `_entryId` bigint(20) unsigned NOT NULL,
  `Asertividad` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Autoconciencia Emocional` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Autoestima` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Colaboración y Cooperación` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Comprensión Organizativa` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Conciencia Crítica` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Desarrollo de las relaciones` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Empatía` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Influencia` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Liderazgo` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Manejo de conflictos` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Motivación de logro` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Percepción y comprensión Emocional` decimal(5,4) NOT NULL,
  `Optimismo` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Relación Social` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Tolerancia a la frustración` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `Violencia` decimal(5,4) NOT NULL DEFAULT 0.0000,
  `modelVersion` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `completionDate` date NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`_id`),
  KEY `Analysis_FK` (`_entryId`),
  CONSTRAINT `Analysis_FK` FOREIGN KEY (`_entryId`) REFERENCES `Entry` (`_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Entry`
--

DROP TABLE IF EXISTS `Entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Entry` (
  `_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hash` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` date NOT NULL DEFAULT current_timestamp(),
  `extractor` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metaKey` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `Entry_hash_IDX` (`hash`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'GPIPI'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-12-01 23:24:01

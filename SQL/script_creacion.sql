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

-- Base de datos: `GPIPI`	
--	
CREATE DATABASE IF NOT EXISTS `GPIPI` DEFAULT CHARSET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;	
USE GPIPI;

--
-- Table structure for table `Analysis`
--

DROP TABLE IF EXISTS `Analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Analysis` (
  `_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `_entryId` bigint(20) unsigned NOT NULL,
  `asertividad` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `autoconciencia emocional` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `autoestima` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `desarrollar y estimular a los demás` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `empatía` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `autocontrol emocional` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `influencia` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `liderazgo` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `optimismo` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `relación social` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `colaboración y cooperación` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `comprensión organizativa` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `conciencia crítica` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `desarrollo de las relaciones` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `tolerancia a la frustración` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `comunicacion asertiva` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `manejo de conflictos` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `motivación de logro` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `percepción y comprensión emocional` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `violencia` decimal(7,4) NOT NULL DEFAULT 0.0000,
  `modelVersion` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `completionDate` date NOT NULL DEFAULT current_timestamp(),
  `hash` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `Analysis_FK` (`_entryId`) USING BTREE,
  CONSTRAINT `Analysis_FK` FOREIGN KEY (`_entryId`) REFERENCES `Entry` (`_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*50017 DEFINER=``*/ /*!50003 TRIGGER `Entry_id_from_hash`
BEFORE INSERT
ON `Analysis` FOR EACH ROW
BEGIN
  IF (NEW.hash IS NOT NULL) THEN 
    SET NEW._entryId = (SELECT _id FROM Entry WHERE Entry.hash = NEW.hash);
  END IF;
END */;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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

-- Dump completed on 2020-12-02 21:56:34

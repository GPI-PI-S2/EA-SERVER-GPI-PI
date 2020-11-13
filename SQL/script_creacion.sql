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
  `entry_id` bigint(20) unsigned NOT NULL,
  `completition_date` date NOT NULL DEFAULT current_timestamp(),
  `model_version` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asertividad` decimal(10,0) NOT NULL,
  `autoconciencia_emocional` decimal(10,0) NOT NULL,
  `autoestima` decimal(10,0) NOT NULL,
  `colaboracion_cooperacion` decimal(10,0) NOT NULL,
  `comprension_organizativa` decimal(10,0) NOT NULL,
  `conciencia_critica` decimal(10,0) NOT NULL,
  `desarrollo_relaciones` decimal(10,0) NOT NULL,
  `empatia` decimal(10,0) NOT NULL,
  `influencia` decimal(10,0) NOT NULL,
  `liderazgo` decimal(10,0) NOT NULL,
  `manejo_conflictos` decimal(10,0) NOT NULL,
  `motivacion_logros` decimal(10,0) NOT NULL,
  `optimismo` decimal(10,0) NOT NULL,
  `percepcion_comprension_emocional` decimal(10,0) NOT NULL,
  `relacion_social` decimal(10,0) NOT NULL,
  `tolerancia_frustracion` decimal(10,0) NOT NULL,
  `violencia` decimal(10,0) NOT NULL,
  PRIMARY KEY (`_id`),
  KEY `Analysis_FK` (`entry_id`),
  CONSTRAINT `Entry_FK` FOREIGN KEY (`entry_id`) REFERENCES `Entry` (`_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Analysis`
--

LOCK TABLES `Analysis` WRITE;
/*!40000 ALTER TABLE `Analysis` DISABLE KEYS */;
/*!40000 ALTER TABLE `Analysis` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `Entry_hash_IDX` (`hash`,`extractor`,`metaKey`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Entry`
--

LOCK TABLES `Entry` WRITE;
/*!40000 ALTER TABLE `Entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `Entry` ENABLE KEYS */;
UNLOCK TABLES;

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

-- Dump completed on 2020-11-13 15:29:52

-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: prodev_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `qty` int DEFAULT NULL,
  `cart_id` bigint DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpcttvuq4mxppo8sxggjtn5i2c` (`cart_id`),
  KEY `FK1re40cjegsfvw58xrkdp6bac6` (`product_id`),
  CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK64t7ox312pqal3p7fg9o503c2` (`user_id`),
  CONSTRAINT `FKb5o626f86h46m4s7ms6ginnop` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,NULL,2),(2,NULL,3);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`),
  CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK32ql8ubntj5uh44ph9659tiih` (`user_id`),
  CONSTRAINT `FK32ql8ubntj5uh44ph9659tiih` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `product_id` bigint NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  KEY `FKqnq71xsohugpqwf3c9gxmsuy` (`product_id`),
  CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (4,'/uploads/products/1757216081805_iphone1.jpeg'),(4,'/uploads/products/1757216081805_iphone2.jpeg'),(4,'/uploads/products/1757216081805_iphone3.jpeg'),(6,'/uploads/products/1757216329696_office chair1.jpeg'),(6,'/uploads/products/1757216329697_office chair2.jpeg'),(6,'/uploads/products/1757216329697_office chair3.jpeg'),(7,'/uploads/products/1757216481090_table dining1.webp'),(7,'/uploads/products/1757216481090_table dining2.jpeg'),(7,'/uploads/products/1757216481091_table dining3.jpeg'),(7,'/uploads/products/1757216481091_table dining4.webp'),(8,'/uploads/products/1757216572833_nike1.webp'),(8,'/uploads/products/1757216572833_nike2.jpeg'),(8,'/uploads/products/1757216572834_nike3.webp'),(10,'/uploads/products/1757226325094_labtop1.webp'),(10,'/uploads/products/1757226325104_labtop2.jpeg'),(10,'/uploads/products/1757226325106_labtop3.jpeg'),(11,'/uploads/products/1757228049810_ipad1.webp'),(11,'/uploads/products/1757228049814_ipad2.webp'),(11,'/uploads/products/1757228049816_ipad3.webp'),(11,'/uploads/products/1757228049817_ipad4.jpeg'),(15,'/uploads/products/1757228867009_m&m1.webp'),(15,'/uploads/products/1757228867011_m&m2.webp'),(15,'/uploads/products/1757228867012_m&m3.jpeg'),(16,'/uploads/products/1757228954513_coffee1.webp'),(16,'/uploads/products/1757228954515_coffee2.jpeg'),(16,'/uploads/products/1757228954518_coffee3.jpeg'),(9,'/uploads/products/1757216674499_hoodie adidas1.webp'),(9,'/uploads/products/1757216674499_hoodie adidas2.webp'),(9,'/uploads/products/1757216674500_hoodie adidas3.jpeg'),(13,'/uploads/products/1757228635578_soup2.webp'),(13,'/uploads/products/1757228635580_soup3.jpeg'),(13,'/uploads/products/1757228635584_ดาวน์โหลด (2).jpeg'),(13,'/uploads/products/1757235271056_protex4.jpeg'),(3,'/uploads/products/1757215971269_cola1.jpeg'),(3,'/uploads/products/1757215971271_cola2.jpeg'),(3,'/uploads/products/1757215971271_cola3.jpeg'),(3,'/uploads/products/1757215971271_cola4.jpeg'),(5,'/uploads/products/1757216197962_samsung1.jpeg'),(5,'/uploads/products/1757216197963_samsung2.jpeg'),(5,'/uploads/products/1757216197963_samsung3.jpeg'),(14,'/uploads/products/1757228766091_kitkat1.webp'),(14,'/uploads/products/1757228766093_kitkat2.jpeg'),(14,'/uploads/products/1757228766098_kitkat3.jpg'),(2,'/uploads/products/1757215854868_lay1.jpeg'),(2,'/uploads/products/1757215854869_lay2.jpeg'),(2,'/uploads/products/1757215854869_lay3.jpeg'),(2,'/uploads/products/1757215854869_lay4.jpeg'),(1,'/uploads/products/1757215406583_ดาวน์โหลด (1).jpeg'),(1,'/uploads/products/1757215406585_benice2.png'),(1,'/uploads/products/1757215406587_benice3.png'),(1,'/uploads/products/1757215406588_benice4.png');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `status_stock` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Shower','2025-09-07 03:23:26.590702','Benefits\r\nBe Nice Shower Cream gently cleanses, keeps skin soft, moisturized, and radiant with a refreshing long-lasting fragrance.\r\n\r\nStorage\r\nStore in a cool, dry place away from sunlight. Close cap tightly after use.\r\n\r\nUnit\r\n1 bottle (450–500 ml)\r\n\r\nSeller\r\nBe Nice / Official retailers\r\n\r\nDisclaimer\r\nImages are for reference only. Please check packaging for exact details.','Be Nice Shower Cream, Perfect Elastic Formula, 450 ml.',109,2,'In stock'),(2,'Snack','2025-09-07 03:30:54.870859','มันฝรั่งทอดกรอบ Lay’s รส Original ความกรอบอร่อยในทุกคำ ผลิตจากมันฝรั่งคุณภาพดี ผ่านกระบวนการผลิตที่สะอาดและได้มาตรฐาน เหมาะสำหรับเป็นของว่างหรือทานคู่กับอาหารจานโปรด.','Lay\'s Classic Potato Chips',35,50,'In stock'),(3,'Food & Drink','2025-09-07 03:32:51.272481','Coca-Cola ขวดใหญ่ 1.5 ลิตร เติมเต็มความสดชื่นในทุกโอกาส รสชาติหวานซ่าเป็นเอกลักษณ์ที่อยู่คู่คนทั่วโลกมานานกว่า 100 ปี ดื่มเย็นๆ ยิ่งอร่อยและช่วยให้กระปรี้กระเปร่า.','Coca-Cola 1.5L',25,100,'In stock'),(4,'SmartPhone','2025-09-07 03:34:41.806738','iPhone 14 Pro มาพร้อมชิป A16 Bionic อันทรงพลังและดีไซน์ใหม่ Dynamic Island กล้องความละเอียดสูงที่ช่วยถ่ายภาพได้อย่างคมชัดทั้งกลางวันและกลางคืน ตัวเครื่องทำจากวัสดุคุณภาพที่ทั้งสวยงามและทนทาน.','iPhone 14 Pro',38900,6,'In stock'),(5,'SmartPhone','2025-09-07 03:36:37.963312','สมาร์ทโฟนเรือธงจาก Samsung ที่มีกล้อง 200MP ถ่ายภาพได้ละเอียดคมชัด มาพร้อมปากกา S Pen สำหรับจดบันทึกและวาดรูป หน้าจอ Dynamic AMOLED 2X ให้ภาพสดใสและการตอบสนองที่ลื่นไหล.','Samsung Galaxy S23 Ultra',35900,780,'In stock'),(6,'Furniture','2025-09-07 03:38:49.697992','เก้าอี้สำนักงานออกแบบตามหลักสรีรศาสตร์ มีระบบปรับระดับได้หลายทิศทางและรองรับหลังอย่างเต็มที่ เบาะนั่งทำจากวัสดุคุณภาพนั่งสบาย สามารถใช้ได้นานโดยไม่ปวดเมื่อย.','Office Chair Ergonomic',4500,12,'In stock'),(7,'Furniture','2025-09-07 03:41:21.091241','โต๊ะทานอาหารไม้เนื้อแข็งสำหรับ 6 ที่นั่ง แข็งแรงทนทาน ดีไซน์คลาสสิคเข้ากับห้องครัวหรือห้องอาหารได้ทุกรูปแบบ เคลือบกันรอยขีดข่วนเพื่อการใช้งานยาวนาน.','Wooden Dining Table',8900,5,'In stock'),(8,'Clothing','2025-09-07 03:42:52.834610','รองเท้ากีฬา Nike Air Max 270 ดีไซน์ทันสมัย เบาและสวมใส่สบาย มีระบบ Air Cushion ที่ช่วยลดแรงกระแทก เหมาะทั้งสำหรับออกกำลังกายและใส่ในชีวิตประจำวัน.','Nike Air Max 270',4900,25,'In stock'),(9,'Clothing','2025-09-07 03:44:34.500310','เสื้อฮู้ด Adidas สีดำที่ทำจากผ้าคุณภาพสูง ให้ความอบอุ่นและสวมใส่สบาย เหมาะสำหรับการแต่งตัวลำลองหรือออกกำลังกายเบา ๆ ดีไซน์เรียบง่ายแต่ดูดี.','Adidas Hoodie Black',2200,100,'In stock'),(10,'Electronics','2025-09-07 06:25:25.108779','MacBook Pro 16 นิ้ว ใช้ชิป M2 Pro ประมวลผลเร็วแรง, RAM 16GB, SSD 1TB, จอ Retina แบบ Liquid Retina XDR รองรับ True Tone, ระบบเสียง 6 ลำโพง และแบตเตอรี่ใช้งานได้ต่อเนื่องถึง 21 ชั่วโมง','Laptop Apple MacBook Pro 16-inch M2 Pro',89900,8,'In stock'),(11,'Electronics','2025-09-07 06:48:13.349325','iPad Pro 12.9-inch รุ่นชิป M2 หน้าจอ Liquid Retina XDR ขนาดใหญ่ รองรับ Apple Pencil 2nd Gen, Magic Keyboard เหมาะสำหรับงานกราฟิก, ตัดต่อวิดีโอ, และจดโน้ตดิจิทัล ประสิทธิภาพแรงระดับ Desktop พร้อม iPadOS 17','iPad Pro 12.9-inch M2',49900,20,'In stock'),(13,'Shower','2025-09-07 07:03:55.587565','สบู่ก้อน Protex Lavender Ice Freeze ขนาด 60 กรัม กลิ่นลาเวนเดอร์เย็นสดชื่น ช่วยทำความสะอาดผิวอย่างอ่อนโยน พร้อมปกป้องแบคทีเรีย ให้ผิวรู้สึกสะอาด สดชื่น และหอมยาวนาน ด้วยส่วนผสมจากธรรมชาติที่ช่วยให้ผิวไม่แห้งตึง เหมาะสำหรับทุกสภาพผิว ทั้งผิวแห้งและผิวมัน ใช้ได้ทุกวันเพื่อผิวสะอาดและมีกลิ่นหอมอ่อนโยน','Protex Lavender Ice Freeze Soap Bar 60 g.',19,20,'In stock'),(14,'Snack','2025-09-07 07:06:06.099541','KitKat เวเฟอร์ช็อกโกแลต 4 ชิ้น ตัวเวเฟอร์กรอบนอก หอมช็อกโกแลตด้านใน ทานง่าย อร่อยลงตัว เหมาะสำหรับพักเบรก ทำงาน หรือทานคู่กับเครื่องดื่ม ช็อกโกแลตคุณภาพดี ผสมกับเวเฟอร์กรอบๆ ให้รสชาติสมดุล เหมาะสำหรับทุกวัย ทานได้ทุกวัน','KitKat Chocolate Wafer 4 Fingers',35,0,'Out of stock'),(15,'Snack','2025-09-07 07:07:47.014346','M&M\'s ช็อกโกแลตเคลือบสีสวย รสชาติหวานมัน ตัวช็อกโกแลตหุ้มถั่วลิสงด้านใน เพิ่มความกรุบกรอบ สนุกสนานในการทาน พกพาสะดวก เหมาะสำหรับทานเล่นระหว่างวัน งานปาร์ตี้ หรือเป็นของว่างระหว่างเรียนและทำงาน ผลิตด้วยช็อกโกแลตคุณภาพสูงและสีธรรมชาติ','M&M\'s Peanut Chocolate 45 g',30,60,'In stock'),(16,'Food & Drink','2025-09-07 07:09:14.520707','Nescafé Blend & Brew 3 in 1 กาแฟสำเร็จรูปพร้อมดื่ม 20 ซอง มีส่วนผสมของกาแฟ, น้ำตาล และครีมเทียม ให้รสชาติเข้มข้น หอมกลมกล่อม ทานง่ายทุกเวลา เหมาะสำหรับคนที่เร่งรีบหรือชอบดื่มกาแฟแบบสะดวกสบาย เพียงฉีกซอง เติมน้ำร้อนก็พร้อมดื่มทันที พกพาสะดวก เหมาะสำหรับทำงาน เรียน หรือพักผ่อน','Nescafé Blend & Brew 3 in 1 Instant Coffee 20 Sticks',120,30,'In stock');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_products`
--

DROP TABLE IF EXISTS `saved_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKiaftdy9f5ce5gqdnhgotdph88` (`user_id`,`product_id`),
  KEY `FKsv5by71hhfc5vm1sjpn53nki4` (`product_id`),
  CONSTRAINT `FKro6mu1ecuh0but0ta5uwmex5r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKsv5by71hhfc5vm1sjpn53nki4` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_products`
--

LOCK TABLES `saved_products` WRITE;
/*!40000 ALTER TABLE `saved_products` DISABLE KEYS */;
INSERT INTO `saved_products` VALUES (1,1,2),(7,2,2),(5,3,2),(6,16,2),(4,3,3);
/*!40000 ALTER TABLE `saved_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@gmail.com','$2a$10$kE3oDEr2PKLGcdNo8qalOuCXs..le0QoiTDyA0X9nhJWO1zy2hDIS','ADMIN','admin'),(2,'test@gmail.com','$2a$10$aMpdQIv7GMelFEnxdLJfC.8vcTS.NmvLaWe9fhuniOcehBxnRG5P2','USER','test'),(3,'kung@gmail.com','$2a$10$WZKqx0xZoUEZfDr7JaJSMuo1c8j5dXdtDQBp.Vh5hDhrX8spEv6nm','USER','kung'),(4,'test@example.com','$2a$10$3kFFD4RllgReAKSuTzcvbeX8hDjp8tVkSMq4GTgxEAgx8NhYRVxV2','USER','tester');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-23  8:57:37

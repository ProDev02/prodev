package aekkasit.prodev.backend.product.controller;

import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    private final ProductRepository productRepository;

    @Value("${upload.dir}")
    private String uploadDir; // เช่น "uploads/products"

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(
            @RequestParam String name,
            @RequestParam String statusStock,
            @RequestParam(required = false) Integer quantity,
            @RequestParam Double price,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam("images") MultipartFile[] images
    ) {
        try {
            List<String> imagePaths = new ArrayList<>();
            String projectRoot = System.getProperty("user.dir");

            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    File dest = new File(projectRoot + File.separator + uploadDir + File.separator + fileName);
                    File parentDir = dest.getParentFile();

                    if (!parentDir.exists() && !parentDir.mkdirs()) {
                        throw new IOException("Failed to create directory: " + parentDir.getAbsolutePath());
                    }

                    file.transferTo(dest);
                    imagePaths.add("/uploads/products/" + fileName); // ✅ Path สำหรับ frontend
                }
            }

            Product product = new Product();
            product.setName(name);
            product.setStatusStock(statusStock);
            if ("In stock".equalsIgnoreCase(statusStock)) {
                product.setQuantity(quantity);
            }
            product.setPrice(price);
            product.setDescription(description);
            product.setCategory(category);
            product.setImages(imagePaths);

            productRepository.save(product);

            return ResponseEntity.ok(product);
        } catch (IOException e) {
            logger.error("Error uploading images", e);
            return ResponseEntity.status(500).body("Error uploading images");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String statusStock,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "existingImages", required = false) String existingImagesJson
    ) {
        return productRepository.findById(id).map(product -> {
            try {
                if (name != null) product.setName(name);
                if (statusStock != null) product.setStatusStock(statusStock);
                if (quantity != null) product.setQuantity(quantity);
                if (price != null) product.setPrice(price);
                if (description != null) product.setDescription(description);
                if (category != null) product.setCategory(category);

                // แปลง JSON string เป็น List
                List<String> existingImages = new ArrayList<>();
                if (existingImagesJson != null && !existingImagesJson.isEmpty()) {
                    existingImages = new ObjectMapper().readValue(existingImagesJson, List.class);
                }

                String projectRoot = System.getProperty("user.dir");
                List<String> updatedImages = new ArrayList<>();

                // ลบรูปเก่าที่ผู้ใช้กดลบ
                for (String imgPath : product.getImages()) {
                    if (existingImages.contains(imgPath)) {
                        updatedImages.add(imgPath); // เก็บเฉพาะรูปที่ยังต้องการ
                    } else {
                        // ลบไฟล์จาก server
                        File fileToDelete = new File(projectRoot + File.separator + imgPath.replace("/", File.separator));
                        if (fileToDelete.exists()) {
                            fileToDelete.delete();
                        }
                    }
                }

                // เพิ่มรูปใหม่
                if (images != null && images.length > 0) {
                    for (MultipartFile file : images) {
                        if (!file.isEmpty()) {
                            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                            File dest = new File(projectRoot + File.separator + uploadDir + File.separator + fileName);
                            File parentDir = dest.getParentFile();
                            if (!parentDir.exists() && !parentDir.mkdirs()) {
                                throw new IOException("Failed to create directory: " + parentDir.getAbsolutePath());
                            }
                            file.transferTo(dest);
                            updatedImages.add("/" + uploadDir + "/" + fileName);
                        }
                    }
                }

                product.setImages(updatedImages);
                productRepository.save(product);

                return ResponseEntity.ok(product);
            } catch (IOException e) {
                logger.error("Error updating images", e);
                return ResponseEntity.status(500).body("Error updating images");
            }
        }).orElse(ResponseEntity.status(404).body("Product not found"));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            productRepository.delete(product);
            return ResponseEntity.ok("Product deleted successfully");
        }).orElse(ResponseEntity.status(404).body("Product not found"));
    }

    //client
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit
    ) {
        // ดึงข้อมูลทั้งหมดจาก DB
        List<Product> all = productRepository.findAll();

        // Filter ตาม category
        if (category != null && !category.equalsIgnoreCase("All")) {
            all = all.stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .toList();
        }

        // Filter ตาม price
        if (minPrice != null) {
            all = all.stream().filter(p -> p.getPrice() >= minPrice).toList();
        }
        if (maxPrice != null) {
            all = all.stream().filter(p -> p.getPrice() <= maxPrice).toList();
        }

        // Filter ตาม keyword
        if (keyword != null && !keyword.isEmpty()) {
            all = all.stream()
                    .filter(p -> p.getName().toLowerCase().contains(keyword.toLowerCase())
                            || p.getDescription().toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
        }

        int total = all.size();

        // Pagination
        int start = (page - 1) * limit;
        int end = Math.min(start + limit, total);
        List<Product> items = start < end ? all.subList(start, end) : new ArrayList<>();

        // Return แบบ object
        return ResponseEntity.ok(Map.of(
                "total", total,
                "items", items
        ));
    }

}

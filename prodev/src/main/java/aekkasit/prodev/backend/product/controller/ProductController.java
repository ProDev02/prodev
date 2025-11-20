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
import org.springframework.security.access.prepost.PreAuthorize;
import me.xdrop.fuzzywuzzy.FuzzySearch;

import java.util.Map;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;  // เพิ่มการ import นี้
import java.util.stream.Collectors;

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
                // อัปเดตข้อมูลทั่วไป
                if (name != null) product.setName(name);
                if (price != null) product.setPrice(price);
                if (description != null) product.setDescription(description);
                if (category != null) product.setCategory(category);

                // อัปเดต statusStock พร้อม quantity
                if (statusStock != null) {
                    product.setStatusStock(statusStock);

                    if ("Out of stock".equalsIgnoreCase(statusStock)) {
                        product.setQuantity(0); // หมด stock = quantity = 0
                    } else if ("In stock".equalsIgnoreCase(statusStock) && quantity != null) {
                        product.setQuantity(quantity); // กำหนด quantity เฉพาะเมื่อ In stock
                    }
                } else if (quantity != null && "In stock".equalsIgnoreCase(product.getStatusStock())) {
                    // อัปเดต quantity เฉพาะถ้า statusStock เป็น In stock
                    product.setQuantity(quantity);
                }

                // จัดการรูปภาพ
                List<String> existingImages = new ArrayList<>();
                if (existingImagesJson != null && !existingImagesJson.isEmpty()) {
                    existingImages = new ObjectMapper().readValue(existingImagesJson, List.class);
                }

                String projectRoot = System.getProperty("user.dir");
                List<String> updatedImages = new ArrayList<>();

                // ลบรูปเก่าที่ผู้ใช้กดลบ
                for (String imgPath : product.getImages()) {
                    if (existingImages.contains(imgPath)) {
                        updatedImages.add(imgPath);
                    } else {
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
                            String destPath = projectRoot + File.separator + uploadDir;

                            if (!destPath.endsWith(File.separator)) {
                                destPath += File.separator;
                            }

                            File dest = new File(destPath + fileName);
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            productRepository.delete(product);
            return ResponseEntity.ok("Product deleted successfully");
        }).orElse(ResponseEntity.status(404).body("Product not found"));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "8") int limit
    ) {
        List<Product> all = productRepository.findAll();

        // Filter ตาม category
        if (category != null && !category.equalsIgnoreCase("All")) {
            all = all.stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        // Filter ตาม price
        if (minPrice != null) {
            all = all.stream().filter(p -> p.getPrice() >= minPrice).collect(Collectors.toList());
        }
        if (maxPrice != null) {
            all = all.stream().filter(p -> p.getPrice() <= maxPrice).collect(Collectors.toList());
        }

        // 🔍 Fuzzy Search รองรับคำผิดเล็กน้อยในแต่ละคำ
        if (keyword != null && !keyword.isEmpty()) {
            String search = keyword.toLowerCase();
            String[] searchTerms = search.split("\\s+");

            all = all.stream()
                    .filter(p -> {
                        String name = p.getName() != null ? p.getName().toLowerCase() : "";
                        String desc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";

                        // แยกคำในชื่อและคำอธิบาย
                        List<String> nameWords = Arrays.asList(name.split("\\W+"));
                        List<String> descWords = Arrays.asList(desc.split("\\W+"));

                        // ให้ผ่านถ้าทุกคำใน searchTerms เจอ match อย่างน้อย 1 ที่
                        return Arrays.stream(searchTerms)
                                .allMatch(term -> {
                                    // 1️⃣ ตรวจคำตรง
                                    boolean exact = nameWords.contains(term) || descWords.contains(term);

                                    // 2️⃣ ตรวจ fuzzy ทีละคำ (ระยะห่างไม่เกิน 1-2 ตัวอักษร)
                                    boolean fuzzyMatch = nameWords.stream()
                                            .anyMatch(w -> FuzzySearch.ratio(term, w) >= 70)
                                            || descWords.stream()
                                            .anyMatch(w -> FuzzySearch.ratio(term, w) >= 70);

                                    return exact || fuzzyMatch;
                                });
                    })
                    .collect(Collectors.toList());
        }

        // เฉพาะสินค้าที่มีของใน stock
        all = all.stream().filter(p -> p.getQuantity() > 0).collect(Collectors.toList());

        int total = all.size();

        // Pagination
        int start = (page - 1) * limit;
        int end = Math.min(start + limit, total);
        List<Product> items = start < end ? all.subList(start, end) : new ArrayList<>();

        return ResponseEntity.ok(Map.of(
                "total", total,
                "items", items
        ));
    }


    //week report
    @GetMapping("/reports/weekly-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getWeeklyStockReport() {
        List<Product> allProducts = productRepository.findAll();

        int totalProducts = allProducts.size();
        int outOfStock = (int) allProducts.stream()
                .filter(p -> p.getQuantity() == 0 || "Out of stock".equalsIgnoreCase(p.getStatusStock()))
                .count();
        int lowStock = (int) allProducts.stream()
                .filter(p -> p.getQuantity() > 0 && p.getQuantity() <= 10)
                .count();

        // map ผลลัพธ์เป็น JSON-friendly
        List<Map<String, Object>> productList = allProducts.stream().map(p -> Map.of(
                "id", p.getId(),
                "name", p.getName(),
                "category", p.getCategory(),
                "quantity", p.getQuantity(),
                "statusStock", p.getStatusStock(),
                "price", p.getPrice(),
                "images", p.getImages(),        // ส่ง path รูป
                "createdAt", p.getCreatedAt()   // ส่งวันที่สร้าง
        )).toList();

        Map<String, Object> report = Map.of(
                "totalProducts", totalProducts,
                "outOfStock", outOfStock,
                "lowStock", lowStock,
                "products", productList
        );

        return ResponseEntity.ok(report);
    }
}

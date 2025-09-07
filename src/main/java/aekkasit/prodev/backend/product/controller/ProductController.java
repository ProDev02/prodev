package aekkasit.prodev.backend.product.controller;

import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
            @RequestParam String category, // ✅ เพิ่ม
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
                    imagePaths.add("/uploads/products/" + fileName);
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
            product.setCategory(category); // ✅ เก็บค่า category
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
}

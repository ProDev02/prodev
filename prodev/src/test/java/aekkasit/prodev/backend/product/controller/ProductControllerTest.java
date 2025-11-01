package aekkasit.prodev.backend.product.controller;

import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class ProductControllerTest {

    @InjectMocks
    private ProductController productController;

    @Mock
    private ProductRepository productRepository;

    // กำหนดค่า uploadDir สำหรับ test
    private void setUploadDir() {
        ReflectionTestUtils.setField(productController, "uploadDir", "uploads/products");
    }

    @Test
    void testAddProduct_Success() throws Exception {
        setUploadDir();

        MockMultipartFile file = new MockMultipartFile(
                "images", "test.jpg", "image/jpeg", "dummy content".getBytes()
        );

        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<?> response = productController.addProduct(
                "Product1", "In stock", 10, 99.99,
                "Description", "Category1", new MockMultipartFile[]{file}
        );

        assertEquals(200, response.getStatusCode().value());

        Product savedProduct = Objects.requireNonNull((Product) response.getBody());
        assertEquals("Product1", savedProduct.getName());
        assertEquals(10, savedProduct.getQuantity());
        assertNotNull(savedProduct.getImages());
        assertEquals(1, savedProduct.getImages().size());
    }

    @Test
    void testGetAllProducts() {
        List<Product> products = new ArrayList<>();
        Product p = new Product();
        p.setImages(new ArrayList<>());
        products.add(p);
        when(productRepository.findAll()).thenReturn(products);

        ResponseEntity<List<Product>> response = productController.getAllProducts();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetProductById_Found() {
        Product product = new Product();
        product.setId(1L);
        product.setImages(new ArrayList<>());
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ResponseEntity<Product> response = productController.getProductById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1L, Objects.requireNonNull(response.getBody()).getId());
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Product> response = productController.getProductById(1L);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void testDeleteProduct_Success() {
        Product product = new Product();
        product.setImages(new ArrayList<>());
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ResponseEntity<?> response = productController.deleteProduct(1L);

        verify(productRepository, times(1)).delete(product);
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testDeleteProduct_NotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = productController.deleteProduct(1L);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void testSearchProducts_FilterAndPagination() {
        // Mock ข้อมูลสินค้า
        Product p1 = new Product(); p1.setName("Be Nice"); p1.setPrice(50.0); p1.setCategory("Motivational"); p1.setImages(new ArrayList<>()); p1.setQuantity(10);
        Product p2 = new Product(); p2.setName("Banana"); p2.setPrice(30.0); p2.setCategory("Fruit"); p2.setImages(new ArrayList<>()); p2.setQuantity(5);
        Product p3 = new Product(); p3.setName("Carrot"); p3.setPrice(20.0); p3.setCategory("Vegetable"); p3.setImages(new ArrayList<>()); p3.setQuantity(0);

        List<Product> allProducts = Arrays.asList(p1, p2, p3);
        when(productRepository.findAll()).thenReturn(allProducts);

        // ทดสอบการกรองพร้อมการค้นหาที่ทนทานต่อการสะกดผิด (คำว่า "be nace" ควรจะตรงกับ "Be Nice")
        @SuppressWarnings("unchecked")
        ResponseEntity<?> response = productController.searchProducts(
                "Motivational", 25.0, 60.0, "be nace", 1, 10 // คำสะกดผิด "be nace"
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) response.getBody();
        assertNotNull(result);
        assertEquals(1, result.get("total")); // ✅ ควรมีแค่ p1 ที่ตรงกับ "be nice"

        @SuppressWarnings("unchecked")
        List<Product> items = (List<Product>) result.get("items");
        assertNotNull(items);
        assertEquals(1, items.size());
        assertTrue(items.stream().allMatch(p -> p.getCategory().equalsIgnoreCase("Motivational")));
    }
}

package aekkasit.prodev.backend.favorite.controller;

import aekkasit.prodev.backend.favorite.dto.FavoriteDTO;
import aekkasit.prodev.backend.favorite.model.SavedProduct;
import aekkasit.prodev.backend.favorite.service.SavedProductService;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class SavedProductControllerTest {

    @InjectMocks
    private SavedProductController savedProductController;

    @Mock
    private SavedProductService savedProductService;

    @Test
    void testGetFavorites() {
        User user = new User();
        Product product = new Product();
        product.setId(1L);
        product.setName("Product1");
        product.setPrice(100.0);
        product.setQuantity(5);
        product.setImages(List.of("image1.jpg"));

        SavedProduct fav = SavedProduct.builder().user(user).product(product).build();
        when(savedProductService.getFavorites(user)).thenReturn(List.of(fav));

        ResponseEntity<List<FavoriteDTO>> response = savedProductController.getFavorites(user);

        assertEquals(200, response.getStatusCode().value());
        List<FavoriteDTO> body = response.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());

        FavoriteDTO dto = body.getFirst();
        assertEquals(1L, dto.getId());
        assertEquals("Product1", dto.getName());
        assertEquals(100.0, dto.getPrice());
        assertEquals("image1.jpg", dto.getImage());
        assertTrue(dto.isInStock());
    }

    @Test
    void testToggleFavorite() {
        User user = new User();
        Long productId = 2L;

        doNothing().when(savedProductService).toggleFavorite(user, productId);

        ResponseEntity<String> response = savedProductController.toggleFavorite(user, Map.of("productId", productId));

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Toggled favorite", response.getBody());
        verify(savedProductService, times(1)).toggleFavorite(user, productId);
    }

    @Test
    void testRemoveFavorite() {
        User user = new User();
        Long productId = 3L;

        doNothing().when(savedProductService).removeFavorite(user, productId);

        ResponseEntity<String> response = savedProductController.removeFavorite(user, productId);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Removed from favorites", response.getBody());
        verify(savedProductService, times(1)).removeFavorite(user, productId);
    }
}

package aekkasit.prodev.backend.favorite.service;

import aekkasit.prodev.backend.favorite.model.SavedProduct;
import aekkasit.prodev.backend.favorite.repository.SavedProductRepository;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class SavedProductServiceTest {

    @InjectMocks
    private SavedProductService savedProductService;

    @Mock
    private SavedProductRepository savedProductRepository;

    @Mock
    private ProductRepository productRepository;

    @Test
    void testGetFavorites() {
        User user = new User();
        SavedProduct fav = new SavedProduct();
        when(savedProductRepository.findByUser(user)).thenReturn(List.of(fav));

        List<SavedProduct> result = savedProductService.getFavorites(user);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(savedProductRepository, times(1)).findByUser(user);
    }

    @Test
    void testToggleFavorite_AddNew() {
        User user = new User();
        Long productId = 1L;
        Product product = new Product();
        product.setId(productId);

        when(savedProductRepository.findByUserAndProductId(user, productId)).thenReturn(Optional.empty());
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(savedProductRepository.save(any(SavedProduct.class))).thenAnswer(i -> i.getArguments()[0]);

        savedProductService.toggleFavorite(user, productId);

        verify(savedProductRepository, times(1)).save(any(SavedProduct.class));
    }

    @Test
    void testToggleFavorite_RemoveExisting() {
        User user = new User();
        Long productId = 1L;
        SavedProduct existingFav = new SavedProduct();

        when(savedProductRepository.findByUserAndProductId(user, productId)).thenReturn(Optional.of(existingFav));

        savedProductService.toggleFavorite(user, productId);

        verify(savedProductRepository, times(1)).delete(existingFav);
    }

    @Test
    void testRemoveFavorite_Success() {
        User user = new User();
        Long productId = 1L;
        SavedProduct fav = new SavedProduct();

        when(savedProductRepository.findByUserAndProductId(user, productId)).thenReturn(Optional.of(fav));

        savedProductService.removeFavorite(user, productId);

        verify(savedProductRepository, times(1)).delete(fav);
    }

    @Test
    void testRemoveFavorite_NotFound() {
        User user = new User();
        Long productId = 1L;

        when(savedProductRepository.findByUserAndProductId(user, productId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> savedProductService.removeFavorite(user, productId));

        assertEquals("Favorite not found or does not belong to user", ex.getMessage());
    }
}

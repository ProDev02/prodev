package aekkasit.prodev.backend.favorite.service;

import aekkasit.prodev.backend.favorite.model.SavedProduct;
import aekkasit.prodev.backend.favorite.repository.SavedProductRepository;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedProductService {

    private final SavedProductRepository savedProductRepository;
    private final ProductRepository productRepository;

    public List<SavedProduct> getFavorites(User user) {
        return savedProductRepository.findByUser(user);
    }

    public void toggleFavorite(User user, Long productId) {
        savedProductRepository.findByUserAndProductId(user, productId)
                .ifPresentOrElse(
                        savedProduct -> savedProductRepository.delete(savedProduct),
                        () -> {
                            Product product = productRepository.findById(productId)
                                    .orElseThrow(() -> new RuntimeException("Product not found"));
                            SavedProduct newFav = SavedProduct.builder()
                                    .user(user)
                                    .product(product)
                                    .build();
                            savedProductRepository.save(newFav);
                        }
                );
    }

    public void removeFavorite(User user, Long productId) {
        SavedProduct savedProduct = savedProductRepository.findByUserAndProductId(user, productId)
                .orElseThrow(() -> new RuntimeException("Favorite not found or does not belong to user"));

        savedProductRepository.delete(savedProduct);
    }

}

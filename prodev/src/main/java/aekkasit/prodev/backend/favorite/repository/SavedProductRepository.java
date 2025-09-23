package aekkasit.prodev.backend.favorite.repository;

import aekkasit.prodev.backend.favorite.model.SavedProduct;
import aekkasit.prodev.backend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedProductRepository extends JpaRepository<SavedProduct, Long> {

    List<SavedProduct> findByUser(User user);

    Optional<SavedProduct> findByUserAndProductId(User user, Long productId);

    void deleteByUserAndProductId(User user, Long productId);
}

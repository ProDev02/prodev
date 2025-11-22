package aekkasit.prodev.backend.favorite.model;

import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_products",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "product_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}

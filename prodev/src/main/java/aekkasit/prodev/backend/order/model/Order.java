package aekkasit.prodev.backend.order.model;

import aekkasit.prodev.backend.user.model.User;
import aekkasit.prodev.backend.product.model.Product;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private String image;
    private int quantity;
    private double price;

    @Enumerated(EnumType.STRING)
    private Status status; // PENDING, FULFILLED, CANCEL, RECEIVED

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public enum Status {
        PENDING, FULFILLED, CANCEL, RECEIVED
    }
}

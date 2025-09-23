package aekkasit.prodev.backend.order.model;

import aekkasit.prodev.backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;

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
    private Status status; // PENDING, FULFILLED, CANCEL

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public enum Status {
        PENDING, FULFILLED, CANCEL, RECEIVED
    }
}

package aekkasit.prodev.backend.coupon.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private Double discount; // ส่วนลดเป็นเปอร์เซ็นต์

    @Column(nullable = false)
    private String description; // คำอธิบายคูปอง
}

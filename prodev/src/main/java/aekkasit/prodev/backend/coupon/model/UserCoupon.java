package aekkasit.prodev.backend.coupon.model;

import aekkasit.prodev.backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code; // แทนที่จะใช้ Coupon entity

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime collectedAt;

    @Column(nullable = false)
    private boolean used = false; // ✅ เพิ่ม default false

    @Column(nullable = false)
    private Double discount;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean isSelected = false; // ฟิลด์ใหม่ เพื่อบ่งบอกว่าคูปองถูกเลือกหรือไม่
}

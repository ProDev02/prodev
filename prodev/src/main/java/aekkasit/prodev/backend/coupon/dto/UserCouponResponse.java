package aekkasit.prodev.backend.coupon.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserCouponResponse {
    private String code;
    private boolean used;
    private LocalDateTime collectedAt;
    private Double discount;
    private String description;
}

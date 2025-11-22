package aekkasit.prodev.backend.coupon.controller;

import aekkasit.prodev.backend.coupon.dto.CouponRequest;
import aekkasit.prodev.backend.coupon.model.UserCoupon;
import aekkasit.prodev.backend.coupon.service.CouponService;
import aekkasit.prodev.backend.coupon.dto.UserCouponResponse;
import aekkasit.prodev.backend.user.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    // ✅ ใช้วิธีเดียวกับ CartController
    private User getCurrentUser(Authentication auth) {
        return (User) auth.getPrincipal();
    }

    // เก็บคูปอง
    @PostMapping("/collect")
    public ResponseEntity<?> collectCoupon(@RequestBody CouponRequest request, Authentication auth) {
        try {
            String response = couponService.collectCouponForUser(request, getCurrentUser(auth));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    // ดึงคูปองของผู้ใช้
    @GetMapping("/user")
    public ResponseEntity<List<UserCouponResponse>> getUserCoupons(Authentication auth) {
        User user = getCurrentUser(auth);
        List<UserCoupon> userCoupons = couponService.getUserCoupons(user.getId());

        List<UserCouponResponse> response = userCoupons.stream()
                .map(uc -> new UserCouponResponse(
                        uc.getCode(),
                        uc.isUsed(),
                        uc.getCollectedAt(),
                        uc.getDiscount(),     // ✅ ใช้ discount ที่ user เก็บ
                        uc.getDescription()   // ✅ ใช้ description ที่ user เก็บ
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    @PutMapping("/use")
    public ResponseEntity<?> useCoupon(@RequestBody CouponRequest request, Authentication auth) {
        try {
            User user = getCurrentUser(auth);
            String couponCode = request.getCouponCode();

            // ตรวจสอบว่าผู้ใช้มีคูปองที่เลือกหรือไม่
            List<UserCoupon> userCoupons = couponService.getUserCoupons(user.getId());
            Optional<UserCoupon> userCoupon = userCoupons.stream()
                    .filter(uc -> uc.getCode().equals(couponCode) && !uc.isUsed())
                    .findFirst();

            if (userCoupon.isPresent()) {
                UserCoupon coupon = userCoupon.get();
                coupon.setUsed(true); // ตั้งคูปองว่าใช้แล้ว
                couponService.saveUserCoupon(coupon); // บันทึกสถานะใหม่

                return ResponseEntity.ok("Coupon applied successfully");
            } else {
                return ResponseEntity.badRequest().body("Coupon not available or already used");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while applying the coupon");
        }
    }

}

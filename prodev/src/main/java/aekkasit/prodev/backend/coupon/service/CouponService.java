package aekkasit.prodev.backend.coupon.service;

import aekkasit.prodev.backend.coupon.model.Coupon;
import aekkasit.prodev.backend.coupon.model.UserCoupon;
import aekkasit.prodev.backend.coupon.repository.CouponRepository;
import aekkasit.prodev.backend.coupon.repository.UserCouponRepository;
import aekkasit.prodev.backend.coupon.dto.CouponRequest;
import aekkasit.prodev.backend.user.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    private final UserCouponRepository userCouponRepository;
    private final CouponRepository couponRepository;

    public CouponService(UserCouponRepository userCouponRepository, CouponRepository couponRepository) {
        this.userCouponRepository = userCouponRepository;
        this.couponRepository = couponRepository;
    }

    // ฟังก์ชันดึงคูปองที่ผู้ใช้เลือก
    public String getSelectedCouponCode(Long userId) {
        // ค้นหาคูปองที่ผู้ใช้เลือกโดยการเช็คฟิลด์ isSelected ใน UserCoupon
        Optional<UserCoupon> selectedCouponOpt = userCouponRepository
                .findByUserIdAndIsSelectedTrue(userId); // ค้นหาคูปองที่ถูกเลือก

        if (selectedCouponOpt.isPresent()) {
            return selectedCouponOpt.get().getCode(); // คืนคูปองที่เลือก
        }

        throw new RuntimeException("No selected coupon found for the user");
    }

    // ฟังก์ชันอื่นๆ

    public double getCouponDiscount(String couponCode, Long userId) {
        Optional<UserCoupon> userCouponOpt = userCouponRepository.findByUserIdAndCode(userId, couponCode);

        if (userCouponOpt.isPresent()) {
            UserCoupon userCoupon = userCouponOpt.get();
            // ตรวจสอบว่าใช้คูปองไปแล้วหรือยัง
            if (userCoupon.isUsed()) {
                throw new RuntimeException("Coupon has already been used");
            }
            // Log คูปองที่ได้
            System.out.println("Coupon applied: " + userCoupon.getCode() + " - Discount: " + userCoupon.getDiscount());
            return userCoupon.getDiscount();
        }
        throw new RuntimeException("Coupon not found or invalid");
    }

    public String collectCouponForUser(CouponRequest request, User user) {
        String couponCode = request.getCouponCode();

        boolean alreadyCollected = userCouponRepository
                .findByUserId(user.getId())
                .stream()
                .anyMatch(uc -> uc.getCode().equals(couponCode));

        if (alreadyCollected) {
            throw new RuntimeException("You already collected this coupon");
        }

        UserCoupon userCoupon = UserCoupon.builder()
                .code(couponCode)
                .user(user)
                .discount(request.getDiscount())
                .description(request.getDescription())
                .collectedAt(LocalDateTime.now())
                .used(false)
                .build();

        userCouponRepository.save(userCoupon);

        return "Coupon collected successfully";
    }

    public List<UserCoupon> getUserCoupons(Long userId) {
        return userCouponRepository.findByUserId(userId);
    }

    public UserCoupon saveUserCoupon(UserCoupon userCoupon) {
        return userCouponRepository.save(userCoupon);
    }

    public boolean hasSelectedCoupon(Long userId) {
        List<UserCoupon> userCoupons = userCouponRepository.findByUserIdAndUsedFalse(userId);
        return !userCoupons.isEmpty();  // ถ้ามีคูปองที่ยังไม่ได้ใช้ก็จะคืน true
    }

    // ฟังก์ชันนี้ใช้ในการทำเครื่องหมายคูปองว่าใช้แล้ว
    public void markCouponAsUsed(String couponCode, Long userId) {
        Optional<UserCoupon> userCouponOpt = userCouponRepository.findByUserIdAndCode(userId, couponCode);

        if (userCouponOpt.isPresent()) {
            UserCoupon userCoupon = userCouponOpt.get();

            // ตรวจสอบว่าใช้คูปองไปแล้วหรือยัง
            if (userCoupon.isUsed()) {
                throw new RuntimeException("Coupon has already been used");
            }

            // เปลี่ยนสถานะคูปองให้ใช้แล้ว
            userCoupon.setUsed(true);
            userCouponRepository.save(userCoupon);

            System.out.println("Coupon marked as used: " + couponCode);
        } else {
            throw new RuntimeException("Coupon not found or invalid");
        }
    }

}

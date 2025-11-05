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

}

package aekkasit.prodev.backend.coupon.repository;

import aekkasit.prodev.backend.coupon.model.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    List<UserCoupon> findByUserId(Long userId); // ค้นหาคูปองของผู้ใช้
    List<UserCoupon> findByUserIdAndUsedFalse(Long userId); // ค้นหาคูปองของผู้ใช้ที่ยังไม่ถูกใช้
    Optional<UserCoupon> findByUserIdAndCode(Long userId, String couponCode); // ค้นหาคูปองที่เลือกจากโค้ด
    Optional<UserCoupon> findByUserIdAndIsSelectedTrue(Long userId); // ค้นหาคูปองที่เลือกจากโค้ด
}

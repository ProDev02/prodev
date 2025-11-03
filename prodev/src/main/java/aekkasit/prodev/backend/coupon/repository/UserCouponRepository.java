package aekkasit.prodev.backend.coupon.repository;

import aekkasit.prodev.backend.coupon.model.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    List<UserCoupon> findByUserId(Long userId); // ค้นหาคูปองของผู้ใช้
}

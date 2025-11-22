package aekkasit.prodev.backend.coupon.repository;

import aekkasit.prodev.backend.coupon.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code); // ค้นหาคูปองจากรหัส
}

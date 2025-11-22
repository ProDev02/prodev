package aekkasit.prodev.backend.coupon.service;

import aekkasit.prodev.backend.coupon.dto.CouponRequest;
import aekkasit.prodev.backend.coupon.model.UserCoupon;
import aekkasit.prodev.backend.coupon.repository.CouponRepository;
import aekkasit.prodev.backend.coupon.repository.UserCouponRepository;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @InjectMocks
    private CouponService couponService;

    @Mock
    private UserCouponRepository userCouponRepository;

    @Mock
    private CouponRepository couponRepository;

    private User mockUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        return user;
    }

    @Test
    void testCollectCouponForUser_Success() {
        User user = mockUser();
        CouponRequest request = new CouponRequest();
        request.setCouponCode("COUPON123");
        request.setDiscount(5.0);
        request.setDescription("Test coupon");

        when(userCouponRepository.findByUserIdAndCodeAndUsedFalse(user.getId(), "COUPON123"))
                .thenReturn(Optional.empty());

        UserCoupon savedCoupon = UserCoupon.builder()
                .code("COUPON123")
                .user(user)
                .discount(5.0)
                .description("Test coupon")
                .collectedAt(LocalDateTime.now())
                .used(false)
                .build();

        when(userCouponRepository.save(any(UserCoupon.class))).thenReturn(savedCoupon);

        String result = couponService.collectCouponForUser(request, user);

        assertEquals("Coupon collected successfully", result);
        verify(userCouponRepository, times(1)).save(any(UserCoupon.class));
    }

    @Test
    void testCollectCouponForUser_AlreadyCollected() {
        User user = mockUser();
        CouponRequest request = new CouponRequest();
        request.setCouponCode("COUPON123");

        when(userCouponRepository.findByUserIdAndCodeAndUsedFalse(user.getId(), "COUPON123"))
                .thenReturn(Optional.of(new UserCoupon()));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                couponService.collectCouponForUser(request, user));

        assertEquals("You already collected this coupon", exception.getMessage());
    }

    @Test
    void testGetUserCoupons() {
        User user = mockUser();
        List<UserCoupon> coupons = new ArrayList<>();
        UserCoupon uc = new UserCoupon();
        uc.setCode("COUPON123");
        uc.setUsed(false);
        coupons.add(uc);

        when(userCouponRepository.findByUserId(user.getId())).thenReturn(coupons);

        List<UserCoupon> result = couponService.getUserCoupons(user.getId());

        assertEquals(1, result.size());
        assertEquals("COUPON123", result.get(0).getCode());
    }

    @Test
    void testMarkCouponAsUsed_Success() {
        User user = mockUser();
        UserCoupon coupon = new UserCoupon();
        coupon.setCode("COUPON123");
        coupon.setUsed(false);

        when(userCouponRepository.findByUserIdAndCode(user.getId(), "COUPON123"))
                .thenReturn(Optional.of(coupon));

        couponService.markCouponAsUsed("COUPON123", user.getId());

        assertTrue(coupon.isUsed());
        verify(userCouponRepository, times(1)).save(coupon);
    }

    @Test
    void testMarkCouponAsUsed_AlreadyUsed() {
        User user = mockUser();
        UserCoupon coupon = new UserCoupon();
        coupon.setCode("COUPON123");
        coupon.setUsed(true);

        when(userCouponRepository.findByUserIdAndCode(user.getId(), "COUPON123"))
                .thenReturn(Optional.of(coupon));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                couponService.markCouponAsUsed("COUPON123", user.getId()));

        assertEquals("Coupon has already been used", exception.getMessage());
        verify(userCouponRepository, never()).save(any());
    }

    @Test
    void testMarkCouponAsUsed_NotFound() {
        User user = mockUser();

        when(userCouponRepository.findByUserIdAndCode(user.getId(), "COUPON123"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                couponService.markCouponAsUsed("COUPON123", user.getId()));

        assertEquals("Coupon not found or invalid", exception.getMessage());
    }
}

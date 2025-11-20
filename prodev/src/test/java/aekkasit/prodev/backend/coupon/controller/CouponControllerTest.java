package aekkasit.prodev.backend.coupon.controller;

import aekkasit.prodev.backend.coupon.dto.CouponRequest;
import aekkasit.prodev.backend.coupon.model.UserCoupon;
import aekkasit.prodev.backend.coupon.dto.UserCouponResponse;
import aekkasit.prodev.backend.coupon.service.CouponService;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponControllerTest {

    @InjectMocks
    private CouponController couponController;

    @Mock
    private CouponService couponService;

    @Mock
    private Authentication authentication;

    // ตัวช่วย mock User
    private User mockUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        return user;
    }

    @Test
    void testCollectCoupon_Success() {
        User user = mockUser();
        when(authentication.getPrincipal()).thenReturn(user);
        CouponRequest request = new CouponRequest();
        request.setCouponCode("COUPON123");

        when(couponService.collectCouponForUser(request, user))
                .thenReturn("Coupon collected successfully");

        ResponseEntity<?> response = couponController.collectCoupon(request, authentication);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Coupon collected successfully", response.getBody());
    }

    @Test
    void testGetUserCoupons() {
        User user = mockUser();
        when(authentication.getPrincipal()).thenReturn(user);

        List<UserCoupon> coupons = new ArrayList<>();
        UserCoupon uc = new UserCoupon();
        uc.setCode("COUPON123");
        uc.setUsed(false);
        uc.setDiscount(5.0);
        uc.setDescription("Test coupon");
        coupons.add(uc);

        when(couponService.getUserCoupons(user.getId())).thenReturn(coupons);

        ResponseEntity<List<UserCouponResponse>> response = couponController.getUserCoupons(authentication);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals("COUPON123", response.getBody().get(0).getCode());
        assertFalse(response.getBody().get(0).isUsed());
    }

    @Test
    void testUseCoupon_Success() {
        User user = mockUser();
        when(authentication.getPrincipal()).thenReturn(user);

        UserCoupon coupon = new UserCoupon();
        coupon.setCode("COUPON123");
        coupon.setUsed(false);

        when(couponService.getUserCoupons(user.getId()))
                .thenReturn(Collections.singletonList(coupon));

        CouponRequest request = new CouponRequest();
        request.setCouponCode("COUPON123");

        ResponseEntity<?> response = couponController.useCoupon(request, authentication);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Coupon applied successfully", response.getBody());
        assertTrue(coupon.isUsed());
        verify(couponService, times(1)).saveUserCoupon(coupon);
    }

    @Test
    void testUseCoupon_NotAvailable() {
        User user = mockUser();
        when(authentication.getPrincipal()).thenReturn(user);

        when(couponService.getUserCoupons(user.getId()))
                .thenReturn(Collections.emptyList());

        CouponRequest request = new CouponRequest();
        request.setCouponCode("COUPON123");

        ResponseEntity<?> response = couponController.useCoupon(request, authentication);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Coupon not available or already used", response.getBody());
        verify(couponService, never()).saveUserCoupon(any());
    }
}

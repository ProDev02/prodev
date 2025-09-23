package aekkasit.prodev.backend.cart.controller;

import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.cart.service.CartService;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class CartControllerTest {

    @InjectMocks
    private CartController cartController;

    @Mock
    private CartService cartService;

    @Mock
    private Authentication authentication;

    @Test
    void testGetCart() {
        User user = new User();
        CartResponse cartResponse = new CartResponse(null, 0.0);

        when(authentication.getPrincipal()).thenReturn(user);
        when(cartService.getCartResponse(user)).thenReturn(cartResponse);

        ResponseEntity<CartResponse> response = cartController.getCart(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cartResponse, response.getBody());
    }

    @Test
    void testAddToCart() {
        User user = new User();
        CartResponse cartResponse = new CartResponse(null, 0.0);
        Map<String, Object> payload = Map.of("productId", 1L, "qty", 2);

        when(authentication.getPrincipal()).thenReturn(user);
        when(cartService.addToCart(user, 1L, 2)).thenReturn(cartResponse);

        ResponseEntity<CartResponse> response = cartController.addToCart(payload, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cartResponse, response.getBody());
    }

    @Test
    void testUpdateQty() {
        User user = new User();
        CartResponse cartResponse = new CartResponse(null, 0.0);

        when(authentication.getPrincipal()).thenReturn(user);
        when(cartService.updateQty(user, 1L, 5)).thenReturn(cartResponse);

        ResponseEntity<CartResponse> response = cartController.updateQty(1L, 5, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cartResponse, response.getBody());
    }

    @Test
    void testClearCart() {
        User user = new User();
        when(authentication.getPrincipal()).thenReturn(user);

        ResponseEntity<String> response = cartController.clearCart(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Cart cleared", response.getBody());
        verify(cartService, times(1)).clearCart(user);
    }
}

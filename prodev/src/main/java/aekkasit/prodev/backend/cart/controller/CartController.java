package aekkasit.prodev.backend.cart.controller;

import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.cart.service.CartService;
import aekkasit.prodev.backend.user.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private User getCurrentUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }

    @GetMapping("/list")
    public ResponseEntity<CartResponse> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCartResponse(getCurrentUser(auth)));
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@RequestBody Map<String, Object> payload, Authentication auth) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        int qty = Integer.parseInt(payload.get("qty").toString());
        return ResponseEntity.ok(cartService.addToCart(getCurrentUser(auth), productId, qty));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateQty(@PathVariable Long itemId,
                                                  @RequestParam int qty,
                                                  Authentication auth) {
        return ResponseEntity.ok(cartService.updateQty(getCurrentUser(auth), itemId, qty));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(Authentication auth) {
        cartService.clearCart(getCurrentUser(auth));
        return ResponseEntity.ok("Cart cleared");
    }
}

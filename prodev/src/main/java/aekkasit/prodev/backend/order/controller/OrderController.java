package aekkasit.prodev.backend.order.controller;

import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.cart.service.CartService;
import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.service.OrderService;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CartService cartService;
    private final ProductRepository productRepository;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        try {
            Map<String, Object> result = orderService.checkout(user);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getOrdersByUser(user));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam Order.Status status) {
        return orderService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/receive")
    public ResponseEntity<?> receiveOrder(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return orderService.receiveOrder(id, user)
                .map(order -> {
                    orderService.deleteOrder(order.getId());
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

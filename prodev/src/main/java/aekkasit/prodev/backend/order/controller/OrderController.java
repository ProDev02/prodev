package aekkasit.prodev.backend.order.controller;

import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.service.OrderService;
import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        // รับ couponCode จาก request body
        String couponCode = (String) request.get("couponCode");

        try {
            Map<String, Object> result = orderService.checkout(user, couponCode);
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
                .map(order -> ResponseEntity.ok(order)) // ส่งกลับ order ที่อัปเดตแล้ว
                .orElse(ResponseEntity.notFound().build());
    }

    // Order History
    @GetMapping("/history")
    public ResponseEntity<List<Order>> getOrderHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getOrderHistory(user));
    }

    // Reorder
    @PostMapping("/{id}/reorder")
    public ResponseEntity<CartResponse> reorder(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            CartResponse cartResponse = orderService.reorder(user, id);
            return ResponseEntity.ok(cartResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}

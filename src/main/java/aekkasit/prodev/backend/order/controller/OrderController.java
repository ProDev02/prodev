package aekkasit.prodev.backend.order.controller;

import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.cart.repository.CartRepository;
import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.service.OrderService;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CartRepository cartRepository;

    // ใช้ user จาก JWT แทนการส่ง userId
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@AuthenticationPrincipal User user) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        List<Order> orders = cart.getItems().stream().map(item -> Order.builder()
                .name(item.getProduct().getName())
                .category(item.getProduct().getCategory())
                .image(item.getProduct().getImages().isEmpty() ? "" : item.getProduct().getImages().get(0))
                .quantity(item.getQuantity())
                .price(item.getProduct().getPrice())
                .status(Order.Status.PENDING)
                .user(user)
                .build()
        ).toList();

        orders.forEach(orderService::createOrder);

        cart.getItems().clear();
        cartRepository.save(cart);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getOrdersByUser(user));
    }


    // Admin: ดู order ทั้งหมด
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Admin: เปลี่ยนสถานะ
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam Order.Status status) {
        return orderService.updateStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin: ลบ order
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/receive")
    public ResponseEntity<?> receiveOrder(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return orderService.receiveOrder(id, user)
                .map(order -> {
                    // ลบ order หลัง receive
                    orderService.deleteOrder(order.getId());
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

}

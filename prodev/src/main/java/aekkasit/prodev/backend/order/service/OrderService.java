package aekkasit.prodev.backend.order.service;

import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.repository.OrderRepository;
import aekkasit.prodev.backend.cart.service.CartService;
import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.cart.repository.CartItemRepository;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public Order createOrder(Order order) {
        order.setStatus(Order.Status.PENDING);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Optional<Order> updateStatus(Long id, Order.Status status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        });
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public Optional<Order> receiveOrder(Long id, User user) {
        return orderRepository.findById(id)
                .filter(o -> o.getUser().equals(user) && o.getStatus() == Order.Status.FULFILLED)
                .map(order -> {
                    // ลบ order จากฐานข้อมูล
                    order.setStatus(Order.Status.RECEIVED);
                    return orderRepository.save(order);
                });
    }

    @Transactional
    public Map<String, Object> checkout(User user) {
        Cart cart = cartService.getCart(user);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 1️⃣ ลด stock
        List<Product> updatedProducts = reduceStock(cartItems);

        // 2️⃣ สร้าง order
        List<Order> orders = createOrders(user, cartItems);

        // 3️⃣ เคลียร์ cart
        cartService.clearCart(user);

        return Map.of(
                "orders", orders,
                "updatedProducts", updatedProducts
        );
    }

    @Transactional
    public List<Product> reduceStock(List<CartItem> cartItems) {
        List<Product> updatedProducts = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            int qtyToReduce = cartItem.getQuantity();
            if (qtyToReduce > product.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            product.setQuantity(product.getQuantity() - qtyToReduce);
            if (product.getQuantity() <= 0) {
                product.setStatusStock("Out of stock");
            }

            productRepository.save(product);
            updatedProducts.add(product);
        }

        return updatedProducts;
    }

    @Transactional
    public List<Order> createOrders(User user, List<CartItem> cartItems) {
        List<Order> orders = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            Order order = Order.builder()
                    .name(product.getName())
                    .category(product.getCategory())
                    .image(product.getImages().isEmpty() ? "" : product.getImages().get(0))
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .status(Order.Status.PENDING)
                    .user(user)
                    .product(product)
                    .build();
            orders.add(orderRepository.save(order));
        }

        return orders;
    }

    // Order History
    public List<Order> getOrderHistory(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Reorder -> เพิ่มกลับ Cart
    @Transactional
    public CartResponse reorder(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Product product = order.getProduct();
        if (product == null) {
            throw new RuntimeException("Product not available for reorder");
        }

        int qty = order.getQuantity();
        return cartService.addToCart(user, product.getId(), qty);
    }
}

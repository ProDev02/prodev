package aekkasit.prodev.backend.order.controller;

import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.cart.repository.CartRepository;
import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.service.OrderService;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class OrderControllerTest {

    @InjectMocks
    private OrderController orderController;

    @Mock
    private OrderService orderService;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private Authentication authentication;

    @Test
    void testCheckout_Success() {
        // Mock user
        User user = new User();
        user.setId(1L);

        when(authentication.getPrincipal()).thenReturn(user);

        // Mock product
        Product product = new Product();
        product.setName("Test Product");
        product.setCategory("Category1");
        product.setPrice(100.0);
        product.setImages(List.of("image1.jpg"));

        // Mock order
        Order order = Order.builder()
                .name(product.getName())
                .category(product.getCategory())
                .image(product.getImages().get(0))
                .quantity(2)
                .price(product.getPrice())
                .status(Order.Status.PENDING)
                .user(user)
                .build();

        List<Order> orders = List.of(order);
        List<Product> updatedProducts = List.of(product);

        Map<String, Object> result = new HashMap<>();
        result.put("orders", orders);
        result.put("updatedProducts", updatedProducts);

        when(orderService.checkout(user)).thenReturn(result);

        // Call checkout
        ResponseEntity<?> response = orderController.checkout(authentication);

        assertEquals(200, response.getStatusCode().value());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);

        @SuppressWarnings("unchecked")
        List<Order> responseOrders = (List<Order>) body.get("orders");
        assertEquals(1, responseOrders.size());

        Order responseOrder = responseOrders.get(0);
        assertEquals("Test Product", responseOrder.getName());
        assertEquals("Category1", responseOrder.getCategory());
        assertEquals(2, responseOrder.getQuantity());
        assertEquals("image1.jpg", responseOrder.getImage());
        assertEquals(100.0, responseOrder.getPrice());
    }

    @Test
    void testGetMyOrders() {
        User user = new User();
        List<Order> orders = List.of(new Order(), new Order());

        when(orderService.getOrdersByUser(user)).thenReturn(orders);

        ResponseEntity<List<Order>> response = orderController.getMyOrders(user);

        assertEquals(200, response.getStatusCode().value());
        List<Order> body = Optional.ofNullable(response.getBody()).orElse(Collections.emptyList());
        assertEquals(2, body.size());
    }

    @Test
    void testGetAllOrders() {
        List<Order> orders = List.of(new Order(), new Order());

        when(orderService.getAllOrders()).thenReturn(orders);

        ResponseEntity<List<Order>> response = orderController.getAllOrders();

        assertEquals(200, response.getStatusCode().value());
        List<Order> body = Optional.ofNullable(response.getBody()).orElse(Collections.emptyList());
        assertEquals(2, body.size());
    }

    @Test
    void testUpdateStatus_Found() {
        Order order = new Order();
        order.setStatus(Order.Status.PENDING);

        when(orderService.updateStatus(1L, Order.Status.FULFILLED)).thenReturn(Optional.of(order));

        ResponseEntity<?> response = orderController.updateStatus(1L, Order.Status.FULFILLED);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(order, response.getBody());
    }

    @Test
    void testUpdateStatus_NotFound() {
        when(orderService.updateStatus(1L, Order.Status.FULFILLED)).thenReturn(Optional.empty());

        ResponseEntity<?> response = orderController.updateStatus(1L, Order.Status.FULFILLED);

        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void testDeleteOrder() {
        ResponseEntity<?> response = orderController.deleteOrder(1L);

        assertEquals(204, response.getStatusCode().value());
        verify(orderService, times(1)).deleteOrder(1L);
    }

    @Test
    void testReceiveOrder_Found() {
        User user = new User();
        Order order = new Order();
        order.setId(1L);

        when(orderService.receiveOrder(1L, user)).thenReturn(Optional.of(order));

        ResponseEntity<?> response = orderController.receiveOrder(1L, user);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(order, response.getBody()); // ตรวจสอบว่า return order ถูกต้อง
        verify(orderService, times(1)).receiveOrder(1L, user); // verify ถูกต้อง
    }

    @Test
    void testReceiveOrder_NotFound() {
        User user = new User();

        when(orderService.receiveOrder(1L, user)).thenReturn(Optional.empty());

        ResponseEntity<?> response = orderController.receiveOrder(1L, user);

        assertEquals(404, response.getStatusCode().value());
        verify(orderService, never()).deleteOrder(anyLong());
    }
}

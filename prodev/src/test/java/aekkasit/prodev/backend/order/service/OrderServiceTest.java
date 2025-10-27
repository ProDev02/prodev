package aekkasit.prodev.backend.order.service;

import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.repository.OrderRepository;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Test
    void testCreateOrder() {
        Order order = new Order();
        order.setUser(new User());
        when(orderRepository.save(order)).thenReturn(order);

        Order saved = orderService.createOrder(order);

        assertEquals(Order.Status.PENDING, saved.getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    void testGetOrdersByUser() {
        User user = new User();
        List<Order> orders = new ArrayList<>();
        orders.add(new Order());
        when(orderRepository.findByUser(user)).thenReturn(orders);

        List<Order> result = orderService.getOrdersByUser(user);

        assertEquals(1, result.size());
    }

    @Test
    void testGetAllOrders() {
        List<Order> orders = Arrays.asList(new Order(), new Order());
        when(orderRepository.findAll()).thenReturn(orders);

        List<Order> result = orderService.getAllOrders();

        assertEquals(2, result.size());
    }

    @Test
    void testUpdateStatus_Found() {
        Order order = new Order();
        order.setStatus(Order.Status.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Optional<Order> updated = orderService.updateStatus(1L, Order.Status.FULFILLED);

        assertTrue(updated.isPresent());
        assertEquals(Order.Status.FULFILLED, updated.get().getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    void testUpdateStatus_NotFound() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());
        Optional<Order> updated = orderService.updateStatus(1L, Order.Status.FULFILLED);
        assertTrue(updated.isEmpty());
    }

    @Test
    void testDeleteOrder() {
        orderService.deleteOrder(1L);
        verify(orderRepository, times(1)).deleteById(1L);
    }

    @Test
    void testReceiveOrder_FoundAndFulfilled() {
        User user = new User();
        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.Status.FULFILLED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Optional<Order> result = orderService.receiveOrder(1L, user);

        assertTrue(result.isPresent());
        assertEquals(Order.Status.RECEIVED, result.get().getStatus()); // ตรวจสอบว่า status เปลี่ยนแล้ว
        verify(orderRepository, times(1)).save(order); // verify save แทน delete
    }

    @Test
    void testReceiveOrder_NotFulfilledOrWrongUser() {
        User user = new User();
        User other = new User();
        Order order = new Order();
        order.setUser(other);
        order.setStatus(Order.Status.PENDING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Optional<Order> result = orderService.receiveOrder(1L, user);

        assertTrue(result.isEmpty());
        verify(orderRepository, never()).delete(any());
    }
}

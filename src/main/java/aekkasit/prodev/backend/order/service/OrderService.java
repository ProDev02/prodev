package aekkasit.prodev.backend.order.service;

import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.repository.OrderRepository;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

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
                    orderRepository.delete(order);
                    return order;
                });
    }

}

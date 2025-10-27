package aekkasit.prodev.backend.order.repository;

import aekkasit.prodev.backend.user.model.User;
import aekkasit.prodev.backend.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}

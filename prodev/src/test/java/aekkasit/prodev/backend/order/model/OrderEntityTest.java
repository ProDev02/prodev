package aekkasit.prodev.backend.order.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class OrderEntityTest {

    @Test
    void testPrePersistAndLombok() {
        Order order = new Order();
        order.setName("Test");
        order.setQuantity(5);
        order.setPrice(99.0);
        order.setStatus(Order.Status.PENDING);

        // เรียก prePersist() เพื่อ set createdAt
        order.prePersist();

        assertNotNull(order.getCreatedAt());
        assertTrue(order.getCreatedAt().isBefore(LocalDateTime.now().plusSeconds(1)));

        // test getter/setter
        assertEquals("Test", order.getName());
        assertEquals(5, order.getQuantity());
        assertEquals(99.0, order.getPrice());

        // test enum
        order.setStatus(Order.Status.FULFILLED);
        assertEquals(Order.Status.FULFILLED, order.getStatus());
    }
}

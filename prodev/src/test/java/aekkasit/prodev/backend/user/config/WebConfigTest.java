package aekkasit.prodev.backend.user.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistration;

import static org.mockito.Mockito.*;

class WebConfigTest {

    @Test
    void testAddResourceHandlers() {
        // Mock Registry
        ResourceHandlerRegistry registry = mock(ResourceHandlerRegistry.class);

        // Mock ResourceHandlerRegistration เมื่อถูกเรียก
        ResourceHandlerRegistration registration = mock(ResourceHandlerRegistration.class);

        // Mock behavior: registry.addResourceHandler(...) -> registration
        when(registry.addResourceHandler("/uploads/products/**")).thenReturn(registration);

        // Mock ให้ registration.addResourceLocations(...) return ตัวมันเองเพื่อ chain
        when(registration.addResourceLocations(
                "file:/uploads/products/",
                "file:/app/uploads/products/"
        )).thenReturn(registration);

        // เรียก WebConfig จริง
        WebConfig config = new WebConfig();
        config.addResourceHandlers(registry);

        // VERIFY เรียกตามที่กำหนดหรือยัง?
        verify(registry, times(1)).addResourceHandler("/uploads/products/**");
        verify(registration, times(1)).addResourceLocations(
                "file:/uploads/products/",
                "file:/app/uploads/products/"
        );
    }
}

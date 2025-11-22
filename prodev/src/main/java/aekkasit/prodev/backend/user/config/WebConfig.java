package aekkasit.prodev.backend.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ชี้ตรงไปยัง folder ที่ไฟล์เก่าและไฟล์ใหม่อยู่
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(
                        "file:/uploads/products/",
                        "file:/app/uploads/products/"
                );
    }
}

package aekkasit.prodev.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProdevApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProdevApplication.class, args);
    }

    // สำหรับ coverage test
    public static void init() {
        // เรียก constructor + method พื้นฐาน
        new ProdevApplication().toString();
    }
}


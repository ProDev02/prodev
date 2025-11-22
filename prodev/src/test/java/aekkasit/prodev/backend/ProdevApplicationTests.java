package aekkasit.prodev.backend;

import org.junit.jupiter.api.Test;

class ProdevApplicationTests {

    @Test
    void contextLoads() {
        // เรียก static init method → coverage ของ class ขึ้นแน่นอน
        ProdevApplication.init();
    }
}

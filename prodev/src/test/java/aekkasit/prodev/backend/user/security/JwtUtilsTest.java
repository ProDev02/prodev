package aekkasit.prodev.backend.user.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilsTest {

    @Test
    void testGenerateTokenAndValidateToken() {
        JwtUtils jwtUtils = new JwtUtils();

        // สร้าง token จริง
        String token = jwtUtils.generateToken("testuser");
        assertNotNull(token);

        // ตรวจสอบ validateToken
        assertTrue(jwtUtils.validateToken(token));

        // ตรวจสอบ getUsernameFromToken
        String username = jwtUtils.getUsernameFromToken(token);
        assertEquals("testuser", username);
    }

    @Test
    void testValidateToken_InvalidToken() {
        JwtUtils jwtUtils = new JwtUtils();

        // token ปลอม
        String invalidToken = "this.is.not.a.valid.token";
        assertFalse(jwtUtils.validateToken(invalidToken));
    }
}

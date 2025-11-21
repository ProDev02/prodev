package aekkasit.prodev.backend.user.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityConfigTest {

    private JwtAuthFilter jwtAuthFilterMock;
    private SecurityConfig securityConfig;

    @BeforeEach
    void setUp() {
        jwtAuthFilterMock = mock(JwtAuthFilter.class);
        securityConfig = new SecurityConfig(jwtAuthFilterMock);
    }

    @Test
    void testPasswordEncoder() {
        assertNotNull(securityConfig.passwordEncoder());
    }

    @Test
    void testCorsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = securityConfig.corsConfigurationSource();
        assertNotNull(source);
        assertEquals(3, source.getCorsConfigurations().get("/**").getAllowedOrigins().size());
    }

    @Test
    void testSecurityFilterChainBuild() throws Exception {
        HttpSecurity http = mock(HttpSecurity.class, RETURNS_DEEP_STUBS);

        SecurityFilterChain chain = securityConfig.securityFilterChain(http);

        assertNotNull(chain);

        // verify ว่า build ถูกเรียก
        verify(http, atLeastOnce()).build();
    }
}

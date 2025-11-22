package aekkasit.prodev.backend.user.controller;

import aekkasit.prodev.backend.user.controller.AuthController;
import aekkasit.prodev.backend.user.dto.*;
import aekkasit.prodev.backend.user.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private AuthService authService;

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password");

        AuthResponse mockResponse = new AuthResponse("testuser", "test@example.com", "USER", "jwtToken", 1L);
        when(authService.register(request)).thenReturn(mockResponse);

        ResponseEntity<AuthResponse> responseEntity = authController.register(request);

        assertEquals(200, responseEntity.getStatusCode().value());
        assertEquals(mockResponse, responseEntity.getBody());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");

        AuthResponse mockResponse = new AuthResponse("testuser", "test@example.com", "USER", "jwtToken", 1L);
        when(authService.login(request)).thenReturn(mockResponse);

        ResponseEntity<AuthResponse> responseEntity = authController.login(request);

        assertEquals(200, responseEntity.getStatusCode().value());
        assertEquals(mockResponse, responseEntity.getBody());
    }
}

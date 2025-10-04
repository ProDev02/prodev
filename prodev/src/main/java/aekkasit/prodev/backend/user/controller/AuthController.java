package aekkasit.prodev.backend.user.controller;

import aekkasit.prodev.backend.user.dto.AuthResponse;
import aekkasit.prodev.backend.user.dto.LoginRequest;
import aekkasit.prodev.backend.user.dto.RegisterRequest;
import aekkasit.prodev.backend.user.service.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // -------- ลบ user หลัง test / ลบ user ตาม id --------
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        authService.deleteUserById(id);
        return ResponseEntity.ok().body("User deleted successfully");
    }
}

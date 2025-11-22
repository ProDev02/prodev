package aekkasit.prodev.backend.user.service;

import aekkasit.prodev.backend.user.dto.AuthResponse;
import aekkasit.prodev.backend.user.dto.LoginRequest;
import aekkasit.prodev.backend.user.dto.RegisterRequest;
import aekkasit.prodev.backend.user.model.User;
import aekkasit.prodev.backend.user.repository.UserRepository;
import aekkasit.prodev.backend.user.security.JwtUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email is already taken");
        if (userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username is already taken");

        String role = userRepository.count() == 0 ? "ADMIN" : "USER";

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());

        return new AuthResponse(user.getUsername(), user.getEmail(), user.getRole(), token, user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password");

        String token = jwtUtils.generateToken(user.getUsername());

        return new AuthResponse(user.getUsername(), user.getEmail(), user.getRole(), token, user.getId());
    }

    // -------- ลบ user ตาม id --------
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
}

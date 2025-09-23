package aekkasit.prodev.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String username;
    private String email;
    private String role;
    private String token;
    private Long id;
}

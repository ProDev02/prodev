package aekkasit.prodev.backend.user.service.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}

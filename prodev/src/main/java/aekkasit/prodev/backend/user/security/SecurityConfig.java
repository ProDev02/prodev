package aekkasit.prodev.backend.user.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true) // เปิดใช้ @PreAuthorize
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/products/reports/weekly-stock").hasRole("ADMIN")
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/coupons/**").hasRole("USER")
                        .requestMatchers("/api/favorites/**").hasRole("USER") // ✅ เพิ่มบรรทัดนี้
                        .requestMatchers("/api/coupons/**").hasRole("USER")
                        .requestMatchers("/api/orders/checkout").hasRole("USER")
                        .requestMatchers("/api/orders/my").hasRole("USER") // ดึง order ของตัวเอง
                        .requestMatchers("/api/orders/*/receive").hasRole("USER")
                        .requestMatchers("/api/orders/checkout", "/api/orders/my", "/api/orders/history", "/api/orders/*/receive")
                        .hasRole("USER")
                        .requestMatchers("/api/orders/*/reorder").hasRole("USER")
                        .requestMatchers("/api/orders/**").hasRole("ADMIN") // ที่เหลือเป็น admin
                        .requestMatchers("/api/orders/pdf/**").hasRole("USER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",  // dev server port
                "http://localhost:30030", // K8s NodePort frontend));
                "http://10.62.104.68:30030"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

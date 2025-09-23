package aekkasit.prodev.backend.favorite.controller;

import aekkasit.prodev.backend.favorite.service.SavedProductService;
import aekkasit.prodev.backend.favorite.dto.FavoriteDTO;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class SavedProductController {

    private final SavedProductService savedProductService;

    @GetMapping
    public ResponseEntity<List<FavoriteDTO>> getFavorites(@AuthenticationPrincipal User user) {
        List<FavoriteDTO> data = savedProductService.getFavorites(user).stream()
                .map(fav -> new FavoriteDTO(
                        fav.getProduct().getId(),
                        fav.getProduct().getName(),
                        fav.getProduct().getPrice(),
                        fav.getProduct().getImages().isEmpty() ? "" : fav.getProduct().getImages().get(0),
                        fav.getProduct().getQuantity() > 0
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(data);
    }


    @PostMapping("/toggle")
    public ResponseEntity<String> toggleFavorite(@AuthenticationPrincipal User user,
                                                 @RequestBody Map<String, Long> body) {
        Long productId = body.get("productId");
        savedProductService.toggleFavorite(user, productId);
        return ResponseEntity.ok("Toggled favorite");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeFavorite(@AuthenticationPrincipal User user,
                                                 @PathVariable Long id) {
        savedProductService.removeFavorite(user, id);
        return ResponseEntity.ok("Removed from favorites");
    }
}

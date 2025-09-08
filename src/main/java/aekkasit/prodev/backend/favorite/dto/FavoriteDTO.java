package aekkasit.prodev.backend.favorite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FavoriteDTO {
    private Long id;
    private String name;
    private Double price;
    private String image;
    private boolean inStock;
}

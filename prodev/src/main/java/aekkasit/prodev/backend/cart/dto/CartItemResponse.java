// CartItemResponse.java
package aekkasit.prodev.backend.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private String productName;
    private int quantity;
    private double price;
    private String image;
    private int stock;
    private String category;
}
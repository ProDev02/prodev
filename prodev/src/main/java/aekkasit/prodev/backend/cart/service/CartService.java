package aekkasit.prodev.backend.cart.service;

import aekkasit.prodev.backend.cart.dto.CartItemResponse;
import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.cart.repository.CartRepository;
import aekkasit.prodev.backend.cart.repository.CartItemRepository;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.user.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public Cart getCart(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).build();
            newCart.setItems(new java.util.ArrayList<>());
            return cartRepository.save(newCart);
        });
    }

    public CartResponse getCartResponse(User user) {
        Cart cart = getCart(user);
        // ดึงรายการล่าสุดจาก DB
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        List<CartItemResponse> items = cartItems.stream()
                .map(i -> new CartItemResponse(
                        i.getId(),
                        i.getProduct().getName(),
                        i.getQuantity(),
                        i.getProduct().getPrice(),
                        i.getProduct().getImages().isEmpty() ? "" : i.getProduct().getImages().get(0),
                        i.getProduct().getQuantity(),
                        i.getProduct().getCategory()
                ))
                .toList();

        double total = items.stream().mapToDouble(i -> i.getQuantity() * i.getPrice()).sum();
        return new CartResponse(items, total);
    }

    public CartResponse addToCart(User user, Long productId, int qty) {
        Cart cart = getCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // ดึง cart items ล่าสุดจาก DB
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        Optional<CartItem> existingItem = cartItems.stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst();

        int totalQty = qty + existingItem.map(CartItem::getQuantity).orElse(0);
        if (totalQty > product.getQuantity()) {
            throw new RuntimeException("Cannot add more than available stock");
        }

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(totalQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(qty)
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCartResponse(user);
    }

    public CartResponse updateQty(User user, Long itemId, int qty) {
        Cart cart = getCart(user);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (qty > item.getProduct().getQuantity()) {
            throw new RuntimeException("Cannot set quantity higher than available stock");
        }

        if (qty <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(qty);
            cartItemRepository.save(item);
        }

        return getCartResponse(user);
    }

    public void clearCart(User user) {
        Cart cart = getCart(user);
        // ดึงรายการล่าสุดจาก DB
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        cartItemRepository.deleteAll(cartItems);
    }
}

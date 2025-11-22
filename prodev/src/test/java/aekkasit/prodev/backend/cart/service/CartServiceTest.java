package aekkasit.prodev.backend.cart.service;

import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.cart.repository.CartItemRepository;
import aekkasit.prodev.backend.cart.repository.CartRepository;
import aekkasit.prodev.backend.cart.service.CartService;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.user.model.User;
import org.junit.jupiter.api.*;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CartServiceTest {

    @InjectMocks
    private CartService cartService;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    private User user;
    private Product product;
    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);

        product = new Product();
        product.setId(1L);
        product.setName("Product A");
        product.setPrice(100.0);
        product.setQuantity(10);
        product.setImages(List.of("img1.jpg"));
        product.setCategory("Cat1");
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void testGetCart_NewCart() {
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArguments()[0]);

        Cart cart = cartService.getCart(user);

        assertNotNull(cart);
        assertEquals(user, cart.getUser());
        assertNotNull(cart.getItems());
        assertTrue(cart.getItems().isEmpty());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testAddToCart_NewItem() {
        Cart cart = Cart.builder().id(1L).user(user).items(new ArrayList<>()).build();
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // จำลอง save แล้ว item ได้ id
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> {
            CartItem item = i.getArgument(0);
            item.setId(1L);
            return item;
        });

        // หลังจากเพิ่มแล้ว ให้ findByCartId return item ใหม่
        when(cartItemRepository.findByCartId(cart.getId())).thenAnswer(i -> {
            CartItem item = CartItem.builder()
                    .id(1L)
                    .cart(cart)
                    .product(product)
                    .quantity(2)
                    .build();
            return List.of(item);
        });

        CartResponse response = cartService.addToCart(user, 1L, 2);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getItems().get(0).getQuantity());
        assertEquals(200.0, response.getTotal());
    }

    @Test
    void testUpdateQty_RemoveItem() {
        CartItem item = CartItem.builder().id(1L).product(product).quantity(2).build();
        Cart cart = Cart.builder().user(user).items(new ArrayList<>(List.of(item))).build();
        item.setCart(cart);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));

        CartResponse response = cartService.updateQty(user, 1L, 0);

        verify(cartItemRepository, times(1)).delete(item);
        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
    }

    @Test
    void testUpdateQty_IncreaseQty() {
        CartItem item = CartItem.builder().id(1L).product(product).quantity(2).build();
        Cart cart = Cart.builder().user(user).items(new ArrayList<>(List.of(item))).build();
        item.setCart(cart);

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(cartItemRepository.save(item)).thenReturn(item);
        when(cartItemRepository.findByCartId(cart.getId())).thenReturn(List.of(item));

        CartResponse response = cartService.updateQty(user, 1L, 5);

        verify(cartItemRepository, times(1)).save(item);
        assertEquals(5, response.getItems().get(0).getQuantity());
        assertEquals(500.0, response.getTotal());
    }

    @Test
    void testClearCart() {
        CartItem item = CartItem.builder().id(1L).product(product).quantity(2).build();
        Cart cart = Cart.builder().user(user).items(new ArrayList<>(List.of(item))).build();

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartId(cart.getId())).thenReturn(List.of(item));

        cartService.clearCart(user);

        verify(cartItemRepository, times(1)).deleteAll(List.of(item));
    }
}

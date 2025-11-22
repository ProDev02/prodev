package aekkasit.prodev.backend.order.service;

import aekkasit.prodev.backend.cart.model.Cart;
import aekkasit.prodev.backend.coupon.service.CouponService;
import aekkasit.prodev.backend.order.model.Order;
import aekkasit.prodev.backend.order.repository.OrderRepository;
import aekkasit.prodev.backend.cart.service.CartService;
import aekkasit.prodev.backend.cart.dto.CartResponse;
import aekkasit.prodev.backend.cart.repository.CartItemRepository;
import aekkasit.prodev.backend.product.repository.ProductRepository;
import aekkasit.prodev.backend.product.model.Product;
import aekkasit.prodev.backend.cart.model.CartItem;
import aekkasit.prodev.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponService couponService;

    @Transactional
    public Order createOrder(Order order) {
        order.setStatus(Order.Status.PENDING);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Optional<Order> updateStatus(Long id, Order.Status status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            return orderRepository.save(order);
        });
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public Optional<Order> receiveOrder(Long id, User user) {
        return orderRepository.findById(id)
                .filter(o -> o.getUser().equals(user) && o.getStatus() == Order.Status.FULFILLED)
                .map(order -> {
                    // ลบ order จากฐานข้อมูล
                    order.setStatus(Order.Status.RECEIVED);
                    return orderRepository.save(order);
                });
    }

    @Transactional
    public Map<String, Object> checkout(User user, String couponCode) {
        Cart cart = cartService.getCart(user);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // ลด stock
        List<Product> updatedProducts = reduceStock(cartItems);

        // คำนวณคูปอง
        double couponDiscount = 0;
        if (couponCode != null && !couponCode.isEmpty()) {
            // ดึงคูปองจาก couponService
            couponDiscount = couponService.getCouponDiscount(couponCode, user.getId());
            couponService.markCouponAsUsed(couponCode, user.getId());
        }

        // สร้าง order
        List<Order> orders = createOrders(user, cartItems);

        // สร้าง PDF จาก cartItems
        byte[] pdfBytes = generateOrderPdfFromCartItems(cartItems, user, couponDiscount, couponCode);

        // เคลียร์ cart
        cartService.clearCart(user);

        return Map.of(
                "orders", orders,
                "updatedProducts", updatedProducts,
                "pdfBytes", Base64.getEncoder().encodeToString(pdfBytes)
        );
    }

    @Transactional
    public List<Product> reduceStock(List<CartItem> cartItems) {
        List<Product> updatedProducts = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            int qtyToReduce = cartItem.getQuantity();
            if (qtyToReduce > product.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            product.setQuantity(product.getQuantity() - qtyToReduce);
            if (product.getQuantity() <= 0) {
                product.setStatusStock("Out of stock");
            }

            productRepository.save(product);
            updatedProducts.add(product);
        }

        return updatedProducts;
    }

    @Transactional
    public List<Order> createOrders(User user, List<CartItem> cartItems) {
        List<Order> orders = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            Order order = Order.builder()
                    .name(product.getName())
                    .category(product.getCategory())
                    .image(product.getImages().isEmpty() ? "" : product.getImages().get(0))
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .status(Order.Status.PENDING)
                    .user(user)
                    .product(product)
                    .build();
            orders.add(orderRepository.save(order));
        }

        return orders;
    }

    // Order History
    public List<Order> getOrderHistory(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Reorder -> เพิ่มกลับ Cart
    @Transactional
    public CartResponse reorder(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Product product = order.getProduct();
        if (product == null) {
            throw new RuntimeException("Product not available for reorder");
        }

        int qty = order.getQuantity();
        return cartService.addToCart(user, product.getId(), qty);
    }

    public byte[] generateOrderPdfFromCartItems(List<CartItem> cartItems, User user, double couponDiscount, String couponCode) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fonts
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(0, 128, 0));
            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
            Font rowFont = new Font(Font.HELVETICA, 12);
            Font totalFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font userInfoFont = new Font(Font.HELVETICA, 10, Font.ITALIC, Color.DARK_GRAY);
            Font discountFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.RED); // สีแดงสำหรับส่วนลด

            // Title
            Paragraph title = new Paragraph("Order Summary", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // User info (username)
            Paragraph userInfo = new Paragraph("Username: " + user.getUsername(), userInfoFont);
            userInfo.setAlignment(Element.ALIGN_LEFT);
            userInfo.setSpacingAfter(10);
            document.add(userInfo);

            // Table
            PdfPTable table = new PdfPTable(4);  // Image column removed
            table.setWidthPercentage(100);

            // Set the column widths
            table.setWidths(new float[]{3, 4, 2, 3});  // Adjusted for fewer columns

            // Header
            String[] headers = {"Product", "Quantity", "Price", "Total"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(0, 128, 0));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            double totalAmount = 0;
            for (CartItem item : cartItems) {
                // Product name
                table.addCell(new PdfPCell(new Phrase(item.getProduct().getName(), rowFont)));

                // Quantity
                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), rowFont));
                qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(qtyCell);

                // Price
                PdfPCell priceCell = new PdfPCell(new Phrase(String.format("฿%.2f", item.getProduct().getPrice()), rowFont));
                priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(priceCell);

                // Total
                double total = item.getQuantity() * item.getProduct().getPrice();
                PdfPCell totalCell = new PdfPCell(new Phrase(String.format("฿%.2f", total), rowFont));
                totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(totalCell);

                totalAmount += total;
            }

            document.add(table);

            // Displaying Total before discount
            Paragraph totalBeforeDiscountPara = new Paragraph(
                    "Total (before discount): ฿" + String.format("%.2f", totalAmount),
                    totalFont
            );
            totalBeforeDiscountPara.setAlignment(Element.ALIGN_LEFT);
            totalBeforeDiscountPara.setSpacingBefore(10);
            document.add(totalBeforeDiscountPara);

            // Coupon Discount
            if (couponDiscount > 0) {
                // Display Coupon in one line and Discount in the next with red color
                Paragraph couponPara = new Paragraph("Coupon (" + couponCode + ")", rowFont);
                couponPara.setAlignment(Element.ALIGN_LEFT);
                document.add(couponPara);

                Paragraph discountPara = new Paragraph(
                        "Discount: ฿" + String.format("%.2f", totalAmount * (couponDiscount / 100)),
                        discountFont  // Set red color for the discount
                );
                discountPara.setAlignment(Element.ALIGN_LEFT);
                discountPara.setSpacingBefore(5);
                document.add(discountPara);
            } else {
                // If no coupon is used, display "-".
                Paragraph couponPara = new Paragraph("Coupon: -", rowFont);
                couponPara.setAlignment(Element.ALIGN_LEFT);
                document.add(couponPara);

                Paragraph discountPara = new Paragraph("Discount: -", rowFont);
                discountPara.setAlignment(Element.ALIGN_LEFT);
                discountPara.setSpacingBefore(5);
                document.add(discountPara);
            }

            // Total after discount - Align right
            double totalAfterDiscount = totalAmount - (totalAmount * (couponDiscount / 100));
            Paragraph totalAfterDiscountPara = new Paragraph(
                    "Total after discount: ฿" + String.format("%.2f", totalAfterDiscount),
                    totalFont
            );
            totalAfterDiscountPara.setAlignment(Element.ALIGN_RIGHT);  // Align right for total
            totalAfterDiscountPara.setSpacingBefore(10);
            document.add(totalAfterDiscountPara);

            // Closing the document
            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
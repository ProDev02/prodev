package aekkasit.prodev.backend.order.service;

import aekkasit.prodev.backend.cart.model.Cart;
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
    public Map<String, Object> checkout(User user) {
        Cart cart = cartService.getCart(user);
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 1️⃣ ลด stock
        List<Product> updatedProducts = reduceStock(cartItems);

        // 2️⃣ สร้าง order
        List<Order> orders = createOrders(user, cartItems);

        // 3️⃣ สร้าง PDF จาก cartItems ปัจจุบัน
        byte[] pdfBytes = generateOrderPdfFromCartItems(cartItems);

        // 4️⃣ เคลียร์ cart
        cartService.clearCart(user);

        return Map.of(
                "orders", orders,
                "updatedProducts", updatedProducts,
                "pdfBytes", Base64.getEncoder().encodeToString(pdfBytes) // เพิ่มตรงนี้ให้ frontend โหลด PDF ได้ทันที
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

    @Transactional
    public byte[] generateOrderPdfFromCartItems(List<CartItem> cartItems) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fonts
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(0, 128, 0));
            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
            Font rowFont = new Font(Font.HELVETICA, 12);
            Font totalFont = new Font(Font.HELVETICA, 14, Font.BOLD);

            // Title
            Paragraph title = new Paragraph("Order Summary", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 3, 1, 1, 1});

            // Header
            String[] headers = {"Image", "Product", "Quantity", "Price", "Total"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(0, 128, 0));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            double totalAmount = 0;
            for (CartItem item : cartItems) {
                String imgUrl = item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0);
                Image img = null;

                if (imgUrl != null && !imgUrl.isEmpty()) {
                    try {
                        // โหลดรูปจาก URL หรือ path ที่ CartItem เก็บไว้
                        img = Image.getInstance(imgUrl);
                        img.scaleToFit(50, 50);
                    } catch (Exception e) {
                        log.warn("Cannot load image for product {}: {}", item.getProduct().getName(), e.getMessage());
                    }
                }

                // Image cell
                PdfPCell imgCell = new PdfPCell();
                imgCell.setPadding(5);
                imgCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                if (img != null) imgCell.addElement(img);
                table.addCell(imgCell);

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

            // Total
            Paragraph totalPara = new Paragraph("Total: ฿" + String.format("%.2f", totalAmount), totalFont);
            totalPara.setAlignment(Element.ALIGN_RIGHT);
            totalPara.setSpacingBefore(10);
            document.add(totalPara);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}

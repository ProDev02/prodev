package aekkasit.prodev.backend.coupon.dto;

public class CouponRequest {
    private String couponCode;
    private Double discount;
    private String description;


    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

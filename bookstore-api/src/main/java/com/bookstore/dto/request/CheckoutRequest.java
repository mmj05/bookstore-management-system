package com.bookstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Shipping address is required")
    @Size(max = 500, message = "Shipping address must not exceed 500 characters")
    private String shippingAddress;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Payment method is ALWAYS Cash on Delivery - this field is ignored if provided
    // The system only supports COD payment method
    private String paymentMethod;
    
    /**
     * Returns the payment method - always returns CASH_ON_DELIVERY
     * regardless of what was set. This is the ONLY supported payment method.
     */
    public String getPaymentMethod() {
        return "CASH_ON_DELIVERY";
    }
}
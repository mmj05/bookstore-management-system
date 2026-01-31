package com.bookstore.dto.request;

import com.bookstore.entity.OrderStatus;
import com.bookstore.entity.ShippingCarrier;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    private ShippingCarrier shippingCarrier;

    private String trackingNumber;

    private String notes;
}

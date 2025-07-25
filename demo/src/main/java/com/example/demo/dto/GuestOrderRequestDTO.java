package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class GuestOrderRequestDTO {
    private String clientFullName;
    private String city;
    private String address;
    private String phoneNumber;
    private String email;
    private String couponCode;
    private List<CartItemDTO> cartItems;
}
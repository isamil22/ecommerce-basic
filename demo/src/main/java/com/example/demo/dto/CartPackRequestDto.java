package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartPackRequestDto {
    private Long baseProductId;
    private List<Long> chosenProductIds;
}

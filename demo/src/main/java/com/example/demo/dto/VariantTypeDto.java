// demo/src/main/java/com/example/demo/dto/VariantTypeDto.java
package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class VariantTypeDto {
    private String name;
    private List<String> options;
}
package com.example.demo.mapper;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.repositories.CouponRepository;
import com.example.demo.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class OrderMapper {

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected CouponRepository couponRepository;

    // --- DTO to Entity Mappings ---
    @Mapping(target = "user", expression = "java(userRepository.findById(orderDTO.getUserId()).orElse(null))")
    @Mapping(target = "items", source = "orderItems")
    // Mapping for converting coupon code from DTO to Coupon entity
    @Mapping(target = "coupon", expression = "java(orderDTO.getCouponCode() != null ? couponRepository.findByCode(orderDTO.getCouponCode()).orElse(null) : null)")
    public abstract Order toEntity(OrderDTO orderDTO);

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "order", ignore = true)
    public abstract OrderItem toOrderItemEntity(OrderItemDTO orderItemDTO);

    // --- Entity to DTO Mappings ---
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "orderItems", source = "items")
    // Safely map the coupon code to the DTO, handling nulls
    @Mapping(target = "couponCode", source = "coupon.code")
    public abstract OrderDTO toDTO(Order order);

    @Mapping(target = "productId", source = "product.id")
    public abstract OrderItemDTO toOrderItemDTO(OrderItem orderItem);

    // --- List Mappings ---
    public abstract List<OrderDTO> toDTOs(List<Order> orders);

    public abstract List<Order> toEntities(List<OrderDTO> orderDTOS);

    public abstract List<OrderItemDTO> toOrderItemDTOs(List<OrderItem> items);

    public abstract List<OrderItem> toOrderItemEntities(List<OrderItemDTO> orderItems);
}
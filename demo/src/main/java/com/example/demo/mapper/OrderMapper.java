package com.example.demo.mapper;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.repositories.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class OrderMapper {

    @Autowired
    protected UserRepository userRepository;

    // --- DTO to Entity Mappings ---

    // Use an expression to explicitly tell MapStruct how to get the User object
    @Mapping(target = "user", expression = "java(userRepository.findById(orderDTO.getUserId()).orElse(null))")
    @Mapping(target = "items", source = "orderItems")
    public abstract Order toEntity(OrderDTO orderDTO);

    @Mapping(target = "product.id", source = "productId")
    @Mapping(target = "order", ignore = true)
    public abstract OrderItem toOrderItemEntity(OrderItemDTO orderItemDTO);


    // --- Entity to DTO Mappings ---

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "orderItems", source = "items")
    public abstract OrderDTO toDTO(Order order);

    @Mapping(target = "productId", source = "product.id")
    public abstract OrderItemDTO toOrderItemDTO(OrderItem orderItem);


    // --- List Mappings ---
    public abstract List<OrderDTO> toDTOs(List<Order> orders);

    public abstract List<Order> toEntities(List<OrderDTO> orderDTOS);

    public abstract List<OrderItemDTO> toOrderItemDTOs(List<OrderItem> items);

    public abstract List<OrderItem> toOrderItemEntities(List<OrderItemDTO> orderItems);
}
package com.example.demo.mapper;

import com.example.demo.dto.CouponDTO;
import com.example.demo.model.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    @Mapping(target = "discountValue", source = "discountValue")
    @Mapping(target = "expiryDate", source = "expiryDate")
    @Mapping(target = "type", source = "type")
    CouponDTO toDTO(Coupon coupon);

    // No changes needed here, but kept for completeness
    Coupon toEntity(CouponDTO couponDTO);
}
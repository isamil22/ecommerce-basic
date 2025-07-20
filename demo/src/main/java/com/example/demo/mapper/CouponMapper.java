package com.example.demo.mapper;

import com.example.demo.dto.CouponDTO;
import com.example.demo.model.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "code", source = "code")
    @Mapping(target = "discountValue", source = "discountValue")
    @Mapping(target = "discountType", source = "discountType")
    @Mapping(target = "expiryDate", source = "expiryDate")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "minPurchaseAmount", source = "minPurchaseAmount")
    @Mapping(target = "usageLimit", source = "usageLimit")
    @Mapping(target = "timesUsed", source = "timesUsed")
    @Mapping(target = "firstTimeOnly", source = "firstTimeOnly")
    CouponDTO toDTO(Coupon coupon);

    @Mapping(target = "name", source = "name")
    Coupon toEntity(CouponDTO couponDTO);
}
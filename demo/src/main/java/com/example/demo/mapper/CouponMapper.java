package com.example.demo.mapper;

import com.example.demo.dto.CouponDTO;
import com.example.demo.model.Coupon;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CouponMapper {
    CouponDTO toDTO(Coupon coupon);
    Coupon toEntity(CouponDTO couponDTO);
}
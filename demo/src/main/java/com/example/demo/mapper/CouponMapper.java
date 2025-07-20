// demo/src/main/java/com/example/demo/mapper/CouponMapper.java
package com.example.demo.mapper;

import com.example.demo.dto.CouponDTO;
import com.example.demo.model.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    /**
     * Correctly maps a Coupon entity to a CouponDTO for sending to the frontend.
     * The 'applicableProducts' and 'applicableCategories' fields are automatically
     * ignored because they do not exist in the CouponDTO.
     */
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

    /**
     * Correctly maps a CouponDTO from the frontend to a Coupon entity for saving.
     * `id` is ignored as it's typically auto-generated for new entities.
     * `timesUsed` is now explicitly mapped to ensure it's handled, and initialized
     * in the service layer if it's a new coupon.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "applicableProducts", ignore = true)
    @Mapping(target = "applicableCategories", ignore = true)
    Coupon toEntity(CouponDTO couponDTO);
}
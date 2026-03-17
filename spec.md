# ShopMart

## Current State
- Full e-commerce app with products, cart, orders, admin dashboard, reseller catalog
- Search already works (searchProducts in backend, search bar in Navbar, results in HomePage)
- No discount/coupon system exists

## Requested Changes (Diff)

### Add
- Discount coupon system: admin can create coupon codes with percentage or flat discount
- Cart page shows coupon input field; user can apply a coupon to get discount on total
- Admin page has a "Coupons" tab to create/delete coupon codes

### Modify
- Backend: add DiscountCoupon type, createCoupon, deleteCoupon, getCoupons (admin), applyCoupon (returns discount info), placeOrder accepts optional coupon code
- CartPage: add coupon input with Apply button, show discount amount and final price
- AdminPage: add Coupons tab

### Remove
- Nothing

## Implementation Plan
1. Add DiscountCoupon type and coupon state to backend
2. Add createCoupon, deleteCoupon, listCoupons (admin), validateCoupon (public) functions
3. Update placeOrder to apply coupon discount
4. Update CartPage to show coupon input and discounted total
5. Update AdminPage to show Coupons management tab

# ShopMart - Meesho-like Reselling App

## Current State
New project, nothing exists yet.

## Requested Changes (Diff)

### Add
- Product catalog with categories (Fashion, Electronics, Home, Beauty, etc.)
- Product detail page with images, price, description
- Shopping cart with quantity management
- Order placement and order history
- Admin panel: add/edit/delete products, manage orders
- Reseller role: browse products and share/list them
- User registration and login (buyer/reseller/admin roles)
- Search and filter products by category and price

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: User auth with roles (admin, reseller, buyer), product CRUD, cart management, order management
2. Frontend: Home page with product grid, product detail, cart drawer, checkout flow, order history, admin dashboard
3. Components: authorization for roles, blob-storage for product images

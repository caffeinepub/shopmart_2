import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Include blob storage
  include MixinStorage();

  // Types
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Category;
    image : ?Storage.ExternalBlob;
    stock : Nat;
    seller : Principal;
    isActive : Bool;
  };

  public type Category = {
    #fashion;
    #electronics;
    #homeKitchen;
    #beauty;
    #sports;
    #kids;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    buyer : Principal;
    items : [CartItem];
    totalAmount : Nat;
    status : OrderStatus;
    timestamp : Time.Time;
  };

  public type ResellerCatalog = {
    products : [Nat];
  };

  public type UserProfile = {
    name : Text;
    role : Text; // "admin", "reseller", or "buyer"
    email : Text;
  };

  // State
  let products = Map.empty<Nat, Product>();
  let userCarts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Nat, Order>();
  let resellerCatalogs = Map.empty<Principal, ResellerCatalog>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId = 1;
  var nextOrderId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin only)
  public shared ({ caller }) func createProduct(
    name : Text,
    description : Text,
    price : Nat,
    category : Category,
    image : ?Storage.ExternalBlob,
    stock : Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      category;
      image;
      stock;
      seller = caller;
      isActive = true;
    };

    products.add(nextProductId, product);
    let productId = nextProductId;
    nextProductId += 1;
    productId;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    description : Text,
    price : Nat,
    category : Category,
    image : ?Storage.ExternalBlob,
    stock : Nat,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    let product = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    let updatedProduct : Product = {
      id;
      name;
      description;
      price;
      category;
      image;
      stock;
      seller = product.seller;
      isActive;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not (products.containsKey(id))) {
      Runtime.trap("Product not found");
    };

    products.remove(id);
  };

  // Cart Management (Users only)
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (not product.isActive) {
      Runtime.trap("Product is not active");
    };

    if (product.stock < quantity) {
      Runtime.trap("Insufficient stock");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };

    // Check if product already in cart, update quantity
    let existingItem = cart.find(func(item : CartItem) : Bool { item.productId == productId });

    let updatedCart = switch (existingItem) {
      case (?_) {
        cart.map<CartItem, CartItem>(func(item : CartItem) : CartItem {
          if (item.productId == productId) {
            { productId = item.productId; quantity = item.quantity + quantity };
          } else {
            item;
          };
        });
      };
      case (null) {
        cart.add({ productId; quantity });
        cart;
      };
    };

    userCarts.add(caller, updatedCart);
    updatedCart.toArray();
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    if (quantity == 0) {
      return await removeFromCart(productId);
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (product.stock < quantity) {
      Runtime.trap("Insufficient stock");
    };

    let updatedCart = cart.map<CartItem, CartItem>(func(item : CartItem) : CartItem {
      if (item.productId == productId) {
        { productId; quantity };
      } else {
        item;
      };
    });

    userCarts.add(caller, updatedCart);
    updatedCart.toArray();
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let updatedCart = cart.filter(func(item : CartItem) : Bool { item.productId != productId });

    userCarts.add(caller, updatedCart);
    updatedCart.toArray();
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  // Order Processing (Users only)
  public shared ({ caller }) func placeOrder() : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let items = cart.toArray();

    if (items.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    // Validate stock and calculate total
    var totalAmount = 0;
    for (item in items.vals()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId.toText()) };
        case (?p) { p };
      };

      if (not product.isActive) {
        Runtime.trap("Product is not active: " # product.name);
      };

      if (product.stock < item.quantity) {
        Runtime.trap("Insufficient stock for: " # product.name);
      };

      totalAmount += item.quantity * product.price;
    };

    let order : Order = {
      id = nextOrderId;
      buyer = caller;
      items = items;
      totalAmount;
      status = #pending;
      timestamp = Time.now();
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;

    // Update stock
    for (item in items.vals()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?p) { p };
      };

      let updatedProduct = {
        id = product.id;
        name = product.name;
        description = product.description;
        price = product.price;
        category = product.category;
        image = product.image;
        stock = if (product.stock >= item.quantity) { product.stock - item.quantity } else { 0 };
        seller = product.seller;
        isActive = product.isActive;
      };

      products.add(item.productId, updatedProduct);
    };

    // Clear cart
    userCarts.remove(caller);

    order;
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order history");
    };

    let userOrders = orders.values().filter(func(order : Order) : Bool { order.buyer == caller });

    userOrders.toArray();
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let order = orders.get(orderId);

    switch (order) {
      case (null) { null };
      case (?o) {
        // Users can only view their own orders, admins can view all
        if (o.buyer == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?o;
        } else {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };
  };

  // Admin Order Management
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    let updatedOrder = {
      id = order.id;
      buyer = order.buyer;
      items = order.items;
      totalAmount = order.totalAmount;
      status = status;
      timestamp = order.timestamp;
    };

    orders.add(orderId, updatedOrder);
  };

  // Reseller Catalog Management
  public shared ({ caller }) func addToResellerCatalog(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage reseller catalog");
    };

    // Verify product exists
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {};
    };

    let catalog = switch (resellerCatalogs.get(caller)) {
      case (null) { { products = [] } };
      case (?c) { c };
    };

    // Check if already in catalog
    let alreadyExists = catalog.products.find(func(id) { id == productId });

    if (alreadyExists != null) {
      Runtime.trap("Product already in catalog");
    };

    let updatedProducts = catalog.products.concat([productId]);
    let updatedCatalog = { products = updatedProducts };

    resellerCatalogs.add(caller, updatedCatalog);
  };

  public shared ({ caller }) func removeFromResellerCatalog(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage reseller catalog");
    };

    let catalog = switch (resellerCatalogs.get(caller)) {
      case (null) { Runtime.trap("Catalog is empty") };
      case (?c) { c };
    };

    let updatedProducts = catalog.products.filter(func(id) { id != productId });
    let updatedCatalog = { products = updatedProducts };

    resellerCatalogs.add(caller, updatedCatalog);
  };

  public query ({ caller }) func getResellerCatalog() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reseller catalog");
    };

    let catalog = switch (resellerCatalogs.get(caller)) {
      case (null) { { products = [] } };
      case (?c) { c };
    };

    let catalogProducts = catalog.products.filter(
      func(productId) {
        products.containsKey(productId);
      }
    );

    catalogProducts.map(
      func(productId) {
        switch (products.get(productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?p) { p };
        };
      }
    );
  };

  // Product Query Functions (Public - anyone can browse)
  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query func listProducts() : async [Product] {
    let activeProducts = products.values().filter(func(p : Product) : Bool { p.isActive });
    activeProducts.toArray();
  };

  public query func searchProducts(searchTerm : Text) : async [Product] {
    let lowerSearchTerm = searchTerm.toLower();

    let matchingProducts = products.values().filter(func(p : Product) : Bool {
      if (not p.isActive) {
        return false;
      };

      let lowerName = p.name.toLower();
      let lowerDesc = p.description.toLower();

      lowerName.contains(#text lowerSearchTerm) or lowerDesc.contains(#text lowerSearchTerm);
    });

    matchingProducts.toArray();
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    let categoryProducts = products.values().filter(func(p : Product) : Bool {
      p.isActive and p.category == category;
    });

    categoryProducts.toArray();
  };

  // Image Upload (Users only)
  public shared ({ caller }) func uploadImage(blob : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload images");
    };
    blob;
  };
};

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.stock = data.stock;
    this.imageUrl = data.imageUrl; // Use imageUrl directly
    this.status = data.stock > 0 ? 'In Stock' : 'Out of Stock'; // Derive status from stock
    this.brand = data.brand || null;
    this.productId = data.id; // Use id for productId
    this.thumbnails = data.thumbnails || [];
    this.description = data.description;
    this.size = data.size; // Add this line
  }

  getFormattedPrice(currency = 'THB') {
    if (this.price === null || this.price === undefined) {
      return 'Price not available';
    }
    return `${this.price.toLocaleString()} ${currency}`;
  }
}

export default Product;

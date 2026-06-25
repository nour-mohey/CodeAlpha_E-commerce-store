const Product = require('../models/Product');

function shapeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    colors: row.colors ? row.colors.split(',') : [],
    details: row.details ? row.details.split('|') : [],
    stock: row.stock
  };
}

async function getAllProducts() {
  const rows = await Product.findAll();
  return rows.map(shapeProduct);
}

async function getProductById(id) {
  const row = await Product.findById(id);
  return row ? shapeProduct(row) : null;
}

async function createProduct(data) {
  await Product.create({
    id: data.id,
    name: data.name,
    category: data.category,
    price: data.price,
    description: data.description || '',
    colors: data.colors || '',
    details: data.details || '',
    stock: data.stock !== undefined ? data.stock : 50
  });
}

async function updateProduct(id, data) {
  return Product.update(id, {
    name: data.name,
    category: data.category,
    price: data.price,
    description: data.description || '',
    colors: data.colors || '',
    details: data.details || '',
    stock: data.stock !== undefined ? data.stock : 50
  });
}

async function deleteProduct(id) {
  return Product.delete(id);
}

module.exports = {
  shapeProduct,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

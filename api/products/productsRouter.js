const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

const PRODUCTS_FILE_PATH = './data/productos.json';

// Verificar si el producto existe
async function productExists(req, res, next) {
  const { pid } = req.params;
  try {
    const products = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
    const parsedProducts = JSON.parse(products);
    const product = parsedProducts.find((p) => p.id.toString() === pid);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET todos los productos
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    const products = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
    const parsedProducts = JSON.parse(products);
    const limitedProducts = limit ? parsedProducts.slice(0, parseInt(limit)) : parsedProducts;
    res.json(limitedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET un producto es especifico
router.get('/:pid', productExists, async (req, res) => {
  res.json(req.product);
});

// POST a un nuevo producto
router.post('/', async (req, res) => {
    const newProduct = req.body;
    try {
      const products = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
      const parsedProducts = JSON.parse(products);
      const id = Date.now().toString(); 
      newProduct.id = id;
      parsedProducts.push(newProduct);
      await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(parsedProducts, null, 2));
      res.status(201).json({ message: 'Product created successfully', id });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// PUT (Update) a producto
router.put('/:pid', productExists, async (req, res) => {
  const { pid } = req.params;
  const updatedProduct = req.body;
  try {
    const products = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
    let parsedProducts = JSON.parse(products);
    parsedProducts = parsedProducts.map((product) =>
      product.id.toString() === pid ? { ...product, ...updatedProduct } : product
    );
    await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(parsedProducts, null, 2));
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a producto
router.delete('/:pid', productExists, async (req, res) => {
  const { pid } = req.params;
  try {
    const products = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
    let parsedProducts = JSON.parse(products);
    parsedProducts = parsedProducts.filter((product) => product.id.toString() !== pid);
    await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(parsedProducts, null, 2));
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

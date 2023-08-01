const express = require('express');
const router = express.Router();
const fs = require('fs').promises;

const CARTS_FILE_PATH = './data/carrito.json';
const PRODUCTS_FILE_PATH = './data/productos.json';

// Verifica si el carrito existe
async function cartExists(req, res, next) {
  const { cid } = req.params;
  try {
    const carts = await fs.readFile(CARTS_FILE_PATH, 'utf-8');
    const parsedCarts = JSON.parse(carts);
    const cart = parsedCarts.find((c) => c.id.toString() === cid);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    req.cart = cart;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

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

// GET Producto en especifico
router.get('/:cid', cartExists, (req, res) => {
  res.json(req.cart.products);
});

// POST a nuevo carrito
router.post('/', async (req, res) => {
  const newCart = {
    id: Date.now().toString(),
    products: [],
  };
  try {
    const carts = await fs.readFile(CARTS_FILE_PATH, 'utf-8');
    const parsedCarts = JSON.parse(carts);
    parsedCarts.push(newCart);
    await fs.writeFile(CARTS_FILE_PATH, JSON.stringify(parsedCarts, null, 2));
    res.status(201).json({ message: 'Cart created successfully', id: newCart.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a un producto especifico 
router.post('/:cid/product/:pid', cartExists, productExists, async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    const carts = await fs.readFile(CARTS_FILE_PATH, 'utf-8');
    let parsedCarts = JSON.parse(carts);
    const cartIndex = parsedCarts.findIndex((cart) => cart.id.toString() === cid);
    const existingProductIndex = parsedCarts[cartIndex].products.findIndex(
      (product) => product.id.toString() === pid
    );

    if (existingProductIndex !== -1) {
      // Incrementa la cantidad si el producto ya existe en el carro
      parsedCarts[cartIndex].products[existingProductIndex].quantity += parseInt(quantity);
    } else {
      // agrega un producto en el carro si no existe
      const productToAdd = { id: pid, quantity: parseInt(quantity) };
      parsedCarts[cartIndex].products.push(productToAdd);
    }

    await fs.writeFile(CARTS_FILE_PATH, JSON.stringify(parsedCarts, null, 2));
    res.json({ message: 'Product added to cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

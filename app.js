const express = require('express');
const app = express();
const productsRouter = require('./api/products/productsRouter');
const cartsRouter = require('./api/carts/cartsRouter');

app.use(express.json());

// Rutas para productos
app.use('/api/products', productsRouter);

// Rutas para carritos
app.use('/api/carts', cartsRouter);

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

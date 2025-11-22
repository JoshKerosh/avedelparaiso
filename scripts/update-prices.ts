import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import Product from '../models/Product';

const USD_TO_CRC = 500;

async function updateProductPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const products = await Product.find();
    let updated = 0;
    for (const product of products) {
      // Si el precio parece estar en dólares (menor a 2000), lo convertimos
      if (product.price < 2000) {
        product.price = Math.round(product.price * USD_TO_CRC);
        await product.save();
        updated++;
      }
    }
    console.log(`Precios actualizados para ${updated} productos.`);
    process.exit(0);
  } catch (error) {
    console.error('Error actualizando precios:', error);
    process.exit(1);
  }
}

updateProductPrices();

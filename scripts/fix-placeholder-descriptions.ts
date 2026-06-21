import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST — static imports are hoisted, so import DB modules dynamically below.
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * One-off, idempotent maintenance: replace obvious placeholder product descriptions
 * (e.g. "Hxhxbxb") with presentable Spanish copy. Only updates a product if it still
 * holds the exact placeholder value, so re-running is safe and never overwrites real
 * content the user has since edited.
 */
const FIXES: { name: string; placeholder: string; description: string }[] = [
  {
    name: 'Anillo estrella',
    placeholder: 'Hxhxbxb',
    description:
      'Anillo con diseño de estrella en acabado brillante. Una pieza elegante y versátil, ideal para regalar o complementar cualquier look.',
  },
];

async function main() {
  const { default: connectDB } = await import('../lib/mongodb');
  const { default: Product } = await import('../models/Product');

  await connectDB();

  for (const fix of FIXES) {
    const result = await Product.updateOne(
      { name: fix.name, description: fix.placeholder },
      { $set: { description: fix.description } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Updated "${fix.name}" description.`);
    } else {
      console.log(`Skipped "${fix.name}" (no placeholder match — already fixed or changed).`);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

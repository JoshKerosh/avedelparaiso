import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST (see scripts/seed.ts for why imports are dynamic below).
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Adds additional admin users. Provide them via the ADDITIONAL_USERS env var as
 * a JSON array, e.g.:
 *   ADDITIONAL_USERS='[{"username":"ana","password":"secret"}]'
 * Existing usernames are skipped.
 */
async function addUsers() {
  const { default: bcrypt } = await import('bcryptjs');
  const { default: connectDB } = await import('../lib/mongodb');
  const { default: User } = await import('../models/User');

  const raw = process.env.ADDITIONAL_USERS;
  if (!raw) {
    console.error('Set ADDITIONAL_USERS to a JSON array of { username, password }.');
    process.exit(1);
  }

  let users: { username: string; password: string }[];
  try {
    users = JSON.parse(raw);
    if (!Array.isArray(users)) throw new Error('not an array');
  } catch {
    console.error('ADDITIONAL_USERS must be a valid JSON array.');
    process.exit(1);
  }

  try {
    await connectDB();

    for (const { username, password } of users) {
      if (!username || !password) {
        console.log(`⏭️  Skipping entry with missing username/password`);
        continue;
      }
      const existing = await User.findOne({ username });
      if (existing) {
        console.log(`ℹ️  User "${username}" already exists — skipped`);
        continue;
      }
      const hashed = await bcrypt.hash(password, 10);
      await User.create({ username, password: hashed });
      console.log(`✅ Created user "${username}"`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding users:', error);
    process.exit(1);
  }
}

addUsers();

import bcrypt from 'bcryptjs';

// Change this before running:
// 1) Set PLAIN_PASSWORD to the password you want to give the user.
// 2) Run: npm run hash-password
// 3) Copy the printed hash into the users.password_hash column in your database.

const PLAIN_PASSWORD = 'nacho123';

async function main() {
  if (!PLAIN_PASSWORD) {
    console.error('Please set PLAIN_PASSWORD to a non-empty password first.');
    process.exit(1);
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(PLAIN_PASSWORD, saltRounds);
  console.log('Plain password:', PLAIN_PASSWORD);
  console.log('Bcrypt hash (password_hash):', hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



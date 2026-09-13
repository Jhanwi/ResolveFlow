const bcrypt = require("bcryptjs");
const pool = require("./config/db");

const createAdmin = async () => {
  try {
    const name = "ResolveFlow Admin";
    const email = "admin@resolveflow.com";
    const password = "Admin@123456";

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log("Admin account already exists.");
      return;
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, role`,
      [
        name,
        email,
        passwordHash
      ]
    );

    console.log(
      "Admin account created:"
    );

    console.log(result.rows[0]);
  } catch (error) {
    console.error(
      "Unable to create admin:",
      error
    );
  } finally {
    await pool.end();
  }
};

createAdmin();
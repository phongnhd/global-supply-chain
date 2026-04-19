import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { generateToken } from "../utils/jwt.js";

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const exist = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (exist.rows.length > 0) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role`,
    [name, email, hash]
  );

  res.json({ user: result.rows[0] });
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({
    user: {
      email: user.email,
      role: user.role,
    },
  });
};
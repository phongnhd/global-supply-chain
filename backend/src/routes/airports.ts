import { Router, Request, Response } from "express";
import { db } from "../config/db.js";

const router = Router();
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "")
      .trim()
      .toUpperCase();

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 15);
    const offset = (page - 1) * limit;

    const params: any[] = [];

    let whereClause = "";

    if (search) {
      whereClause = `
        WHERE
          code ILIKE $1
          OR name ILIKE $1
      `;
      params.push(`${search}%`);
    }

    const query = `
      SELECT
        code,
        name,
        city,
        country
      FROM airports
      ${whereClause}
      ORDER BY code ASC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      data: result.rows,
      page,
      limit,
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});
export default router;
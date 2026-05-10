import { Router, Request, Response } from "express";
import { db } from "../config/db.js";

const router = Router();

router.get(
  "/",
  async (req: Request, res: Response) => {
    try {
      const search = String(
        req.query.search || ""
      )
        .trim()
        .toUpperCase();

      const page = Math.max(
        Number(req.query.page || 1),
        1
      );

      const limit = Math.min(
        Number(req.query.limit || 15),
        100
      );

      const offset = (page - 1) * limit;

      // =========================
      // NO SEARCH
      // =========================
      if (!search) {
        const [dataResult, countResult] =
          await Promise.all([
            db.query(
              `
              SELECT
                code,
                name,
                country
              FROM seaports
              ORDER BY code ASC
              LIMIT $1
              OFFSET $2
              `,
              [limit, offset]
            ),

            db.query(`
              SELECT COUNT(*)::int AS total
              FROM seaports
            `),
          ]);

        const total =
          countResult.rows[0].total;

        return res.json({
          data: dataResult.rows,
          total,
          page,
          limit,
          hasMore:
            offset +
              dataResult.rows.length <
            total,
        });
      }

      // =========================
      // SEARCH
      // =========================
      const [dataResult, countResult] =
        await Promise.all([
          db.query(
            `
            SELECT
              code,
              name,
              country
            FROM seaports
            WHERE
              code ILIKE $1
              OR name ILIKE $1
            ORDER BY code ASC
            LIMIT $2
            OFFSET $3
            `,
            [
              `${search}%`,
              limit,
              offset,
            ]
          ),

          db.query(
            `
            SELECT COUNT(*)::int AS total
            FROM seaports
            WHERE
              code ILIKE $1
              OR name ILIKE $1
            `,
            [`${search}%`]
          ),
        ]);

      const total =
        countResult.rows[0].total;

      return res.json({
        data: dataResult.rows,
        total,
        page,
        limit,
        hasMore:
          offset +
            dataResult.rows.length <
          total,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Internal Server Error",
      });
    }
  }
);

export default router;
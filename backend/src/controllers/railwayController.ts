import type { Request, Response } from "express";
import type { RailwayDeclaration } from "@global/shared/types";
import { hashService } from "../services/hashService.js";

export const railwayController = {
  submit(req: Request, res: Response) {
    const body = req.body as Partial<RailwayDeclaration>;
    if (!body.wagonId || !body.originStation || !body.destinationStation) {
      res.status(400).json({ error: "wagonId, originStation, destinationStation required" });
      return;
    }
    const hash = hashService.sha256Hex(JSON.stringify(body));
    res.status(201).json({ declaration: { ...body, contentHash: hash } });
  },
};

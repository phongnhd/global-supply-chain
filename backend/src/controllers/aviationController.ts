import type { Request, Response } from "express";
import type { AviationDeclaration } from "@global/shared/types";
import { hashService } from "../services/hashService.js";

export const aviationController = {
  submit(req: Request, res: Response) {
    const body = req.body as Partial<AviationDeclaration>;
    if (!body.awbNumber || !body.flightNumber || !body.departureAirport || !body.arrivalAirport) {
      res.status(400).json({ error: "awbNumber, flightNumber, airports required" });
      return;
    }
    const hash = hashService.sha256Hex(JSON.stringify(body));
    res.status(201).json({ declaration: { ...body, contentHash: hash } });
  },
};

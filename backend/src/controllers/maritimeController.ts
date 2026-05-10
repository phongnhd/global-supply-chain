import type { Request, Response } from "express";
import type { MaritimeDeclaration } from "@global/shared/types";
import { hashService } from "../services/hashService.js";

export const maritimeController = {
  submit(req: Request, res: Response) {
    const body = req.body as Partial<MaritimeDeclaration>;
    if (!body.imoNumber || !body.containerId || !body.portOfLoading || !body.portOfDischarge) {
      res.status(400).json({ error: "imoNumber, containerId, ports required" });
      return;
    }
    const hash = hashService.sha256Hex(JSON.stringify(body));
    res.status(201).json({ declaration: { ...body, contentHash: hash } });
  },
};

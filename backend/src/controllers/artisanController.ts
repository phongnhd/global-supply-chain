import type { Request, Response } from "express";
import type { BirthCertificatePayload } from "@global/shared/types";
import { hashService } from "../services/hashService.js";
import { ipfsService } from "../services/ipfsService.js";

export const artisanController = {
  async createDraft(req: Request, res: Response) {
    const body = req.body as Partial<BirthCertificatePayload>;
    if (!body.productName || !body.sku || !body.originCountry) {
      res.status(400).json({ error: "productName, sku, originCountry required" });
      return;
    }
    const canonical = JSON.stringify({
      productName: body.productName,
      sku: body.sku,
      originCountry: body.originCountry,
      metadataCid: body.metadataCid ?? null,
    });
    const contentHash = hashService.sha256Hex(canonical);
    let metadataCid = body.metadataCid;
    if (!metadataCid && req.body.metadataJson) {
      metadataCid = (await ipfsService.pinJson(req.body.metadataJson)) ?? undefined;
    }
    res.status(201).json({
      draft: {
        ...body,
        metadataCid: metadataCid ?? undefined,
        contentHash,
      },
    });
  },
};

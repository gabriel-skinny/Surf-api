import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";

@Controller("beaches")
export class BeachController {
  @Post("")
  public async createBeach(req: Request, res: Response): Promise<void> {
    res.status(201).send({...req.body, id: "13"});
  }
}
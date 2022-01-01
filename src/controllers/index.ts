import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import Mongoose from 'mongoose';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: Mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof Mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);

      res.status(clientErrors.code).send(clientErrors);
    } else {
      res.status(500).send({ code: 500, error: 'Internal error' });
    }
  }

  private handleClientErrors(error: Mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) =>
        err.name === 'ValidatorError' &&
        err.kind === CUSTOM_VALIDATION.DUPLICATED
    );

    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    } else {
      return { code: 422, error: error.message };
    }
  }
}

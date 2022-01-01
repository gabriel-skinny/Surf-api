import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { get } from "config";

export class Auth {
  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await hash(password, salt);
  }

  public static async comparePassword(
    password: string,
    hashedpassword: string
  ): Promise<boolean> {
    return await compare(password, hashedpassword);
  }

  public static generateToken(payload: object): string {
    return jwt.sign(payload, get("App.auth.key"), {
      expiresIn: get("App.auth.tokenExpiresIn")
    })
  }
}

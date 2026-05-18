declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  export interface StrategyOptions {
    secretOrKey?: string | Buffer;
    jwtFromRequest?: JwtFromRequestFunction;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: Record<string, unknown>;
  }

  export type JwtFromRequestFunction = (req: Request) => string | null;

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken: () => JwtFromRequestFunction;
    fromHeader: (headerName: string) => JwtFromRequestFunction;
    fromAuthHeaderWithScheme: (authScheme: string) => JwtFromRequestFunction;
  };

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify?: (payload: any, done: any) => void);
  }
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: string | string[], options?: Record<string, unknown>): RequestHandler;
  export = cookieParser;
}

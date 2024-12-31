import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Observable } from "rxjs";

@Injectable()
export class WsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const auth = context.switchToWs().getClient().handshake.auth;
      console.log(auth);
      if (auth.token !== "auth") {
        throw new WsException("error la sial");
      }

      return true;
  }
}
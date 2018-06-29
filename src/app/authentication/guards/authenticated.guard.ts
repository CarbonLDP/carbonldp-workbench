import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

import { AbstractAuthenticationGuard } from "./abstract-authentication.guard";

/*
*  Guard that detects if a user IS authenticated
* */
@Injectable()
export class AuthenticatedGuard extends AbstractAuthenticationGuard {
	constructor( protected router:Router ) {
		super( router );
	}

	/*
	*  Determines if a user IS authenticated using the AuthService from its parent
	* */
	canActivate( route:ActivatedRouteSnapshot, state:RouterStateSnapshot ):Promise<boolean> {
		return super.canActivate( route, state ).then( ( canActivate:boolean ) => {
			if( ! canActivate ) return false;
			return this.authService.isAuthenticated() ? true : this.onReject( route, state );
		} ).catch( () => {
			return this.onError( route, state );
		} );
	}
}

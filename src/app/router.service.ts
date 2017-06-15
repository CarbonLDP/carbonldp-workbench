import { Router } from "@angular/router";
import { Injectable } from "@angular/core";

/**
 * Service that wraps router related functionality. This service must not be automatically injected,
 * because we need a different instance each time we inject it into a component (not a singleton).
 * Instead use a factory like:
 * <pre><code>
 *      provide( RouterService, {
 *          useFactory: ( router:Router ):RouterService => {
 *              return new RouterService( router );
 *          },
 *          deps: [ Router ]
 *      })
 * </pre></code>
 */
@Injectable()
export class RouterService {
	private router:Router;

	constructor( router:Router ) {
		this.router = router;
	}

	isActive( routes:string[], exact:boolean = true ):boolean {
		let fullRoute:string = "";
		if( typeof routes === "string" ) {
			fullRoute = routes;
		} else {
			routes.forEach( ( value:string, idx:number ) => {
				fullRoute += value;
				if( idx !== routes.length - 1 ) fullRoute += "/";
			} );
		}
		return this.router.isActive( fullRoute, exact );
	}
}

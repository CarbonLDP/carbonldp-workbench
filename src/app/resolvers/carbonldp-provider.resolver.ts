import { Observable } from "rxjs";

import { Injectable } from "@angular/core";
import { Router, Resolve, ActivatedRouteSnapshot } from "@angular/router";

import { CarbonLDP } from "carbonldp";

import { carbonldpProvider } from "app/providers";

@Injectable()
export class CarbonLDPProviderResolver implements Resolve<boolean | CarbonLDP> {
	constructor( protected router:Router ) {}

	resolve( route:ActivatedRouteSnapshot ):Observable<CarbonLDP | boolean> | Promise<CarbonLDP | boolean> | CarbonLDP | boolean {
		return carbonldpProvider.promise.then( () => {
			return carbonldpProvider();
		} ).catch( ( error ) => {
			if( typeof route.data === "object" && route.data !== null && typeof route.data[ "onError" ] !== "undefined" ) {
				this.router.navigate( route.data[ "onError" ] );
			} else {
				console.error( "CarbonProviderResolver was configured in a route without an 'data.onError' property" );
			}

			return false;
		} );
	}
}

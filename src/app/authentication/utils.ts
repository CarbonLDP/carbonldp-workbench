import { Injector } from "@angular/core";

import * as Cookies from "js-cookie";


/**
 * Function that holds the app's injector. To initialize it, call it passing appRef.injector as a parameter.
 * After that, you can import the function and execute it to receive the same injector.
 * @type {function(Injector=): Injector}
 */
const appInjectorFn:( injector?:Injector ) => Promise<Injector> = (():( injector?:Injector ) => Promise<Injector> => {
	let appInjector:Injector;

	let resolve:( injector:Injector ) => void;
	let reject:( error:any ) => void;
	let promise:Promise<Injector> = new Promise( ( _resolve:( injector:Injector ) => void, _reject:( error:any ) => void ) => {
		resolve = _resolve;
		reject = _reject;
	} );

	setTimeout( () => {
		reject( new Error( "appInjector wasn't provided in the configured amount of time" ) );
	}, 10 * 1000 );

	return ( injector?:Injector ):Promise<Injector> => {
		if( injector ) {
			appInjector = injector;
			resolve( injector );
		}

		return promise;
	};
})();

function inject( token:any ):Promise<any> {
	return appInjectorFn().then( ( injector:Injector ) => {
		return injector.get( token );
	} );
}


// Exports
export function authenticationCookieIsPresent():boolean {
	return typeof Cookies.get( AUTH_COOKIE ) !== "undefined";
}

export const AUTH_COOKIE:string = "carbonldp-workbench-token";

export {
	inject,
	appInjectorFn as appInjector,
};

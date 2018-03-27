import { Injector } from "@angular/core";

import * as Cookies from "js-cookie";

import { CarbonLDP } from "carbonldp";
import * as Errors from "carbonldp/Errors";
import { Errors as HTTPErrors } from "carbonldp/HTTP";
import { Method, Token } from "carbonldp/Auth";


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

export function authenticateWithCookie( carbonldp:CarbonLDP ):Promise<any> {
	let token:Token.Class;
	try {
		token = <any>Cookies.getJSON( AUTH_COOKIE );
	} catch( error ) {
		return Promise.reject( error );
	}
	// TODO: change the "TOKEN" string to Method.TOKEN
	return carbonldp.auth.authenticateUsing( "TOKEN", token ).catch( ( error ) => {
		if( error instanceof Errors.IllegalArgumentError || error instanceof HTTPErrors.UnauthorizedError ) {
			// Invalid token
			Cookies.remove( AUTH_COOKIE );
		} else return Promise.reject( error );
	} );
}

export const AUTH_COOKIE:string = "carbonldp-workbench-token";

export {
	inject,
	appInjectorFn as appInjector,
};

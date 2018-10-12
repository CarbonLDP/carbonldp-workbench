import { enableProdMode, NgModuleRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { appInjector } from "app/authentication/utils";
import { carbonldpProvider } from "app/providers/carbonldp.provider";

import { CarbonLDP } from "carbonldp";

import { CARBON_HOST, CARBON_PROTOCOL, DEBUG } from "app/config";
import { AppModule } from "app/app.module";

const carbonldp:CarbonLDP = new CarbonLDP( `${CARBON_PROTOCOL}://${CARBON_HOST}` );
carbonldpProvider
	.initialize( <any>carbonldp )
	.catch( console.error );

// Allows to access the carbonldp object in the console while debugging
if( DEBUG && typeof window !== "undefined" ) window[ "carbonldp" ] = carbonldp;

if( ! DEBUG ) enableProdMode();

platformBrowserDynamic().bootstrapModule( AppModule ).then( ( appRef:NgModuleRef<AppModule> ) => {
	return appInjector( appRef.injector );
} ).catch( ( error ) => {
	console.error( error );
} );

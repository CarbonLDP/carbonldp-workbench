import { enableProdMode, NgModuleRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { appInjector, activeContext } from "angular2-carbonldp/boot";

import { Class as Carbon } from "carbonldp/Carbon";

import { CARBON_PROTOCOL, CARBON_HOST, DEBUG } from "app/config";
import { AppModule } from "app/app.module";

let carbon:Carbon = new Carbon();
if( CARBON_PROTOCOL !== "https" ) carbon.setSetting( "http.ssl", false );
carbon.setSetting( "domain", CARBON_HOST );
activeContext.initialize( <any>carbon );

if( ! DEBUG ) enableProdMode();

platformBrowserDynamic().bootstrapModule( AppModule ).then( ( appRef:NgModuleRef<AppModule> ) => {
	appInjector( appRef.injector );
} ).catch( ( error ) => {
	console.error( error );
} );

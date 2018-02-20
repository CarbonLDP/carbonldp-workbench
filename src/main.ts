import { enableProdMode, NgModuleRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { appInjector } from "app/authentication/utils";
import { carbonProvider } from "app/providers/carbon.provider";

import { Class as Carbon } from "carbonldp/Carbon";

import { CARBON_PROTOCOL, CARBON_HOST, DEBUG } from "app/config";
import { AppModule } from "app/app.module";

let carbon:Carbon = new Carbon( CARBON_HOST, CARBON_PROTOCOL === "https" );
carbonProvider.initialize( <any>carbon );

if( ! DEBUG ) enableProdMode();

platformBrowserDynamic().bootstrapModule( AppModule ).then( ( appRef:NgModuleRef<AppModule> ) => {
	appInjector( appRef.injector );
} ).catch( ( error ) => {
	console.error( error );
} );

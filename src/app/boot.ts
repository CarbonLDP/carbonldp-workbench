// There are files that reference this two dependencies and therefore they get included in the bundled file
// This causes a conflict with angular2-polyfills.js, as that file also declares them
// To avoid this, angular2-polyfills.js is no longer included in the index.html and zone and reflect are declared here instead
import "reflect-metadata";
import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";

import { enableProdMode, NgModuleRef } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

// import { Title } from "@angular/platform-browser";
// import { APP_BASE_HREF } from "@angular/common";
// import { ROUTER_PROVIDERS } from "@angular/router-deprecated";
// import { HTTP_PROVIDERS } from "@angular/http";
// import { WORKBENCH_PROVIDERS } from "app/workbench/workbench";

import { appInjector, activeContext } from "angular2-carbonldp/boot";

import Carbon from "carbonldp/Carbon";

import { CARBON_PROTOCOL, CARBON_DOMAIN, DEBUG } from "app/config";
import { AppModule } from "app/app.module";

let carbon:Carbon = new Carbon();
if( CARBON_PROTOCOL !== "https" ) carbon.setSetting( "http.ssl", false );
carbon.setSetting( "domain", CARBON_DOMAIN );
activeContext.initialize( carbon );

if( ! DEBUG ) enableProdMode();

platformBrowserDynamic().bootstrapModule( AppModule ).then( ( appRef:NgModuleRef<AppModule> ) => {
// bootstrap( AppComponent, [
// 	ROUTER_PROVIDERS,
// 	HTTP_PROVIDERS,
// 	Title,
//
// 	provide( APP_BASE_HREF, { useValue: "<%- url.base %>" } ),
//
// 	providers,
// 	WORKBENCH_PROVIDERS
// ] ).then( ( appRef:ComponentRef<AppComponent> ) => {
	appInjector( appRef.injector );
} ).catch( ( error ) => {
	console.error( error );
} );

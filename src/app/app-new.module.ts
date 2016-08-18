import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { CARBON_PROVIDERS } from "angular2-carbonldp/boot";
import { CARBON_SERVICES_PROVIDERS } from "angular2-carbonldp/services";

import { routing, appRoutingProviders } from "./app-new.routing";
import { AppComponent } from "./app-new.component";

@NgModule( {
	imports: [
		BrowserModule,
		routing
	],
	declarations: [
		AppComponent,
	],
	providers: [
		appRoutingProviders,
		CARBON_PROVIDERS,
		CARBON_SERVICES_PROVIDERS
	],
	bootstrap: [ AppComponent ],
} )
export class AppModule {
}
import { NgModule } from "@angular/core";
import { APP_BASE_HREF, DeprecatedFormsModule } from "@angular/common";
import { BrowserModule, Title } from "@angular/platform-browser";

import { CARBON_PROVIDERS } from "angular2-carbonldp/boot";
import { CARBON_SERVICES_PROVIDERS } from "angular2-carbonldp/services";

import { URL_BASE } from "app/config";
import { routing, appRoutingProviders } from "./app.routing";
import { AppComponent } from "./app.component";

import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";
import { NotFoundErrorView } from "app/error-pages/not-found-error/not-found-error.view";

import { DashboardView } from "app/dashboard/dashboard.view";

import { PanelModule } from "carbon-panel/panel.module";


@NgModule( {
	imports: [
		BrowserModule,
		DeprecatedFormsModule,
		routing,
		PanelModule.forRoot()
	],
	declarations: [
		AppComponent,
		LoginView,
		WorkbenchView,
		NotFoundErrorView,
		DashboardView,
	],
	providers: [
		{ provide: APP_BASE_HREF, useValue: URL_BASE },

		appRoutingProviders,

		Title,
		CARBON_PROVIDERS,
		CARBON_SERVICES_PROVIDERS
	],
	bootstrap: [ AppComponent ],
} )
export class AppModule {
}

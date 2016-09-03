import { NgModule } from "@angular/core";
import { APP_BASE_HREF, DeprecatedFormsModule } from "@angular/common";
import { BrowserModule, Title } from "@angular/platform-browser";

// Providers
import { URL_BASE } from "app/config";
import { CARBON_PROVIDERS } from "angular2-carbonldp/boot";
import { CARBON_SERVICES_PROVIDERS } from "angular2-carbonldp/services";
import { routing, appRoutingProviders } from "./app.routing";

// Components
import { AppComponent } from "./app.component";
import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";
import { NotFoundErrorView } from "app/error-pages/not-found-error/not-found-error.view";
import { DashboardView } from "app/dashboard/dashboard.view";

// Modules
import { PanelModule } from "carbonldp-panel/panel.module";


@NgModule( {
	imports: [
		BrowserModule,
		DeprecatedFormsModule,
		routing,
		PanelModule.forRoot(),
	],
	declarations: [
		AppComponent,
		LoginView,
		WorkbenchView,
		NotFoundErrorView,
		DashboardView,
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useValue: URL_BASE
		},
		CARBON_PROVIDERS,
		CARBON_SERVICES_PROVIDERS,
		appRoutingProviders,
		Title,
	],
	bootstrap: [ AppComponent ],
} )
export class AppModule {
}

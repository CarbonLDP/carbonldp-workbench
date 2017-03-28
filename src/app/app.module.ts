import { NgModule } from "@angular/core";
import { APP_BASE_HREF } from "@angular/common";
import { BrowserModule, Title } from "@angular/platform-browser";

// Providers
import { BASE_URL } from "./config";
import { CARBON_PROVIDERS } from "angular2-carbonldp/boot";
import { CARBON_SERVICES_PROVIDERS } from "angular2-carbonldp/services";
import { routing, appRoutingProviders } from "./app.routing";

// Components
import { AppComponent } from "./app.component";
import { LoginView } from "./login/login.view";
import { WorkbenchView } from "./workbench/workbench.view";
import { ErrorView } from "./error-pages/error.view";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";
import { DashboardView } from "./dashboard/dashboard.view";
import { BackgroundVideoComponent } from "./error-pages/background-video.component";
import { VersionsExposerComponent } from "./versions-exposer/versions-exposer.component";

// Modules
import { PanelModule } from "carbonldp-panel/panel.module";


@NgModule( {
	imports: [
		BrowserModule,
		routing,
		PanelModule.forRoot(),
	],
	declarations: [
		AppComponent,
		LoginView,
		WorkbenchView,
		ErrorView,
		NotFoundErrorView,
		DashboardView,
		BackgroundVideoComponent,
		VersionsExposerComponent
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useFactory: BASE_URL
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

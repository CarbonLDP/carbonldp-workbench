import { NgModule } from "@angular/core";
import { APP_BASE_HREF } from "@angular/common";
import { BrowserModule, Title } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

// Providers
import { BASE_URL } from "./config";
import { CARBONLDP_PROVIDERS } from "app/providers";
import { CARBONLDP_SERVICES_PROVIDERS } from "app/authentication/services";
import { routing, appRoutingProviders } from "./app.routing";

// Components
import { AppComponent } from "./app.component";
import { LoginView } from "./login/login.view";
import { ErrorView } from "./error-pages/error.view";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";
import { BackgroundVideoComponent } from "./error-pages/background-video.component";

import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";

// Modules
import { SharedModule } from "./shared/shared.module";

// Services


@NgModule( {
	imports: [
		BrowserModule,
		FormsModule,
		routing,
		SharedModule.forRoot(),
	],
	declarations: [
		AppComponent,
		LoginView,
		ErrorView,
		NotFoundErrorView,

		RegisterComponent,
		LoginComponent,

		BackgroundVideoComponent,
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useFactory: BASE_URL
		},
		CARBONLDP_PROVIDERS,
		CARBONLDP_SERVICES_PROVIDERS,
		appRoutingProviders,
		Title,
	],
	bootstrap: [ AppComponent ],
} )
export class AppModule {
}

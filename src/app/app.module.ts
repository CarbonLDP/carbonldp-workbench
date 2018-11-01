import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { APP_BASE_HREF } from "@angular/common";
import { BASE_URL } from "../config";
import { carbonldpFactory } from "./providers";
import { NotFoundErrorView } from "app/error-pages/not-found-error/not-found-error.view";
import { AppCommonModule } from "app/common/app-common.module";
import { CarbonLDP } from "carbonldp";

@NgModule( {
	declarations: [
		AppComponent,
		NotFoundErrorView
	],
	imports: [
		BrowserModule,
		AppRoutingModule,

		// Enable Material UI animations
		BrowserAnimationsModule,

		ServiceWorkerModule.register( "ngsw-worker.js", { enabled: environment.production } ),

		AppCommonModule.forRoot(),
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useFactory: () => {
				return BASE_URL;
			}
		},
		{
			provide: CarbonLDP,
			useFactory: carbonldpFactory
		}
	],
	bootstrap: [ AppComponent ]
} )
export class AppModule {
}

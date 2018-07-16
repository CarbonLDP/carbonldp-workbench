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
import { WorkbenchView } from "./workbench/workbench.view";
import { ErrorView } from "./error-pages/error.view";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";
import { DashboardView } from "./dashboard/dashboard.view";
import { BackgroundVideoComponent } from "./error-pages/background-video.component";
import { VersionsPresenterComponent } from "./versions-presenter/versions-presenter.component";

import { HeaderItemComponent } from "./header/header-item.component";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { SidebarItemsComponent } from "./sidebar/sidebar-items.component";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";

// Modules
import { SharedModule } from "./shared/shared.module";

// Services
import { RouterService } from "./router.service";
import { HeaderService } from "./header/header.service";
import { SidebarService } from "./sidebar/sidebar.service";


@NgModule( {
	imports: [
		BrowserModule,
		FormsModule,
		routing,
		SharedModule.forRoot(),
	],
	declarations: [
		AppComponent,
		WorkbenchView,
		ErrorView,
		NotFoundErrorView,
		DashboardView,

		HeaderItemComponent,
		HeaderComponent,
		SidebarComponent,
		SidebarItemsComponent,
		BreadcrumbsComponent,

		BackgroundVideoComponent,
		VersionsPresenterComponent
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

		RouterService, HeaderService, SidebarService,
	],
	bootstrap: [ AppComponent ],
} )
export class AppModule {
}

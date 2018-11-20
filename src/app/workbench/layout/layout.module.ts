import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
// Components
import { HeaderItemComponent } from "./header/header-item.component";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { SidebarItemsComponent } from "./sidebar/sidebar-items.component";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";
// Modules
import { AppCommonModule } from "app/common/app-common.module";
// Services
import { HeaderService } from "./header/header.service";
import { SidebarService } from "./sidebar/sidebar.service";
import { LogoComponent } from "app/workbench/layout/header/logo/logo.component";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,

		AppCommonModule,
	],
	declarations: [
		BreadcrumbsComponent,
		HeaderItemComponent,
		HeaderComponent,
		LogoComponent,
		SidebarComponent,
		SidebarItemsComponent,
	],
	exports: [
		HeaderItemComponent,
		HeaderComponent,
		SidebarComponent,
		SidebarItemsComponent,
		BreadcrumbsComponent,
	],
	providers: [
		HeaderService,
		SidebarService,
	],
} )
export class LayoutModule {}

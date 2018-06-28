import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";


// Components
import { HeaderItemComponent } from "./header/header-item.component";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { SidebarItemsComponent } from "./sidebar/sidebar-items.component";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";

// Modules
import { SharedModule } from "app/shared/shared.module";

// Services
import { HeaderService } from "./header/header.service";
import { SidebarService } from "./sidebar/sidebar.service";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,

		SharedModule,
	],
	declarations: [
		HeaderItemComponent,
		HeaderComponent,
		SidebarComponent,
		SidebarItemsComponent,
		BreadcrumbsComponent,
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
import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";

// Components
import { WidgetComponent } from "./widgets/widget.component";
import { WidgetsMenu } from "./widgets/widgets-menu.component"
	
// Modules
import { SharedModule } from "app/shared/shared.module";

// Services
import { WidgetsService } from "./widgets/widgets.service";

@NgModule( {
	imports: [
		CommonModule,
		SharedModule,
	],
	declarations: [
		WidgetComponent,
		WidgetsMenu,
	],
	exports: [
		WidgetsMenu,
		WidgetComponent
	],
	providers: [ WidgetsService ],
} )
export class DashboardModule {

	static forChild():ModuleWithProviders {
		return {
			ngModule: DashboardModule,
			providers: [ WidgetsService ]
		};
	}

}
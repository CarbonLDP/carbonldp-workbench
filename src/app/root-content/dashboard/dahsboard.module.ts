import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";

// Components
import { DocumentsWidgetComponent } from "./widgets/documents/documents-widget.component";
import { TriplesWidgetComponent } from "./widgets/triples/triples-widget.component";
import { InstanceWidgetComponent } from "./widgets/instance/instance-widget.component"
import { WidgetsComponent } from "./widgets/widgets.component";
import { WidgetsMenu } from "./widgets/widgets-menu/widgets-menu.component";
import { CustomWidgetsComponent } from "./widgets/customWidgets/custom-widgets.component";
import { CustomCountWidgetComponent } from "./widgets/customWidgets/custom-count-widget/custom-count-widget.component";

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
		DocumentsWidgetComponent,
		InstanceWidgetComponent,
		TriplesWidgetComponent,
		WidgetsComponent,
		WidgetsMenu,
		CustomWidgetsComponent,
		CustomCountWidgetComponent
	],
	exports: [
		WidgetsMenu,
		WidgetsComponent
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
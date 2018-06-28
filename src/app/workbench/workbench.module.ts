import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

import { routing } from "./workbench.routing";

// Components
import { WorkbenchView } from "./workbench.view";
import { DashboardView } from "./dashboard/dashboard.view";
import { EditInstanceComponent } from "./edit-instance/edit-instance.component";
import { EditInstanceView } from "./edit-instance/edit-instance.view";
import { SPARQLClientView } from "./sparql-client/sparql-client.view";
import { ExplorerView } from "./explorer/explorer.view";

// Modules
import { SharedModule } from "app/shared/shared.module";
import { SPARQLClientModule } from "./sparql-client/sparql-client.module";
import { ConfigurationModule } from "./configuration/configuration.module";
import { DocumentExplorerModule } from "./explorer/document-explorer/document-explorer.module";
import { DashboardModule } from "./dashboard/dahsboard.module";
import { LayoutModule } from "./layout/layout.module";

// Services
import { DocumentsResolverService } from "./explorer/document-explorer/documents-resolver.service";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,

		routing,
		SharedModule,
		SPARQLClientModule,
		ConfigurationModule,
		DocumentExplorerModule,
		DashboardModule,
		LayoutModule,
	],
	declarations: [
		WorkbenchView,
		DashboardView,
		SPARQLClientView,
		EditInstanceComponent,
		EditInstanceView,
		ExplorerView,
	],
	exports: [],
	providers: [
		DocumentsResolverService,
	],
} )
export class WorkbenchModule {
}
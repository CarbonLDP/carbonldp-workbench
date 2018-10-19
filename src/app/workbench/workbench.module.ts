import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

import { routing } from "./workbench.routing";
// Components
import { WorkbenchView } from "./workbench.view";
import { DashboardView } from "./dashboard/dashboard.view";
import { SPARQLClientView } from "./sparql-client/sparql-client.view";
import { ExplorerView } from "./explorer/explorer.view";
// Modules
import { AppCommonModule } from "app/common/app-common.module";
import { SPARQLClientModule } from "./sparql-client/sparql-client.module";
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
		AppCommonModule,
		SPARQLClientModule,
		DocumentExplorerModule,
		DashboardModule,
		LayoutModule,
	],
	declarations: [
		WorkbenchView,
		DashboardView,
		SPARQLClientView,
		ExplorerView,
	],
	exports: [],
	providers: [
		DocumentsResolverService,
	],
} )
export class WorkbenchModule {
}
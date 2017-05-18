import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

import { routing } from "./root-content.routing";

// Components
import { RootContentView } from "./root-content.view";
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
	],
	declarations: [
		RootContentView,
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
export class RootContentModule {
}
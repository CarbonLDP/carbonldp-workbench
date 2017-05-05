import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

import { routing } from "./app-content.routing";
import { AppContentResolver } from "./app-content.resolver";
import { AppContentService } from "./app-content.service";

// Components
import { AppContentView } from "./app-content.view";
import { DashboardView } from "./dashboard/dashboard.view";
import { EditAppComponent } from "./edit-app/edit-app.component";
import { EditAppView } from "./edit-app/edit-app.view";
import { SPARQLClientView } from "./sparql-client/sparql-client.view";
import { ExplorerView } from "./explorer/explorer.view";
// Components -> Configuration
import { BackupExporterComponent } from "./configuration/backup/backup-exporter/backup-exporter.component";
import { BackupImporterComponent } from "./configuration/backup/backup-importer/backup-importer.component";
import { BackupsListComponent } from "./configuration/backup/backups-list/backups-list.component";
import { BackupsComponent } from "./configuration/backup/backups.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { ConfigurationView } from "./configuration/configuration.view";

//Directives
import { BackupFileValidator, AtLeastOneValidValidator } from "./configuration/backup/backup-importer/backup-importer-validators";

// Modules
import { SharedModule } from "app/shared/shared.module";
import { SPARQLClientModule } from "./sparql-client/sparql-client.module";
import { DocumentExplorerModule } from "./explorer/document-explorer/document-explorer.module";

// Services
import { DocumentsResolverService } from "./explorer/document-explorer/documents-resolver.service";
import { JobsService } from "./configuration/job/jobs.service";
import { BackupsService } from "./configuration/backup/backups.service";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		routing,
		SharedModule,
		SPARQLClientModule,
		DocumentExplorerModule,
	],
	declarations: [
		AppContentView,
		DashboardView,
		SPARQLClientView,
		EditAppView,
		EditAppComponent,
		ExplorerView,
		BackupExporterComponent,
		BackupImporterComponent,
		BackupsListComponent,
		BackupsComponent,
		ConfigurationComponent,
		ConfigurationView,
		BackupFileValidator,
		AtLeastOneValidValidator
	],
	exports: [],
	providers: [
		AppContentService,
		AppContentResolver,
		DocumentsResolverService,
		JobsService,
		BackupsService,
	],
} )
export class AppContentModule {
}
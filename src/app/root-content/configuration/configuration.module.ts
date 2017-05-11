import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

// Components -> Configuration
import { BackupExporterComponent } from "./backup/backup-exporter/backup-exporter.component";
import { BackupImporterComponent } from "./backup/backup-importer/backup-importer.component";
import { BackupsListComponent } from "./backup/backups-list/backups-list.component";
import { BackupsComponent } from "./backup/backups.component";
import { ConfigurationComponent } from "./configuration.component";
import { ConfigurationView } from "./configuration.view";

//Directives
import { BackupFileValidator, AtLeastOneValidValidator } from "./backup/backup-importer/backup-importer-validators";

// Modules
import { SharedModule } from "app/shared/shared.module";

// Services
import { JobsService } from "./job/jobs.service";
import { BackupsService } from "./backup/backups.service";


@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
	],
	declarations: [
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
	providers: [ JobsService, BackupsService ],
} )
export class ConfigurationModule {
}
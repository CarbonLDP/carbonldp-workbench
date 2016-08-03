import { Provider } from "@angular/core";
import { AppContextService } from "carbon-panel/my-apps/app-context.service";
import { ErrorsAreaService } from "carbon-panel/errors-area/errors-area.service";
import { DocumentsResolverService } from "carbon-panel/my-apps/app-content/explorer/document-explorer/documents-resolver.service";
import { JobsService } from "carbon-panel/my-apps/app-content/configuration/job/jobs.service";
import { BackupsService } from "carbon-panel/my-apps/app-content/configuration/backup/backups.service";
import { SidebarService } from "carbon-panel/sidebar.service";

export const WORKBENCH_PROVIDERS = [
	new Provider( AppContextService, {
		useClass: AppContextService
	} ),
	new Provider( ErrorsAreaService, {
		useClass: ErrorsAreaService
	} ),
	new Provider( DocumentsResolverService, {
		useClass: DocumentsResolverService
	} ),
	new Provider( JobsService, {
		useClass: JobsService
	} ),
	new Provider( BackupsService, {
		useClass: BackupsService
	} ),
	new Provider( SidebarService, {
		useClass: SidebarService
	} )
];
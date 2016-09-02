import { AppContextService } from "carbon-panel/my-apps/app-context.service";
import { ErrorsAreaService } from "carbon-panel/errors-area/errors-area.service";
import { DocumentsResolverService } from "carbon-panel/my-apps/app-content/explorer/document-explorer/documents-resolver.service";
import { JobsService } from "carbon-panel/my-apps/app-content/configuration/job/jobs.service";
import { BackupsService } from "carbon-panel/my-apps/app-content/configuration/backup/backups.service";
import { SidebarService } from "carbon-panel/sidebar.service";

export const WORKBENCH_PROVIDERS = [
	{
		provide: AppContextService,
		useClass: AppContextService
	},
	{
		provide: ErrorsAreaService,
		useClass: ErrorsAreaService
	},
	{
		provide: DocumentsResolverService,
		useClass: DocumentsResolverService
	},
	{
		provide: JobsService,
		useClass: JobsService
	},
	{
		provide: BackupsService,
		useClass: BackupsService
	},
	{
		provide: SidebarService,
		useClass: SidebarService
	}
];
import { AppContextService } from "carbonldp-panel/my-apps/app-context.service";
import { ErrorsAreaService } from "carbonldp-panel/errors-area/errors-area.service";
import { DocumentsResolverService } from "carbonldp-panel/document-explorer/documents-resolver.service";
import { JobsService } from "carbonldp-panel/my-apps/app-content/configuration/job/jobs.service";
import { BackupsService } from "carbonldp-panel/my-apps/app-content/configuration/backup/backups.service";
import { SidebarService } from "carbonldp-panel/sidebar.service";

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
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";

// Guards
import { CarbonLDPProviderResolver } from "app/resolvers";

// Components
import { WorkbenchView } from "./workbench/workbench.view";
import { ErrorView } from "./error-pages/error.view";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";

const appRoutes:Routes = [
	{
		path: "",
		component: WorkbenchView,
		children: [
			{
				path: "",
				loadChildren: "app/root-content/root-content.module#RootContentModule",
			},
		]
	},
	{
		path: "error",
		component: ErrorView,
		data: {
			title: "Error | Workbench"
		}
	},
	{
		path: "**",
		component: NotFoundErrorView,
		data: {
			title: "404 | Workbench",
		}
	},
];


export const appRoutingProviders:any[] = [
	CarbonLDPProviderResolver,
];

export const routing:ModuleWithProviders = RouterModule.forRoot( appRoutes, { preloadingStrategy: PreloadAllModules } );
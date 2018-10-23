import { ModuleWithProviders } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
// Components
import { ErrorView } from "./error-pages/error.view";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";

// Guards

const appRoutes:Routes = [
	{
		path: "",
		children: [
			{
				path: "",
				loadChildren: "app/workbench/workbench.module#WorkbenchModule",
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


export const appRoutingProviders:any[] = [];

export const routing:ModuleWithProviders = RouterModule.forRoot( appRoutes, { preloadingStrategy: PreloadAllModules } );
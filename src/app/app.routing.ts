import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";

// Guards
import { AuthenticatedGuard, NotAuthenticatedGuard } from "angular-carbonldp/guards";
import { CarbonProviderResolver } from "angular-carbonldp/resolvers";

// Components
import { LoginView } from "./login/login.view";
import { WorkbenchView } from "./workbench/workbench.view";
import { ErrorView } from "./error-pages/error.view";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";

const appRoutes:Routes = [
	{
		path: "login",
		component: LoginView,
		// canActivate: [ NotAuthenticatedGuard ],
		data: {
			alias: "login",
			title: "Workbench | Log In",

			// NotAuthenticatedGuard cases
			onReject: [ "/" ],
			onError: [ "/error" ],
		}
	},
	{
		path: "",
		component: WorkbenchView,
		// canActivate: [ AuthenticatedGuard ],
		data: {
			// AuthenticatedGuard cases
			onReject: [ "/login" ],
			onError: [ "/error" ],
			title: "Workbench",
		},
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
	CarbonProviderResolver,
	AuthenticatedGuard,
	NotAuthenticatedGuard,
];

export const routing:ModuleWithProviders = RouterModule.forRoot( appRoutes, { preloadingStrategy: PreloadAllModules } );
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

//Guards
import { AuthenticatedGuard, NotAuthenticatedGuard } from "angular2-carbonldp/guards";
import { ActiveContextResolver } from "angular2-carbonldp/resolvers";

//Components
import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";
import { NotFoundErrorView } from "app/error-pages/not-found-error/not-found-error.view";
import { DashboardView } from "app/dashboard/dashboard.view";


const appRoutes:Routes = [
	{
		path: "login",
		component: LoginView,
		data: {
			alias: "login",
			title: "Workbench | Log In",
		}
	},
	{
		path: "",
		component: WorkbenchView,
		canActivate: [ AuthenticatedGuard ],
		data: {
			alias: "",
			displayName: "Workbench",
			// AuthenticatedGuard cases
			onReject: [ "/login" ],
			onError: [ "/error" ],
			title: "Workbench",
		},
		children: [
			{
				path: "",
				component: DashboardView,
				data: {
					alias: "",
					displayName: "Dashboard",
					title: false,
				},
			},
			{
				path: "my-apps",
				loadChildren: "carbon-panel/my-apps/my-apps.module#MyAppsModule",
			},
		]
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
	ActiveContextResolver,
	AuthenticatedGuard,
	NotAuthenticatedGuard,
];

export const routing:ModuleWithProviders = RouterModule.forRoot( appRoutes );
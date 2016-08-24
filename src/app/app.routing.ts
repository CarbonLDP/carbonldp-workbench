import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthenticatedGuard, NotAuthenticatedGuard } from "angular2-carbonldp/guards";
import { ActiveContextResolver } from "angular2-carbonldp/resolvers";

import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";
import { NotFoundErrorView } from "app/error-pages/not-found-error/not-found-error.view";

import { DashboardView } from "app/dashboard/dashboard.view";


const appRoutes:Routes = [
	{
		path: "login",
		// as: "WorkbenchLogin",
		component: LoginView,
		data: {
			alias: "WorkbenchLogin",
			displayName: "Workbench Log In",
		}
	},
	{
		path: "",
		// as: "Workbench",
		component: WorkbenchView,
		data: {
			alias: "Workbench",
			displayName: "Workbench",
	 	},
	 	children: [
	 		{
				path: "",
				// as: "Dashboard",
				component: DashboardView,
				data: {
					alias: "Dashboard",
					displayName: "Dashboard",
				},
			},
			{   
				path: "my-apps",
				// as: "MyApps",
				data: {
					alias: "MyApps",
					displayName: "My Apps",
				},
				loadChildren: "carbon-panel/my-apps/my-apps.module#MyAppsModule",
			},
	 	]
	 },
	{
		path: "**",
		// as: "NotFoundError"
		component: NotFoundErrorView
	},
];


export const appRoutingProviders:any[] = [
	ActiveContextResolver,
	AuthenticatedGuard,
	NotAuthenticatedGuard,
];

export const routing:ModuleWithProviders = RouterModule.forRoot( appRoutes );
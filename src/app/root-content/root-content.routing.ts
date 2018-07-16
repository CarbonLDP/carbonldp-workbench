import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";


import { RootContentView } from "./root-content.view";
import { DashboardView } from "./dashboard/dashboard.view";
import { EditInstanceView } from "./edit-instance/edit-instance.view";
import { SPARQLClientView } from "./sparql-client/sparql-client.view";
import { ExplorerView } from "./explorer/explorer.view";
import { ConfigurationView } from "./configuration/configuration.view";

export const RootContentRoutes:Routes = [
	{
		path: "",
		component: RootContentView,
		data: {
			alias: "",
			displayName: "Workbench",
			title: "Workbench",
			hide: true,
		},
		children: [
			{
				path: "",
				data: {
					alias: "",
					displayName: "Dashboard",
					hide: false,
				},
				component: DashboardView,
			},
			{
				path: "edit",
				component: EditInstanceView,
				data: {
					alias: "edit",
					displayName: "Edit",
				},
			},
			{
				path: "sparql-client",
				component: SPARQLClientView,
				data: {
					alias: "sparql-client",
					displayName: "SPARQL Client",
					title: "SPARQL Client",
				},
			},
			{
				path: "explore",
				component: ExplorerView,
				data: {
					alias: "explore",
					displayName: "Explorer",
					title: "Explorer",
				},
			},
			{
				path: "configure",
				component: ConfigurationView,
				data: {
					alias: "configure",
					displayName: "Configuration",
					title: "Configuration",
				},
			},
		]
	}
];

export const routing:ModuleWithProviders = RouterModule.forChild( RootContentRoutes );
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthenticatedGuard, NotAuthenticatedGuard } from "angular2-carbonldp/guards";
import { ActiveContextResolver } from "angular2-carbonldp/resolvers";

import { HomeView } from "app/home-new.view";

const appRoutes:Routes = [
	{ path: "", redirectTo: "/home", pathMatch: "full" },
	{
		path: "home",
		component: HomeView,
	},
];


export const appRoutingProviders:any[] = [
	ActiveContextResolver,
	AuthenticatedGuard,
	NotAuthenticatedGuard,
];

export const routing:ModuleWithProviders = RouterModule.forRoot( appRoutes );
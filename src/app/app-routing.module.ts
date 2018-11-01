import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { NotFoundErrorView } from "./error-pages/not-found-error/not-found-error.view";

const routes:Routes = [
	{
		path: "",
		children: [
			{
				path: "",
				loadChildren: "app/workbench/workbench.module#WorkbenchModule"
			}
		]
	},
	{
		path: "**",
		component: NotFoundErrorView,
		data: {
			title: "404 | Workbench"
		}
	}
];

@NgModule( {
	imports: [ RouterModule.forRoot( routes, { preloadingStrategy: PreloadAllModules } ) ],
	exports: [ RouterModule ]
} )
export class AppRoutingModule {
}

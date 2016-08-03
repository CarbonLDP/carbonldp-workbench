import { Component, ViewEncapsulation } from "@angular/core";
import { RouteConfig, ROUTER_DIRECTIVES } from "@angular/router-deprecated";

import { LoginView } from "app/login/login.view";
import { WorkbenchView } from "app/workbench/workbench.view";

import template from "./app.component.html!";
import style from "./app.component.css!text";

@Component( {
	selector: "app",
	template: template,
	styles: [ style ],
	encapsulation: ViewEncapsulation.None,
	directives: [ ROUTER_DIRECTIVES ]
} )
@RouteConfig( [
	{ path: "login", as: "WorkbenchLogin", component: LoginView },
	{
		path: "...",
		as: "Workbench",
		component: WorkbenchView,
		useAsDefault: true,
		data: {
			alias: "Workbench",
			displayName: "Workbench",
		},
	},
] )
export class AppComponent {
}

export default AppComponent;

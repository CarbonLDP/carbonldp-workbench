import {Component, ViewEncapsulation} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {LoginView} from "app/login.view";
import {WorkbenchView} from "app/workbench.view";

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
	{path: "login", name: "WorkbenchLogin", component: LoginView},
	{path: "...", name: "Workbench", component: WorkbenchView, useAsDefault: true},
] )
export class AppComponent {

}

export default AppComponent;

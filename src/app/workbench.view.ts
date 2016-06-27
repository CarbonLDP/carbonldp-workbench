import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {Authenticated} from "angular2-carbonldp/decorators";
import {DashboardView} from "app/dashboard.view";

import template from "./workbench.view.html!";

@Authenticated( {redirectTo: [ "/WorkbenchLogin" ]} )
@Component( {
	selector: "div.ng-view",
	template: `<router-outlet></router-outlet>`,
	directives: [ ROUTER_DIRECTIVES ]
} )
@RouteConfig( [
	{path: "dashboard", name: "Dashboard", component: DashboardView, useAsDefault: true},
] )
export class WorkbenchView {

}

export default WorkbenchView;

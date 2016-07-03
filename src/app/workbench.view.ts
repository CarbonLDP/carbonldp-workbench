import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {Authenticated} from "angular2-carbonldp/decorators";

import {HeaderComponent} from "carbon-panel/header.component";

import {DashboardView} from "app/dashboard.view";

import template from "./workbench.view.html!";
import style from "./workbench.view.css!text";

@Authenticated( {redirectTo: [ "/WorkbenchLogin" ]} )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [ ROUTER_DIRECTIVES, HeaderComponent ]
} )
@RouteConfig( [
	{path: "dashboard", name: "Dashboard", component: DashboardView, useAsDefault: true},
] )
export class WorkbenchView {
	ngOnInit():void {
		console.log( "WorkbenchView > ngOnInit()" );
	}
}

export default WorkbenchView;

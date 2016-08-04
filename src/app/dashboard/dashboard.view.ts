import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouteData, Router } from "@angular/router-deprecated";

import template from "./dashboard.view.html!";

@Component( {
	selector: "div.ng-view",
	template: template,
	directives: []
} )
export class DashboardView {
	private routeData:RouteData;
	private title:Title;
	private router:Router;
	constructor( router:Router, routeData:RouteData, title:Title){
		this.router = router;
		this.routeData =routeData;
		this.title =title;
	}
	routerOnActivate(){
		let rootComponent = this.router.root.currentInstruction.component.routeData.data[ "displayName" ];
		let title:string = rootComponent +" | "+this.routeData.data["displayName"];
		this.title.setTitle(title);
	}
}

export default DashboardView;

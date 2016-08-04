import { Component } from "@angular/core";
import { Router, RouteData } from "@angular/router-deprecated";
import { Title } from "@angular/platform-browser";

import { NotAuthenticated } from "angular2-carbonldp/decorators";

import { LoginComponent } from "carbon-panel/login.component";

import template from "./login.view.html!";
import style from "./login.view.css!text";

@NotAuthenticated( { redirectTo: [ "/Workbench" ] } )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [ LoginComponent ]
} )
export class LoginView {
	private router:Router;
	private routeData:RouteData;
	private title:Title;

	constructor( router:Router, routeData:RouteData, title:Title ) {
		this.router = router;
		this.routeData =routeData;
		this.title =title;
	}

	onLogin():void {
		this.router.navigate( [ "/Workbench/" ] );
	}

	routerOnActivate(){
		let title:string = this.routeData.data["displayName"];
		this.title.setTitle(title);
	}
}

export default LoginView;

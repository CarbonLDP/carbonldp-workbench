import {Component} from "@angular/core";
import {Router} from "@angular/router-deprecated";

import {NotAuthenticated} from "angular2-carbonldp/decorators";

import {LoginComponent} from "carbon-panel/login.component";

import template from "./login.view.html!";
import style from "./login.view.css!text";

@NotAuthenticated( {redirectTo: [ "/Workbench" ]} )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [ LoginComponent ]
} )
export class LoginView {
	private router:Router;

	constructor( router:Router ) {
		this.router = router;
	}

	onLogin():void {
		this.router.navigate( [ "/Workbench/" ] );
	}
}

export default LoginView;

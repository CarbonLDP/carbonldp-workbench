import { Component } from "@angular/core";
import { Router } from "@angular/router-deprecated";

import { NotAuthenticated } from "angular2-carbonldp/decorators";

import { LoginComponent } from "carbon-panel/login.component";
import { RegisterComponent } from "carbon-panel/register.component";

import template from "./login.view.html!";
import style from "./login.view.css!text";

@NotAuthenticated( { redirectTo: [ "/Workbench" ] } )
@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
	directives: [ LoginComponent, RegisterComponent ]
} )
export class LoginView {
	private router:Router;

	private hasAccount:boolean = true;
	private registrationWasSuccessful:boolean = false;

	constructor( router:Router ) {
		this.router = router;
	}

	onLogin():void {
		this.router.navigate( [ "/Workbench/" ] );
	}

	onRegister():void {
		this.hasAccount = true;
		this.registrationWasSuccessful = true;
	}

	activateRegisterForm():void {
		this.hasAccount = false;
	}

	activateLoginForm():void {
		this.hasAccount = true;
	}
}

export default LoginView;

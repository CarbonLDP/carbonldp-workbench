import { Component } from "@angular/core";
import { Router } from "@angular/router";

import template from "./login.view.html!";
import style from "./login.view.css!text";

@Component( {
	selector: "div.ng-view",
	template: template,
	styles: [ style ],
} )
export class LoginView {
	private router:Router;

	private hasAccount:boolean = true;
	private registrationWasSuccessful:boolean = false;

	constructor( router:Router ) {
		this.router = router;
	}

	onLogin():void {
		this.router.navigate( [ "" ] );
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

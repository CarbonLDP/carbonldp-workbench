import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component( {
	selector: "div.ng-view",
	templateUrl: "./login.view.html",
	styleUrls: [ "./login.view.scss" ],
} )
export class LoginView {
	router:Router;

	hasAccount:boolean = true;
	registrationWasSuccessful:boolean = false;

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


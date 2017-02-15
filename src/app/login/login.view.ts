import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component( {
	selector: "div.ng-view",
	templateUrl: "./login.view.html",
	styleUrls: [ "./login.view.scss" ],
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

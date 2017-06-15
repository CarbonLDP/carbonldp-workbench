import { Component, ElementRef, Input, Output, Inject, EventEmitter, OnInit } from "@angular/core";

import { AuthService } from "angular-carbonldp/services";

import { Class as Credentials } from "carbonldp/Auth/Credentials";
import * as HTTP from "carbonldp/HTTP";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-login",
	templateUrl: "./login.component.html",
	styles: [ ":host { display:block; } " ],
} )
export class LoginComponent implements OnInit {
	@Input( "container" ) container:string|JQuery;
	@Output( "onLogin" ) onLogin:EventEmitter<Credentials> = new EventEmitter<Credentials>();

	element:ElementRef;

	$element:JQuery;
	$loginForm:JQuery;

	sending:boolean = false;
	errorMessage:string = "";

	login:{ email:string, password:string, rememberMe:boolean } =
		{
			email: "",
			password: "",
			rememberMe: false
		};

	private authService:AuthService.Class;

	constructor( element:ElementRef, @Inject( AuthService.Token ) authService:AuthService.Class ) {
		this.element = element;
		this.authService = authService;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
		this.$loginForm = this.$element.find( "form.login" );
		this.$loginForm.find( ".ui.checkbox" ).checkbox();
	}

	onSubmit( data:{ email:string, password:string, rememberMe:boolean }, $event:any ):void {
		$event.preventDefault();
		this.sending = true;
		this.errorMessage = "";

		let username:string = data.email;
		let password:string = data.password;
		let rememberMe:boolean = ! ! data.rememberMe;

		this.authService.login( username, password, rememberMe ).then( ( credentials:Credentials ) => {
			this.sending = false;
			this.onLogin.emit( credentials );
		} ).catch( ( error:HTTP.Errors.Error ) => {
			this.sending = false;
			this.setErrorMessage( error );
			this.shakeForm();
		} );
	}

	getDays( firstDate:Date, lastDate:Date ):number {
		// Discard the time and time-zone information
		let utc1:number = Date.UTC( firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() );
		let utc2:number = Date.UTC( lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() );
		let msPerDay:number = 1000 * 60 * 60 * 24;
		return Math.floor( (utc2 - utc1) / msPerDay );
	}

	setErrorMessage( error:HTTP.Errors.Error ):void {
		switch( true ) {
			case error instanceof HTTP.Errors.ForbiddenError:
				this.errorMessage = "Denied Access.";
				break;
			case error instanceof HTTP.Errors.UnauthorizedError:
				this.errorMessage = "Wrong credentials.";
				break;
			case error instanceof HTTP.Errors.BadGatewayError:
				this.errorMessage = "An error occurred while trying to login. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.GatewayTimeoutError:
				this.errorMessage = "An error occurred while trying to login. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.InternalServerErrorError:
				this.errorMessage = "An error occurred while trying to login. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.UnknownError:
				this.errorMessage = "An error occurred while trying to login. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.ServiceUnavailableError:
				this.errorMessage = "Service currently unavailable.";
				break;
			default:
				this.errorMessage = "There was a problem processing the request. Error: " + error.response.status;
				break;
		}
	}

	shakeForm():void {
		let target:JQuery = this.container ? $( this.container ) : this.$element;
		if( ! target ) return;

		target.transition( {
			animation: "shake",
		} );
	}
}


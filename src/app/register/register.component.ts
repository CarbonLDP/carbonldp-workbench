import { Component, ElementRef, Output, Inject, EventEmitter, OnInit } from "@angular/core";

import * as HTTP from "carbonldp/HTTP";

import { AuthService } from "app/angular-carbonldp/services";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-register",
	templateUrl: "./register.component.html",
	styles: [],
} )
export class RegisterComponent implements OnInit {
	@Output( "onRegister" ) onRegister:EventEmitter<any> = new EventEmitter<any>();

	private element:ElementRef;
	private $element:JQuery;
	private authService:AuthService.Class;

	sending:boolean = false;
	errorMessage:string = "";
	register:{ name:string, email:string, password:string, repeatPassword:string } = {
		name: "",
		email: "",
		password: "",
		repeatPassword: ""
	};

	constructor( element:ElementRef, @Inject( AuthService.Token ) authService:AuthService.Class ) {
		this.element = element;
		this.authService = authService;
	}

	ngOnInit():void {
		this.$element = $( this.element.nativeElement );
	}

	onSubmit( form, $event:any ):void {
		$event.preventDefault();

		this.sending = true;
		this.errorMessage = "";

		if( ! form.valid ) {
			this.shakeForm();
			this.sending = false;
			return;
		}

		let name:string = form.controls.name.value;
		let username:string = form.controls.email.value;
		let password:string = form.controls.password.value;

		this.authService.register( name, username, password, true ).then( () => {
			this.sending = false;
			this.onRegister.emit( null );
		} ).catch( ( error:any ) => {
			this.sending = false;
			this.setErrorMessage( error );
		} );
	}

	sanitize( evt:any ):void {
		if( typeof evt.target !== "undefined" ) {
			let slug:string = evt.target.value;
			if( slug ) {
				slug = slug.toLowerCase().replace( / - | -|- /g, "-" ).replace( /[^-\w ]+/g, "" ).replace( / +/g, "-" );
				if( slug.charAt( slug.length - 1 ) !== "/" ) slug += "/";
			}
		}
	}

	shakeForm():void {
		let target:JQuery = this.$element;
		target.transition( {
			animation: "shake",
		} );
	}

	setErrorMessage( error:HTTP.Errors.Error ):void {
		if( typeof error.message !== "undefined" ) this.errorMessage = error.message;
		else switch( true ) {
			case error instanceof HTTP.Errors.ConflictError:
				this.errorMessage = "That email is already in use";
				break;
			case error instanceof HTTP.Errors.ForbiddenError:
				this.errorMessage = "Denied Access";
				break;
			case error instanceof HTTP.Errors.UnauthorizedError:
				this.errorMessage = "Wrong credentials";
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
				this.errorMessage = "Service currently unavailable";
				break;
			default:
				if( "response" in error ) {
					this.errorMessage = "There was a problem processing the request. Error: " + error.response.status;
				} else {
					this.errorMessage = "There was a problem processing the request";
					console.error( error );
				}
				break;
		}
	}
}


import { Component, Input, OnInit } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as HTTP from "carbonldp/HTTP";
import * as URI from "carbonldp/RDF/URI";
import * as PersistedApp from "carbonldp/PersistedApp";

import { AppContextService } from "../../app-context.service";
import * as App from "../app";

import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-edit-app",
	templateUrl: "./edit-app.component.html",
	styleUrls: [  "./edit-app.component.scss"  ],
} )

export class EditAppComponent implements OnInit {

	appContextService:AppContextService;

	submitting:boolean = false;
	displaySuccessMessage:boolean = false;
	errorMessage:Message;

	editAppFormModel:{ name:string, description:string, allDomains:boolean, domain:string } = {
		name: "",
		description: "",
		allDomains: true,
		domain: ""
	};

	allowedDomains:string[] = [];
	// Inputs and Outputs
	@Input() app:App.Class;


	constructor( appContextService:AppContextService ) {
		this.appContextService = appContextService;
	}

	ngOnInit():void {
		let allowAllOrigins:boolean = false;
		if( ! ! this.app.allowsOrigins && this.app.allowsOrigins.length > 0 ) {
			allowAllOrigins = this.app.allowsOrigins[ 0 ][ "id" ] === Carbon.NS.CS.Class.AllOrigins;
			if( ! allowAllOrigins ) this.allowedDomains = <string[]>this.app.allowsOrigins;
		}

		this.editAppFormModel.name = this.app.name;
		this.editAppFormModel.description = this.app.description;
		this.editAppFormModel.allDomains = allowAllOrigins;
	}

	addDomain( domain:any ):void {
		if( domain.valid && ! ! domain.value ) {
			this.allowedDomains.push( domain.value );
		}
	}

	removeDomain( option:string, allDomains:any ):void {
		let idx:number = this.allowedDomains.indexOf( option );
		if( idx >= 0 ) {
			this.allowedDomains.splice( idx, 1 );
		}
	}

	onSubmit( form, $event:Event ):void {
		$event.preventDefault();

		this.submitting = true;
		this.errorMessage = null;
		let name:string = form.value.name;
		let description:string = form.value.description;
		let allowsAllOrigins:any = form.value.allowAllOrigins;
		let allowedDomains = this.allowedDomains;

		if( ! form.valid || (form.valid && (! allowsAllOrigins && allowedDomains.length === 0)) ) {
			this.submitting = false;
			return;
		}


		if( name ) this.app.name = name;
		if( description ) this.app.description = description;
		if( allowsAllOrigins ) {
			this.app.allowsOrigins = [ Carbon.Pointer.Factory.create( Carbon.NS.CS.Class.AllOrigins ) ];
		} else {
			this.app.allowsOrigins = allowedDomains.length > 0 ? allowedDomains : this.app.allowsOrigins;
		}

		this.app.saveAndRefresh().then( ( [ updatedApp, response ]:[ PersistedApp.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ] ) => {
			this.displaySuccessMessage = true;
			let slug:string = URI.Util.getSlug( updatedApp.id );
			return this.appContextService.updateContext( slug );
		} ).catch( ( error:HTTP.Errors.Error ):void => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error )
			this.errorMessage.content = this.getErrorMessage( error );
		} ).then( ():void => {
			this.submitting = false;
		} );
	}

	getErrorMessage( error:HTTP.Errors.Error ):string {
		let tempMessage:string = "";
		switch( true ) {
			case error instanceof HTTP.Errors.BadRequestError:
				tempMessage = "";
				break;
			case error instanceof HTTP.Errors.ConflictError:
				tempMessage = "There's already a resource with that slug. Error:" + error.response.status;
				break;
			case error instanceof HTTP.Errors.ForbiddenError:
				tempMessage = "Forbidden Action.";
				break;
			case error instanceof HTTP.Errors.NotFoundError:
				tempMessage = "Couldn't found the requested URL.";
				break;
			case error instanceof HTTP.Errors.RequestEntityTooLargeError:
				tempMessage = "Request entity too large.";
				break;
			case error instanceof HTTP.Errors.UnauthorizedError:
				tempMessage = "Unauthorized operation.";
				break;
			case error instanceof HTTP.Errors.InternalServerErrorError:
				tempMessage = "An internal error occurred while trying to update the app. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.ServiceUnavailableError:
				tempMessage = "Service currently unavailable.";
				break;
			case error instanceof HTTP.Errors.UnknownError:
				tempMessage = "An error occurred while trying to update the app. Please try again later. Error: " + error.response.status;
				break;
			default:
				tempMessage = "There was a problem processing the request. Error: " + error.response.status;
				break;
		}
		return tempMessage;
	}

	clearMessages( evt:Event ):void {
		this.displaySuccessMessage = false;
		this.errorMessage = null;
	}
}


import { Component, Input, OnInit } from "@angular/core";

import { Errors } from "carbonldp/HTTP";
import { PersistedDocument } from "carbonldp/PersistedDocument";
import { Pointer } from "carbonldp/Pointer";
import { CS } from "carbonldp/Vocabularies";

// TOOD: import InstanceMetadata when available
// import { PlatformMetadata } from "carbonldp/System/InstanceMetadata";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-edit-instance",
	templateUrl: "./edit-instance.component.html",
	styleUrls: [ "./edit-instance.component.scss" ],
} )

export class EditInstanceComponent implements OnInit {

	submitting:boolean = false;
	displaySuccessMessage:boolean = false;
	errorMessage:Message;

	editInstanceFormModel:{ name:string, description:string, allDomains:boolean, domain:string } = {
		name: "",
		description: "",
		allDomains: true,
		domain: ""
	};

	allowedDomains:string[] = [];
	// Inputs and Outputs
	@Input() instance:any;


	constructor() {
	}

	ngOnInit():void {
		let allowAllOrigins:boolean = false;
		if( ! ! this.instance.allowsOrigins && this.instance.allowsOrigins.length > 0 ) {
			allowAllOrigins = this.instance.allowsOrigins[ 0 ][ "id" ] === CS.AllOrigins;
			if( ! allowAllOrigins ) this.allowedDomains = <string[]>this.instance.allowsOrigins;
		}

		this.editInstanceFormModel.name = this.instance.name;
		this.editInstanceFormModel.description = this.instance.description;
		this.editInstanceFormModel.allDomains = allowAllOrigins;
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


		if( name ) this.instance.name = name;
		if( description ) this.instance.description = description;
		if( allowsAllOrigins ) {
			this.instance.allowsOrigins = [ Pointer.create( CS.AllOrigins ) ];
		} else {
			this.instance.allowsOrigins = allowedDomains.length > 0 ? allowedDomains : this.instance.allowsOrigins;
		}

		this.instance.saveAndRefresh().then( ( [ updatedInstance, response ]:[ PersistedDocument, [ Response, Response.Response ] ] ) => {
			this.displaySuccessMessage = true;
			return updatedInstance;
		} ).catch( ( error:HTTP.Errors.Error ):void => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error )
			this.errorMessage.content = this.getErrorMessage( error );
		} ).then( ():void => {
			this.submitting = false;
		} );
	}

	getErrorMessage( error:Errors.HTTPError ):string {
		let tempMessage:string = "";
		switch( true ) {
			case error instanceof Errors.BadRequestError:
				tempMessage = "";
				break;
			case error instanceof Errors.ConflictError:
				tempMessage = "There's already a resource with that slug. Error:" + error.response.status;
				break;
			case error instanceof Errors.ForbiddenError:
				tempMessage = "Forbidden Action.";
				break;
			case error instanceof Errors.NotFoundError:
				tempMessage = "Couldn't found the requested URL.";
				break;
			case error instanceof Errors.RequestEntityTooLargeError:
				tempMessage = "Request entity too large.";
				break;
			case error instanceof Errors.UnauthorizedError:
				tempMessage = "Unauthorized operation.";
				break;
			case error instanceof Errors.InternalServerErrorError:
				tempMessage = "An internal error occurred while trying to update the instance. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof Errors.ServiceUnavailableError:
				tempMessage = "Service currently unavailable.";
				break;
			case error instanceof Errors.UnknownError:
				tempMessage = "An error occurred while trying to update the instance. Please try again later. Error: " + error.response.status;
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


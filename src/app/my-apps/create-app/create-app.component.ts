import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Class as Carbon } from "carbonldp/Carbon";
import * as CarbonApp from "carbonldp/App";
import * as HTTP from "carbonldp/HTTP";
import * as Pointer from "carbonldp/Pointer";
import * as Auth from "carbonldp/Auth";
import * as CS from "carbonldp/NS/CS";
import * as PersistedProtectedDocument from "carbonldp/PersistedProtectedDocument";
import * as PersistedDocument from "carbonldp/PersistedDocument";

import { AppContextService } from "./../app-context.service";
import { Message, Types } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";


import "semantic-ui/semantic";

@Component( {
	selector: "cw-create-app",
	templateUrl: "./create-app.component.html",
	styles: [ ":host { display: block; }" ],
} )
export class CreateAppComponent implements OnInit {
	private carbon:Carbon;
	private router:Router;

	private appContextService:AppContextService;
	private messagesAreaService:MessagesAreaService;

	private _name:string = "";
	private _slug:string = "";
	private persistedSlug:string = "";
	private persistedName:string = "";
	private slugInput;

	public submitting:boolean = false;
	public displaySuccessMessage:boolean = false;
	public displayWarningMessage:boolean = false;
	public errorMessage:Message;
	public createAppFormModel:{ name:string, slug:string, description:string } = {
		name: "",
		slug: "",
		description: ""
	};

	constructor( carbon:Carbon, appContextService:AppContextService, router:Router, messagesAreaService:MessagesAreaService ) {
		this.carbon = carbon;
		this.appContextService = appContextService;
		this.messagesAreaService = messagesAreaService;
		this.router = router;
	}

	ngOnInit():void {
		this.slugInput = $( "form > :input[name='slug']" );
	}


	public slugLostControl( evt:any ):void {
		if( typeof evt.target === "undefined" ) return;
		if( ! evt.target.value.match( /^[a-z0-9]+(?:-[a-z0-9]*)*(?:\/*)$/ ) )
			this.createAppFormModel.slug = this.getSanitizedSlug( evt.target.value );
		if( ! this.createAppFormModel.slug.endsWith( "/" ) && this.createAppFormModel.slug.trim() !== "" ) this.createAppFormModel.slug += "/";
	}

	public getSanitizedSlug( slug:string ):string {
		if( typeof slug === "undefined" ) return slug;
		slug = slug.toLowerCase().replace( / - | -|- /g, "-" ).replace( /[^-\w ]+/g, "" ).replace( / +/g, "-" );
		return slug;
	}

	public onSubmit( form:any, $event:any ):void {
		$event.preventDefault();

		this.submitting = true;
		this.errorMessage = null;
		this.displaySuccessMessage = false;
		this.displayWarningMessage = false;

		if( ! form.valid ) {
			this.submitting = false;
			return;
		}

		let name:string = form.value.name;
		let slug:string = form.value.slug;
		let description:string = form.value.description;

		let appDocument:CarbonApp.Class = CarbonApp.Factory.create( name );
		appDocument.description = description;
		appDocument.allowsOrigins = [ Carbon.Pointer.Factory.create( Carbon.NS.CS.Class.AllOrigins ) ];
		this.createApp( slug, appDocument );
	}

	private createApp( slug:string, appDocument:CarbonApp.Class ):Promise<Auth.PersistedACL.Class | void> {
		return this.carbon.apps.create( appDocument, slug ).then( ( [ appPointer, appCreationResponse ]:[ Pointer.Class, HTTP.Response.Class ] ) => {
			this.persistedSlug = this._slug;
			this.persistedName = this._name;
			return this.carbon.apps.getContext( appPointer );
		} ).then( ( appContext:CarbonApp.Context ) => {
			this.persistedSlug = this.appContextService.getSlug( appContext );
			this.persistedName = appContext.app.name;
			let persistedAppDocument:PersistedProtectedDocument.Class = (<PersistedProtectedDocument.Class>(<PersistedDocument.Class>appContext.app));
			return persistedAppDocument.getACL();
		} ).then( ( [ acl, response ]:[ Auth.PersistedACL.Class, HTTP.Response.Class ] ) => {
			return this.grantAccess( acl );
		} ).catch( ( error:HTTP.Errors.Error ) => {
			console.error( error );
			if( error.response ) {
				this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
				this.errorMessage.content = this.getErrorMessage( error );
			} else {
				this.errorMessage = <Message>{
					title: error.name,
					type: Types.ERROR,
					content: JSON.stringify( error )
				};
			}
		} ).then( () => {
			this.submitting = false;
		} );
	}

	private grantAccess( acl:Auth.PersistedACL.Class ):Promise<Auth.PersistedACL.Class> {
		let subject:string = this.carbon.resolve( "roles/anonymous/" ),
			subjectClass:string = CS.namespace + "PlatformRole",
			permissions:string[] = [ CS.namespace + "Read" ];
		acl.grant( subject, subjectClass, permissions );
		return acl.saveAndRefresh().then( () => {
			this.displaySuccessMessage = true;
			let successMessage:Message = {
				title: "App Created",
				content: `The app ${this.persistedName} was created successfully.`,
				type: Types.SUCCESS,
				duration: 3000,
			};
			this.messagesAreaService.addMessage( successMessage );
			this.router.navigate( [ "my-apps/", this.persistedSlug ] );
		} ).catch( ( error:HTTP.Errors.Error ) => {
			this.displayWarningMessage = true;
		} ).then( () => {
			return acl;
		} );
	}

	private getHTTPErrorMessage( error:HTTP.Errors.Error, content:string ):Message {
		return {
			title: error.name,
			content: content + (! ! error.message ? (" Reason: " + error.message) : ""),
			endpoint: (<any>error.response.request).responseURL,
			statusCode: "" + (<XMLHttpRequest>error.response.request).status + " - RequestID: " + error.requestID,
			statusMessage: (<XMLHttpRequest>error.response.request).statusText
		};
	}

	private getErrorMessage( error:HTTP.Errors.Error ):string {
		let friendlyMessage:string = "";
		switch( true ) {
			case error instanceof HTTP.Errors.BadRequestError:
				friendlyMessage = "";
				break;
			case error instanceof HTTP.Errors.ConflictError:
				friendlyMessage = "There's already a resource with that slug. Error:" + error.response.status;
				break;
			case error instanceof HTTP.Errors.ForbiddenError:
				friendlyMessage = "Forbidden Action.";
				break;
			case error instanceof HTTP.Errors.NotFoundError:
				friendlyMessage = "Couldn't found the requested URL.";
				break;
			case error instanceof HTTP.Errors.RequestEntityTooLargeError:
				friendlyMessage = "Request entity too large.";
				break;
			case error instanceof HTTP.Errors.UnauthorizedError:
				friendlyMessage = "Unauthorized operation.";
				break;
			case error instanceof HTTP.Errors.InternalServerErrorError:
				friendlyMessage = "An error occurred while trying to create the app. Please try again later. Error: " + error.response.status;
				break;
			case error instanceof HTTP.Errors.ServiceUnavailableError:
				friendlyMessage = "Service currently unavailable.";
				break;
			case error instanceof HTTP.Errors.UnknownError:
				friendlyMessage = "An error occurred while trying to create the app. Please try again later. Error: " + error.response.status;
				break;
			default:
				friendlyMessage = "There was a problem processing the request. Error: " + error.response.status;
				break;
		}
		return friendlyMessage;
	}

	private clearMessages( evt:Event ):void {
		this.displaySuccessMessage = false;
		this.displayWarningMessage = false;
		this.errorMessage = null;
	}
}


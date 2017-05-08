import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import * as App from "carbonldp/App";
import * as PersistedRole from "carbonldp/App/PersistedRole";
import * as HTTP from "carbonldp/HTTP";

import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { RolesService } from "../roles.service";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-role-deleter",
	templateUrl: "./role-deleter.component.html",
	styleUrls: [ "./role-deleter.component.scss" ],
} )

export class RoleDeleterComponent implements AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private rolesService:RolesService;

	private $deleteRoleModal:JQuery;
	public errorMessages:Message[] = [];
	public deletingRole:boolean = false;

	@Input() appContext:App.Context;
	@Input() role:string;
	@Output() onSuccess:EventEmitter<string> = new EventEmitter<string>();
	@Output() onError:EventEmitter<any> = new EventEmitter<any>();


	constructor( element:ElementRef, rolesService:RolesService ) {
		this.element = element;
		this.rolesService = rolesService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$deleteRoleModal = this.$element.find( ".delete.role.modal" ).modal( {
			closable: false,
			blurring: true,
			onApprove: ():boolean => { return false; },
		} );
	}

	public onSubmitDeleteRole():void {
		this.deletingRole = true;
		this.rolesService.getDescendants( this.appContext, this.role ).then( ( rolesToDelete:PersistedRole.Class[] ) => {
			return rolesToDelete;
		} ).then(
			( rolesToDelete:PersistedRole.Class[] ) => {
				let promises:Promise<any>[] = [];
				rolesToDelete.forEach( ( role:PersistedRole.Class ) => {
					promises.push( this.deleteRole( role.id ) )
				} );
				return Promise.all( promises );
			},
			( error:HTTP.Errors.Error ) => {
				let retrievalError:Message = ErrorMessageGenerator.getErrorMessage( error );
				retrievalError.title = retrievalError.title + " - An error occurred while trying to delete the descendants of the role.";
				this.errorMessages.push( retrievalError );
				return Promise.reject( null );
			}
		).then( () => {
			this.onSuccess.emit( this.role );
			this.hide();
		} ).catch( ( error:HTTP.Errors.Error ) => {
			this.onError.emit( error );
		} ).then( () => {
			this.deletingRole = false;
		} );
	}

	private deleteRole( roleID:string ):Promise<HTTP.Response.Class> {
		return this.rolesService.delete( this.appContext, roleID ).catch( ( error:HTTP.Errors.Error ) => {
			this.errorMessages.push( ErrorMessageGenerator.getErrorMessage( error ) );
			throw error;
		} );
	}

	public clearErrorMessage():void {
		this.errorMessages = [];
	}

	public removeErrorMessage( index:number ):void {
		this.errorMessages.splice( index, 1 );
	}

	public show():void {
		this.$deleteRoleModal.modal( "show" );
	}

	public hide():void {
		this.hideDeleteRoleForm();
	}

	public hideDeleteRoleForm():void {
		this.$deleteRoleModal.modal( "hide" );
		this.clearErrorMessage();
	}

	public toggle():void {
		this.$deleteRoleModal.modal( "toggle" );
	}

}

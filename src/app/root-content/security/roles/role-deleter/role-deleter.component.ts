import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import { Response, Errors } from "carbonldp/HTTP";

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
		this.rolesService.getDescendants( this.role ).then( ( rolesToDelete:PersistedRole.Class[] ) => {
			return rolesToDelete;
		} ).then(
			( rolesToDelete:PersistedRole.Class[] ) => {
				let promises:Promise<any>[] = [];
				rolesToDelete.forEach( ( role:PersistedRole.Class ) => {
					promises.push( this.deleteRole( role.id ) )
				} );
				return Promise.all( promises );
			},
			( error:Errors.HTTPError ) => {
				let retrievalError:Message = ErrorMessageGenerator.getErrorMessage( error );
				retrievalError.title = retrievalError.title + " - An error occurred while trying to delete the descendants of the role.";
				this.errorMessages.push( retrievalError );
				return Promise.reject( null );
			}
		).then( () => {
			this.onSuccess.emit( this.role );
			this.hide();
		} ).catch( ( error:Errors.HTTPError ) => {
			this.onError.emit( error );
		} ).then( () => {
			this.deletingRole = false;
		} );
	}

	private deleteRole( roleID:string ):Promise<void> {
		return this.rolesService.delete( roleID ).catch( ( error:Errors.HTTPError ) => {
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

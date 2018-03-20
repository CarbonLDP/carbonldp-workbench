import { Component, Input, Output, ElementRef, SimpleChange, EventEmitter } from "@angular/core"

import * as Role from "carbonldp/Auth/Role";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import * as PersistedUser from "carbonldp/Auth/PersistedUser";
import * as HTTP from "carbonldp/HTTP";
import { CS } from "carbonldp/Vocabularies";
import * as Pointer from "carbonldp/Pointer";

import { RolesService } from "./../roles.service";
import { DocumentExplorerLibrary } from "app/root-content/explorer/document-explorer/document-explorer-library";
import { Message, Types } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";


@Component( {
	selector: "cw-role-details",
	templateUrl: "./role-details.component.html",
	styleUrls: [ "./role-details.component.scss" ],
} )

export class RoleDetailsComponent {

	private element:ElementRef;
	private $element:JQuery;
	private rolesService:RolesService;
	private messagesAreaService:MessagesAreaService;
	private roleUsers:PersistedUser.Class[] = [];
	private parentRole:PersistedRole.Class;

	public Modes:typeof Modes = Modes;
	public roleFormModel:RoleFormModel = {
		slug: "",
		name: "",
		description: "",
		parentRole: "",
		users: [],
	};
	public activeTab:string = "details";
	public errorMessage:Message;
	public displaySuccessMessage:boolean = false;
	public mustAddParent:boolean = false;


	@Input() embedded:boolean = true;
	@Input() mode:string = Modes.READ;
	@Input() role:PersistedRole.Class = <any>Role.Factory.create( "New Role" );
	@Input() selectedRole:string | PersistedRole.Class;

	@Output() onClose:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSuccess:EventEmitter<string> = new EventEmitter<string>();
	@Output() onError:EventEmitter<boolean> = new EventEmitter<boolean>();


	constructor( element:ElementRef, rolesService:RolesService, messagesAreaService:MessagesAreaService ) {
		this.element = element;
		this.$element = $( this.element.nativeElement );
		this.rolesService = rolesService;
		this.messagesAreaService = messagesAreaService;
	}

	ngAfterViewInit():void { }

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {
		if( changes[ "role" ] && ! ! changes[ "role" ].currentValue && changes[ "role" ].currentValue !== changes[ "role" ].previousValue ) {
			this.changeRole( this.role );
		}
	}

	private changeRole( role:PersistedRole.Class ):void {
		this.mode = Modes.READ;
		this.displaySuccessMessage = false;
		this.errorMessage = null;
		this.roleFormModel.slug = this.getSanitizedSlug( role.id );
		this.roleFormModel.name = role.name;
		this.roleFormModel.description = role[ CS.description ];
		this.roleFormModel.parentRole = ! ! role.parentRole ? role.parentRole.id : null;
		this.mustAddParent = (! this.role.id.endsWith( "roles/admin/" ) && ! this.role.parentRole);
		this.getUsers( this.role ).then( ( users ) => {
			this.roleUsers = [];
			this.roleUsers = users;
			this.roleFormModel.users = [ ...users ];
		} );
		if( ! ! this.role.parentRole ) {
			this.getRole( this.role.parentRole.id ).then( ( parentRole:PersistedRole.Class ) => {
				this.parentRole = parentRole;
			} );
		}
	}

	private changeMode( mode:string ):void {
		this.mode = mode;
	}

	public onSubmit( data:RoleFormModel, $event:any ):void {
		$event.preventDefault();
		switch( this.mode ) {
			case Modes.EDIT:
				this.editRole( this.role, data );
				break;
			case Modes.CREATE:
				this.createRole( this.role, data );
				break;
		}
	}

	private editRole( role:PersistedRole.Class, roleData:RoleFormModel ):void {
		role.name = roleData.name;
		role[ CS.description ] = roleData.description;
		this.rolesService.saveAndRefresh( role ).then( ( [ updatedRole, [ saveResponse, refreshResponse ] ]:[ PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ] ) => {
			return this.editRoleUsers( role, roleData.users );
		} ).then( () => {
			if( role.id.endsWith( "roles/admin/" ) )
				return new Promise( ( resolve, reject ) => { resolve( role )} );
			else if( ! role.parentRole )
				return this.parentRole.addMember( role );
			else
				return new Promise( ( resolve, reject ) => { resolve( this.parentRole )} );
		} ).then( () => {
			return role.refresh();
		} ).then( () => {
			this.onSuccess.emit( this.role.id );
			this.cancelForm();
			this.displaySuccessMessage = true;
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) this.errorMessage.title = error.name;
			this.onError.emit( true );
		} );
	}

	private createRole( role:PersistedRole.Class, roleData:RoleFormModel ):void {
		role.name = roleData.name;
		role[ CS.description ] = roleData.description;
		this.rolesService.create( this.selectedRole, this.role, roleData.slug ).then( ( persistedRole:PersistedRole.Class ) => {
			return this.editRoleUsers( persistedRole, roleData.users );
		} ).then( ( persistedRole:PersistedRole.Class ) => {
			this.onSuccess.emit( this.role.id );
			this.cancelForm();
			let successMessage:Message = {
				title: "The role was created correctly.",
				content: "The role was create correctly.",
				type: Types.SUCCESS,
				duration: 4000,
			};
			this.messagesAreaService.addMessage( successMessage );
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) this.errorMessage.title = error.name;
			this.onError.emit( true );
		} );
	}

	private getUsers( role:PersistedRole.Class ):Promise<PersistedUser.Class[]> {
		let promises:Promise<any>[] = [],
			users:PersistedUser.Class[] = [];
		if( typeof role.users === "undefined" ) return Promise.resolve( users );

		(<any>role.users).forEach( ( userPointer:Pointer.Class ) => {
			promises.push( userPointer.resolve() );
		} );
		return Promise.all( promises ).then( ( resolvedUsers:[ PersistedUser.Class, HTTP.Response.Class ][] ) => {
			resolvedUsers.forEach( ( [ resolvedUser, response ]:[ PersistedUser.Class, HTTP.Response.Class ] ) => {
				users.push( resolvedUser );
			} );
			return users;
		} );
	}

	private getRole( roleID:string ):Promise<PersistedRole.Class> {
		return this.rolesService.get( roleID );
	}

	private editRoleUsers( role:PersistedRole.Class, selectedUsers:PersistedUser.Class[] ):Promise<any> {
		let promises:Promise<any>[] = [],
			removedUsers:PersistedUser.Class[] = this.getRemovedUsers( selectedUsers );

		selectedUsers.forEach( ( user:PersistedUser.Class ) => {
			promises.push( this.registerUserToRole( user.id, role.id ) )
		} );
		removedUsers.forEach( ( user:PersistedUser.Class ) => {
			promises.push( this.removeUserFromRole( user.id, role.id ) )
		} );

		return Promise.all( promises ).catch( ( error ) => {
			let generatedMessage:Message = ErrorMessageGenerator.getErrorMessage( error ),
				finalError:Error = new Error( "The role details were saved but an error occurred while trying to persist the users: " + generatedMessage.content );
			finalError.name = "User Saved";
			throw finalError;
		} );
	}

	private getRemovedUsers( selectedUsers:PersistedUser.Class[] ):PersistedUser.Class[] {
		return this.roleUsers.filter( ( roleUser:PersistedUser.Class ) => {
			return ! selectedUsers.some( ( selectedUser:PersistedUser.Class ) => selectedUser.id === roleUser.id );
		} ).map( ( removedUser:PersistedUser.Class ) => {
			return removedUser
		} );
	}

	private registerUserToRole( userID:string, roleID:string ):Promise<HTTP.Response.Class> {
		return this.rolesService.registerUser( userID, roleID );
	}

	private removeUserFromRole( userID:string, roleID:string ):Promise<HTTP.Response.Class> {
		return this.rolesService.removeUser( userID, roleID );
	}

	public getSanitizedSlug( slug:string ):string {
		return DocumentExplorerLibrary.getSanitizedSlug( slug );
	}

	private slugLostFocus( evt:any ):void {
		evt.target.value = DocumentExplorerLibrary.getAppendedSlashSlug( evt.target.value );
	}

	private changeUsers( selectedUsers:PersistedUser.Class[] ):void {
		this.roleFormModel.users = selectedUsers;
	}

	private changeParentRole( parentRoles:PersistedRole.Class[] ):void {
		let parentRole:PersistedRole.Class = parentRoles.length > 0 ? parentRoles[ 0 ] : null;
		this.roleFormModel.parentRole = ! ! parentRole ? parentRole.id : null;
		this.parentRole = parentRole;
	}

	private cancelForm():void {
		if( this.mode === Modes.CREATE ) {
			this.close();
		} else {
			this.mode = Modes.READ;
		}
		this.changeRole( this.role );
	}

	private close():void {
		this.onClose.emit( true );
	}

	private closeError():void {
		this.errorMessage = null;
	}
}

export class Modes {
	static READ:string = "READ";
	static EDIT:string = "EDIT";
	static CREATE:string = "CREATE";
}

export interface RoleFormModel {
	slug:string;
	name:string;
	description?:string;
	parentRole?:string;
	users:PersistedUser.Class[];
}

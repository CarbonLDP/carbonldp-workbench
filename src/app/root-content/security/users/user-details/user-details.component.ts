import { ElementRef, Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from "@angular/core";

import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import { User, CredentialsSet, UsernameAndPasswordCredentials, LDAPCredentials } from "carbonldp/Auth";

import { UsersService } from "../users.service";
import { RolesService } from "../../roles/roles.service";
import { DocumentExplorerLibrary } from "app/root-content/explorer/document-explorer/document-explorer-library";
import { Message, Types } from "app/shared/messages-area/message.component";
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { CredentialsService } from "app/root-content/security/credentials/credentials.service";
import { BasicCredentialsFormModel } from "app/root-content/security/credentials/basic-credentials.component";

@Component( {
	selector: "cw-user-details",
	templateUrl: "./user-details.component.html",
	styleUrls: [ "./user-details.component.scss" ],
} )

export class UserDetailsComponent implements OnChanges, AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private messagesAreaService:MessagesAreaService;
	private usersService:UsersService;
	private rolesService:RolesService;
	private credentialsService:CredentialsService;

	private timer:number;
	private userRoles:PersistedRole.Class[] = [];
	private availableRoles:string[] = [];
	private credentials:UsernameAndPasswordCredentials | LDAPCredentials;
	public errorMessage:Message;
	public displaySuccessMessage:boolean = false;

	public Modes:typeof Modes = Modes;
	public userFormModel:UserFormModel = {
		slug: "",
		roles: [],
		basicCredentialsFormModel: {
			username: "",
			password: "",
			repeatPassword: "",
		}
	};

	@Input() mode:string = Modes.EDIT;
	@Input() user:User;
	@Input() canClose:boolean = true;

	@Output() onClose:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSuccess:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onError:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( element:ElementRef, usersService:UsersService, rolesService:RolesService, credentialsService:CredentialsService, messagesAreaService:MessagesAreaService ) {
		this.element = element;
		this.$element = $( element.nativeElement );
		this.messagesAreaService = messagesAreaService;
		this.usersService = usersService;
		this.rolesService = rolesService;
		this.credentialsService = credentialsService;
	}

	ngAfterViewInit():void {
		// this.getRoles( this.user ).then( ( roles:PersistedRole.Class[] ) => {
		// 	roles.forEach( ( role:PersistedRole.Class ) => {
		// 		this.availableRoles.push( role.id );
		// 	} );
		// } );
		this.initializeCredentialsTabs();
	}

	ngOnChanges( changes:SimpleChanges ):void {
		if( ! changes.user ) return;
		// if( ! changes.user.currentValue && ! changes.user.previousValue ) return;
		if( changes.user.currentValue !== changes.user.previousValue ) {
			// if( this.mode === Modes.CREATE && ! this.user ) {
			// 	this.user = <User & User>User.create( "New User Name", "new-user@mail.com", "password" );
			// }
			this.changeUser( this.user );
		}
	}

	private initializeCredentialsTabs():void {
		this.$element.find( ".credentials-types .tabular.menu .item" ).tab();
	}

	private changeUser( newUser:User ):void {
		this.user = newUser;
		if( this.mode === Modes.CREATE ) {
			this.updateFormModel( "new-user@mail.com", "password", [] );
		} else {
			this.getCredentialsSet( this.user.id ).then( ( credentialSet:CredentialsSet ) => {

				if( ! credentialSet ) return;
				this.credentials = <any>credentialSet.credentials;

				this.updateFormModel(
					(<UsernameAndPasswordCredentials>this.credentials).username,
					(<UsernameAndPasswordCredentials>this.credentials).password,
					[]
				);
			} );
		}
		// this.getRoles( this.user ).then( ( roles:PersistedRole.Class[] ) => {
		// 	roles.forEach( ( role:PersistedRole.Class ) => {
		// 		this.userFormModel.roles.push( role.id );
		// 	} );
		// 	this.userRoles = roles;
		// } );
	}

	private updateFormModel( username:string, password:string, roles:Array<any> ):void {
		this.userFormModel.roles = roles;
		this.userFormModel.basicCredentialsFormModel = {
			username: username,
			password: password,
			repeatPassword: ""
		}
	}

	private getCredentialsSet( userURI:string ):Promise<CredentialsSet> {
		return this.credentialsService.getUserCredentialsSet( userURI );
	}

	private getRoles():Promise<PersistedRole.Class[]>;
	private getRoles( user?:User ):Promise<PersistedRole.Class[]>;
	private getRoles( user?:any ):Promise<PersistedRole.Class[]> {
		if( ! user ) return this.rolesService.getAll();
		return this.rolesService.getAll().then( ( roles:PersistedRole.Class[] ) => {
			return roles.filter( ( role:any ) => {
				return ! role.users ? false : role.users.some( ( listedUser:User ) => {return listedUser.id === user.id } );
			} );
		} );
	}

	private changeMode( mode:string ) {
		this.mode = mode;
	}

	private changeRoles( selectedRoles:PersistedRole.Class[] ):void {
		this.userFormModel.roles = [];
		selectedRoles.forEach( ( selectedRole:PersistedRole.Class ) => {
			this.userFormModel.roles.push( selectedRole.id );
		} );
	}

	private cancelForm():void {
		this.changeUser( this.user );
		if( this.mode === Modes.CREATE ) {
			this.close();
		} else {
			this.mode = Modes.READ;
		}
	}

	public onSubmit( data:UserFormModel, $event:any ):void {
		$event.preventDefault();
		switch( this.mode ) {
			case Modes.EDIT:
				this.editUser( this.user, this.credentials, data );
				break;
			case Modes.CREATE:
				this.createUser( data );
				break;
		}
	}

	private editUser( user:User, credentials:UsernameAndPasswordCredentials | LDAPCredentials, userFormData:UserFormModel ):void {
		credentials = credentials as UsernameAndPasswordCredentials;

		let changedCredentials:BasicCredentialsFormModel = userFormData.basicCredentialsFormModel,
			usernameHasChanged:boolean = credentials.username !== changedCredentials.username,
			passwordHasChanged:boolean = ! ! changedCredentials.password && changedCredentials.password.trim().length > 0;

		if( usernameHasChanged || passwordHasChanged ) {
			user.credentials = UsernameAndPasswordCredentials.create( {
				username: usernameHasChanged ? changedCredentials.username : null,
				password: passwordHasChanged ? changedCredentials.password : null
			} );
		}

		this.usersService.saveAndRefreshUser( user ).then( ( updatedUser:User ) => {
			// TODO: set user roles
			this.displaySuccessMessage = true;
			this.onSuccess.emit( true );
			this.changeUser( updatedUser );
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) {
				this.errorMessage.title = error.name;
			}
			this.onError.emit( true );
		} );
	}

	private createUser( userFormData:UserFormModel ):void {

		let credential:UsernameAndPasswordCredentials = this.createCredential( userFormData );

		this.usersService.createUser( credential, userFormData.slug ).then( ( createdUser:User ) => {
			this.user = createdUser;
			this.credentials = createdUser.credentials;
			// TODO: Add roles after persisting the user
			let successMessage:Message = {
				title: "User Created",
				content: "The user was created successfully.",
				type: Types.SUCCESS,
				duration: 4000,
			};
			this.messagesAreaService.addMessage( successMessage );
			this.onSuccess.emit( true );
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) this.errorMessage.title = error.name;
			this.onError.emit( true );
		} );
	}

	private createCredential( userFormData:UserFormModel ):UsernameAndPasswordCredentials {

		// TODO: Add condition to identify other credential types of the FormModel and return that type of credential
		return UsernameAndPasswordCredentials.create( {
			username: userFormData.basicCredentialsFormModel.username,
			password: userFormData.basicCredentialsFormModel.password
		} );
	}

	private emitOnSuccessAfter( seconds:number ):void {
		this.timer = seconds;
		let countDown:any = setInterval( ():boolean => {
			this.timer --;
			if( this.timer === 0 ) {
				this.onSuccess.emit( true );
				this.timer = null;
				clearInterval( countDown );
				return false;
			}
		}, 1000 );
	}

	public getSanitizedSlug( slug:string ):string {
		return DocumentExplorerLibrary.getSanitizedSlug( slug );
	}

	private slugLostFocus( evt:any ):void {
		evt.target.value = DocumentExplorerLibrary.getAppendedSlashSlug( evt.target.value );
	}

	private editUserRoles( user:User, selectedRoles:string[] ):Promise<any> {
		let removedRoles:string[] = this.getRemovedRoles( selectedRoles ),
			promises:Promise<any>[] = [];

		selectedRoles.forEach( ( roleID:string, idx:number, roles:string[] ) => {
			promises.push( this.registerUserToRole( user.id, roleID ) )
		} );
		removedRoles.forEach( ( roleID:string, idx:number, roles:string[] ) => {
			promises.push( this.removeUserFromRole( user.id, roleID ) )
		} );

		return Promise.all( promises ).catch( ( error ) => {
			let generatedMessage:Message = ErrorMessageGenerator.getErrorMessage( error ),
				finalError:Error = new Error( "The user was saved but an error occurred while trying to persist its roles: " + generatedMessage.content );
			finalError.name = "User Saved";
			throw finalError;
		} );
	}

	private getRemovedRoles( selectedRoles:string[] ):string[] {
		return this.userRoles.filter( ( userRole:PersistedRole.Class ) => {
			return ! selectedRoles.some( ( selectedRole:string ) => {
				return selectedRole === userRole.id;
			} );
		} ).map( ( removedRole:PersistedRole.Class ) => {
			return removedRole.id
		} );
	}

	private registerUserToRole( userID:string, roleID:string ):Promise<void> {
		return this.rolesService.registerUser( userID, roleID );
	}

	private removeUserFromRole( userID:string, roleID:string ):Promise<void> {
		return this.rolesService.removeUser( userID, roleID );
	}

	private close():void {
		this.onClose.emit( true );
	}

	private closeError():void {
		this.errorMessage = null;
	}

	private closeSuccessMessage( event:Event, messageDiv:HTMLElement ):void {
		$( messageDiv ).transition( {
			animation: "fade",
			onComplete: () => { this.displaySuccessMessage = false; }
		} );
	}
}

export class Modes {
	static READ:string = "READ";
	static EDIT:string = "EDIT";
	static CREATE:string = "CREATE";
}

export interface UserFormModel {
	slug:string;
	roles:string[];
	basicCredentialsFormModel:BasicCredentialsFormModel;
}

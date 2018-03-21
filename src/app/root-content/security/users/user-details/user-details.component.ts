import { ElementRef, Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from "@angular/core";

import * as User from "carbonldp/Auth/User";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import * as PersistedUser from "carbonldp/Auth/PersistedUser";
import * as Credentials from "carbonldp/Auth/Credentials";
import * as PersistedCredentials from "carbonldp/Auth/PersistedCredentials";
import { Response } from "carbonldp/HTTP";

import { UsersService } from "../users.service";
import { RolesService } from "../../roles/roles.service";
import { DocumentExplorerLibrary } from "app/root-content/explorer/document-explorer/document-explorer-library";
import { Message, Types } from "app/shared/messages-area/message.component";
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

@Component( {
	selector: "cw-user-details",
	templateUrl: "./user-details.component.html",
	styleUrls: [ "./user-details.component.scss" ],
} )

export class UserDetailsComponent implements OnChanges, AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private messagesAreaService:MessagesAreaService;

	private timer:number;
	private userRoles:PersistedRole.Class[] = [];
	private availableRoles:string[] = [];
	public errorMessage:Message;
	public displaySuccessMessage:boolean = false;

	private usersService:UsersService;
	private rolesService:RolesService;

	public Modes:typeof Modes = Modes;
	public userFormModel:UserFormModel = {
		slug: "",
		name: "",
		email: "",
		roles: [],
		password: "",
		repeatPassword: "",
		enabled: false,
	};

	@Input() mode:string = Modes.READ;
	@Input() user:PersistedUser.Class;
	@Input() canClose:boolean = true;

	@Output() onClose:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSuccess:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onError:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( element:ElementRef, usersService:UsersService, rolesService:RolesService, messagesAreaService:MessagesAreaService ) {
		this.element = element;
		this.$element = $( element.nativeElement );
		this.usersService = usersService;
		this.rolesService = rolesService;
		this.messagesAreaService = messagesAreaService;
	}

	ngAfterViewInit():void {
		this.getRoles( this.user ).then( ( roles:PersistedRole.Class[] ) => {
			roles.forEach( ( role:PersistedRole.Class ) => {
				this.availableRoles.push( role.id );
			} );
		} );
		this.$element.find( ".enabled.checkbox" ).checkbox();
	}

	ngOnChanges( changes:SimpleChanges ):void {
		if( ! ! changes[ "user" ] && (changes[ "user" ].currentValue !== changes[ "user" ].previousValue || (typeof changes[ "user" ].currentValue === "undefined" && typeof changes[ "user" ].previousValue === "undefined")) ) {
			// if( this.mode === Modes.CREATE && ! this.user ) {
			// 	this.user = <User.Class & PersistedUser.Class>User.Factory.create( "New User Name", "new-user@mail.com", "password" );
			// }
			this.changeUser( this.user );
		}
	}

	private changeUser( newUser:PersistedUser.Class ):void {
		this.user = newUser;
		if( this.mode === Modes.CREATE ) {
			this.updateFormModel( "New User Name", "new-user@mail.com", "password", true, [] );
		} else {
			this.user.credentials.resolve().then( ( [ credentials, promise ]:[ PersistedCredentials.Class, Response ] ) => {
				this.updateFormModel(
					this.user.name,
					(<Credentials.Class>this.user.credentials).email,
					(<Credentials.Class>this.user.credentials).password,
					(<Credentials.Class>this.user.credentials).enabled,
					[]
				)
			} );
		}

		this.getRoles( this.user ).then( ( roles:PersistedRole.Class[] ) => {
			roles.forEach( ( role:PersistedRole.Class ) => {
				this.userFormModel.roles.push( role.id );
			} );
			this.userRoles = roles;
		} );
	}

	private updateFormModel( name:string, email:string, password:string, enabled:boolean, roles:Array<any> ):void {
		this.userFormModel.name = name;
		this.userFormModel.email = email;
		this.userFormModel.password = password;
		this.userFormModel.repeatPassword = "";
		this.userFormModel.enabled = enabled;
		this.userFormModel.roles = roles;
	}

	private getRoles():Promise<PersistedRole.Class[]>;
	private getRoles( user?:PersistedUser.Class ):Promise<PersistedRole.Class[]>;
	private getRoles( user?:any ):Promise<PersistedRole.Class[]> {
		if( ! user ) return this.rolesService.getAll();
		return this.rolesService.getAll().then( ( roles:PersistedRole.Class[] ) => {
			return roles.filter( ( role:any ) => {
				return ! role.users ? false : role.users.some( ( listedUser:User.Class ) => {return listedUser.id === user.id } );
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
				this.editUser( this.user, data );
				break;
			case Modes.CREATE:
				this.createUser( data );
				break;
		}
	}

	private editUser( user:PersistedUser.Class, userData:UserFormModel ):void {
		user.name = userData.name;
		(<Credentials.Class>user.credentials).email = userData.email;
		(<Credentials.Class>user.credentials).password = userData.password.trim().length > 0 ? userData.password : (<Credentials.Class>user.credentials).password;
		(<Credentials.Class>user.credentials).enabled = userData.enabled;
		user.saveAndRefresh().then( ( [ updatedUser, [ saveResponse, refreshResponse ] ]:[ PersistedUser.Class, [ Response, Response ] ] ) => {
			return this.editUserRoles( user, userData.roles );
		} ).then( () => {
			this.displaySuccessMessage = true;
			this.onSuccess.emit( true );
			this.cancelForm();
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) this.errorMessage.title = error.name;
			this.onError.emit( true );
		} );
	}

	private createUser( userData:UserFormModel ):void {
		this.usersService.createUser( userData.email, userData.password, userData.enabled ).then( ( [ createdUser, responses ]:[ PersistedUser.Class, Response ] ) => {
			createdUser.name = userData.name;
			return createdUser.saveAndRefresh();
		} ).then( ( [ createdUser, response ]:[ PersistedUser.Class, [ Response, Response ] ] ) => {
			this.user = createdUser;
			return this.editUserRoles( this.user, userData.roles );
		} ).then( () => {
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

	private editUserRoles( user:PersistedUser.Class, selectedRoles:string[] ):Promise<any> {
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

	private registerUserToRole( userID:string, roleID:string ):Promise<Response> {
		return this.rolesService.registerUser( userID, roleID );
	}

	private removeUserFromRole( userID:string, roleID:string ):Promise<Response> {
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
	name:string;
	email:string;
	roles:string[];
	password:string;
	repeatPassword:string;
	enabled:boolean;
}

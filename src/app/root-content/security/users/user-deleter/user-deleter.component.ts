import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import * as User from "carbonldp/Auth/User";
import { HTTPError } from "carbonldp/HTTP/Errors";

import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { UsersService } from "../users.service";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-user-deleter",
	templateUrl: "./user-deleter.component.html",
	styleUrls: [ "./user-deleter.component.scss" ],
} )

export class UserDeleterComponent implements AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private usersService:UsersService;

	private $deleteUserModal:JQuery;

	public errorMessage:Message;
	public deletingUser:boolean = false;

	@Input() user:User.Class;
	@Output() onSuccess:EventEmitter<any> = new EventEmitter<any>();
	@Output() onError:EventEmitter<any> = new EventEmitter<any>();


	constructor( element:ElementRef, usersService:UsersService ) {
		this.element = element;
		this.usersService = usersService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$deleteUserModal = this.$element.find( ".delete.user.modal" ).modal( {
			closable: false,
			blurring: true,
			onApprove: ():boolean => { return false; },
		} );
	}

	public onSubmitDeleteUser():void {
		this.deletingUser = true;
		this.usersService.deleteUser( this.user ).then( ( result ) => {
			this.onSuccess.emit( this.deletingUser );
			this.hide();
		} ).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			this.deletingUser = false;
		} );
	}

	private clearErrorMessage():void {
		this.errorMessage = null;
	}

	public show():void {
		this.$deleteUserModal.modal( "show" );
	}

	public hide():void {
		this.hideDeleteUserForm();
	}

	public hideDeleteUserForm():void {
		this.$deleteUserModal.modal( "hide" );
		this.clearErrorMessage();
	}

	public toggle():void {
		this.$deleteUserModal.modal( "toggle" );
	}

}


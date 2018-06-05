import { ElementRef, Component, Input, Output, AfterViewInit, AfterViewChecked, ChangeDetectorRef, EventEmitter } from "@angular/core";

import { User } from "carbonldp/Auth";

import { UsersService } from "../users.service";

@Component( {
	selector: "cw-users-chooser",
	templateUrl: "./users-chooser.component.html",
	styleUrls: [ "./users-chooser.component.scss" ],
} )

export class UsersChooserComponent implements AfterViewInit, AfterViewChecked {

	private element:ElementRef;
	private $element:JQuery;
	private usersService:UsersService;
	private cdRef:ChangeDetectorRef;

	private activePage:number = 0;
	private totalUsers:number = 0;
	private usersPerPage:number = 5;

	private headers:Header[] = [ { name: "Name", value: "name" } ];
	private sortedColumn:string = "name";
	private ascending:boolean = false;

	public loading:boolean = false;
	public availableUsers:User[] = [];


	@Input() single:boolean = false;
	@Input() selectedUsers:User[] = [];

	@Output() onChangeSelection:EventEmitter<User[]> = new EventEmitter<User[]>();

	constructor( element:ElementRef, usersService:UsersService, cdRef:ChangeDetectorRef ) {
		this.element = element;
		this.cdRef = cdRef;
		this.$element = $( element.nativeElement );
		this.usersService = usersService;
	}

	ngAfterViewInit():void {
		this.loadUsers();
	}

	ngAfterViewChecked() {
		this.cdRef.detectChanges();
	}

	private hasUser( user:string, list:User[] ):boolean {
		return list.findIndex( ( persistedUser:User ) => { return user === persistedUser.id } ) !== - 1;
	}

	private onClickUser( evt:Event, user:User ):void {
		evt.stopPropagation();
		this.selectUser( user );
	}

	private selectUser( user:User ):void {
		if( this.single ) this.addUserAsSingle( user );
		else this.addUserAsMulti( user );
		this.onChangeSelection.emit( this.selectedUsers );
	}

	private addUserAsMulti( user:User ):void {
		user[ "checked" ] ? delete user[ "checked" ] : user[ "checked" ] = true;
		let idx:number = this.selectedUsers.findIndex( ( persistedUser:User ) => { return user.id === persistedUser.id } );
		if( idx === - 1 )
			this.selectedUsers.push( user );
		else
			this.selectedUsers.splice( idx, 1 );
	}

	private addUserAsSingle( user:User ):void {
		this.availableUsers.forEach( ( localUser:User ) => {
			localUser[ "checked" ] = false;
		} );
		user[ "checked" ] ? delete user[ "checked" ] : user[ "checked" ] = true;
		this.selectedUsers = [ user ];
	}

	private loadUsers():void {
		this.loading = true;
		this.getNumberOfUsers().then( ( amount:number ) => {
			this.totalUsers = amount;
			return this.getUsers();
		} ).then( ( users:User[] ) => {
			this.availableUsers = users;
		} ).catch( ( error ) => {
			console.error( error );
			// this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			setTimeout( () => { this.$element.find( ".ui.checkbox" ).checkbox(); } );
		} ).then( () => {
			this.loading = false;
		} );
	}

	private getNumberOfUsers():Promise<number> {
		return this.usersService.getNumberOfUsers();
	}

	private getUsers():Promise<User[]> {
		return this.usersService.getAll( this.usersPerPage, this.activePage, this.sortedColumn, this.ascending ).then( ( users:User[] ) => {
			users.forEach( ( user:User ) => {
				user[ "checked" ] = this.hasUser( user.id, this.selectedUsers );
			} );
			return users.filter( ( user:User ) => { return user.id.indexOf( "/users/me/" ) === - 1 } );
		} );
	}

	private changePage( page:number ):void {
		this.activePage = page;
		this.loadUsers();
	}

	private changeUsersPerPage( usersPerPage:number ) {
		this.usersPerPage = usersPerPage;
		this.loadUsers();
	}

	private sortColumn( header:Header ):void {
		if( this.sortedColumn === header.value ) this.ascending = ! this.ascending;
		this.sortedColumn = header.value;
		this.loadUsers();
	}
}

export interface Header {
	name:string;
	value:string;
}

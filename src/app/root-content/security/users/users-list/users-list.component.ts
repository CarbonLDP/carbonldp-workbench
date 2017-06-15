import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";

import { Class as Carbon } from "carbonldp/Carbon";
import * as User from "carbonldp/Auth/User";
import * as PersistedUser from "carbonldp/Auth/PersistedUser";
import * as URI from "carbonldp/RDF/URI";

import { UsersService } from "../users.service";
import { Modes as UserDetailsModes } from "../user-details/user-details.component";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";


@Component( {
	selector: "cw-users-list",
	templateUrl: "./users-list.component.html",
	styleUrls: [ "./users-list.component.scss" ],
} )

export class UsersListComponent implements OnInit {

	private router:Router;
	private carbon:Carbon;
	private route:ActivatedRoute;
	private usersService:UsersService;

	private activePage:number = 0;
	private totalUsers:number = 0;
	private usersPerPage:number = 5;
	private headers:Header[] = [ { name: "Name", value: "name" }, { name: "Created", value: "created" }, { name: "Modified", value: "modified" } ];
	private sortedColumn:string = "name";
	private ascending:boolean = false;

	public errorMessage:Message;
	public users:PersistedUser.Class[] = [];
	public loading:boolean = false;
	public deletingUser:User.Class;


	constructor( router:Router, carbon:Carbon, route:ActivatedRoute, usersService:UsersService ) {
		this.router = router;
		this.carbon = carbon;
		this.route = route;
		this.usersService = usersService;
	}

	ngOnInit():void {
		this.loadUsers();
	}

	private loadUsers():void {
		this.loading = true;
		this.getNumberOfUsers().then( ( amount:number ) => {
			this.totalUsers = amount;
			return this.getUsers();
		} ).then( ( users:PersistedUser.Class[] ) => {
			this.users = users;
		} ).catch( ( error ) => {
			console.error( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			this.loading = false;
		} );
	}

	private getUsers():Promise<PersistedUser.Class[]> {
		return this.usersService.getAll( this.usersPerPage, this.activePage, this.sortedColumn, this.ascending ).then( ( users:PersistedUser.Class[] ) => {
			return users.filter( ( user:PersistedUser.Class ) => { return user.id.indexOf( "/users/me/" ) === - 1 } );
		} );
	}

	private openUser( event:Event, user:PersistedUser.Class ):void {
		event.stopPropagation();
		this.goToUser( user );
	}

	private onClickEditUser( event:Event, user:PersistedUser.Class ):void {
		event.stopPropagation();
		this.goToUser( user, true );
	}

	private goToUser( user:PersistedUser.Class, edit?:boolean ):void {
		let slug:string = URI.Util.getSlug( user.id );
		let extras:NavigationExtras = { relativeTo: this.route };
		if( edit ) extras.queryParams = { mode: UserDetailsModes.EDIT };
		this.router.navigate( [ slug ], extras );
	}

	public refreshUsers():void {
		this.loadUsers();
	}

	private onClickDeleteUser( event:Event, user:User.Class ):void {
		event.stopPropagation();
		this.deletingUser = user;
	}

	private getNumberOfUsers():Promise<number> {
		return this.usersService.getNumberOfUsers();
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


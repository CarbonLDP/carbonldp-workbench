import { Injectable, EventEmitter } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import * as User from "carbonldp/Auth/User";
import * as Users from "carbonldp/Auth/Users";
import * as PersistedUser from "carbonldp/Auth/PersistedUser";
import { Response } from "carbonldp/HTTP";
import { ArrayUtils } from "carbonldp/Utils";
import * as URI from "carbonldp/RDF/URI";
import * as SPARQL from "carbonldp/SPARQL";
import { CS } from "carbonldp/Vocabularies";
import { QueryDocumentsBuilder } from "carbonldp/SPARQL/QueryDocument";

@Injectable()
export class UsersService {

	private carbonldp:CarbonLDP;
	public users:Map<string, PersistedUser.Class>;
	private _activeUser:PersistedUser.Class;
	public set activeUser( user:PersistedUser.Class ) {
		this._activeUser = user;
		this.onUserHasChanged.emit( this.activeUser );
	}

	public get activeUser():PersistedUser.Class {
		return this._activeUser;
	}

	public onUserHasChanged:EventEmitter<PersistedUser.Class> = new EventEmitter<PersistedUser.Class>();

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this.users = new Map<string, PersistedUser.Class>();
	}

	public get( slugOrURI:string ):Promise<PersistedUser.Class> {
		let uri:string = this.carbonldp.baseURI + `users/${slugOrURI}/`;
		if( URI.Util.isAbsolute( slugOrURI ) ) uri = slugOrURI;
		this.users = typeof this.users === "undefined" ? new Map<string, PersistedUser.Class>() : this.users;
		return this.carbonldp.documents.get<PersistedUser.Class>( uri ).then( ( [ user, response ]:[ PersistedUser.Class, Response.Response ] ) => {
			this.users.set( user.id, user );
			return user;
		} );
	}

	public getAll( limit?:number, page?:number, orderBy?:string, ascending:boolean = true ):Promise<PersistedUser.Class[]> {
		let uri:string = this.carbonldp.baseURI + "users/";
		this.users = typeof this.users === "undefined" ? new Map<string, PersistedUser.Class>() : this.users;

		let property:string = orderBy ? orderBy : "name";

		return this.carbonldp.documents.getMembers<PersistedUser.Class>( uri, ( _:QueryDocumentsBuilder.Class ) => {
			let func = _.properties( {
				"name": _.inherit,
				"email": _.inherit,
				"created": _.inherit,
				"modified": _.inherit,
			} );
			if( ! orderBy ) func.orderBy( property, ascending ? "ASC" : "DESC" );
			if( typeof limit !== "undefined" ) func.limit( limit );
			if( typeof page !== "undefined" ) func.offset( page * limit );
			return func;

		} ).then( ( [ users, response ]:[ PersistedUser.Class[], Response.Response ] ) => {
			users.forEach( ( user:PersistedUser.Class ) => this.users.set( user.id, user ) );

			let usersArray:PersistedUser.Class[] = ArrayUtils.from( this.users.values() );
			if( orderBy ) usersArray = this.getSortedUsers( usersArray, orderBy, ascending );

			return usersArray;
		} );
	}

	public getNumberOfUsers():Promise<number> {
		let usersURI:string = this.carbonldp.baseURI + "users/",
			query:string = `SELECT DISTINCT (COUNT(?user) AS ?count) WHERE {
			?user a <${CS.User}> . 
		}`;
		return this.carbonldp.documents.executeSELECTQuery( usersURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, Response.Response ] ) => {
			if( typeof results.bindings[ 0 ] === "undefined" ) return 0;
			return <number>results.bindings[ 0 ][ "count" ];
		} );
	}

	public saveUser( user:PersistedUser.Class ):Promise<[ PersistedUser.Class, Response.Response ]> {
		return user.save();
	}

	public saveAndRefreshUser( user:PersistedUser.Class ):Promise<[ PersistedUser.Class, Response [] ]> {
		return user.saveAndRefresh();
	}

	public createUser( email:string, password:string, enabled:boolean ):Promise<[ PersistedUser.Class, Response.Response ]> {
		return this.carbonldp.auth.users.register( email, password, enabled );
	}

	public deleteUser( user:User.Class, slug?:string ):Promise<Response.Response> {
		let users:Users.Class = this.carbonldp.auth.users;
		return users.delete( user.id );
	}

	private getSortedUsers( users:PersistedUser.Class[], orderBy:string, ascending:boolean ):PersistedUser.Class[] {
		return users.sort( ( userA, userB ) => {
			if( typeof userA[ orderBy ] === "string" && typeof userB[ orderBy ] === "string" ) {
				if( userA[ orderBy ].toLowerCase() > userB[ orderBy ].toLowerCase() ) return ascending ? - 1 : 1;
				if( userA[ orderBy ].toLowerCase() < userB[ orderBy ].toLowerCase() ) return ascending ? 1 : - 1;
			} else {
				if( userA[ orderBy ] > userB[ orderBy ] ) return ascending ? - 1 : 1;
				if( userA[ orderBy ] < userB[ orderBy ] ) return ascending ? 1 : - 1;
			}
			return 0;
		} );
	}
}
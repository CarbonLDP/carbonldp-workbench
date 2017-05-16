import { Injectable, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as User from "app/migration-temp/Auth/User";
import * as Users from "app/migration-temp/Auth/Users";
import * as PersistedUser from "app/migration-temp/Auth/PersistedUser";
import * as Credentials from "app/migration-temp/Auth/Credentials";
import * as HTTP from "carbonldp/HTTP";
import * as Utils from "carbonldp/Utils";
import * as URI from "carbonldp/RDF/URI";
import * as NS from "carbonldp/NS";
import * as SPARQL from "carbonldp/SPARQL";
import { Class as RetrievalPreferences, OrderByProperty } from "carbonldp/RetrievalPreferences";

@Injectable()
export class UsersService {

	private carbon:Carbon;
	public users:Map<string, PersistedUser.Class>;
	private _activeUser:PersistedUser.Class;
	public set activeUser( user:PersistedUser.Class ) {
		this._activeUser = user;
		this.onUserHasChanged.emit( this.activeUser );
	}

	public get activeUser():PersistedUser.Class {
		return this._activeUser;
	}

	public onUserHasChanged:EventEmitter<PersistedUser.Class> = new EventEmitter<User.Class>();

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.users = new Map<string, PersistedUser.Class>();
	}

	public get( slugOrURI:string ):Promise<PersistedUser.Class> {
		let uri:string = this.carbon.getBaseURI() + `users/${slugOrURI}/`;
		if( URI.Util.isAbsolute( slugOrURI ) ) uri = slugOrURI;
		this.users = typeof this.users === "undefined" ? new Map<string, PersistedUser.Class>() : this.users;
		return this.carbon.documents.get<PersistedUser.Class>( uri ).then( ( [ user, response ]:[ PersistedUser.Class, HTTP.Response.Class ] ) => {
			this.users.set( user.id, user );
			return user;
		} );
	}

	public getAll( limit?:number, page?:number, orderBy?:string, ascending:boolean = true ):Promise<PersistedUser.Class[]> {
		let uri:string = this.carbon.getBaseURI() + "users/";
		this.users = typeof this.users === "undefined" ? new Map<string, PersistedUser.Class>() : this.users;

		let preferences:RetrievalPreferences = {},
			property:OrderByProperty,
			name:OrderByProperty = {
				"@id": NS.CS.Predicate.namae,
				"@type": "string",
			},
			email:OrderByProperty = {
				"@id": NS.VCARD.Predicate.email,
				"@type": "string",
			},
			created:OrderByProperty = {
				"@id": NS.C.Predicate.created,
				"@type": "dateTime",
			},
			modified:OrderByProperty = {
				"@id": NS.C.Predicate.modified,
				"@type": "dateTime",
			};
		switch( orderBy ) {
			case "name":
				property = name;
				break;
			case "email":
				property = email;
				break;
			case "created":
				property = created;
				break;
			case "modified":
				property = modified;
				break;
			default:
				property = name;
				break;
		}
		if( ! orderBy ) preferences.orderBy = [ property ];
		if( ! ascending ) property[ "@id" ] = "-" + property[ "@id" ];
		if( typeof limit !== "undefined" ) preferences.limit = limit;
		if( typeof page !== "undefined" ) preferences.offset = page * limit;


		return this.carbon.documents.getMembers<PersistedUser.Class>( uri, false, preferences ).then( ( [ users, response ]:[ PersistedUser.Class[], HTTP.Response.Class ] ) => {
			users.forEach( ( user:PersistedUser.Class ) => this.users.set( user.id, user ) );

			let usersArray:PersistedUser.Class[] = Utils.A.from( this.users.values() );
			if( orderBy ) usersArray = this.getSortedUsers( usersArray, orderBy, ascending );

			return usersArray;
		} );
	}

	public getNumberOfUsers():Promise<number> {
		// TODO: check this query. Probably namespace CS will change
		let usersURI:string = this.carbon.getBaseURI() + "users/",
			query:string = `SELECT DISTINCT (COUNT(?user) AS ?count) WHERE {
			?user a <https://carbonldp.com/ns/v1/security#User> . 
		}`;
		return this.carbon.documents.executeSELECTQuery( usersURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			if( typeof results.bindings[ 0 ] === "undefined" ) return 0;
			return results.bindings[ 0 ][ "count" ];
		} );
	}

	public saveUser( user:PersistedUser.Class ):Promise<[ PersistedUser.Class, HTTP.Response.Class ]> {
		return user.save();
	}

	public saveAndRefreshUser( user:PersistedUser.Class ):Promise<[ PersistedUser.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]> {
		return user.saveAndRefresh();
	}

	public createUser( email:string, password:string, enabled:boolean ):Promise<[ PersistedUser.Class, HTTP.Response.Class ]> {
		return (<Users.Class>this.carbon.auth.users).register( email, password, enabled );
	}

	public deleteUser( user:User.Class, slug?:string ):Promise<HTTP.Response.Class> {
		let users:Users.Class = this.carbon.auth.users;
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

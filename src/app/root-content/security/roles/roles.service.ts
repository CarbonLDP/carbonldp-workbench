import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as Roles from "carbonldp/Auth/Roles";
import * as Role from "carbonldp/Auth/Role";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import * as HTTP from "carbonldp/HTTP";
import * as Utils from "carbonldp/Utils";
import * as URI from "carbonldp/RDF/URI";
import * as NS from "carbonldp/NS";
import * as SPARQL from "carbonldp/SPARQL";
import { Class as RetrievalPreferences, OrderByProperty } from "carbonldp/RetrievalPreferences";

@Injectable()
export class RolesService {

	carbon:Carbon;
	roles:Map<string, PersistedRole.Class>;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.roles = new Map<string, PersistedRole.Class>();
	}

	public get( slugOrURI:string ):Promise<PersistedRole.Class> {
		let uri:string = this.carbon.getBaseURI() + `.system/roles/${slugOrURI}/`;
		if( URI.Util.isAbsolute( slugOrURI ) ) uri = slugOrURI;
		this.roles = typeof this.roles === "undefined" ? new Map<string, PersistedRole.Class>() : this.roles;
		return this.carbon.documents.get<PersistedRole.Class>( uri ).then( ( [ role, response ]:[ PersistedRole.Class, HTTP.Response.Class ] ) => {
			this.roles.set( role.id, role );
			return role;
		} );
	}

	public getAll( limit?:number, page?:number, orderBy?:string, ascending:boolean = true ):Promise<PersistedRole.Class[]> {
		let uri:string = this.carbon.getBaseURI() + `.system/roles/`;
		this.roles = typeof this.roles === "undefined" ? new Map<string, PersistedRole.Class>() : this.roles;

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
		}
		if( ! ascending ) property[ "@id" ] = "-" + property[ "@id" ];
		if( ! ! orderBy ) preferences.orderBy = [ property ];
		if( typeof limit !== "undefined" ) preferences.limit = limit;
		if( typeof page !== "undefined" ) preferences.offset = page * limit;

		return this.carbon.documents.getChildren<PersistedRole.Class>( uri, preferences ).then( ( [ roles, response ]:[ PersistedRole.Class[], HTTP.Response.Class ] ) => {
			roles.filter( ( role:PersistedRole.Class ) => ! this.roles.has( role.id ) )
				.forEach( ( role:PersistedRole.Class ) => this.roles.set( role.id, role ) );

			let rolesArray:PersistedRole.Class[] = Utils.A.from( this.roles.values() );
			if( orderBy ) rolesArray = this.getSortedRoles( rolesArray, orderBy, ascending );

			return rolesArray;
		} );
	}

	public create( parentRole:string | PersistedRole.Class, role:PersistedRole.Class, slug?:string ):Promise<PersistedRole.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( this.carbon );
		return roles.createChild( parentRole, <Role.Class & PersistedRole.Class>role, slug ).then( ( [ role, response ]:[ PersistedRole.Class, HTTP.Response.Class ] ) => {
			return role;
		} );
	}

	public delete( roleID:string ):Promise<HTTP.Response.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( this.carbon );
		return this.carbon.documents.delete( roleID );
	}

	public saveAndRefresh( role:PersistedRole.Class ):Promise<[ PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]> {
		return role.saveAndRefresh();
	}

	public registerUser( userID:string, roleID:string ):Promise<HTTP.Response.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( this.carbon );
		return roles.addUser( roleID, userID )
	}

	public removeUser( userID:string, roleID:string ):Promise<HTTP.Response.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( this.carbon );
		return roles.removeUser( roleID, userID )
	}

	public getNumberOfRoles():Promise<number> {
		let usersURI:string = this.carbon.getBaseURI() + ".system/roles/",
			query:string = `SELECT DISTINCT (COUNT(?role) AS ?count) WHERE {
			?role a <https://carbonldp.com/ns/v1/security#Role> . 
		}`;
		return this.carbon.documents.executeSELECTQuery( usersURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			if( typeof results.bindings[ 0 ] === "undefined" ) return 0;
			return results.bindings[ 0 ][ "count" ];
		} );
	}


	public getDescendants( roleID?:string ):Promise<PersistedRole.Class[]> {
		let rolesURI:string = this.carbon.getBaseURI() + "roles/",
			query:string = `
				SELECT ?parentRole ?childRole ?name
				WHERE{
					<${roleID}> <https://carbonldp.com/ns/v1/security#childRole>* ?childRole.
					?childRole <https://carbonldp.com/ns/v1/security#name> ?name.
					?childRole <https://carbonldp.com/ns/v1/security#parentRole> ?parentRole.
				}
			`;

		return this.carbon.documents.executeSELECTQuery( rolesURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			let roles:PersistedRole.Class[] = [];
			results.bindings.forEach( ( rolePointer:SPARQL.SELECTResults.BindingObject ) => {
				let role:Role.Class = Role.Factory.createFrom( { id: rolePointer[ "childRole" ][ "id" ] }, <string>rolePointer[ "name" ] );
				role[ "parentRole" ] = rolePointer[ "parentRole" ];
				roles.push( <Role.Class & PersistedRole.Class>role );
			} );
			return roles;
		} );
	}

	public getChildren( roleID?:string ):Promise<PersistedRole.Class[]> {
		let rolesURI:string = this.carbon.getBaseURI() + "roles/",
			filter:string = ! ! roleID ? `EXISTS { ?role <${NS.CS.Predicate.parentRole}> <${roleID}> }` : `NOT EXISTS { ?role <${NS.CS.Predicate.parentRole}> ?parentRole } `,
			query:string = `
				SELECT ?role ?name ?parentRole ?childRole
				WHERE{
				  GRAPH ?role { 
				    ?role a <https://carbonldp.com/ns/v1/security#Role> .
					?role <https://carbonldp.com/ns/v1/security#name> ?name .
					OPTIONAL { ?role <https://carbonldp.com/ns/v1/security#parentRole> ?parentRole } .
				  }
				  BIND( EXISTS { GRAPH ?role { ?role <https://carbonldp.com/ns/v1/security#childRole> ?childRole } } as ?childRole)
				  FILTER( ${filter} )
				}`;
		return this.carbon.documents.executeSELECTQuery( rolesURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			let roles:PersistedRole.Class[] = [];
			results.bindings.forEach( ( rolePointer:SPARQL.SELECTResults.BindingObject ) => {
				let role:Role.Class = Role.Factory.createFrom( { id: rolePointer[ "role" ][ "id" ] }, <string>rolePointer[ "name" ] );
				role[ "hasChildren" ] = rolePointer[ "childRole" ];
				roles.push( <Role.Class & PersistedRole.Class>role );
			} );
			return roles;
		} );
	}

	private getSortedRoles( roles:PersistedRole.Class[], orderBy:string, ascending:boolean ):PersistedRole.Class[] {
		return roles.sort( ( roleA, roleB ) => {
			if( typeof roleA[ orderBy ] === "string" ) {
				if( roleA[ orderBy ].toLowerCase() > roleB[ orderBy ].toLowerCase() ) return ascending ? - 1 : 1;
				if( roleA[ orderBy ].toLowerCase() < roleB[ orderBy ].toLowerCase() ) return ascending ? 1 : - 1;
			} else {
				if( roleA[ orderBy ] > roleB[ orderBy ] ) return ascending ? - 1 : 1;
				if( roleA[ orderBy ] < roleB[ orderBy ] ) return ascending ? 1 : - 1;
			}
			return 0;
		} );
	}
}

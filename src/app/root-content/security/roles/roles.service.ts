import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as Roles from "carbonldp/App/Roles";
import * as Role from "carbonldp/App/Role";
import * as PersistedRole from "carbonldp/App/PersistedRole";
import * as HTTP from "carbonldp/HTTP";
import * as Utils from "carbonldp/Utils";
import * as URI from "carbonldp/RDF/URI";
import * as NS from "carbonldp/NS";
import * as SPARQL from "carbonldp/SPARQL";
import { Class as RetrievalPreferences, OrderByProperty } from "carbonldp/RetrievalPreferences";

@Injectable()
export class RolesService {

	carbon:Carbon;
	appContextsRoles:Map<string, Map<string, PersistedRole.Class>>;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.appContextsRoles = new Map<string, Map<string, PersistedRole.Class>>();
	}

	public get( slugOrURI:string, appContext:App.Context ):Promise<PersistedRole.Class> {
		let uri:string = appContext.getBaseURI() + `roles/${slugOrURI}/`;
		if( URI.Util.isAbsolute( slugOrURI ) ) uri = slugOrURI;
		let existingRoles:Map<string, PersistedRole.Class> = this.appContextsRoles.get( appContext.getBaseURI() );
		existingRoles = typeof existingRoles === "undefined" ? new Map<string, PersistedRole.Class>() : existingRoles;
		return appContext.documents.get<PersistedRole.Class>( uri ).then( ( [ role, response ]:[ PersistedRole.Class, HTTP.Response.Class ] ) => {
			existingRoles.set( role.id, role );
			return role;
		} );
	}

	public getAll( appContext:App.Context, limit?:number, page?:number, orderBy?:string, ascending:boolean = true ):Promise<PersistedRole.Class[]> {
		let uri:string = appContext.getBaseURI() + "roles/";
		let existingRoles:Map<string, PersistedRole.Class> = this.appContextsRoles.get( appContext.getBaseURI() );
		existingRoles = typeof existingRoles === "undefined" ? new Map<string, PersistedRole.Class>() : existingRoles;

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

		return appContext.documents.getChildren<PersistedRole.Class>( uri, preferences ).then( ( [ roles, response ]:[ PersistedRole.Class[], HTTP.Response.Class ] ) => {
			roles.filter( ( role:PersistedRole.Class ) => ! existingRoles.has( role.id ) )
				.forEach( ( role:PersistedRole.Class ) => existingRoles.set( role.id, role ) );

			let rolesArray:PersistedRole.Class[] = Utils.A.from( existingRoles.values() );
			if( orderBy ) rolesArray = this.getSortedRoles( rolesArray, orderBy, ascending );

			return rolesArray;
		} );
	}

	public create( appContext:App.Context, parentRole:string | PersistedRole.Class, role:PersistedRole.Class, slug?:string ):Promise<PersistedRole.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( appContext );
		return roles.createChild( parentRole, <Role.Class & PersistedRole.Class>role, slug ).then( ( [ role, response ]:[ PersistedRole.Class, HTTP.Response.Class ] ) => {
			return role;
		} );
	}

	public delete( appContext:App.Context, roleID:string ):Promise<HTTP.Response.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( appContext );
		return appContext.documents.delete( roleID );
	}

	public saveAndRefresh( appContext:App.Context, role:PersistedRole.Class ):Promise<[ PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]> {
		return role.saveAndRefresh();
	}

	public registerAgent( appContext:App.Context, agentID:string, roleID:string ):Promise<HTTP.Response.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( appContext );
		return roles.addAgent( roleID, agentID )
	}

	public removeAgent( appContext:App.Context, agentID:string, roleID:string ):Promise<HTTP.Response.Class> {
		class MockedRoles extends Roles.Class {}
		let roles:Roles.Class = new MockedRoles( appContext );
		return roles.removeAgent( roleID, agentID )
	}

	public getNumberOfRoles( appContext:App.Context ):Promise<number> {
		let agentsURI:string = appContext.getBaseURI() + "roles/",
			query:string = `SELECT DISTINCT (COUNT(?role) AS ?count) WHERE {
			?role a <https://carbonldp.com/ns/v1/security#AppRole> . 
		}`;
		return appContext.documents.executeSELECTQuery( agentsURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			if( typeof results.bindings[ 0 ] === "undefined" ) return 0;
			return results.bindings[ 0 ][ "count" ];
		} );
	}


	public getDescendants( appContext:App.Context, roleID?:string ):Promise<PersistedRole.Class[]> {
		let rolesURI:string = appContext.getBaseURI() + "roles/",
			query:string = `
				SELECT ?parentRole ?childRole ?name
				WHERE{
					<${roleID}> <https://carbonldp.com/ns/v1/security#childRole>* ?childRole.
					?childRole <https://carbonldp.com/ns/v1/security#name> ?name.
					?childRole <https://carbonldp.com/ns/v1/security#parentRole> ?parentRole.
				}
			`;

		return appContext.documents.executeSELECTQuery( rolesURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			let roles:PersistedRole.Class[] = [];
			results.bindings.forEach( ( rolePointer:SPARQL.SELECTResults.BindingObject ) => {
				let role:Role.Class = Role.Factory.createFrom( { id: rolePointer[ "childRole" ][ "id" ] }, <string>rolePointer[ "name" ] );
				role[ "parentRole" ] = rolePointer[ "parentRole" ];
				roles.push( <Role.Class & PersistedRole.Class>role );
			} );
			return roles;
		} );
	}

	public getChildren( appContext:App.Context, roleID?:string ):Promise<PersistedRole.Class[]> {
		let rolesURI:string = appContext.getBaseURI() + "roles/",
			filter:string = ! ! roleID ? `EXISTS { ?role <${NS.CS.Predicate.parentRole}> <${roleID}> }` : `NOT EXISTS { ?role <${NS.CS.Predicate.parentRole}> ?parentRole } `,
			query:string = `
				SELECT ?role ?name ?parentRole ?childRole
				WHERE{
				  GRAPH ?role { 
				    ?role a <https://carbonldp.com/ns/v1/security#AppRole> .
					?role <https://carbonldp.com/ns/v1/security#name> ?name .
					OPTIONAL { ?role <https://carbonldp.com/ns/v1/security#parentRole> ?parentRole } .
				  }
				  BIND( EXISTS { GRAPH ?role { ?role <https://carbonldp.com/ns/v1/security#childRole> ?childRole } } as ?childRole)
				  FILTER( ${filter} )
				}`;
		return appContext.documents.executeSELECTQuery( rolesURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
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

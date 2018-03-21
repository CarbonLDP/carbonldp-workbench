import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import * as Roles from "carbonldp/Auth/Roles";
import * as Role from "carbonldp/Auth/Role";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import { Response } from "carbonldp/HTTP";
import { ArrayUtils } from "carbonldp/Utils";
import { URI } from "carbonldp/RDF/URI";
import { CS } from "carbonldp/Vocabularies";
import * as SPARQL from "carbonldp/SPARQL";
import { QueryDocumentsBuilder } from "carbonldp/SPARQL/QueryDocument";

@Injectable()
export class RolesService {

	carbonldp:CarbonLDP;
	roles:Map<string, PersistedRole.Class>;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this.roles = new Map<string, PersistedRole.Class>();
	}

	public get( slugOrURI:string ):Promise<PersistedRole.Class> {
		let uri:string = this.carbonldp.baseURI + `.system/roles/${slugOrURI}/`;
		if( URI.isAbsolute( slugOrURI ) ) uri = slugOrURI;
		this.roles = typeof this.roles === "undefined" ? new Map<string, PersistedRole.Class>() : this.roles;
		return this.carbonldp.documents.get<PersistedRole.Class>( uri ).then( ( role:PersistedRole.Class ) => {
			this.roles.set( role.id, role );
			return role;
		} );
	}

	public getAll( limit?:number, page?:number, orderBy?:string, ascending:boolean = true ):Promise<PersistedRole.Class[]> {
		let uri:string = this.carbonldp.baseURI + `.system/roles/`;
		this.roles = typeof this.roles === "undefined" ? new Map<string, PersistedRole.Class>() : this.roles;

		let property:string = orderBy ? orderBy : "name";

		return this.carbonldp.documents.getChildren<PersistedRole.Class>( uri, ( _:QueryDocumentsBuilder.Class ) => {
			let func:QueryDocumentsBuilder.Class = _.properties( {
				"name": _.inherit,
				"email": _.inherit,
				"created": _.inherit,
				"modified": _.inherit
			} );
			if( ! orderBy ) func.orderBy( property, ascending ? "ASC" : "DESC" );
			if( typeof limit !== "undefined" ) func.limit( limit );
			if( typeof page !== "undefined" ) func.offset( page * limit );
			return func;

		} ).then( ( roles:PersistedRole.Class[] ) => {
			roles.filter( ( role:PersistedRole.Class ) => ! this.roles.has( role.id ) )
				.forEach( ( role:PersistedRole.Class ) => this.roles.set( role.id, role ) );

			let rolesArray:PersistedRole.Class[] = ArrayUtils.from( this.roles.values() );
			if( orderBy ) rolesArray = this.getSortedRoles( rolesArray, orderBy, ascending );

			return rolesArray;
		} );
	}

	public create( parentRole:string | PersistedRole.Class, role:PersistedRole.Class, slug?:string ):Promise<PersistedRole.Class> {
		class MockedRoles extends Roles.Class {}

		let roles:Roles.Class = new MockedRoles( this.carbonldp );
		return roles.createChild( parentRole, <Role.Class & PersistedRole.Class>role, slug ).then( ( role:PersistedRole.Class ) => {
			return role;
		} );
	}

	public delete( roleID:string ):Promise<Response.Response> {
		class MockedRoles extends Roles.Class {}

		let roles:Roles.Class = new MockedRoles( this.carbonldp );
		return this.carbonldp.documents.delete( roleID );
	}

	public saveAndRefresh( role:PersistedRole.Class ):Promise<PersistedRole.Class> {
		return role.saveAndRefresh();
	}

	public registerUser( userID:string, roleID:string ):Promise<Response.Response> {
		class MockedRoles extends Roles.Class {}

		let roles:Roles.Class = new MockedRoles( this.carbonldp );
		return roles.addUser( roleID, userID )
	}

	public removeUser( userID:string, roleID:string ):Promise<Response.Response> {
		class MockedRoles extends Roles.Class {}

		let roles:Roles.Class = new MockedRoles( this.carbonldp );
		return roles.removeUser( roleID, userID )
	}

	public getNumberOfRoles():Promise<number> {
		let usersURI:string = this.carbonldp.baseURI + ".system/roles/",
			query:string = `SELECT DISTINCT (COUNT(?role) AS ?count) WHERE {
			?role a <${CS.Role}> . 
		}`;
		return this.carbonldp.documents.executeSELECTQuery( usersURI, query ).then( ( results:SPARQL.SELECTResults.Class ) => {
			if( typeof results.bindings[ 0 ] === "undefined" ) return 0;
			return <number>results.bindings[ 0 ][ "count" ];
		} );
	}


	public getDescendants( roleID?:string ):Promise<PersistedRole.Class[]> {
		let rolesURI:string = this.carbonldp.baseURI + ".system/roles/",
			query:string = `
				SELECT ?parentRole ?childRole ?name
				WHERE{
					<${roleID}> <${CS.childRole}>* ?childRole.
					?childRole <${CS.name}> ?name.
					?childRole <${CS.parentRole}> ?parentRole.
				}
			`;

		return this.carbonldp.documents.executeSELECTQuery( rolesURI, query ).then( ( results:SPARQL.SELECTResults.Class ) => {
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
		let rolesURI:string = this.carbonldp.baseURI + ".system/roles/",
			filter:string = ! ! roleID ? `EXISTS { ?role <${CS.parentRole}> <${roleID}> }` : `NOT EXISTS { ?role <${CS.parentRole}> ?parentRole } `,
			query:string = `
				SELECT ?role ?name ?parentRole ?childRole
				WHERE{
				  GRAPH ?role { 
				    ?role a <${CS.Role}> .
					?role <${CS.namae}> ?name .
					OPTIONAL { ?role <${CS.parentRole}> ?parentRole } .
				  }
				  BIND( EXISTS { GRAPH ?role { ?role <${CS.childRole}> ?childRole } } as ?childRole)
				  FILTER( ${filter} )
				}`;
		return this.carbonldp.documents.executeSELECTQuery( rolesURI, query ).then( ( results:SPARQL.SELECTResults.Class ) => {
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
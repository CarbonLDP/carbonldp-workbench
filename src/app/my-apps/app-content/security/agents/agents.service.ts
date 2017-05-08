import { Injectable, EventEmitter } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as Agent from "carbonldp/Auth/Agent";
import * as Agents from "carbonldp/Auth/Agents";
import * as PersistedAgent from "carbonldp/Auth/PersistedAgent";
import * as HTTP from "carbonldp/HTTP";
import * as Utils from "carbonldp/Utils";
import * as URI from "carbonldp/RDF/URI";
import * as NS from "carbonldp/NS";
import * as SPARQL from "carbonldp/SPARQL";
import { Class as RetrievalPreferences, OrderByProperty } from "carbonldp/RetrievalPreferences";
import { AppContentService } from "app/my-apps/app-content/app-content.service";

@Injectable()
export class AgentsService {

	private carbon:Carbon;
	public appContextsAgents:Map<string, Map<string, PersistedAgent.Class>>;
	private appContentService:AppContentService;
	private _activeAgent:PersistedAgent.Class;
	public set activeAgent( app:PersistedAgent.Class ) {
		this._activeAgent = app;
		this.onAgentHasChanged.emit( this.activeAgent );
	}

	public get activeAgent():PersistedAgent.Class {
		return this._activeAgent;
	}

	public onAgentHasChanged:EventEmitter<PersistedAgent.Class> = new EventEmitter<App.Class>();

	constructor( carbon:Carbon, appContentService:AppContentService ) {
		this.carbon = carbon;
		this.appContextsAgents = new Map<string, Map<string, PersistedAgent.Class>>();
		this.appContentService = appContentService;
	}

	public get( slugOrURI:string, appContext:App.Context ):Promise<PersistedAgent.Class> {
		let uri:string = appContext.getBaseURI() + `agents/${slugOrURI}/`;
		if( URI.Util.isAbsolute( slugOrURI ) ) uri = slugOrURI;
		let existingAgents:Map <string, PersistedAgent.Class> = this.appContextsAgents.get( appContext.getBaseURI() );
		existingAgents = typeof existingAgents === "undefined" ? new Map<string, PersistedAgent.Class>() : existingAgents;
		return appContext.documents.get<PersistedAgent.Class>( uri ).then( ( [ agent, response ]:[ PersistedAgent.Class, HTTP.Response.Class ] ) => {
			existingAgents.set( agent.id, agent );
			return agent;
		} );
	}

	public getAll( appContext:App.Context, limit?:number, page?:number, orderBy?:string, ascending:boolean = true ):Promise<PersistedAgent.Class[]> {
		let uri:string = appContext.getBaseURI() + "agents/",
			existingAgents:Map <string, PersistedAgent.Class> = this.appContextsAgents.get( appContext.getBaseURI() );
		existingAgents = typeof existingAgents === "undefined" ? new Map<string, PersistedAgent.Class>() : existingAgents;

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


		return appContext.documents.getMembers<PersistedAgent.Class>( uri, false, preferences ).then( ( [ agents, response ]:[ PersistedAgent.Class[], HTTP.Response.Class ] ) => {
			agents.filter( ( agent:PersistedAgent.Class ) => ! existingAgents.has( agent.id ) )
				.forEach( ( agent:PersistedAgent.Class ) => existingAgents.set( agent.id, agent ) );

			let agentsArray:PersistedAgent.Class[] = Utils.A.from( existingAgents.values() );
			if( orderBy ) agentsArray = this.getSortedAgents( agentsArray, orderBy, ascending );

			return agentsArray;
		} );
	}

	public getNumberOfAgents( appContext:App.Context ):Promise<number> {
		let agentsURI:string = appContext.getBaseURI() + "agents/",
			query:string = `SELECT DISTINCT (COUNT(?agent) AS ?count) WHERE {
			?agent a <https://carbonldp.com/ns/v1/security#Agent> . 
		}`;
		return appContext.documents.executeSELECTQuery( agentsURI, query ).then( ( [ results, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			if( typeof results.bindings[ 0 ] === "undefined" ) return 0;
			return results.bindings[ 0 ][ "count" ];
		} );
	}

	public saveAgent( appContext:App.Context, agent:PersistedAgent.Class ):Promise<[ PersistedAgent.Class, HTTP.Response.Class ]> {
		return agent.save();
	}

	public saveAndRefreshAgent( appContext:App.Context, agent:PersistedAgent.Class ):Promise<[ PersistedAgent.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]> {
		return agent.saveAndRefresh();
	}

	public createAgent( appContext:App.Context, agent:Agent.Class, slug?:string ):Promise<[ PersistedAgent.Class, HTTP.Response.Class ]> {
		let agents:Agents.Class = appContext.auth.agents;
		return agents.register( agent, slug );
	}

	public deleteAgent( appContext:App.Context, agent:Agent.Class, slug?:string ):Promise<HTTP.Response.Class> {
		let agents:Agents.Class = appContext.auth.agents;
		return agents.delete( agent.id );
	}

	private getSortedAgents( agents:PersistedAgent.Class[], orderBy:string, ascending:boolean ):PersistedAgent.Class[] {
		return agents.sort( ( agentA, agentB ) => {
			if( typeof agentA[ orderBy ] === "string" && typeof agentB[ orderBy ] === "string" ) {
				if( agentA[ orderBy ].toLowerCase() > agentB[ orderBy ].toLowerCase() ) return ascending ? - 1 : 1;
				if( agentA[ orderBy ].toLowerCase() < agentB[ orderBy ].toLowerCase() ) return ascending ? 1 : - 1;
			} else {
				if( agentA[ orderBy ] > agentB[ orderBy ] ) return ascending ? - 1 : 1;
				if( agentA[ orderBy ] < agentB[ orderBy ] ) return ascending ? 1 : - 1;
			}
			return 0;
		} );
	}
}

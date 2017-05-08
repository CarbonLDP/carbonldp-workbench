import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";

import * as App from "carbonldp/App";
import * as Agent from "carbonldp/Auth/Agent";
import * as PersistedAgent from "carbonldp/Auth/PersistedAgent";
import * as URI from "carbonldp/RDF/URI";

import { AgentsService } from "../agents.service";
import { Modes as AgentDetailsModes } from "../agent-details/agent-details.component";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";


@Component( {
	selector: "cw-agents-list",
	templateUrl: "./agents-list.component.html",
	styleUrls: [ "./agents-list.component.scss" ],
} )

export class AgentsListComponent implements OnInit {

	private router:Router;
	private route:ActivatedRoute;
	private agentsService:AgentsService;

	private activePage:number = 0;
	private totalAgents:number = 0;
	private agentsPerPage:number = 5;
	private headers:Header[] = [ { name: "Name", value: "name" }, { name: "Created", value: "created" }, { name: "Modified", value: "modified" } ];
	private sortedColumn:string = "name";
	private ascending:boolean = false;

	public errorMessage:Message;
	public agents:PersistedAgent.Class[] = [];
	public loading:boolean = false;
	public deletingAgent:Agent.Class;

	@Input() appContext:App.Context;


	constructor( router:Router, route:ActivatedRoute, agentsService:AgentsService ) {
		this.router = router;
		this.route = route;
		this.agentsService = agentsService;
	}

	ngOnInit():void {
		this.loadAgents();
	}

	private loadAgents():void {
		this.loading = true;
		this.getNumberOfAgents().then( ( amount:number ) => {
			this.totalAgents = amount;
			return this.getAgents();
		} ).then( ( agents:PersistedAgent.Class[] ) => {
			this.agents = agents;
		} ).catch( ( error ) => {
			console.error( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			this.loading = false;
		} );
	}

	private getAgents():Promise<PersistedAgent.Class[]> {
		return this.agentsService.getAll( this.appContext, this.agentsPerPage, this.activePage, this.sortedColumn, this.ascending ).then( ( agents:PersistedAgent.Class[] ) => {
			return agents.filter( ( agent:PersistedAgent.Class ) => { return agent.id.indexOf( "/agents/me/" ) === - 1 } );
		} );
	}

	private openAgent( event:Event, agent:PersistedAgent.Class ):void {
		event.stopPropagation();
		this.goToAgent( agent );
	}

	private onClickEditAgent( event:Event, agent:PersistedAgent.Class ):void {
		event.stopPropagation();
		this.goToAgent( agent, true );
	}

	private goToAgent( agent:PersistedAgent.Class, edit?:boolean ):void {
		let slug:string = URI.Util.getSlug( agent.id );
		let extras:NavigationExtras = { relativeTo: this.route };
		if( edit ) extras.queryParams = { mode: AgentDetailsModes.EDIT };
		this.router.navigate( [ slug ], extras );
	}

	public refreshAgents():void {
		this.loadAgents();
	}

	private onClickDeleteAgent( event:Event, agent:Agent.Class ):void {
		event.stopPropagation();
		this.deletingAgent = agent;
	}

	private getNumberOfAgents():Promise<number> {
		return this.agentsService.getNumberOfAgents( this.appContext );
	}

	private changePage( page:number ):void {
		this.activePage = page;
		this.loadAgents();
	}

	private changeAgentsPerPage( agentsPerPage:number ) {
		this.agentsPerPage = agentsPerPage;
		this.loadAgents();
	}

	private sortColumn( header:Header ):void {
		if( this.sortedColumn === header.value ) this.ascending = ! this.ascending;
		this.sortedColumn = header.value;
		this.loadAgents();
	}
}

export interface Header {
	name:string;
	value:string;
}


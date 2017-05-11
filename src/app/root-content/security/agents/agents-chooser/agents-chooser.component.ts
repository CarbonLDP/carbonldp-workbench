import { ElementRef, Component, Input, Output, AfterViewInit, AfterViewChecked, ChangeDetectorRef, EventEmitter } from "@angular/core";

import * as App from "carbonldp/App";
import * as PersistedAgent from "carbonldp/App/PersistedAgent";

import { AgentsService } from "../agents.service";

@Component( {
	selector: "cw-agents-chooser",
	templateUrl: "./agents-chooser.component.html",
	styleUrls: [ "./agents-chooser.component.scss" ],
} )

export class AgentsChooserComponent implements AfterViewInit, AfterViewChecked {

	private element:ElementRef;
	private $element:JQuery;
	private agentsService:AgentsService;
	private cdRef:ChangeDetectorRef;

	private activePage:number = 0;
	private totalAgents:number = 0;
	private agentsPerPage:number = 5;

	private headers:Header[] = [ { name: "Name", value: "name" } ];
	private sortedColumn:string = "name";
	private ascending:boolean = false;

	public loading:boolean = false;
	public availableAgents:PersistedAgent.Class[] = [];


	@Input() appContext:App.Context;
	@Input() single:boolean = false;
	@Input() selectedAgents:PersistedAgent.Class[] = [];

	@Output() onChangeSelection:EventEmitter<PersistedAgent.Class[]> = new EventEmitter<PersistedAgent.Class[]>();

	constructor( element:ElementRef, agentsService:AgentsService, cdRef:ChangeDetectorRef ) {
		this.element = element;
		this.cdRef = cdRef;
		this.$element = $( element.nativeElement );
		this.agentsService = agentsService;
	}

	ngAfterViewInit():void {
		this.loadAgents();
	}

	ngAfterViewChecked() {
		this.cdRef.detectChanges();
	}

	private hasAgent( agent:string, list:PersistedAgent.Class[] ):boolean {
		return list.findIndex( ( persistedAgent:PersistedAgent.Class ) => { return agent === persistedAgent.id } ) !== - 1;
	}

	private onClickAgent( evt:Event, agent:PersistedAgent.Class ):void {
		evt.stopPropagation();
		this.selectAgent( agent );
	}

	private selectAgent( agent:PersistedAgent.Class ):void {
		if( this.single ) this.addAgentAsSingle( agent );
		else this.addAgentAsMulti( agent );
		this.onChangeSelection.emit( this.selectedAgents );
	}

	private addAgentAsMulti( agent:PersistedAgent.Class ):void {
		agent[ "checked" ] ? delete agent[ "checked" ] : agent[ "checked" ] = true;
		let idx:number = this.selectedAgents.findIndex( ( persistedAgent:PersistedAgent.Class ) => { return agent.id === persistedAgent.id } );
		if( idx === - 1 )
			this.selectedAgents.push( agent );
		else
			this.selectedAgents.splice( idx, 1 );
	}

	private addAgentAsSingle( agent:PersistedAgent.Class ):void {
		this.availableAgents.forEach( ( localAgent:PersistedAgent.Class ) => {
			localAgent[ "checked" ] = false;
		} );
		agent[ "checked" ] ? delete agent[ "checked" ] : agent[ "checked" ] = true;
		this.selectedAgents = [ agent ];
	}

	private loadAgents():void {
		this.loading = true;
		this.getNumberOfAgents().then( ( amount:number ) => {
			this.totalAgents = amount;
			return this.getAgents();
		} ).then( ( agents:PersistedAgent.Class[] ) => {
			this.availableAgents = agents;
		} ).catch( ( error ) => {
			console.error( error );
			// this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			setTimeout( () => { this.$element.find( ".ui.checkbox" ).checkbox(); } );
		} ).then( () => {
			this.loading = false;
		} );
	}

	private getNumberOfAgents():Promise<number> {
		return this.agentsService.getNumberOfAgents( this.appContext );
	}

	private getAgents():Promise<PersistedAgent.Class[]> {
		return this.agentsService.getAll( this.appContext, this.agentsPerPage, this.activePage, this.sortedColumn, this.ascending ).then( ( agents:PersistedAgent.Class[] ) => {
			agents.forEach( ( agent:PersistedAgent.Class ) => {
				agent[ "checked" ] = this.hasAgent( agent.id, this.selectedAgents );
			} );
			return agents.filter( ( agent:PersistedAgent.Class ) => { return agent.id.indexOf( "/agents/me/" ) === - 1 } );
		} );
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

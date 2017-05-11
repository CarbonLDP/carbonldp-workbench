import { ElementRef, Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from "@angular/core";

import * as App from "carbonldp/App";
import * as Agent from "carbonldp/Auth/Agent";
import * as PersistedRole from "carbonldp/Auth/PersistedRole";
import * as PersistedAgent from "carbonldp/Auth/PersistedAgent";
import * as HTTP from "carbonldp/HTTP";
import * as RDF from "carbonldp/RDF";

import { AgentsService } from "../agents.service";
import { RolesService } from "../../roles/roles.service";
import { DocumentExplorerLibrary } from "app/root-content/explorer/document-explorer/document-explorer-library";
import { Message, Types } from "app/shared/messages-area/message.component";
import { MessagesAreaService } from "app/shared/messages-area/messages-area.service";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

@Component( {
	selector: "cw-agent-details",
	templateUrl: "./agent-details.component.html",
	styleUrls: [ "./agent-details.component.scss" ],
} )

export class AgentDetailsComponent implements OnChanges, AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private messagesAreaService:MessagesAreaService;

	private timer:number;
	private agentRoles:PersistedRole.Class[] = [];
	private availableRoles:string[] = [];
	public errorMessage:Message;
	public displaySuccessMessage:boolean = false;

	private agentsService:AgentsService;
	private rolesService:RolesService;

	public Modes:typeof Modes = Modes;
	public agentFormModel:AgentFormModel = {
		slug: "",
		name: "",
		email: "",
		roles: [],
		password: "",
		repeatPassword: "",
		enabled: false,
	};

	@Input() mode:string = Modes.READ;
	@Input() agent:PersistedAgent.Class;
	@Input() appContext:App.Context;
	@Input() canClose:boolean = true;

	@Output() onClose:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSuccess:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onError:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( element:ElementRef, agentsService:AgentsService, rolesService:RolesService, messagesAreaService:MessagesAreaService ) {
		this.element = element;
		this.$element = $( element.nativeElement );
		this.agentsService = agentsService;
		this.rolesService = rolesService;
		this.messagesAreaService = messagesAreaService;
	}

	ngAfterViewInit():void {
		this.getRoles( this.agent ).then( ( roles:PersistedRole.Class[] ) => {
			roles.forEach( ( role:PersistedRole.Class ) => {
				this.availableRoles.push( role.id );
			} );
		} );
		this.$element.find( ".enabled.checkbox" ).checkbox();
	}

	ngOnChanges( changes:SimpleChanges ):void {
		if( ! ! changes[ "agent" ] && (changes[ "agent" ].currentValue !== changes[ "agent" ].previousValue || (typeof changes[ "agent" ].currentValue === "undefined" && typeof changes[ "agent" ].previousValue === "undefined"  )) ) {
			if( this.mode === Modes.CREATE && ! this.agent ) {
				this.agent = <Agent.Class & PersistedAgent.Class>Agent.Factory.create( "New Agent Name", "new-agent@mail.com", "password" );
			}
			this.changeAgent( this.agent );
		}
		// if(typeof changes[ "agent" ].currentValue === "undefined"){}
	}

	private changeAgent( newAgent:PersistedAgent.Class ):void {
		this.agent = newAgent;
		let agentSlug:string = RDF.URI.Util.getSlug( this.agent.id );
		if( this.mode === Modes.CREATE ) {
			agentSlug = "new-agent-name";
		}

		this.agentFormModel.slug = this.getSanitizedSlug( agentSlug );
		this.agentFormModel.name = this.agent.name;
		this.agentFormModel.email = this.agent.email;
		this.agentFormModel.roles = [];
		this.agentFormModel.password = "";
		this.agentFormModel.repeatPassword = "";
		this.agentFormModel.enabled = this.mode === Modes.CREATE ? true : this.agent.enabled;
		this.getRoles( this.agent ).then( ( roles:PersistedRole.Class[] ) => {
			roles.forEach( ( role:PersistedRole.Class ) => {
				this.agentFormModel.roles.push( role.id );
			} );
			this.agentRoles = roles;
		} );
	}

	private getRoles():Promise<PersistedRole.Class[]>;
	private getRoles( agent?:PersistedAgent.Class ):Promise<PersistedRole.Class[]>;
	private getRoles( agent?:any ):Promise<PersistedRole.Class[]> {
		if( ! agent ) return this.rolesService.getAll( this.appContext );
		return this.rolesService.getAll( this.appContext ).then( ( appRoles:PersistedRole.Class[] ) => {
			return appRoles.filter( ( role:any ) => {
				return ! role.agents ? false : role.agents.some( ( listedAgent:Agent.Class ) => {return listedAgent.id === agent.id } );
			} );
		} );
	}

	private changeMode( mode:string ) {
		this.mode = mode;
	}

	private changeRoles( selectedRoles:PersistedRole.Class[] ):void {
		this.agentFormModel.roles = [];
		selectedRoles.forEach( ( selectedRole:PersistedRole.Class ) => {
			this.agentFormModel.roles.push( selectedRole.id );
		} );
	}

	private cancelForm():void {
		this.changeAgent( this.agent );
		if( this.mode === Modes.CREATE ) {
			this.close();
		} else {
			this.mode = Modes.READ;
		}
	}

	public onSubmit( data:AgentFormModel, $event:any ):void {
		$event.preventDefault();
		switch( this.mode ) {
			case Modes.EDIT:
				this.editAgent( this.agent, data );
				break;
			case Modes.CREATE:
				this.createAgent( this.agent, data );
				break;
		}
	}

	private editAgent( agent:PersistedAgent.Class, agentData:AgentFormModel ):void {
		agent.email = agentData.email;
		agent.name = agentData.name;
		agent.password = agentData.password.trim().length > 0 ? agentData.password : agent.password;
		agent.enabled = agentData.enabled;
		this.agentsService.saveAndRefreshAgent( this.appContext, agent ).then( ( [ updatedAgent, [ saveResponse, refreshResponse ] ]:[ PersistedAgent.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ] ) => {
			return this.editAgentRoles( agent, agentData.roles );
		} ).then( () => {
			this.displaySuccessMessage = true;
			this.onSuccess.emit( true );
			this.cancelForm();
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) this.errorMessage.title = error.name;
			this.onError.emit( true );
		} );
	}

	private createAgent( agent:PersistedAgent.Class, agentData:AgentFormModel ):void {
		agent.email = agentData.email;
		agent.name = agentData.name;
		agent.password = agentData.password;
		agent.enabled = agentData.enabled;
		this.agentsService.createAgent( this.appContext, <any>agent, agentData.slug ).then( ( [ updatedAgent, response ]:[ PersistedAgent.Class, HTTP.Response.Class ] ) => {
			return this.editAgentRoles( agent, agentData.roles );
		} ).then( () => {
			let successMessage:Message = {
				title: "Agent Created",
				content: "The agent was created successfully.",
				type: Types.SUCCESS,
				duration: 4000,
			};
			this.messagesAreaService.addMessage( successMessage );
			this.onSuccess.emit( true );
		} ).catch( ( error ) => {
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
			if( typeof error.name !== "undefined" ) this.errorMessage.title = error.name;
			this.onError.emit( true );
		} );
	}

	private emitOnSuccessAfter( seconds:number ):void {
		this.timer = seconds;
		let countDown:any = setInterval( ():boolean => {
			this.timer --;
			if( this.timer === 0 ) {
				this.onSuccess.emit( true );
				this.timer = null;
				clearInterval( countDown );
				return false;
			}
		}, 1000 );
	}

	public getSanitizedSlug( slug:string ):string {
		return DocumentExplorerLibrary.getSanitizedSlug( slug );
	}

	private slugLostFocus( evt:any ):void {
		evt.target.value = DocumentExplorerLibrary.getAppendedSlashSlug( evt.target.value );
	}

	private editAgentRoles( agent:PersistedAgent.Class, selectedRoles:string[] ):Promise<any> {
		let removedRoles:string[] = this.getRemovedRoles( selectedRoles ),
			promises:Promise<any>[] = [];

		selectedRoles.forEach( ( roleID:string, idx:number, roles:string[] ) => {
			promises.push( this.registerAgentToRole( agent.id, roleID ) )
		} );
		removedRoles.forEach( ( roleID:string, idx:number, roles:string[] ) => {
			promises.push( this.removeAgentFromRole( agent.id, roleID ) )
		} );

		return Promise.all( promises ).catch( ( error ) => {
			let generatedMessage:Message = ErrorMessageGenerator.getErrorMessage( error ),
				finalError:Error = new Error( "The agent was saved but an error occurred while trying to persist its roles: " + generatedMessage.content );
			finalError.name = "Agent Saved";
			throw finalError;
		} );
	}

	private getRemovedRoles( selectedRoles:string[] ):string[] {
		return this.agentRoles.filter( ( agentRole:PersistedRole.Class ) => {
			return ! selectedRoles.some( ( selectedRole:string ) => {
				return selectedRole === agentRole.id;
			} );
		} ).map( ( removedRole:PersistedRole.Class ) => {
			return removedRole.id
		} );
	}

	private registerAgentToRole( agentID:string, roleID:string ):Promise<HTTP.Response.Class> {
		return this.rolesService.registerAgent( this.appContext, agentID, roleID );
	}

	private removeAgentFromRole( agentID:string, roleID:string ):Promise<HTTP.Response.Class> {
		return this.rolesService.removeAgent( this.appContext, agentID, roleID );
	}

	private close():void {
		this.onClose.emit( true );
	}

	private closeError():void {
		this.errorMessage = null;
	}

	private closeSuccessMessage( event:Event, messageDiv:HTMLElement ):void {
		$( messageDiv ).transition( {
			animation: "fade",
			onComplete: () => { this.displaySuccessMessage = false; }
		} );
	}
}

export class Modes {
	static READ:string = "READ";
	static EDIT:string = "EDIT";
	static CREATE:string = "CREATE";
}

export interface AgentFormModel {
	slug:string;
	name:string;
	email:string;
	roles:string[];
	password:string;
	repeatPassword:string;
	enabled:boolean;
}

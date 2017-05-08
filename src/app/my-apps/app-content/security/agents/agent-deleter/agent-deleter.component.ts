import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import * as App from "carbonldp/App";
import * as Agent from "carbonldp/Auth/Agent";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { AgentsService } from "../agents.service";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-agent-deleter",
	templateUrl: "./agent-deleter.component.html",
	styleUrls: [ "./agent-deleter.component.scss" ],
} )

export class AgentDeleterComponent implements AfterViewInit {

	private element:ElementRef;
	private $element:JQuery;
	private agentsService:AgentsService;

	private $deleteAgentModal:JQuery;

	public errorMessage:Message;
	public deletingAgent:boolean = false;

	@Input() context:App.Context;
	@Input() agent:Agent.Class;
	@Output() onSuccess:EventEmitter<any> = new EventEmitter<any>();
	@Output() onError:EventEmitter<any> = new EventEmitter<any>();


	constructor( element:ElementRef, agentsService:AgentsService ) {
		this.element = element;
		this.agentsService = agentsService;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$deleteAgentModal = this.$element.find( ".delete.agent.modal" ).modal( {
			closable: false,
			blurring: true,
			onApprove: ():boolean => { return false; },
		} );
	}

	public onSubmitDeleteAgent():void {
		this.deletingAgent = true;
		this.agentsService.deleteAgent( this.context, this.agent ).then( ( result ) => {
			this.onSuccess.emit( this.deletingAgent );
			this.hide();
		} ).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
			this.errorMessage = ErrorMessageGenerator.getErrorMessage( error );
		} ).then( () => {
			this.deletingAgent = false;
		} );
	}

	private clearErrorMessage():void {
		this.errorMessage = null;
	}

	public show():void {
		this.$deleteAgentModal.modal( "show" );
	}

	public hide():void {
		this.hideDeleteAgentForm();
	}

	public hideDeleteAgentForm():void {
		this.$deleteAgentModal.modal( "hide" );
		this.clearErrorMessage();
	}

	public toggle():void {
		this.$deleteAgentModal.modal( "toggle" );
	}

}


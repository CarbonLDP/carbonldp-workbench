import { Component, Input, Output, EventEmitter, OnDestroy } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

import { Message, Types } from "app/shared/messages-area/message.component";
import { JobsService } from "../../job/jobs.service";
import * as Job from "../../job/job";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-backup-exporter",
	templateUrl: "./backup-exporter.component.html",
	styleUrls: [ "./backup-exporter.component.scss" ],
} )

export class BackupExporterComponent implements OnDestroy {

	executingBackup:boolean = false;
	errorMessages:Message[] = [];
	jobsService:JobsService;
	exportSuccess:boolean;
	monitorExecutionInterval:number;
	carbon:Carbon;

	@Input() backupJob:PersistedDocument.Class;
	@Output() onExportSuccess:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( carbon:Carbon, jobsService:JobsService ) {
		this.carbon = carbon;
		this.jobsService = jobsService;
	}

	onGenerateBackup():void {
		this.executingBackup = true;
		this.exportSuccess = false;

		this.jobsService.runJob( this.backupJob ).then( ( execution:PersistedDocument.Class ) => {
			return this.monitorExecution( execution ).catch( ( executionOrError:HTTPError | PersistedDocument.Class ) => {
				if( executionOrError.hasOwnProperty( "response" ) ) return Promise.reject( executionOrError );
				let errorMessage:Message = <Message>{
					title: "Couldn't execute backup.",
					type: Types.ERROR,
					content: "An error occurred while executing your export backup job. This may be caused due to a bad configuration during the creation of your job.",
					statusMessage: execution[ Job.Execution.ERROR_DESCRIPTION ]
				};
				this.errorMessages.push( errorMessage );
			} );
		} ).then( () => {
			this.exportSuccess = true;
		} ).catch( ( error:HTTPError ) => {
			let errorMessage:Message = <Message>{
				title: error.name,
				type: Types.ERROR,
				content: "Couldn't execute backup.",
				endpoint: (<any>error.response.request).responseURL,
				statusCode: "" + (<XMLHttpRequest>error.response.request).status,
				statusMessage: (<XMLHttpRequest>error.response.request).statusText
			};
			this.errorMessages.push( errorMessage );
		} ).then( () => {
			this.executingBackup = false;
		} );
	}

	monitorExecution( execution:PersistedDocument.Class ):Promise<PersistedDocument.Class> {
		return new Promise<PersistedDocument.Class>( ( resolve:( result:any ) => void, reject:( error:HTTPError | PersistedDocument.Class ) => void ) => {
			// Node typings are overriding setInterval, that's why we need to cast it to any before assigning it to a number variable
			this.monitorExecutionInterval = <any>setInterval( () => {
				execution.refresh().then( () => {
					switch( execution[ Job.Execution.STATUS ].id ) {
						case Job.ExecutionStatus.FINISHED:
							clearInterval( this.monitorExecutionInterval );
							resolve( execution );
							this.onExportSuccess.emit( true );
							break;
						case Job.ExecutionStatus.ERROR:
							clearInterval( this.monitorExecutionInterval );
							reject( execution );
							break;
					}
				} ).catch( ( error:HTTPError ) => {
					let errorMessage:Message = <Message>{
						title: error.name,
						type: Types.ERROR,
						content: "Couldn't monitor the exporting backup status.",
						endpoint: (<any>error.response.request).responseURL,
						statusCode: "" + (<XMLHttpRequest>error.response.request).status,
						statusMessage: (<XMLHttpRequest>error.response.request).statusText
					};
					this.errorMessages = [ errorMessage ];
					clearInterval( this.monitorExecutionInterval );
					this.executingBackup = false;
				} );
			}, 3000 );
		} );
	}

	ngOnDestroy():void {
		if( typeof this.monitorExecutionInterval !== "undefined" ) clearInterval( this.monitorExecutionInterval );
	}

	removeMessage( index:number ):void {
		this.errorMessages.splice( index, 1 );
	}

	onCloseSuccess():void {
		this.exportSuccess = false;
	}

	closeMessage( messageDiv:HTMLElement ):void {
		$( messageDiv ).transition( { animation: "fade" } );
	}
}


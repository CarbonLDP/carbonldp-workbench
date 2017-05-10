import { Component, ElementRef, Input, OnInit, OnDestroy } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as Response from "carbonldp/HTTP/Response";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as Pointer from "carbonldp/Pointer";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

import { BackupsService } from "../backups.service";
import { JobsService } from "../../job/jobs.service";
import * as Job from "../../job/job";
import { Message, Types } from "app/shared/messages-area/message.component";

import "semantic-ui/semantic";

@Component( {
	selector: "cw-backup-importer",
	templateUrl: "./backup-importer.component.html",
	styleUrls: [ "./backup-importer.component.scss" ],
} )

export class BackupImporterComponent implements OnInit, OnDestroy {
	carbon:Carbon;

	element:ElementRef;
	monitorExecutionInterval:number;

	importFormModel:{ uri:string, backup:string, backupFile:string } = {
		uri: "",
		backup: "",
		backupFile: "",
	};
	backupFileBlob:Blob;
	backupFileArray:any[] = [];

	backups:PersistedDocument.Class[] = [];
	backupsService:BackupsService;
	jobsService:JobsService;

	running:ImportStatus = new ImportStatus();
	uploading:ImportStatus = new ImportStatus();
	creating:ImportStatus = new ImportStatus();
	executing:ImportStatus = new ImportStatus();
	errorMessages:Message[] = [];
	errorMessage:Message;

	constructor( element:ElementRef, carbon:Carbon, backupsService:BackupsService, jobsService:JobsService ) {
		this.element = element;
		this.carbon = carbon;
		this.backupsService = backupsService;
		this.jobsService = jobsService;
	}

	ngOnInit():void {
		this.getBackups();
	}


	getBackups():void {
		this.backupsService.getAll().then( ( [ backups, response ]:[ PersistedDocument.Class[], Response.Class ] ) => {
			this.backups = backups.sort( ( a:any, b:any ) => b.modified < a.modified ? - 1 : b.modified > a.modified ? 1 : 0 );
		} )
	}

	onImportBackup( form:any ):void {
		let uri = form.form.controls.uri;
		let backup = form.form.controls.backup;
		let backupFile = form.form.controls.backupFile;
		this.running.start();
		if( uri.valid ) this.createBackupImport( uri.value );
		if( backup.valid ) this.createBackupImport( backup.value );
		if( backupFile.valid ) this.uploadBackup( this.backupFileBlob );
	}

	executeImport( importJob:PersistedDocument.Class ):Promise<PersistedDocument.Class> {
		return this.jobsService.runJob( importJob );
	}

	monitorExecution( importJobExecution:PersistedDocument.Class ):Promise<PersistedDocument.Class> {
		return new Promise<PersistedDocument.Class>( ( resolve:( result:any ) => void, reject:( error:HTTPError | PersistedDocument.Class ) => void ) => {
			// Node typings are overriding setInterval, that's why we need to cast it to any before assigning it to a number variable
			this.monitorExecutionInterval = <any>setInterval( () => {
				this.checkImportJobExecution( importJobExecution ).then( () => {
					if( this.executing.done ) {
						clearInterval( this.monitorExecutionInterval );
						resolve( importJobExecution );
					}
				} );
			}, 3000 );
		} );
	}

	ngOnDestroy():void {
		if( typeof this.monitorExecutionInterval !== "undefined" ) clearInterval( this.monitorExecutionInterval );
	}

	private checkImportJobExecution( importJobExecution:PersistedDocument.Class ):Promise<any> {
		return this.jobsService.checkJobExecution( importJobExecution ).then( ( execution ) => {
			if( ! execution[ Job.Execution.STATUS ] ) return Promise.reject( execution );
			if( execution[ Job.Execution.STATUS ].id === Job.ExecutionStatus.FINISHED ) this.executing.success();
			if( execution[ Job.Execution.STATUS ].id === Job.ExecutionStatus.ERROR ) {
				this.executing.fail();
				let errorMessage:Message = <Message>{
					title: "Error while executing import",
					type: Types.ERROR,
					content: "An error occurred while executing your import backup job. Please, fix your job configuration.",
					statusMessage: execution[ Job.Execution.ERROR_DESCRIPTION ]
				};
				this.errorMessages.push( errorMessage );
			}
		} ).catch( ( error:HTTPError ) => {
			console.error( error );
			this.executing.fail();
			let errorMessage:Message;
			if( error.response ) errorMessage = this.getHTTPErrorMessage( error, "Couldn't monitor the import execution." );
			else {
				errorMessage = <Message>{
					title: error.name,
					type: Types.ERROR,
					content: JSON.stringify( error )
				};
			}
			this.errorMessages.push( errorMessage );
		} )
	}

	onFileChange( event ):void {
		let files:FileList = event.srcElement.files;
		this.backupFileBlob = files[ 0 ];
	}

	onInputLostFocus( control:any ):void {
		switch( control.name ) {
			case "uri":
				if( control.valid ) {
					this.element.nativeElement.querySelector( "[ ng-reflect-name ='backup']" ).setAttribute( "disabled", true );
					this.element.nativeElement.querySelector( "[ ng-reflect-name ='backupFile']" ).setAttribute( "disabled", true );
				} else { this.enableAllInputs() }
				break;
			case "backup":
				if( control.valid ) {
					this.element.nativeElement.querySelector( "[ ng-reflect-name ='uri']" ).setAttribute( "disabled", true );
					this.element.nativeElement.querySelector( "[ ng-reflect-name ='backupFile']" ).setAttribute( "disabled", true );
				} else { this.enableAllInputs() }
				break;
			case "backupFile":
				if( ! ! this.backupFileBlob ) {
					this.element.nativeElement.querySelector( "[ ng-reflect-name ='uri']" ).setAttribute( "disabled", true );
					this.element.nativeElement.querySelector( "[ ng-reflect-name='backup']" ).setAttribute( "disabled", true );
				} else { this.enableAllInputs() }
				break;
		}
	}

	enableAllInputs():void {
		this.element.nativeElement.querySelector( "[ng-reflect-name='uri']" ).removeAttribute( "disabled", true );
		this.element.nativeElement.querySelector( "[ng-reflect-name='backupFile']" ).removeAttribute( "disabled", true );
	}

	canDisplayImportButtonLoading():boolean {
		return this.uploading.active ? true : this.creating.active ? true : this.executing.active ? true : false;
	}

	uploadBackup( file:Blob ):void {
		this.uploading.start();
		this.backupsService.upload( file ).then(
			( [ pointer, response ]:[ Pointer.Class, Response.Class ] ) => {
				this.uploading.success();
				this.createBackupImport( pointer.id );
			}
		).catch( ( error:HTTPError ) => {
			console.error( error );
			this.uploading.fail();
			let errorMessage:Message;
			if( error.response ) errorMessage = this.getHTTPErrorMessage( error, "Couldn't upload the file." );
			else {
				errorMessage = <Message>{
					title: error.name,
					type: Types.ERROR,
					content: JSON.stringify( error )
				};
			}
			this.errorMessages.push( errorMessage );
		} );
	}

	createBackupImport( backupURI:string ):Promise<any> {
		this.creating.start();
		return this.jobsService.createImportBackup( backupURI ).then( ( importJob:PersistedDocument.Class ) => {
			this.creating.success();
			this.executing.start();
			return this.executeImport( importJob ).then( ( importJobExecution:PersistedDocument.Class ) => {this.monitorExecution( importJobExecution );}
			).catch( ( error:HTTPError ) => {
				console.error( error );
				this.executing.fail();
				let errorMessage:Message;
				if( error.response ) errorMessage = this.getHTTPErrorMessage( error, "Couldn't monitor the import execution." );
				else {
					errorMessage = <Message>{
						title: error.name,
						type: Types.ERROR,
						content: JSON.stringify( error )
					};
				}
				this.errorMessages.push( errorMessage );
			} );
		} ).catch( ( error:HTTPError ) => {
			console.error( error );
			this.creating.fail();
			let errorMessage:Message;
			if( ! ! error.response ) errorMessage = this.getHTTPErrorMessage( error, "The importing job couldn't be created." );
			else {
				errorMessage = <Message>{
					title: error.name,
					type: Types.ERROR,
					content: JSON.stringify( error )
				};
			}
			this.errorMessages.push( errorMessage );
		} );
	}

	private getHTTPErrorMessage( error:HTTPError, content:string ):Message {
		return {
			title: error.name,
			content: content + " Reason: " + error.message,
			endpoint: (<any>error.response.request).responseURL,
			statusCode: "" + (<XMLHttpRequest>error.response.request).status + " - RequestID: " + error.requestID,
			statusMessage: (<XMLHttpRequest>error.response.request).statusText
		};
	}

	finishImport():void {
		this.uploading = new ImportStatus();
		this.creating = new ImportStatus();
		this.executing = new ImportStatus();
		this.running = new ImportStatus();
		this.getBackups();
		this.errorMessages = [];
	}

	checkForFailedTasks():boolean {
		return this.uploading.failed ? true : this.creating.failed ? true : this.executing.failed ? true : false;
	}

	removeMessage( index:number ):void {
		this.errorMessages.splice( index, 1 );
	}
}

export class ImportStatus {
	private _active:boolean;
	private _done:boolean;
	private _failed:boolean;
	private _succeed:boolean;

	get active():boolean { return this._active; }

	get done():boolean { return this._done; }

	get failed():boolean { return this._failed; }

	get succeed():boolean { return this._succeed; }

	set active( value:boolean ) {
		this._active = value;
		this._done = ! value;
	}

	set done( value:boolean ) {
		this._done = value;
		this._active = ! value;
	}

	set failed( value:boolean ) {
		this.done = true;
		this._failed = value;
		this._succeed = ! value;
	}

	set succeed( value:boolean ) {
		this.done = true;
		this._failed = ! value;
		this._succeed = value;
	}

	start():void {
		this.active = true;
	}

	finish():void {
		this.done = true;
	}

	fail():void {
		this.failed = true;
	}

	success():void {
		this.succeed = true;
	}
}

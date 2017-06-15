import { Component, ElementRef, Input, EventEmitter, SimpleChange, AfterViewInit, OnChanges, OnDestroy } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as Response from "carbonldp/HTTP/Response";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import { StatusCode as HTTPStatusCode } from "carbonldp/HTTP";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

import { BackupsService } from "../backups.service";
import { Message, Types } from "app/shared/messages-area/message.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-backups-list",
	templateUrl: "./backups-list.component.html",
	styleUrls: [ "./backups-list.component.scss" ],
} )

export class BackupsListComponent implements AfterViewInit, OnChanges, OnDestroy {

	carbon:Carbon;
	element:ElementRef;
	$element:JQuery;
	$deleteBackupConfirmationModal:JQuery;
	fetchBackupsListInterval:number;

	backupsService:BackupsService;
	backups:MockBackup[];
	askingBackupToRemove:MockBackup;
	loadingBackups:boolean = false;
	deletingBackup:boolean = false;
	errorMessages:Message[] = [];
	refreshPeriod:number = 15000;
	deleteMessages:Message[] = [];
	failedDownloadMessage:Message;

	@Input() backupJob:PersistedDocument.Class;
	fetchBackupsList:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor( element:ElementRef, carbon:Carbon, backupsService:BackupsService ) {
		this.element = element;
		this.carbon = carbon;
		this.backupsService = backupsService;
		this.fetchBackupsList.subscribe( ( doFetch ) => {
			if( ! doFetch ) return;
			this.getBackups().then( ( backups:PersistedDocument.Class[] ) => {
				clearInterval( this.fetchBackupsListInterval );
				this.monitorBackups();
			} );
		} );
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$deleteBackupConfirmationModal = this.$element.find( ".delete.backup.modal" );
		this.initializeModals();
	}

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {
		if( changes[ "backupJob" ] && ! ! changes[ "backupJob" ].currentValue && changes[ "backupJob" ].currentValue !== changes[ "backupJob" ].previousValue ) {
			this.loadingBackups = true;
			this.getBackups().then( ( backups:PersistedDocument.Class[] ) => {
				this.loadingBackups = false;
			} ).catch( () => this.loadingBackups = false );
			this.monitorBackups();
		}
	}

	ngOnDestroy():void {
		clearInterval( this.fetchBackupsListInterval );
	}

	initializeModals():void {
		this.$deleteBackupConfirmationModal.modal( {
			closable: false,
			blurring: true,
			onApprove: () => false
		} );
	}

	monitorBackups():void {
		// Node typings are overriding setInterval, that's why we need to cast it to any before assigning it to a number variable
		this.fetchBackupsListInterval = <any>setInterval( () => this.getBackups(), this.refreshPeriod );
	}

	getBackups():Promise<PersistedDocument.Class[]> {
		this.errorMessages = [];
		return this.backupsService.getAll().then(
			( [ backups, response ]:[ PersistedDocument.Class[], Response.Class ] ) => {
				backups = backups.sort( ( a:any, b:any ) => b.modified < a.modified ? - 1 : b.modified > a.modified ? 1 : 0 );
				this.backups = backups;
				return backups;
			}
		).catch( ( error:HTTPError ) => {
			let errorMessage:Message = <Message>{
				title: error.name,
				type: Types.ERROR,
				content: `Couldn't fetch backups. I'll try again in ${(this.refreshPeriod / 1000)} seconds.`,
				endpoint: (<any>error.response.request).responseURL,
				statusCode: "" + (<XMLHttpRequest>error.response.request).status,
				statusMessage: (<XMLHttpRequest>error.response.request).statusText
			};
			this.errorMessages.push( errorMessage );
			return error;
		} );
	}

	downloadBackup( uri:string, downLoadButton:HTMLButtonElement ):void {
		downLoadButton.classList.add( "loading" );
		this.failedDownloadMessage = null;
		this.backupsService.getDownloadURL( uri ).then( ( getDownloadURL:string ) => {
			window.open( getDownloadURL );
		} ).catch( ( error:HTTPError ) => {
			let deleteMessage:Message;
			deleteMessage = <Message>{
				title: (<HTTPError>error).name,
				type: Types.ERROR,
				content: "Couldn't generate download link.",
				endpoint: (<any>(<HTTPError>error).response.request).responseURL,
				statusCode: "" + (<XMLHttpRequest>(<HTTPError>error).response.request).status,
				statusMessage: (<XMLHttpRequest>(<HTTPError>error).response.request).statusText
			};
			this.failedDownloadMessage = deleteMessage;
		} ).then( () => {downLoadButton.classList.remove( "loading" );} );
	}

	closeFailedDownloadMessage():void {
		this.failedDownloadMessage = null;
	}

	askToDeleteBackup( askingBackupToRemove:PersistedDocument.Class ):void {
		this.askingBackupToRemove = askingBackupToRemove;
		this.$deleteBackupConfirmationModal.modal( "show" );
	}

	deleteBackup( backup:PersistedDocument.Class ):Promise<Response.Class> {
		this.deletingBackup = true;
		return this.backupsService.delete( backup.id ).then( ( response:Response.Class ):Response.Class => {
			if( response.status !== HTTPStatusCode.OK ) return <any>Promise.reject( response );
			this.getBackups();
			this.closeDeleteModal();
			return response;
		} ).catch( ( errorOrResponse:HTTPError | Response.Class ) => {
			let deleteMessage:Message;
			if( errorOrResponse.hasOwnProperty( "response" ) ) {
				deleteMessage = <Message>{
					title: (<HTTPError>errorOrResponse).name,
					type: Types.ERROR,
					content: "Couldn't delete the backup.",
					endpoint: (<any>(<HTTPError>errorOrResponse).response.request).responseURL,
					statusCode: "" + (<XMLHttpRequest>(<HTTPError>errorOrResponse).response.request).status,
					statusMessage: (<XMLHttpRequest>(<HTTPError>errorOrResponse).response.request).statusText
				};
			} else {
				deleteMessage = <Message>{
					title: (<XMLHttpRequest>(<Response.Class>errorOrResponse).request).statusText,
					type: Types.ERROR,
					content: "Couldn't delete the backup.",
					endpoint: (<any>(<Response.Class>errorOrResponse).request).responseURL,
					statusCode: "" + (<Response.Class>errorOrResponse).status,
					statusMessage: (<XMLHttpRequest>(<Response.Class>errorOrResponse).request).statusText
				};
			}
			this.deleteMessages.push( deleteMessage );
		} ).then( ( response:Response.Class ) => {
			this.deletingBackup = false;
			return response;
		} );
	}

	refreshList():void {
		this.loadingBackups = true;
		this.getBackups().then( ( backups:PersistedDocument.Class[] ) => {
			this.loadingBackups = false;
		} ).catch( () => this.loadingBackups = false );
		clearInterval( this.fetchBackupsListInterval );
		this.monitorBackups();
	}

	removeDeleteErrorMessage( index:number ):void {
		this.deleteMessages.slice( index );
	}

	closeDeleteModal():void {
		this.$deleteBackupConfirmationModal.modal( "hide" );
	}

}

export interface MockBackup extends PersistedDocument.Class {
	fileIdentifier?:string;
}


import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { isEqual, sortBy } from "lodash";

import { CarbonLDP } from "carbonldp";
import { SPARQLRawResults } from "carbonldp/SPARQL/RawResults";
import { Errors, Header, RequestOptions, Response } from "carbonldp/HTTP";
import { SPARQLService } from "carbonldp/SPARQL";

import { SPARQLClientResponse, SPARQLResponseType } from "./response/response.component";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";
import { SavedQueryService } from "app/workbench/sparql-client/saved-query.service";
import { QueryType, SPARQLQuery, SPARQLType } from "app/workbench/sparql-client/models";

import * as $ from "jquery";
import "semantic-ui/semantic";
import { QueryBuilderComponent } from "app/workbench/sparql-client/query-builder/query-builder.component";

class ModalControl<RESULT> {
	promise:Promise<RESULT>;
	resolve:( result:RESULT ) => void;
	reject:( error:any ) => void;

	constructor() {
		this.promise = new Promise( ( resolve, reject ) => {
			this.resolve = resolve;
			this.reject = reject;
		} );
	}
}

class ActionCanceled {}

@Component( {
	selector: "cw-sparql-client",
	templateUrl: "./sparql-client.component.html",
	styleUrls: [ "./sparql-client.component.scss" ],
	providers: [ SavedQueryService ],
} )
export class SPARQLClientComponent implements OnInit, AfterViewInit {
	@Input() emitErrors:boolean = false;
	@Output() errorOccurs:EventEmitter<any> = new EventEmitter();

	@ViewChild( "queryBuilder" ) queryBuilder:QueryBuilderComponent;

	isQueryType:boolean = true;
	isSending:boolean = false;
	isSaving:boolean = false;

	query:SPARQLQuery;
	responses:SPARQLClientResponse[] = [];
	savedQueries$:Observable<SPARQLQuery[]>;

	messages:any[] = [];

	// Expose SPARQLType to the template
	readonly SPARQLType:typeof SPARQLType = SPARQLType;

	// TODO: Make them configurable
	private prefixes:Map<string, string> = new Map( [
		[ "acl", "http://www.w3.org/ns/auth/acl#" ],
		[ "api", "http://purl.org/linked-data/api/vocab#" ],
		[ "c", "https://carbonldp.com/ns/v1/platform#" ],
		[ "cs", "https://carbonldp.com/ns/v1/security#" ],
		[ "cw", "https://carbonldp.com/ns/v1/patch#" ],
		[ "cc", "http://creativecommons.org/ns#" ],
		[ "cert", "http://www.w3.org/ns/auth/cert#" ],
		[ "dbp", "http://dbpedia.org/property/" ],
		[ "dc", "http://purl.org/dc/terms/" ],
		[ "dc11", "http://purl.org/dc/elements/1.1/" ],
		[ "dcterms", "http://purl.org/dc/terms/" ],
		[ "doap", "http://usefulinc.com/ns/doap#" ],
		[ "example", "http://example.org/ns#" ],
		[ "ex", "http://example.org/ns#" ],
		[ "exif", "http://www.w3.org/2003/12/exif/ns#" ],
		[ "fn", "http://www.w3.org/2005/xpath-functions#" ],
		[ "foaf", "http://xmlns.com/foaf/0.1/" ],
		[ "geo", "http://www.w3.org/2003/01/geo/wgs84_pos#" ],
		[ "geonames", "http://www.geonames.org/ontology#" ],
		[ "gr", "http://purl.org/goodrelations/v1#" ],
		[ "http", "http://www.w3.org/2006/http#" ],
		[ "ldp", "http://www.w3.org/ns/ldp#" ],
		[ "log", "http://www.w3.org/2000/10/swap/log#" ],
		[ "owl", "http://www.w3.org/2002/07/owl#" ],
		[ "rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#" ],
		[ "rdfs", "http://www.w3.org/2000/01/rdf-schema#" ],
		[ "rei", "http://www.w3.org/2004/06/rei#" ],
		[ "rsa", "http://www.w3.org/ns/auth/rsa#" ],
		[ "rss", "http://purl.org/rss/1.0/" ],
		[ "sd", "http://www.w3.org/ns/sparql-service-description#" ],
		[ "sfn", "http://www.w3.org/ns/sparql#" ],
		[ "sioc", "http://rdfs.org/sioc/ns#" ],
		[ "shacl", "http://www.w3.org/ns/shacl#" ],
		[ "skos", "http://www.w3.org/2004/02/skos/core#" ],
		[ "swrc", "http://swrc.ontoware.org/ontology#" ],
		[ "types", "http://rdfs.org/sioc/types#" ],
		[ "vcard", "http://www.w3.org/2001/vcard-rdf/3.0#" ],
		[ "wot", "http://xmlns.com/wot/0.1/" ],
		[ "xhtml", "http://www.w3.org/1999/xhtml#" ],
		[ "xsd", "http://www.w3.org/2001/XMLSchema#" ],
	] );

	private $element:JQuery;
	private $savedQueriesSidebar:JQuery;

	private $deleteQueryConfirmationModal:JQuery;
	private deleteQueryConfirmationControl:ModalControl<boolean>;

	private $saveQueryModal:JQuery;
	private saveQueryControl:ModalControl<SPARQLQuery> | null;

	private $overwriteQueryConfirmationModal:JQuery;
	private overwriteConfirmationControl:ModalControl<SPARQLQuery> | null;

	private $replaceQueryConfirmationModal:JQuery;
	private replaceQueryConfirmationControl:ModalControl<boolean> | null;

	private queryBeingSaved:SPARQLQuery;
	private queryBeingOverwritten:SPARQLQuery;

	constructor( private element:ElementRef, private carbonldp:CarbonLDP, private savedQueryService:SavedQueryService ) {}

	ngOnInit() {
		this.resetQuery();

		this.savedQueries$ = this.savedQueryService
			.getAll()
			// Sort by name in ascending order
			.pipe( map( queries => sortBy( queries, query => query.name.toLowerCase() ) ) )
			.pipe( share() );
	}

	ngAfterViewInit() {
		this.$element = $( this.element.nativeElement );

		this.initializeSemanticUIElements();
	}

	initializeSemanticUIElements() {
		const defaultModalConfiguration = {
			// Return false to prevent the modal from closing by default so the logic can be handled by Angular
			onApprove: () => false,
			onDeny: () => false,
		};

		// Save modal
		this.$saveQueryModal = this.$element.find( ".cw-saveQueryModal" );
		this.$saveQueryModal.modal( defaultModalConfiguration );

		// Overwrite modal
		this.$overwriteQueryConfirmationModal = this.$element.find( ".cw-overwriteQueryConfirmationModal" );
		this.$overwriteQueryConfirmationModal.modal( defaultModalConfiguration );

		// Replace modal
		this.$replaceQueryConfirmationModal = this.$element.find( ".cw-replaceQueryConfirmationModal" );
		this.$replaceQueryConfirmationModal.modal( defaultModalConfiguration );

		// Delete modal
		this.$deleteQueryConfirmationModal = this.$element.find( ".cw-deleteQueryConfirmationModal" );
		this.$deleteQueryConfirmationModal.modal( defaultModalConfiguration );

		// Saved queries sidebar
		this.$savedQueriesSidebar = this.$element.find( ".cw-savedQueries" );
		this.$savedQueriesSidebar.sidebar( {
			context: this.$element.find( ".cw-queryBuilderCard" ),
		} );
	}

	toggleSidebar() {
		this.$savedQueriesSidebar.sidebar( "toggle" );
	}

	showSidebar() {
		this.$savedQueriesSidebar.sidebar( "show" );
	}

	hideSidebar() {
		this.$savedQueriesSidebar.sidebar( "hide" );
	}

	async on_queryBuilder_execute( query:SPARQLQuery ) {
		let response:SPARQLClientResponse;
		try {
			response = await this.disableInteractions( () =>
				this.execute( query )
			);
		} catch( error ) {
			if( error instanceof SPARQLClientResponse ) {
				response = error  as SPARQLClientResponse;
			} else if( this.emitErrors ) {
				this.errorOccurs.emit( error );
				return;
			} else {
				this.messages.push( error );
				return;
			}
		}

		this.addResponse( response );
	}

	on_queryBuilder_clean( query:SPARQLQuery ) {
		this.resetQuery();
	}

	@HostListener( "document:keydown", [ "$event" ] )
	async handleSaveShortcut( event:KeyboardEvent ) {
		if( (event.metaKey || event.ctrlKey) && event.code === "KeyS" ) {
			// Prevent the browser from trying to save the web page
			event.preventDefault();

			await this.on_queryBuilder_save();
		}
	}

	async on_queryBuilder_save() {
		if( ! this.queryBuilder.hasUnsavedChanges() ) return;
		// Create a copy of the query to replace the one being used by the UI
		const query:SPARQLQuery = Object.assign( {}, this.query );
		this.queryBeingSaved = query;

		if( query.id ) {
			// The user is saving an already saved query
			this.query = await this.save( query );
		} else {
			// The user is saving a new query
			try {
				this.query = await this.askQueryDetailsAndThenSave();
			} catch( error ) {
				if( error instanceof ActionCanceled ) return;
			}
		}
	}

	async askQueryDetailsAndThenSave():Promise<SPARQLQuery> {
		this.saveQueryControl = new ModalControl<SPARQLQuery>();

		this.$saveQueryModal.modal( "show" );

		return this.saveQueryControl.promise;
	}

	async on_saveQueryModal_cancel() {
		// Clean state that the save modal could have left
		delete this.query.name;

		this.saveQueryControl.reject( new ActionCanceled() );
		this.$saveQueryModal.modal( "hide" );
	}

	async on_saveQueryModal_submit() {
		try {
			this.saveQueryControl.resolve( await this.save( this.query ) );
		} catch( error ) {
			this.saveQueryControl.reject( error );
		} finally {
			this.$saveQueryModal.modal( "hide" );
		}
	}

	async save( query:SPARQLQuery ):Promise<SPARQLQuery> {
		const existingQuery = await this.disableInteractions( () =>
			this.savedQueryService.findByName( query.name )
		);
		if(
			// There's no query with the same name
			! existingQuery ||
			// or the query being saved shares its name only with itself
			query.id && query.id === existingQuery.id
		) {
			return await this.disableInteractions( () =>
				this.savedQueryService.save( query )
			);
		} else {
			return this.askConfirmationToOverwrite( existingQuery, query );
		}
	}

	async askConfirmationToOverwrite( original:SPARQLQuery, replacement:SPARQLQuery ):Promise<SPARQLQuery> {
		this.overwriteConfirmationControl = new ModalControl<SPARQLQuery>();

		this.queryBeingOverwritten = original;
		this.$overwriteQueryConfirmationModal.modal( "show" );

		return this.overwriteConfirmationControl.promise;
	}

	async on_overwriteQueryConfirmationModal_cancel() {
		this.queryBeingOverwritten = null;
		this.overwriteConfirmationControl.reject( new ActionCanceled() );
		this.$overwriteQueryConfirmationModal.modal( "hide" );
	}

	async on_overwriteQueryConfirmationModal_submit() {
		try {
			this.overwriteConfirmationControl.resolve( await this.overwriteQuery() );
		} catch( error ) {
			this.overwriteConfirmationControl.reject( error );
		} finally {
			this.$overwriteQueryConfirmationModal.modal( "hide" );
		}
	}

	async overwriteQuery():Promise<SPARQLQuery> {
		return this.disableInteractions( () =>
			this.savedQueryService.replace( this.queryBeingOverwritten, this.query )
		);
	}

	async on_savedQuery_select( query:SPARQLQuery ) {
		this.hideSidebar();

		if( this.queryBuilder.hasUnsavedChanges() ) {
			if( ! await this.getConfirmationForReplacement() ) {
				return;
			}
		}

		this.loadQuery( query );
	}

	getConfirmationForReplacement():Promise<boolean> {
		this.replaceQueryConfirmationControl = new ModalControl<boolean>();

		this.$replaceQueryConfirmationModal.modal( "show" );

		return this.replaceQueryConfirmationControl.promise;
	}

	on_replaceQueryConfirmationModal_cancel() {
		this.replaceQueryConfirmationControl.resolve( false );
		this.$replaceQueryConfirmationModal.modal( "hide" );
	}

	on_replaceQueryConfirmationModal_submit() {
		this.replaceQueryConfirmationControl.resolve( true );
		this.$replaceQueryConfirmationModal.modal( "hide" );
	}

	async on_savedQuery_delete( query:SPARQLQuery ) {
		if( await this.getConfirmationForDeletion() ) {
			await this.disableInteractions( () =>
				this.savedQueryService.delete( query )
			);

			// Was the current query the one that was deleted?
			if( this.query.id === query.id ) this.resetQuery();
		}
	}

	async getConfirmationForDeletion():Promise<boolean> {
		this.deleteQueryConfirmationControl = new ModalControl();

		this.$deleteQueryConfirmationModal.modal( "show" );

		return this.deleteQueryConfirmationControl.promise;
	}

	on_deleteQueryConfirmationModal_cancel() {
		this.deleteQueryConfirmationControl.resolve( false );
	}

	on_deleteQueryConfirmationModal_submit() {
		this.deleteQueryConfirmationControl.resolve( true );
	}

	loadQuery( query:SPARQLQuery ) {
		this.query = Object.assign( {}, query );
	}

	/**
	 * Executes the callback after disabling UI interactions and re-enables them after the callback finishes or errors out
	 * @param callback
	 */
	async disableInteractions<RESULT>( callback:() => RESULT ):Promise<RESULT> {
		this.isSending = true;
		try {
			const result = callback();

			if( result instanceof Promise ) return await result;
			else return result;
		} finally {
			this.isSending = false;
		}
	}

	resetQuery() {
		this.query = {
			endpoint: "",
			content: "",
		};
	}

	async on_response_load( response:SPARQLClientResponse ) {
		const query = Object.assign( {}, response.query );

		// Make the endpoint relative if it shares the platform's base
		const base = this.carbonldp.resolve( "" );
		query.endpoint = query.endpoint.startsWith( base )
			? query.endpoint.substring( base.length )
			: query.endpoint;

		// Delete name as the new configuration needs to be treated independently
		delete query.name;

		if( this.queryBuilder.hasUnsavedChanges() && ! isEqual( this.query, query ) ) {
			if( await this.getConfirmationForReplacement() ) {
				this.loadQuery( query );
			}
		} else {
			this.loadQuery( query );
		}
	}

	async on_response_rerun( originalResponse:SPARQLClientResponse ) {
		originalResponse.isReExecuting = true;
		let newResponse:SPARQLClientResponse;
		try {
			newResponse = await this.execute( originalResponse.query );
		} finally {
			originalResponse.isReExecuting = false;
		}

		// FIXME: Abstract to another method
		originalResponse.duration = newResponse.duration;
		originalResponse.resultset = Object.assign( {}, newResponse.resultset );
		originalResponse.setData = Object.assign( {}, newResponse.resultset );
		originalResponse.query = Object.assign( {}, newResponse.query );
	}

	async execute( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		// Copy the query to make the response a-temporal
		const _query = Object.assign( {}, query );
		// Remove its saved state
		delete _query.id;

		// Resolve the endpoint against Carbon LDP in case the endpoint is relative
		_query.endpoint = this.carbonldp.resolve( _query.endpoint );

		switch( _query.type ) {
			case SPARQLType.QUERY:
				return this.executeQuery( _query );
			case SPARQLType.UPDATE:
				return this.executeUPDATE( _query );
			default:
				throw this.getMessage( "Unsupported Operation" );
		}
	}

	// FIXME
	executeQuery( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		switch( query.operation ) {
			case QueryType.SELECT:
				return this.executeSELECT( query );
			case QueryType.DESCRIBE:
				return this.executeDESCRIBE( query );
			case QueryType.CONSTRUCT:
				return this.executeCONSTRUCT( query );
			case QueryType.ASK:
				return this.executeASK( query );
			default:
				// Unsupported Operation
				return Promise.reject( this.getMessage( "Unsupported Operation" ) );
		}
	}

	// FIXME
	executeSELECT( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		return SPARQLService.executeRawSELECTQuery( query.endpoint, query.content ).then(
			( [ result, response ]:[ SPARQLRawResults, Response ] ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return Promise.reject( this.handleError( error, query, beforeTimestamp ) );
			} );
	}

	executeDESCRIBE( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		let requestOptions:RequestOptions = { headers: new Map().set( "Accept", new Header( query.format ) ) };
		return SPARQLService.executeRawDESCRIBEQuery( query.endpoint, query.content, requestOptions ).then(
			( [ result, response ]:[ string, Response ] ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return Promise.reject( this.handleError( error, query, beforeTimestamp ) );
			} );
	}

	executeCONSTRUCT( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		let requestOptions:RequestOptions = { headers: new Map().set( "Accept", new Header( query.format ) ) };
		return SPARQLService.executeRawCONSTRUCTQuery( query.endpoint, query.content, requestOptions ).then(
			( [ result, response ]:[ string, Response ] ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return Promise.reject( this.handleError( error, query, beforeTimestamp ) );
			} );
	}

	executeASK( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		return SPARQLService.executeRawASKQuery( query.endpoint, query.content ).then(
			( [ result, response ]:[ SPARQLRawResults, Response ] ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return Promise.reject( this.handleError( error, query, beforeTimestamp ) );
			} );
	}

	executeUPDATE( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		return this.carbonldp.documents.$executeUPDATE( query.endpoint, query.content ).then(
			():SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				// return this.buildResponse( duration, (<XMLHttpRequest>result.request).status + " - " + (<XMLHttpRequest>result.request).statusText, <string> SPARQLResponseType.success, query );
				return this.buildResponse( duration, "200 - OK", <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return Promise.reject( this.handleError( error, query, beforeTimestamp ) );
			} );
	}

	onEmptyStack():void {
		this.responses = [];
	}

	onRemove( response:any ):void {
		let idx:number = this.responses.indexOf( response );
		if( idx > - 1 ) this.responses.splice( idx, 1 );
	}

	addResponse( response:SPARQLClientResponse ):void {
		let responsesLength:number = this.responses.length, i:number;
		for( i = responsesLength; i > 0; i -- ) {
			this.responses[ i ] = this.responses[ i - 1 ];
		}
		this.responses[ 0 ] = response;
	}

	closeMessage( evt:any ):void {
		$( evt.srcElement ).closest( ".ui.message" ).transition( "fade" );
	}

	getMessage( error:any ):Message {
		switch( typeof error ) {
			case "string":
				return <Message>{
					title: error,
					content: "",
					statusCode: "",
					statusMessage: "",
					endpoint: "",
					type: "error",
				};
			default:
				return ErrorMessageGenerator.getErrorMessage( error );
		}
	}

	buildResponse( duration:number, resultset:SPARQLRawResults | string | Message, responseType:string, query:SPARQLQuery ):SPARQLClientResponse {
		const clientResponse:SPARQLClientResponse = new SPARQLClientResponse();
		clientResponse.duration = duration;
		clientResponse.resultset = resultset;
		clientResponse.setData( resultset );
		clientResponse.query = query;
		clientResponse.result = responseType;
		return clientResponse;
	}

	handleError( error:Error | Errors.HTTPError, query:SPARQLQuery, beforeTimestamp:number ):SPARQLClientResponse | Message {
		let duration:number = (new Date()).valueOf() - beforeTimestamp;

		let errorMessage:Message = this.getMessage( error );
		let stackErrors:number[] = [ 400, 403, 404, 413, 414, 429 ];
		// TODO implement login modal when 401
		if( error instanceof Errors.HTTPError && stackErrors.indexOf( error.response.status ) > - 1 ) {
			return this.buildResponse( duration, errorMessage, SPARQLResponseType.error, query );
		}
		return errorMessage;
	}
}

import { Component, ElementRef, Input, Output, EventEmitter, OnInit, AfterViewInit } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { SPARQLRawResults } from "carbonldp/SPARQL/RawResults";
import { Response, Header, Errors } from "carbonldp/HTTP";

import { SPARQLResponseType, SPARQLFormats, SPARQLClientResponse, SPARQLQuery } from "./response/response.component";
import * as CodeMirrorComponent from "app/shared/code-mirror/code-mirror.component";
import { Message } from "app/shared/messages-area/message.component";
import { ErrorMessageGenerator } from "app/shared/messages-area/error/error-message-generator";

import * as $ from "jquery";
import "semantic-ui/semantic";


@Component( {
	selector: "cw-sparql-client",
	templateUrl: "./sparql-client.component.html",
	styleUrls: [ "./sparql-client.component.scss" ],
} )
export class SPARQLClientComponent implements OnInit, AfterViewInit {

	sparqlTypes:SPARQLTypes = <SPARQLTypes>{
		query: "Query",
		update: "Update",
	};
	sparqlQueryOperations:SPARQLQueryOperations = <SPARQLQueryOperations>{
		select: {
			name: "SELECT",
			formats: [
				{ value: SPARQLFormats.table, name: "Friendly Table" },
				// {value: SPARQLFormats.xml, name: "XML"},
				// {value: SPARQLFormats.csv, name: "CSV"},
				// {value: SPARQLFormats.tsv, name: "TSV"},
			],
		},
		describe: {
			name: "DESCRIBE",
			formats: [
				{ value: SPARQLFormats.jsonLD, name: "JSON-LD" },
				{ value: SPARQLFormats.turtle, name: "TURTLE" },
				{ value: SPARQLFormats.jsonRDF, name: "RDF/JSON" },
				{ value: SPARQLFormats.rdfXML, name: "RDF/XML" },
				{ value: SPARQLFormats.n3, name: "N3" },
			],
		},
		construct: {
			name: "CONSTRUCT",
			formats: [
				{ value: SPARQLFormats.jsonLD, name: "JSON-LD" },
				{ value: SPARQLFormats.turtle, name: "TURTLE" },
				{ value: SPARQLFormats.jsonRDF, name: "RDF/JSON" },
				{ value: SPARQLFormats.rdfXML, name: "RDF/XML" },
				{ value: SPARQLFormats.n3, name: "N3" },
			],
		},
		ask: {
			name: "ASK",
			formats: [
				{ value: SPARQLFormats.boolean, name: "Boolean" },
			],
		},
		update: {
			name: "UPDATE",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		},
		clear: {
			name: "CLEAR",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		},
		insert: {
			name: "INSERT",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		},
		"delete": {
			name: "DELETE",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		},
		drop: {
			name: "DROP",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		},
		load: {
			name: "LOAD",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		},
		create: {
			name: "CREATE",
			formats: [
				{ value: SPARQLFormats.text, name: "Text" },
			]
		}
	};

	isQueryType:boolean = true;
	isSending:boolean = false;
	isSaving:boolean = false;
	isCarbonContext:boolean = false;
	responses:SPARQLClientResponse[] = [];


	currentQuery:SPARQLQuery = <SPARQLQuery>{
		endpoint: "",
		type: this.sparqlTypes.query,
		content: "",
		operation: null,
		format: null,
		name: "",
	};
	askingQuery:SPARQLQuery = <SPARQLQuery>{
		endpoint: "",
		type: this.sparqlTypes.query,
		content: "",
		operation: null,
		format: null,
		name: "",
	};
	formatsAvailable:any = [];
	savedQueries:SPARQLQuery[] = [];
	messages:any[] = [];

	// Buttons
	btnsGroupSaveQuery:JQuery;
	btnSaveQuery:JQuery;
	btnSave:JQuery;
	btnSaveAs:JQuery;
	// Sidebar
	sidebar:JQuery;
	// Modals
	replaceQueryConfirmationModal:JQuery;
	deleteQueryConfirmationModal:JQuery;

	// Regex
	regExpSelect:RegExp = new RegExp( "((.|\n)+)?SELECT((.|\n)+)?", "i" );
	regExpConstruct:RegExp = new RegExp( "((.|\n)+)?CONSTRUCT((.|\n)+)?", "i" );
	regExpAsk:RegExp = new RegExp( "((.|\n)+)?ASK((.|\n)+)?", "i" );
	regExpDescribe:RegExp = new RegExp( "((.|\n)+)?DESCRIBE((.|\n)+)?", "i" );
	regExpURL:RegExp = new RegExp( "(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})" );
	regExpInsert:RegExp = new RegExp( "((.|\n)+)?INSERT((.|\n)+)?", "i" );
	regExpDelete:RegExp = new RegExp( "((.|\n)+)?DELETE((.|\n)+)?", "i" );
	regExpClear:RegExp = new RegExp( "((.|\n)+)?CLEAR((.|\n)+)?", "i" );
	regExpCreate:RegExp = new RegExp( "((.|\n)+)?CREATE((.|\n)+)?", "i" );
	regExpDrop:RegExp = new RegExp( "((.|\n)+)?DROP((.|\n)+)?", "i" );
	regExpLoad:RegExp = new RegExp( "((.|\n)+)?LOAD((.|\n)+)?", "i" );

	// Inputs and Outputs
	@Input() emitErrors:boolean = false;
	@Output() errorOccurs:EventEmitter<any> = new EventEmitter();

	private element:ElementRef;
	// TODO: Make them configurable
	private prefixes:{ [ prefix:string ]:string } = {
		"acl": "http://www.w3.org/ns/auth/acl#",
		"api": "http://purl.org/linked-data/api/vocab#",
		"c": "https://carbonldp.com/ns/v1/platform#",
		"cs": "https://carbonldp.com/ns/v1/security#",
		"cw": "https://carbonldp.com/ns/v1/patch#",
		"cc": "http://creativecommons.org/ns#",
		"cert": "http://www.w3.org/ns/auth/cert#",
		"dbp": "http://dbpedia.org/property/",
		"dc": "http://purl.org/dc/terms/",
		"dc11": "http://purl.org/dc/elements/1.1/",
		"dcterms": "http://purl.org/dc/terms/",
		"doap": "http://usefulinc.com/ns/doap#",
		"example": "http://example.org/ns#",
		"ex": "http://example.org/ns#",
		"exif": "http://www.w3.org/2003/12/exif/ns#",
		"fn": "http://www.w3.org/2005/xpath-functions#",
		"foaf": "http://xmlns.com/foaf/0.1/",
		"geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
		"geonames": "http://www.geonames.org/ontology#",
		"gr": "http://purl.org/goodrelations/v1#",
		"http": "http://www.w3.org/2006/http#",
		"ldp": "http://www.w3.org/ns/ldp#",
		"log": "http://www.w3.org/2000/10/swap/log#",
		"owl": "http://www.w3.org/2002/07/owl#",
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"rei": "http://www.w3.org/2004/06/rei#",
		"rsa": "http://www.w3.org/ns/auth/rsa#",
		"rss": "http://purl.org/rss/1.0/",
		"sd": "http://www.w3.org/ns/sparql-service-description#",
		"sfn": "http://www.w3.org/ns/sparql#",
		"sioc": "http://rdfs.org/sioc/ns#",
		"skos": "http://www.w3.org/2004/02/skos/core#",
		"swrc": "http://swrc.ontoware.org/ontology#",
		"types": "http://rdfs.org/sioc/types#",
		"vcard": "http://www.w3.org/2001/vcard-rdf/3.0#",
		"wot": "http://xmlns.com/wot/0.1/",
		"xhtml": "http://www.w3.org/1999/xhtml#",
		"xsd": "http://www.w3.org/2001/XMLSchema#",
	};
	private $element:JQuery;
	private carbonldp:CarbonLDP;
	private _sparql:string = "";
	private _endpoint:string = "";

	// Getters and Setters
	get codeMirrorMode():typeof CodeMirrorComponent.Mode { return CodeMirrorComponent.Mode; }

	get sparql():string { return this._sparql; }

	set sparql( value:string ) {
		this._sparql = value;
		this.currentQuery.content = value;
		this.sparqlChanged();
	}

	get endpoint():string { return this._endpoint; }

	set endpoint( value:string ) {
		this._endpoint = value;
		this.endpointChanged();
	}

	constructor( element:ElementRef, carbonldp:CarbonLDP ) {
		this.element = element;
		this.isSending = false;
		this.savedQueries = this.getLocalSavedQueries() || [];
		this.carbonldp = carbonldp;
	}

	ngOnInit():void {
		this.isCarbonContext = true;
		this.currentQuery.endpoint = this.carbonldp.baseURI;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.btnSaveQuery = this.$element.find( ".btnSaveQuery" );
		this.btnsGroupSaveQuery = this.$element.find( ".btnsGroupSaveQuery" );
		this.btnSave = this.btnsGroupSaveQuery.find( ".btnSave" );
		this.btnSaveAs = this.btnsGroupSaveQuery.find( ".btnSaveAs" );
		this.sidebar = this.$element.find( ".query-builder .ui.sidebar" );
		this.btnsGroupSaveQuery.find( ".dropdown" ).dropdown();
		this.replaceQueryConfirmationModal = this.$element.find( ".ui.replace-query-confirmation.modal" );
		this.deleteQueryConfirmationModal = this.$element.find( ".ui.delete-query-confirmation.modal" );
		this.initializeSavedQueriesSidebar();
		this.initializeModal();
	}

	onChangeQueryType( $event:JQueryEventObject ):void {
		let type:string = (<HTMLInputElement>$event.target).value;
		this.isQueryType = type === this.sparqlTypes.query;
	}

	/**
	 * Updates the currentQuery and the available formats depending on the SPARQL Query Operation
	 * Triggered whenever the user writes code inside the CodeMirror text area.
	 */
	sparqlChanged():void {
		let operation:string = this.getSPARQLOperation( this.sparql );
		if( operation !== null && this.sparqlQueryOperations[ operation.toLowerCase() ] ) {
			operation = operation.toLowerCase();
			this.formatsAvailable = this.sparqlQueryOperations[ operation ].formats;
			if( this.formatsAvailable.indexOf( this.currentQuery.format ) === - 1 ) {
				this.currentQuery.format = this.sparqlQueryOperations[ operation ].formats[ 0 ].value;
			}
			this.currentQuery.type = this.sparqlTypes.query;
			let queryOperations:string[] = [ "select", "describe", "construct", "ask" ];
			if( queryOperations.indexOf( operation ) === - 1 ) this.currentQuery.type = this.sparqlTypes.update;
			this.currentQuery.operation = operation.toUpperCase();
		} else {
			this.currentQuery.format = null;
			this.currentQuery.operation = "update";
			this.formatsAvailable = <any>[];
		}
	}

	/**
	 * Updates the currentQuery endpoints according to the context in which the editor is working.
	 * Triggered whenever the user writes the endpoint URI.
	 */
	endpointChanged():void {
		if( this.regExpURL.test( this.endpoint ) ) {
			this.currentQuery.endpoint = this.endpoint;
		} else {
			this.currentQuery.endpoint = this.carbonldp.baseURI + this.endpoint;
		}
	}

	/**
	 * Identifies which SPARL Query Operation will be called
	 * @param query  String. The content of the Code Mirror plugin.
	 * @returns      String. The name of the main SPARQL Query Operation.
	 */
	getSPARQLOperation( query:string ):string {
		switch( true ) {
			case (this.regExpConstruct.test( query )):
				return this.sparqlQueryOperations.construct.name;
			case (this.regExpAsk.test( query )):
				return this.sparqlQueryOperations.ask.name;
			case (this.regExpSelect.test( query )):
				return this.sparqlQueryOperations.select.name;
			case (this.regExpDescribe.test( query )):
				return this.sparqlQueryOperations.describe.name;
			case (this.regExpInsert.test( query )):
				return this.sparqlQueryOperations.insert.name;
			case (this.regExpDelete.test( query )):
				return this.sparqlQueryOperations.delete.name;
			case (this.regExpClear.test( query )):
				return this.sparqlQueryOperations.clear.name;
			case (this.regExpCreate.test( query )):
				return this.sparqlQueryOperations.create.name;
			case (this.regExpDrop.test( query )):
				return this.sparqlQueryOperations.drop.name;
			case (this.regExpLoad.test( query )):
				return this.sparqlQueryOperations.load.name;
			default:
				return null;
		}
	}

	onReExecute( originalResponse:SPARQLClientResponse ):void {
		originalResponse.isReExecuting = true;
		this.execute( originalResponse.query, originalResponse ).then(
			( newResponse:SPARQLClientResponse ) => {
				originalResponse.duration = newResponse.duration;
				originalResponse.resultset = Object.assign( {}, newResponse.resultset );
				originalResponse.setData = Object.assign( {}, newResponse.resultset );
				originalResponse.query = Object.assign( {}, newResponse.query );
				originalResponse.isReExecuting = false;
			}
		).catch(
			( error:any ) => {
				originalResponse.isReExecuting = false;
				throw error;
			}
		);
	}

	onExecute():void {
		this.isSending = true;
		let query:SPARQLQuery = Object.assign( {}, this.currentQuery );

		this.execute( query, null ).then(
			( response:SPARQLClientResponse ) => {
				this.addResponse( response );
				return response;
			}
		).catch(
			( error:any ) => {
				if( this.emitErrors ) {
					this.errorOccurs.emit( this.getMessage( error ) );
				} else {
					this.messages.push( this.getMessage( error ) );
				}
			} );
	}

	onErase():void {
		this.currentQuery.type = this.sparqlTypes.query;
		this.sparql = "";
		this.endpoint = "";
	}

	execute( query:SPARQLQuery, activeResponse?:SPARQLClientResponse ):Promise<SPARQLClientResponse> {
		let type:string = query.type;
		if( activeResponse ) {
			query = activeResponse.query;
		}
		let promise:Promise<SPARQLClientResponse> = null;
		switch( type ) {
			case this.sparqlTypes.query:
				promise = this.executeQuery( query );
				break;
			case this.sparqlTypes.update:
				promise = this.executeUPDATE( query );
				break;
			default:
				// Unsupported Operation
				promise = new Promise( ( resolve, reject ) => {
					reject( "Unsupported Type" );
				} );
		}

		return promise.then(
			( response:SPARQLClientResponse ) => {
				// Response Success
				this.isSending = false;
				return response;
			},
			( error:any ) => {
				// Response Fail
				this.isSending = false;
				return Promise.reject( error );
			}
		);
	}

	executeQuery( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		this.isSending = true;
		switch( query.operation ) {
			case this.sparqlQueryOperations.select.name:
				return this.executeSELECT( query );
			case this.sparqlQueryOperations.describe.name:
				return this.executeDESCRIBE( query );
			case this.sparqlQueryOperations.construct.name:
				return this.executeCONSTRUCT( query );
			case this.sparqlQueryOperations.ask.name:
				return this.executeASK( query );
			default:
				// Unsupported Operation
				return Promise.reject<SPARQLClientResponse>( "Unsupported Operation" );
		}
	}

	executeSELECT( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		return this.carbonldp.documents.executeRawSELECTQuery( query.endpoint, query.content ).then(
			( result:SPARQLRawResults ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return this.handleError( error, query, beforeTimestamp );
			} );
	}

	executeDESCRIBE( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		let requestOptions:Request.Options = { headers: new Map().set( "Accept", new Header( query.format ) ) };
		return this.carbonldp.documents.executeRawDESCRIBEQuery( query.endpoint, query.content, requestOptions ).then(
			( result:string ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return this.handleError( error, query, beforeTimestamp );
			} );
	}

	executeCONSTRUCT( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		let requestOptions:Request.Options = { headers: new Map().set( "Accept", new Header( query.format ) ) };
		return this.carbonldp.documents.executeRawCONSTRUCTQuery( query.endpoint, query.content, requestOptions ).then(
			( result:string ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return this.handleError( error, query, beforeTimestamp );
			} );
	}

	executeASK( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		let beforeTimestamp:number = (new Date()).valueOf();
		return this.carbonldp.documents.executeRawASKQuery( query.endpoint, query.content ).then(
			( result:SPARQLRawResults ):SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				return this.buildResponse( duration, result, <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return this.handleError( error, query, beforeTimestamp );
			} );
	}

	executeUPDATE( query:SPARQLQuery ):Promise<SPARQLClientResponse> {
		this.isSending = true;
		let beforeTimestamp:number = (new Date()).valueOf();
		return this.carbonldp.documents.executeUPDATE( query.endpoint, query.content ).then(
			():SPARQLClientResponse => {
				let duration:number = (new Date()).valueOf() - beforeTimestamp;
				// return this.buildResponse( duration, (<XMLHttpRequest>result.request).status + " - " + (<XMLHttpRequest>result.request).statusText, <string> SPARQLResponseType.success, query );
				return this.buildResponse( duration, "200 - OK", <string> SPARQLResponseType.success, query );
			},
			( error:Errors.HTTPError ):Promise<SPARQLClientResponse> => {
				return this.handleError( error, query, beforeTimestamp );
			} );
	}

	canExecute():boolean {
		return ! ! (this.currentQuery.type && this.currentQuery.content && this.currentQuery.operation && this.currentQuery.format);
	}

	canSaveQuery():boolean {
		return ! ! (this.currentQuery.type && this.currentQuery.content && this.currentQuery.operation && this.currentQuery.format && this.currentQuery.name);
	}

	canErase():boolean {
		return (! ! this.endpoint || ! ! this.sparql);
	}

	onEmptyStack():void {
		this.responses = [];
	}

	onRemove( response:any ):void {
		let idx:number = this.responses.indexOf( response );
		if( idx > - 1 ) this.responses.splice( idx, 1 );
	}

	onConfigureResponse( response:SPARQLClientResponse ):void {
		let configureQuery:SPARQLQuery = this.askingQuery = Object.assign( {}, response.query );
		if( JSON.stringify( this.currentQuery ) !== JSON.stringify( configureQuery ) ) {
			this.toggleReplaceQueryConfirmationModal();
		} else {
			this.loadQuery( configureQuery );
		}
	}

	addResponse( response:SPARQLClientResponse ):void {
		let responsesLength:number = this.responses.length, i:number;
		for( i = responsesLength; i > 0; i -- ) {
			this.responses[ i ] = this.responses[ i - 1 ];
		}
		this.responses[ 0 ] = response;
	}

	onClickSaveQuery():void {
		let query:SPARQLQuery = <SPARQLQuery>{
			endpoint: this.currentQuery.endpoint,
			type: this.currentQuery.type,
			content: this.currentQuery.content,
			operation: this.currentQuery.operation,
			format: this.currentQuery.format,
			name: this.currentQuery.name,
			id: this.savedQueries.length,
		};
		this.isSaving = true;
		this.savedQueries = this.getLocalSavedQueries();
		this.savedQueries.push( query );
		this.updateLocalSavedQueries();
		setInterval( () => {
			this.isSaving = false;
		}, 500 );
	}

	onClickSaveExistingQuery():void {
		this.savedQueries = this.getLocalSavedQueries();
		let queryIdx:number = - 1;
		this.savedQueries.forEach( ( iteratingQuery:SPARQLQuery, index:number ) => {
			if( iteratingQuery.id === this.currentQuery.id ) {
				queryIdx = index;
			}
		} );
		if( queryIdx > - 1 ) {
			this.savedQueries[ queryIdx ] = <SPARQLQuery> {
				endpoint: this.currentQuery.endpoint,
				type: this.currentQuery.type,
				content: this.currentQuery.content,
				operation: this.currentQuery.operation,
				format: this.currentQuery.format,
				name: this.currentQuery.name,
				id: this.currentQuery.id,
			};
		} else {
			this.currentQuery.id = this.savedQueries.length;
			this.savedQueries.push( this.currentQuery );
		}
		this.updateLocalSavedQueries();
	}

	onClickSavedQuery( selectedQuery:SPARQLQuery ):void {
		if( ! ! this.currentQuery.endpoint || ! ! this.currentQuery.content ) {
			if( ! ! this.currentQuery.endpoint && ! ! this.currentQuery.content ) {
				if( JSON.stringify( this.currentQuery ) !== JSON.stringify( selectedQuery ) ) {
					this.askConfirmationToReplace( selectedQuery );
				} else {
					this.loadQuery( selectedQuery );
					this.toggleSidebar();
				}
			} else {
				if( (! ! this.currentQuery.endpoint && this.currentQuery.endpoint === selectedQuery.endpoint) ||
					(! ! this.currentQuery.content && this.currentQuery.content === selectedQuery.content) ) {
					this.loadQuery( selectedQuery );
					this.toggleSidebar();
				} else {
					this.askConfirmationToReplace( selectedQuery );
				}
			}

		} else {
			this.loadQuery( selectedQuery );
			this.toggleSidebar();
		}
	}

	askConfirmationToReplace( selectedQuery:SPARQLQuery ):void {
		this.askingQuery = Object.assign( {}, selectedQuery );
		this.toggleReplaceQueryConfirmationModal();
	}

	onClickRemoveSavedQuery( index:number ):void {
		this.savedQueries = this.getLocalSavedQueries();
		this.askingQuery = this.savedQueries[ index ];
		this.toggleDeleteQueryConfirmationModal();
	}

	removeQuery( query:SPARQLQuery ):void {
		this.savedQueries = this.getLocalSavedQueries();
		let index:number = this.savedQueries.indexOf( query );
		this.savedQueries.splice( index, 1 );
		this.updateLocalSavedQueries();
	}

	loadQuery( query:SPARQLQuery ):void {
		this.currentQuery = Object.assign( {}, query );
		this.askingQuery = Object.assign( {}, query );
		this.endpoint = query.endpoint;
		this.sparql = query.content;
	}

	initializeSavedQueriesSidebar():void {
		this.sidebar.sidebar( {
			context: this.$element.find( ".query-builder .pushable" ),
		} );
	}

	initializeModal():void {
		this.deleteQueryConfirmationModal.modal( {
			closable: false,
			blurring: true,
		} );
		this.replaceQueryConfirmationModal.modal( {
			closable: false,
			blurring: true,
		} );
	}

	toggleReplaceQueryConfirmationModal():void {
		this.replaceQueryConfirmationModal.modal( "toggle" );
	}

	toggleDeleteQueryConfirmationModal():void {
		this.deleteQueryConfirmationModal.modal( "toggle" );
	}

	onApproveQueryReplacement( approvedQuery:SPARQLQuery ):void {
		this.askingQuery = <SPARQLQuery>{};
		this.loadQuery( approvedQuery );
		this.hideSidebar();
	}

	onApproveQueryRemoval( approvedQuery:SPARQLQuery ):void {
		this.removeQuery( approvedQuery );
		this.askingQuery = <SPARQLQuery>{};
	}

	getLocalSavedQueries():SPARQLQuery[] {
		if( ! window.localStorage.getItem( "savedQueries" ) )
			this.updateLocalSavedQueries();
		return <SPARQLQuery[]>JSON.parse( window.localStorage.getItem( "savedQueries" ) );
	}

	updateLocalSavedQueries():void {
		window.localStorage.setItem( "savedQueries", JSON.stringify( this.savedQueries ) );
	}

	toggleSidebar():void {
		this.sidebar.sidebar( "toggle" );
	}

	hideSidebar():void {
		this.sidebar.sidebar( "hide" );
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
		let clientResponse:SPARQLClientResponse = new SPARQLClientResponse();
		clientResponse.duration = duration;
		clientResponse.resultset = resultset;
		clientResponse.setData( resultset );
		clientResponse.query = query;
		clientResponse.result = responseType;
		return clientResponse;
	}

	handleError( error:Errors.HTTPError, query:SPARQLQuery, beforeTimestamp:number ):Promise<SPARQLClientResponse> {
		let duration:number = (new Date()).valueOf() - beforeTimestamp;
		return new Promise<SPARQLClientResponse>(
			( resolve, reject ) => {
				let stackErrors:number[] = [ 400, 403, 404, 413, 414, 429 ];
				// TODO implement login modal when 401
				if( stackErrors.indexOf( error.response.status ) > - 1 ) {
					let errorMessage:Message = this.getMessage( error );
					let errorResponse:SPARQLClientResponse = this.buildResponse( duration, errorMessage, <string> SPARQLResponseType.error, query );
					resolve( errorResponse );
				} else {
					reject( error );
				}
			}
		).then(
			( response:SPARQLClientResponse ) => {
				return response;
			},
			( _error:Errors.HTTPError ) => {
				return Promise.reject( _error );
			}
		);
	}
}

export interface SPARQLQueryOperationFormat {
	name:string;
	value:string;
}

export interface SPARQLQueryOperation {
	name:string;
	formats:SPARQLQueryOperationFormat[];
}

export interface SPARQLQueryOperations {
	select:SPARQLQueryOperation;
	describe:SPARQLQueryOperation;
	construct:SPARQLQueryOperation;
	ask:SPARQLQueryOperation;
	insert:SPARQLQueryOperation;
	"delete":SPARQLQueryOperation;
	clear:SPARQLQueryOperation;
	create:SPARQLQueryOperation;
	drop:SPARQLQueryOperation;
	load:SPARQLQueryOperation;
}

export interface SPARQLTypes {
	query:string;
	update:string;
}

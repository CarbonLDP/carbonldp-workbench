import { Component, ElementRef, Input, Output, EventEmitter, SimpleChange, ViewChild, AfterViewInit, OnChanges } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as RDFNode from "carbonldp/RDF/Node";
import * as RDFDocument from "carbonldp/RDF/Document";
import * as JSONLDParser from "carbonldp/JSONLD/Parser";
import { Error as HTTPError } from "carbonldp/HTTP/Errors";

import { DocumentsResolverService } from "../documents-resolver.service";
import { RootRecords } from "../document-resource/document-resource.component";
import { BlankNodesComponent, BlankNodesRecords } from "../blank-nodes/blank-nodes.component";
import { NamedFragmentsComponent, NamedFragmentsRecords } from "../named-fragments/named-fragments.component";
import { BlankNodeRow } from "../blank-nodes/blank-node.component";
import { NamedFragmentRow } from "../named-fragments/named-fragment.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-document-viewer",
	host: { "[class.ui]": "true", "[class.basic]": "true", "[class.segment]": "true", },
	templateUrl: "./document-viewer.component.html",
	styleUrls: [ "./document-viewer.component.scss" ],
} )

export class DocumentViewerComponent implements AfterViewInit, OnChanges {
	carbon:Carbon;
	element:ElementRef;
	$element:JQuery;
	$successMessage:JQuery;
	successMessageContent:string = "";

	sections:string[] = [ "bNodes", "namedFragments", "documentResource" ];
	rootNode:RDFNode.Class;
	bNodes:BlankNodeRow[] = [];
	namedFragments:NamedFragmentRow[] = [];
	documentURI:string = "";

	rootNodeHasChanged:boolean = false;
	rootNodeRecords:RootRecords;
	bNodesHaveChanged:boolean = false;
	bNodesChanges:BlankNodesRecords;
	namedFragmentsHaveChanged:boolean = false;
	namedFragmentsChanges:NamedFragmentsRecords;

	get documentContentHasChanged() {
		return this.rootNodeHasChanged || this.bNodesHaveChanged || this.namedFragmentsHaveChanged;
	}


	documentsResolverService:DocumentsResolverService;
	@Input() uri:string;
	@Input() displaySuccessMessage:EventEmitter<string> = new EventEmitter<string>();
	private _document:RDFDocument.Class;
	@Input()
	set document( value:RDFDocument.Class ) {
		this._document = value;
		this.receiveDocument( value );
	}

	get document():RDFDocument.Class {return this._document;}


	@Output() onError:EventEmitter<HTTPError> = new EventEmitter<HTTPError>();
	@Output() onOpenNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onRefreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onLoadingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSavingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onRefreshDocument:EventEmitter<string> = new EventEmitter<string>();

	@ViewChild( BlankNodesComponent ) documentBNodes:BlankNodesComponent;
	@ViewChild( NamedFragmentsComponent ) documentNamedFragments:NamedFragmentsComponent;

	private _savingDocument:boolean = false;
	set savingDocument( value:boolean ) {
		this._savingDocument = value;
		this.onSavingDocument.emit( value );
	}

	get savingDocument():boolean { return this._savingDocument; }

	private _loadingDocument:boolean = false;
	set loadingDocument( value:boolean ) {
		this._loadingDocument = value;
		this.onLoadingDocument.emit( value );
	}

	get loadingDocument():boolean { return this._loadingDocument; }


	constructor( element:ElementRef, carbon:Carbon, documentsResolverService:DocumentsResolverService ) {
		this.element = element;
		this.carbon = carbon;
		this.documentsResolverService = documentsResolverService;
	}


	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$successMessage = this.$element.find( ".success.message" );
		this.displaySuccessMessage.subscribe( ( content:string ) => {
			this.showSuccessMessage( content, 2500 );
		} );
	}

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {

		// In case the DocumentViewer is used by passing a URI, it can make the call to resolve the URI by itself
		if( changes[ "uri" ] && ! ! changes[ "uri" ].currentValue && changes[ "uri" ].currentValue !== changes[ "uri" ].previousValue ) {
			this.loadingDocument = true;
			this.getDocument( this.uri ).then( ( document:RDFDocument.Class ) => {
				this.document = document[ 0 ];
			} );
		}
	}

	receiveDocument( document:RDFDocument.Class ):void {
		if( ! document ) return;
		this.loadingDocument = true;
		this.setRoot();
		this.generateFragments();
		this.clearDocumentChanges();
		this.documentURI = this.document[ "@id" ];

		setTimeout( () => {
			this.loadingDocument = false;
			this.goToSection( "documentResource" );
			this.initializeTabs();
		}, 1 );
	}

	setRoot():void {
		this.rootNode = RDFDocument.Util.getDocumentResources( this.document )[ 0 ];
	}

	getDocument( uri:string ):Promise<RDFDocument.Class> {
		return this.documentsResolverService.get( uri ).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
		} );
	}

	generateFragments():void {
		this.bNodes = RDFDocument.Util.getBNodeResources( this.document ).map(
			( bNode:RDFNode.Class ) => {
				return {
					id: bNode[ "@id" ],
					copy: bNode
				}
			} );
		this.namedFragments = RDFDocument.Util.getFragmentResources( this.document ).map( ( namedFragment:RDFNode.Class ) => {
			return {
				id: namedFragment[ "@id" ],
				name: namedFragment[ "@id" ],
				copy: namedFragment
			}
		} );
	}

	openBlankNode( id:string ):void {
		this.documentBNodes.openBlankNode( id );
		this.goToSection( "bNodes" );
	}

	openNamedFragment( id:string ):void {
		this.documentNamedFragments.openNamedFragment( id );
		this.goToSection( "namedFragments" );
	}

	initializeTabs() {
		this.$element.find( ".secondary.menu.document.tabs .item" ).tab();
	}

	goToSection( section:string ):void {
		if( this.sections.indexOf( section ) === - 1 || this.loadingDocument ) return;
		this.scrollTo( ">div:first-child" );
		this.$element.find( ".secondary.menu.document.tabs .item" ).tab( "changeTab", section );
	}

	registerRootNodeChanges( records:RootRecords ):void {
		this.rootNodeRecords = records;
		this.rootNodeHasChanged = records.changes.size > 0 || records.additions.size > 0 || records.deletions.size > 0;
	}

	registerBlankNodesChanges( bNodeChanges:BlankNodesRecords ):void {
		this.bNodesChanges = bNodeChanges;
		this.bNodesHaveChanged = bNodeChanges.changes.size > 0 || bNodeChanges.additions.size > 0 || bNodeChanges.deletions.size > 0;
	}

	registerNamedFragmentsChanges( namedFragmentsChanges:NamedFragmentsRecords ):void {
		this.namedFragmentsChanges = namedFragmentsChanges;
		this.namedFragmentsHaveChanged = namedFragmentsChanges.changes.size > 0 || namedFragmentsChanges.additions.size > 0 || namedFragmentsChanges.deletions.size > 0;
	}

	modifyRootNodeWithChanges( rootNode:RDFNode.Class ):void {
		if( ! ! this.rootNodeRecords ) {
			this.rootNodeRecords.deletions.forEach( ( property, key ) => {
				delete rootNode[ key ];
			} );
			this.rootNodeRecords.changes.forEach( ( property, key ) => {
				if( property.modified.id !== property.modified.name ) {
					delete rootNode[ key ];
					rootNode[ property.modified.name ] = property.modified.value;
				} else {
					rootNode[ key ] = property.modified.value;
				}
			} );
			this.rootNodeRecords.additions.forEach( ( property, key ) => {
				rootNode[ key ] = property.added.value;
			} );

		}
	}

	modifyBNodesWithChanges( document:RDFDocument.Class ):void {
		let tempIdx:number;
		if( ! this.bNodesChanges ) return;
		this.bNodesChanges.deletions.forEach( ( blankNodeRow:BlankNodeRow, bNodeId ) => {
			tempIdx = document[ "@graph" ].findIndex( (bNode => { return bNode[ "@id" ] === bNodeId }) );
			document[ "@graph" ].splice( tempIdx, 1 );
		} );
		tempIdx = - 1;
		this.bNodesChanges.changes.forEach( ( blankNodeRow:BlankNodeRow, bNodeId ) => {
			tempIdx = document[ "@graph" ].findIndex( (bNode => { return bNode[ "@id" ] === bNodeId }) );
			document[ "@graph" ][ tempIdx ] = blankNodeRow.modified;
		} );
		this.bNodesChanges.additions.forEach( ( blankNodeRow:BlankNodeRow, bNodeId ) => {
			document[ "@graph" ].push( blankNodeRow.added );
		} );
	}

	modifyNamedFragmentsWithChanges( document:RDFDocument.Class ):void {
		let tempIdx:number;
		if( ! this.namedFragmentsChanges ) return;
		this.namedFragmentsChanges.deletions.forEach( ( namedFragmentRow:NamedFragmentRow, namedFragmentId ) => {
			tempIdx = document[ "@graph" ].findIndex( (namedFragment => { return namedFragment[ "@id" ] === namedFragmentId }) );
			document[ "@graph" ].splice( tempIdx, 1 );
		} );
		tempIdx = - 1;
		this.namedFragmentsChanges.changes.forEach( ( namedFragmentRow:NamedFragmentRow, namedFragmentId ) => {
			tempIdx = document[ "@graph" ].findIndex( (namedFragment => { return namedFragment[ "@id" ] === namedFragmentId }) );
			document[ "@graph" ][ tempIdx ] = namedFragmentRow.modified;
		} );
		this.namedFragmentsChanges.additions.forEach( ( namedFragmentRow:NamedFragmentRow, namedFragmentId ) => {
			document[ "@graph" ].push( namedFragmentRow.added );
		} );
	}

	clearDocumentChanges():void {
		this.rootNodeRecords = new RootRecords();
		this.bNodesChanges = new BlankNodesRecords();
		this.namedFragmentsChanges = new BlankNodesRecords();
		this.rootNodeHasChanged = false;
		this.bNodesHaveChanged = false;
		this.namedFragmentsHaveChanged = false;
	}

	saveDocument():void {
		this.savingDocument = true;
		let backupDocument:RDFDocument.Class = JSON.parse( JSON.stringify( this.document ) );
		let backupRootNode:RDFNode.Class = RDFDocument.Util.getDocumentResources( backupDocument )[ 0 ];
		this.modifyRootNodeWithChanges( backupRootNode );
		this.modifyBNodesWithChanges( backupDocument );
		this.modifyNamedFragmentsWithChanges( backupDocument );
		let body:string = JSON.stringify( backupDocument, null, "\t" );
		this.documentsResolverService.update( backupDocument[ "@id" ], body ).then(
			( updatedDocument:RDFDocument.Class ) => {
				this.document = updatedDocument;
				this.showSuccessMessage( "<p>Changes saved successfully</p>", 4500 );
			}
		).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
		} ).then( () => {
			this.savingDocument = false;
			this.rootNodeHasChanged = this.rootNodeRecords.changes.size > 0 || this.rootNodeRecords.additions.size > 0 || this.rootNodeRecords.deletions.size > 0;
			this.bNodesHaveChanged = this.bNodesChanges.changes.size > 0 || this.bNodesChanges.additions.size > 0 || this.bNodesChanges.deletions.size > 0;
			this.namedFragmentsHaveChanged = this.namedFragmentsChanges.changes.size > 0 || this.namedFragmentsChanges.additions.size > 0 || this.namedFragmentsChanges.deletions.size > 0;
		} );
	}

	getErrors( error:HTTPError ):Promise<any[]> {
		let parser:JSONLDParser.Class = new JSONLDParser.Class();
		let mainError = {};
		let errors:any[] = [];
		return parser.parse( error.response.data ).then( ( mainErrors ) => {
			mainError = mainErrors.find( ( error ) => { return error[ "@type" ].indexOf( "https://carbonldp.com/ns/v1/platform#ErrorResponse" ) !== - 1} );
			errors = mainErrors.filter( ( error ) => { return error[ "@type" ].indexOf( "https://carbonldp.com/ns/v1/platform#Error" ) !== - 1} );
			return errors;
		} );
	}

	closeMessage( message:HTMLElement ):void {
		$( message ).transition( "fade" );
	}

	showSuccessMessage( content:string, timeout?:number ):void {
		this.successMessageContent = content;
		this.$successMessage.transition( {
			onComplete: () => {
				setTimeout( () => {
					if( ! this.$successMessage.hasClass( "hidden" ) ) this.$successMessage.transition( "fade" );
					this.successMessageContent = "";
				}, typeof timeout !== "undefined" ? timeout : 2500 );
			}
		} );
	}

	private beforeRefreshDocument( documentURI:string ):void {
		if( this.documentContentHasChanged ) this.toggleConfirmRefresh();
		else this.refreshDocument( documentURI );
	}

	public refreshDocument( documentURI:string ):void {
		this.onRefreshDocument.emit( documentURI );
		this.$element.find( ".unsaved.prompt.message" ).transition( { animation: "fade" } ).transition( "hide" );
	}

	public toggleConfirmRefresh():void {
		this.$element.find( ".unsaved.prompt.message" ).transition( { animation: "fade" } );
	}


	private scrollTo( selector:string ):void {
		if( ! this.$element ) return;
		let divPosition:JQueryCoordinates = this.$element.find( selector ).position();
		if( ! divPosition ) return;
		this.$element.animate( { scrollTop: divPosition.top }, "fast" );
	}
}


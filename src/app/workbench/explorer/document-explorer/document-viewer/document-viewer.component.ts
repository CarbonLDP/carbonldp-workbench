import { Component, ElementRef, Input, Output, EventEmitter, SimpleChange, ViewChild, AfterViewInit, OnChanges } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { RDFNode } from "carbonldp/RDF/Node"
import { RDFDocument } from "carbonldp/RDF/Document";
import { HTTPError } from "carbonldp/HTTP/Errors";

import { DocumentsResolverService } from "../documents-resolver.service";
import { JsonLDKeyword, ResourceRecords } from "../document-explorer-library";
import { BlankNodesComponent, BlankNodesRecords } from "../blank-nodes/blank-nodes.component";
import { NamedFragmentsComponent, NamedFragmentsRecords } from "../named-fragments/named-fragments.component";
import { BlankNodeStatus } from "../blank-nodes/blank-node.component";
import { NamedFragmentStatus } from "../named-fragments/named-fragment.component";


/*
*   Contains and displays the contents of a @graph (Document, Blank Nodes and Fragments)
* */
@Component( {
	selector: "cw-document-viewer",
	host: { "[class.ui]": "true", "[class.basic]": "true", "[class.segment]": "true", },
	templateUrl: "./document-viewer.component.html",
	styleUrls: [ "./document-viewer.component.scss" ],
} )

export class DocumentViewerComponent implements AfterViewInit, OnChanges {
	carbonldp:CarbonLDP;
	element:ElementRef;
	$element:JQuery;
	$successMessage:JQuery;
	successMessageContent:string = "";

	sections:string[] = [ "blankNodes", "namedFragments", "documentResource" ];
	rootNode:RDFNode;
	blankNodes:BlankNodeStatus[] = [];
	namedFragments:NamedFragmentStatus[] = [];
	documentURI:string = "";


	rootNodeRecords:ResourceRecords = new ResourceRecords();
	blankNodesChanges:BlankNodesRecords = new BlankNodesRecords();
	namedFragmentsChanges:NamedFragmentsRecords = new NamedFragmentsRecords();

	get rootNodeHasChanged():boolean { return this.rootNodeRecords.changes.size > 0 || this.rootNodeRecords.additions.size > 0 || this.rootNodeRecords.deletions.size > 0; }

	get blankNodesHaveChanged():boolean { return this.blankNodesChanges.changes.size > 0 || this.blankNodesChanges.additions.size > 0 || this.blankNodesChanges.deletions.size > 0; }

	get namedFragmentsHaveChanged():boolean { return this.namedFragmentsChanges.changes.size > 0 || this.namedFragmentsChanges.additions.size > 0 || this.namedFragmentsChanges.deletions.size > 0; }

	get documentContentHasChanged() { return this.rootNodeHasChanged || this.blankNodesHaveChanged || this.namedFragmentsHaveChanged; }


	documentsResolverService:DocumentsResolverService;
	@Input() uri:string;
	@Input() displaySuccessMessage:EventEmitter<string> = new EventEmitter<string>();
	private _document:RDFDocument;
	@Input() set document( value:RDFDocument ) {
		this._document = value;
		this.receiveDocument( value );
	}

	get document():RDFDocument {return this._document;}


	@Output() onError:EventEmitter<HTTPError> = new EventEmitter<HTTPError>();
	@Output() onOpenNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onRefreshNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onLoadingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSavingDocument:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onRefreshDocument:EventEmitter<string> = new EventEmitter<string>();

	@ViewChild( BlankNodesComponent ) documentBlankNodes:BlankNodesComponent;
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


	constructor( element:ElementRef, carbonldp:CarbonLDP, documentsResolverService:DocumentsResolverService ) {
		this.element = element;
		this.carbonldp = carbonldp;
		this.documentsResolverService = documentsResolverService;
	}


	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.$successMessage = this.$element.find( ".success.message" );
		this.displaySuccessMessage.subscribe( ( content:string ) => {
			this.showSuccessMessage( content, 2500 );
		} );
	}

	ngOnChanges( changes:{ [ propName:string ]:SimpleChange } ):void {

		// In case the DocumentViewer is used by passing a URI, it can make the call to resolve the URI by itself
		if( changes[ "uri" ] && ! ! changes[ "uri" ].currentValue && changes[ "uri" ].currentValue !== changes[ "uri" ].previousValue ) {
			this.loadingDocument = true;
			this.getDocument( this.uri ).then( ( document:RDFDocument ) => {
				this.document = document;
			} );
		}
	}

	/*
	*   Prepares the changes to properly display the new
	*   document contents by:
    *   1) setting a new root
    *   2) obtaining the fragments of the document
    *   3) clearing the old changes
	* */
	receiveDocument( document:RDFDocument ):void {
		if( ! document ) return;
		this.loadingDocument = true;
		this.setRoot();
		this.generateFragments();
		this.clearDocumentChanges();
		this.documentURI = this.document[ JsonLDKeyword.ID ];

		setTimeout( () => {
			this.loadingDocument = false;
			this.goToSection( "documentResource" );
			this.initializeTabs();
		}, 1 );
	}

	setRoot():void {
		this.rootNode = RDFDocument.getDocumentResources( this.document )[ 0 ];
	}

	getDocument( uri:string ):Promise<RDFDocument | void> {
		return this.documentsResolverService.get( uri ).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
		} );
	}

	generateFragments():void {
		this.blankNodes = RDFDocument.getBNodeResources( this.document ).map(
			( blankNode:RDFNode ) => {
				return {
					id: blankNode[ JsonLDKeyword.ID ],
					copy: blankNode
				}
			} );
		this.namedFragments = RDFDocument.getNamedFragmentResources( this.document ).map( ( namedFragment:RDFNode ) => {
			return {
				id: namedFragment[ JsonLDKeyword.ID ],
				name: namedFragment[ JsonLDKeyword.ID ],
				copy: namedFragment
			}
		} );
	}

	openBlankNode( id:string ):void {
		this.documentBlankNodes.openBlankNode( id );
		this.goToSection( "blankNodes" );
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

	registerRootNodeChanges( records:ResourceRecords ):void {
		this.rootNodeRecords = records;
	}

	registerBlankNodesChanges( blankNodeChanges:BlankNodesRecords ):void {
		this.blankNodesChanges = blankNodeChanges;
	}

	registerNamedFragmentsChanges( namedFragmentsChanges:NamedFragmentsRecords ):void {
		this.namedFragmentsChanges = namedFragmentsChanges;
	}

	applyRootNodeChanges( rootNode:RDFNode ):void {
		if( ! this.rootNodeRecords ) return;
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

	applyBlankNodesChanges( document:RDFDocument ):void {
		let tempIdx:number;
		if( ! this.blankNodesChanges ) return;
		this.blankNodesChanges.deletions.forEach( ( blankNodeRow:BlankNodeStatus, blankNodeId ) => {
			tempIdx = document[ JsonLDKeyword.GRAPH ].findIndex( (blankNode => { return blankNode[ JsonLDKeyword.ID ] === blankNodeId }) );
			document[ JsonLDKeyword.GRAPH ].splice( tempIdx, 1 );
		} );
		tempIdx = - 1;
		this.blankNodesChanges.changes.forEach( ( blankNodeRow:BlankNodeStatus, blankNodeId ) => {
			tempIdx = document[ JsonLDKeyword.GRAPH ].findIndex( (blankNode => { return blankNode[ JsonLDKeyword.ID ] === blankNodeId }) );
			document[ JsonLDKeyword.GRAPH ][ tempIdx ] = blankNodeRow.modified;
		} );
		this.blankNodesChanges.additions.forEach( ( blankNodeRow:BlankNodeStatus, blankNodeId ) => {
			document[ JsonLDKeyword.GRAPH ].push( blankNodeRow.added );
		} );
	}

	applyNamedFragmentsChanges( document:RDFDocument ):void {
		let tempIdx:number;
		if( ! this.namedFragmentsChanges ) return;
		this.namedFragmentsChanges.deletions.forEach( ( namedFragmentRow:NamedFragmentStatus, namedFragmentId ) => {
			tempIdx = document[ JsonLDKeyword.GRAPH ].findIndex( (namedFragment => { return namedFragment[ JsonLDKeyword.ID ] === namedFragmentId }) );
			document[ JsonLDKeyword.GRAPH ].splice( tempIdx, 1 );
		} );
		tempIdx = - 1;
		this.namedFragmentsChanges.changes.forEach( ( namedFragmentRow:NamedFragmentStatus, namedFragmentId ) => {
			tempIdx = document[ JsonLDKeyword.GRAPH ].findIndex( (namedFragment => { return namedFragment[ JsonLDKeyword.ID ] === namedFragmentId }) );
			document[ JsonLDKeyword.GRAPH ][ tempIdx ] = namedFragmentRow.modified;
		} );
		this.namedFragmentsChanges.additions.forEach( ( namedFragmentRow:NamedFragmentStatus, namedFragmentId ) => {
			document[ JsonLDKeyword.GRAPH ].push( namedFragmentRow.added );
		} );
	}

	clearDocumentChanges():void {
		this.rootNodeRecords = new ResourceRecords();
		this.blankNodesChanges = new BlankNodesRecords();
		this.namedFragmentsChanges = new NamedFragmentsRecords();
	}

	saveDocument():void {
		this.savingDocument = true;

		// Creates a copy of the document so we could modify that copy instead of
		// the original document.
		let backupDocument:RDFDocument = JSON.parse( JSON.stringify( this.document ) );
		let backupRootNode:RDFNode = RDFDocument.getDocumentResources( backupDocument )[ 0 ];


		// Apply the changes to the backup document
		this.applyRootNodeChanges( backupRootNode );
		this.applyBlankNodesChanges( backupDocument );
		this.applyNamedFragmentsChanges( backupDocument );


		// Get the JSON string of the updated object
		let body:string = JSON.stringify( backupDocument, null, "\t" );


		// Update the document
		this.documentsResolverService.update( backupDocument[ JsonLDKeyword.ID ], body ).then(
			( updatedDocument:RDFDocument ) => {
				this.document = updatedDocument;
				this.showSuccessMessage( "<p>Changes saved successfully</p>", 4500 );
			}
		).catch( ( error:HTTPError ) => {
			this.onError.emit( error );
		} ).then( () => {
			this.savingDocument = false;
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

	/*
	*   Checks if the document has changed before refreshing it
	* */
	private beforeRefreshDocument( documentURI:string ):void {
		if( this.documentContentHasChanged ) {
			this.toggleConfirmRefresh();
			return;
		}
		this.refreshDocument( documentURI );
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


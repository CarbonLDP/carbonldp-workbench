import { Component, ElementRef, Input, Output, EventEmitter, SimpleChange, AfterViewInit, OnChanges } from "@angular/core";

import { RDFNode } from "carbonldp/RDF/Node"

import { BlankNodeStatus } from "./blank-node.component"

import * as $ from "jquery";
import "semantic-ui/semantic";

/*
*  Lists all the Blank Nodes a Documents contains
* */
@Component( {
	selector: "cw-blank-nodes",
	templateUrl: "./blank-nodes.component.html",
	styleUrls: [ "./blank-nodes.component.scss" ],
} )
export class BlankNodesComponent implements AfterViewInit, OnChanges {

	element:ElementRef;
	$element:JQuery;

	nodesTab:JQuery;
	openedBlankNodes:BlankNodeStatus[] = [];
	blankNodesRecords:BlankNodesRecords = new BlankNodesRecords();
	askingDeletionBlankNode:BlankNodeStatus;

	@Input() blankNodes:BlankNodeStatus[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() documentURI:string = "";

	@Output() onChanges:EventEmitter<BlankNodesRecords> = new EventEmitter<BlankNodesRecords>();
	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.nodesTab = this.$element.find( ".tabular.blank-nodes.menu" ).tab();
		this.initializeDeletionDimmer();
	}

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {
		if( ( changes[ "blankNodes" ].currentValue !== changes[ "blankNodes" ].previousValue ) ) {
			this.openedBlankNodes = [];
			this.goToBlankNode( "all" );
			this.blankNodesRecords.clear();
		}
	}

	openBlankNode( nodeOrId:BlankNodeStatus | string ):void {
		let node:BlankNodeStatus;
		if( typeof nodeOrId === "string" ) {
			node = this.blankNodes.find( ( node ) => { return node.id === nodeOrId} );
		} else {
			node = nodeOrId;
		}
		if( this.openedBlankNodes.indexOf( node ) === - 1 ) this.openedBlankNodes.push( node );
		setTimeout( () => {
			this.refreshTabs();
			this.goToBlankNode( "blankNode_" + this.escape( node.id ) );
		}, 50 );
	}

	openNamedFragment( id:string ):void {
		this.onOpenNamedFragment.emit( id );
	}

	goToBlankNode( id:string ) {
		if( ! this.nodesTab ) return;
		this.nodesTab.find( "> [data-tab='" + id + "']" ).click();
		this.onOpenBlankNode.emit( "blankNodes" );
	}

	closeBlankNode( blankNode:BlankNodeStatus, index?:number ):void {
		this.openedBlankNodes.splice( index, 1 );
		this.goToBlankNode( "all" );
	}

	getShortId( id:string ):string {
		if( ! id ) return;
		return "..." + id.substr( id.length - 8, id.length );
	}

	refreshTabs():void {
		this.nodesTab.find( ">.item" ).tab();
	}

	escape( value:string ):string {
		return value === "all" ? value : value.substr( value.indexOf( "_:" ) + 2 );
	}

	changeBlankNode( blankNodeRow:BlankNodeStatus, index?:number ):void {
		if( typeof this.blankNodesRecords === "undefined" ) this.blankNodesRecords = new BlankNodesRecords();
		if( typeof blankNodeRow.modified !== "undefined" ) {
			this.blankNodesRecords.changes.set( blankNodeRow.id, blankNodeRow );
		} else if( typeof blankNodeRow.added === "undefined" ) {
			this.blankNodesRecords.changes.delete( blankNodeRow.id );
		}
		this.onChanges.emit( this.blankNodesRecords );
	}

	deleteBlankNode( blankNodeRow:BlankNodeStatus, index?:number ):void {
		index = this.openedBlankNodes.indexOf( blankNodeRow );
		this.openedBlankNodes.splice( index, 1 );
		if( typeof this.blankNodesRecords === "undefined" ) this.blankNodesRecords = new BlankNodesRecords();
		if( typeof blankNodeRow.added !== "undefined" ) {
			this.blankNodesRecords.additions.delete( blankNodeRow.id );
		} else if( typeof blankNodeRow.modified !== "undefined" ) {
			this.blankNodesRecords.changes.delete( blankNodeRow.id );
			this.blankNodesRecords.deletions.set( blankNodeRow.id, blankNodeRow );
		} else {
			this.blankNodesRecords.deletions.set( blankNodeRow.id, blankNodeRow );
		}
		index = this.blankNodes.indexOf( blankNodeRow );
		this.blankNodes.splice( index, 1 );
		this.onChanges.emit( this.blankNodesRecords );
	}

	createBlankNode():void {
		let id:string = "_:" + this.generateTemporalID();
		let newBlankNode:BlankNodeStatus = <BlankNodeStatus>{
			id: id,
			copy: {
				"@id": id,
			}
		};
		newBlankNode.added = newBlankNode.copy;
		this.blankNodes.splice( this.blankNodes.length, 0, newBlankNode );
		this.blankNodesRecords.additions.set( id, newBlankNode );
		this.onChanges.emit( this.blankNodesRecords );
		this.openBlankNode( id );
	}

	initializeDeletionDimmer():void {
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( { closable: false } );
	}

	askToConfirmDeletion( clickEvent:Event, blankNode:BlankNodeStatus ):void {
		clickEvent.stopPropagation();
		this.askingDeletionBlankNode = blankNode;
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( "show" );
	}

	confirmDeletion():void {
		this.deleteBlankNode( this.askingDeletionBlankNode );
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	cancelDeletion():void {
		this.askingDeletionBlankNode = null;
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	generateTemporalID():string {
		let newId:number = 1;

		while( this.blankNodesRecords.additions.has( "_:New_Blank_Node_Temporal_Id_ " + newId ) ) {
			newId ++;
		}

		return "New_Blank_Node_Temporal_Id_ " + newId;
	}
}

export class BlankNodesRecords {
	changes:Map<string, BlankNodeStatus> = new Map<string, BlankNodeStatus>();
	deletions:Map<string, BlankNodeStatus> = new Map<string, BlankNodeStatus>();
	additions:Map<string, BlankNodeStatus> = new Map<string, BlankNodeStatus>();

	clear():void {
		this.changes.clear();
		this.deletions.clear();
		this.additions.clear();
	}
}

import { Component, ElementRef, Input, Output, EventEmitter, SimpleChange, OnChanges, AfterViewInit } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

import { NamedFragmentStatus } from "./named-fragment.component";
import { BlankNodeStatus } from "../blank-nodes/blank-node.component";


/*
*  Lists all the Named Fragments a Documents contains
* */
@Component( {
	selector: "cw-named-fragments",
	templateUrl: "./named-fragments.component.html",
	styleUrls: [ "./named-fragments.component.scss" ],
} )

export class NamedFragmentsComponent implements AfterViewInit, OnChanges {

	element:ElementRef;
	$element:JQuery;

	nodesTab:JQuery;
	openedNamedFragments:NamedFragmentStatus[] = [];
	namedFragmentsRecords:NamedFragmentsRecords = new NamedFragmentsRecords();
	askingDeletionNamedFragment:NamedFragmentStatus;

	@Input() blankNodes:BlankNodeStatus[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() documentURI:string = "";

	@Output() onChanges:EventEmitter<NamedFragmentsRecords> = new EventEmitter<NamedFragmentsRecords>();
	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.nodesTab = this.$element.find( ".tabular.named-fragments.menu" );
		this.initializeDeletionDimmer();
	}

	ngOnChanges( changes:{ [ propName:string ]:SimpleChange } ):void {
		if( (changes[ "namedFragments" ].currentValue !== changes[ "namedFragments" ].previousValue) ) {
			this.openedNamedFragments = [];
			this.goToNamedFragment( "all-namedFragments" );
			this.namedFragmentsRecords.clear();
		}
	}

	openNamedFragment( nodeOrId:NamedFragmentStatus | string ):void {
		let node:NamedFragmentStatus;
		if( typeof nodeOrId === "string" ) {
			node = this.namedFragments.find( ( node ) => { return node.name === nodeOrId} );
		} else {
			node = nodeOrId;
		}
		if( this.openedNamedFragments.indexOf( node ) === - 1 ) this.openedNamedFragments.push( node );
		setTimeout( () => {
			this.refreshTabs();
			this.goToNamedFragment( "named-fragment_" + this.getNormalizedUri( node.name ) );
		}, 50 );
	}

	openBlankNode( id:string ):void {
		this.onOpenBlankNode.emit( id );
	}

	goToNamedFragment( id:string ) {
		if( ! this.nodesTab )
			return;
		this.nodesTab.find( "> [data-tab='" + id + "']" ).click();
		this.onOpenNamedFragment.emit( "namedFragments" );
	}

	closeNamedFragment( namedFragment:NamedFragmentStatus, index?:number ):void {
		this.openedNamedFragments.splice( index, 1 );
		this.goToNamedFragment( "all-namedFragments" );
	}

	refreshTabs():void {
		let items:JQuery = this.nodesTab.find( ">.item" );
		items.removeData();
		// The destroy is because JQuery uses a cache version of all data attributes. So we need to clear the data attributes to get the new tabs ids.
		items.tab( "destroy" );
		items.tab();
	}

	getNormalizedUri( uri:string ):string {
		return uri.replace( /[^\w\s]/gi, "" );
	}

	getSlug( uri:string ) {
		return URI.getSlug( uri );
	}

	changeNamedFragment( namedFragmentRow:NamedFragmentStatus, index?:number ):void {
		if( typeof this.namedFragmentsRecords === "undefined" ) this.namedFragmentsRecords = new NamedFragmentsRecords();
		if( typeof namedFragmentRow.modified !== "undefined" ) {
			this.namedFragmentsRecords.changes.set( namedFragmentRow.id, namedFragmentRow );
		} else if( typeof namedFragmentRow.added === "undefined" ) {
			this.namedFragmentsRecords.changes.delete( namedFragmentRow.id );
		}
		this.refreshTabs();
		this.onChanges.emit( this.namedFragmentsRecords );
	}

	deleteNamedFragment( namedFragmentRow:NamedFragmentStatus, index?:number ):void {
		index = this.openedNamedFragments.indexOf( namedFragmentRow );
		this.openedNamedFragments.splice( index, 1 );
		if( typeof this.namedFragmentsRecords === "undefined" ) this.namedFragmentsRecords = new NamedFragmentsRecords();
		if( typeof namedFragmentRow.added !== "undefined" ) {
			this.namedFragmentsRecords.additions.delete( namedFragmentRow.id );
		} else if( typeof namedFragmentRow.modified !== "undefined" ) {
			this.namedFragmentsRecords.changes.delete( namedFragmentRow.id );
			this.namedFragmentsRecords.deletions.set( namedFragmentRow.id, namedFragmentRow );
		} else {
			this.namedFragmentsRecords.deletions.set( namedFragmentRow.id, namedFragmentRow );
		}
		index = this.namedFragments.indexOf( namedFragmentRow );
		this.namedFragments.splice( index, 1 );
		this.refreshTabs();
		this.onChanges.emit( this.namedFragmentsRecords );
	}

	createNamedFragment():void {
		let newName:string = this.documentURI + "#New-Fragment-Name-";
		let newFragments:NamedFragmentStatus[] = this.namedFragments.filter( ( namedFragment:NamedFragmentStatus ) => { return namedFragment.name.startsWith( newName ) } );
		let id:string = newName + (newFragments.length + 1);
		let newNamedFragment:NamedFragmentStatus = <NamedFragmentStatus>{
			id: id,
			name: id,
			copy: {
				"@id": id
			}
		};
		newNamedFragment.added = newNamedFragment.copy;
		this.namedFragments.splice( 0, 0, newNamedFragment );
		this.namedFragmentsRecords.additions.set( id, newNamedFragment );
		this.refreshTabs();
		this.onChanges.emit( this.namedFragmentsRecords );
		this.openNamedFragment( id );
	}

	initializeDeletionDimmer():void {
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( { closable: false } );
	}

	askToConfirmDeletion( clickEvent:Event, blankNode:BlankNodeStatus ):void {
		clickEvent.stopPropagation();
		this.askingDeletionNamedFragment = blankNode;
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( "show" );
	}

	confirmDeletion():void {
		this.deleteNamedFragment( this.askingDeletionNamedFragment );
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	cancelDeletion():void {
		this.askingDeletionNamedFragment = null;
		this.$element.find( ".confirm-deletion.dimmer" ).dimmer( "hide" );
	}

}

export class NamedFragmentsRecords {
	changes:Map<string, NamedFragmentStatus> = new Map<string, NamedFragmentStatus>();
	deletions:Map<string, NamedFragmentStatus> = new Map<string, NamedFragmentStatus>();
	additions:Map<string, NamedFragmentStatus> = new Map<string, NamedFragmentStatus>();

	clear():void {
		this.changes.clear();
		this.deletions.clear();
		this.additions.clear();
	}
}

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp/CarbonLDP";
import { RDFNode } from "carbonldp/RDF/Node"

import { BlankNodeStatus } from "../blank-nodes/blank-node.component";
import { Property, PropertyStatus } from "../property/property.component";
import { JsonLDKeyword, Modes, ResourceFeatures, ResourceRecords } from "../document-explorer-library";

/*
*  Displays the contents of a Named Fragment with all its properties
* */
@Component( {
	selector: "cw-named-fragment",
	templateUrl: "./named-fragment.component.html",
	styles: [ ":host { display:block; }" ],
} )

export class NamedFragmentComponent extends ResourceFeatures implements AfterViewInit {

	element:ElementRef;
	$element:JQuery;
	carbonldp:CarbonLDP;

	modes:Modes = Modes;

	private _namedFragmentHasChanged:boolean;
	set namedFragmentHasChanged( hasChanged:boolean ) {
		this._namedFragmentHasChanged = hasChanged;
		delete this.namedFragment.modified;
		delete this.namedFragment.records;
		this.namedFragment.name = this.namedFragment.id;
		if( hasChanged ) {
			this.namedFragment.records = this.records;
			if( typeof this.namedFragment.added !== "undefined" ) this.namedFragment.added = this.getRawVersion();
			else this.namedFragment.modified = this.getRawVersion();
		}
		this.onChanges.emit( this.records );
	}

	get namedFragmentHasChanged() { return this._namedFragmentHasChanged; }

	@Input() blankNodes:BlankNodeStatus[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";

	private _namedFragment:NamedFragmentStatus;
	@Input() set namedFragment( namedFragment:NamedFragmentStatus ) {
		this._namedFragment = namedFragment;
		this.rootNode = namedFragment.copy;
		if( ! ! namedFragment.records ) this.records = namedFragment.records;
		this.updateExistingProperties();
	}

	get namedFragment():NamedFragmentStatus { return this._namedFragment; }

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<ResourceRecords> = new EventEmitter<ResourceRecords>();


	constructor( element:ElementRef, carbonldp:CarbonLDP ) {
		super( carbonldp );
		this.element = element;
		this.carbonldp = carbonldp;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
	}

	openBlankNode( id:string ):void {
		this.onOpenBlankNode.emit( id );
	}

	openNamedFragment( id:string ):void {
		this.onOpenNamedFragment.emit( id );
	}

	changeProperty( property:PropertyStatus, index:number ):void {
		super.changeProperty( property, index );
	}

	deleteProperty( property:PropertyStatus, index:number ):void {
		super.deleteProperty( property, index );
	}

	addProperty( property:PropertyStatus, index:number ):void {
		super.addProperty( property, index );
	}

	createProperty( property:Property, propertyStatus:PropertyStatus ):void {
		super.createProperty( property, propertyStatus );

		// Animates created property
		setTimeout( () => {
			let createdPropertyComponent:JQuery = this.$element.find( "cw-property.added-property" ).first();
			createdPropertyComponent.addClass( "transition hidden" );
			createdPropertyComponent.transition( { animation: "drop" } );
		} );
	}

	updateExistingProperties():void {
		super.updateExistingProperties();
		this.namedFragmentHasChanged = this.resourceHasChanged;
	}

	/*
	*   Returns the fragment converted into its JSON+LD representation
	* */
	getRawVersion():RDFNode {
		let rawNode:RDFNode = Object.assign( {}, this.namedFragment.added ? this.namedFragment.added : this.namedFragment.copy );
		this.records.deletions.forEach( ( property, key ) => {
			delete rawNode[ key ];
		} );
		this.records.changes.forEach( ( property, key ) => {
			if( property.modified.id === JsonLDKeyword.ID ) { this.namedFragment.name = property.modified.value; }
			if( property.modified.id !== property.modified.name ) {
				delete rawNode[ key ];
				rawNode[ property.modified.name ] = property.modified.value;
			} else {
				rawNode[ key ] = property.modified.value;
			}
		} );
		this.records.additions.forEach( ( property, key ) => {
			if( property.added.id === JsonLDKeyword.ID ) { this.namedFragment.name = property.modified.value; }
			rawNode[ key ] = property.added.value;
		} );
		return rawNode;
	}
}

export interface NamedFragmentStatus {
	id?:string;
	name?:string;

	copy?:RDFNode;
	added?:RDFNode;
	modified?:RDFNode;
	deleted?:RDFNode;

	records?:ResourceRecords;
}


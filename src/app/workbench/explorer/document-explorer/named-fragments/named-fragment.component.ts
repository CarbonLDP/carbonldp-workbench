import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from "@angular/core";

import { CarbonLDP } from "carbonldp/CarbonLDP";
import { RDFNode } from "carbonldp/RDF/Node";

import { BlankNodeStatus } from "../blank-nodes/blank-node.component";
import { Property, PropertyStatus } from "../property/property.component";
import { JsonLDKeyword, Modes, ResourceRecords } from "../document-explorer-library";
import { ResourceFeatures, States } from "../resource-features.component";

/*
*  Displays the contents of a Named Fragment with all its properties
* */
@Component( {
	selector: "app-named-fragment",
	templateUrl: "./named-fragment.component.html",
	styles: [ ":host { display:block; }" ]
} )

export class NamedFragmentComponent extends ResourceFeatures implements AfterViewInit, OnInit, OnChanges {
	element:ElementRef;
	$element:JQuery;

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

	get namedFragmentHasChanged() {
		return this._namedFragmentHasChanged;
	}

	@Input() blankNodes:BlankNodeStatus[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";
	@Input() namedFragment:NamedFragmentStatus;

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

	cancelProperty( property:PropertyStatus, index:number ):void {
		super.cancelProperty( property, index );
	}

	addProperty( property:PropertyStatus, index:number ):void {
		super.addProperty( property, index );
	}

	createProperty( property:Property, propertyStatus:PropertyStatus ):void {
		super.createProperty( property, propertyStatus );

		// Animates created property
		/*
			2018-11-09 @MiguelAraCo
			TODO[code-quality]: Use vanilla JavaScript and CSS instead of JQuery
		*/


		// setTimeout( () => {
		// 	const createdPropertyComponent:JQuery = this.$element.find( "app-property.added-property" ).first();
		// 	createdPropertyComponent.addClass( "transition hidden" );
		// 	createdPropertyComponent.transition( { animation: "drop" } );
		// }, 0 );
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
			if( property.modified.id === JsonLDKeyword.ID ) {
				this.namedFragment.name = property.modified.value;
			}
			if( property.modified.id !== property.modified.name ) {
				delete rawNode[ key ];
				rawNode[ property.modified.name ] = property.modified.value;
			} else {
				rawNode[ key ] = property.modified.value;
			}
		} );
		this.records.additions.forEach( ( property, key ) => {
			if( property.added.id === JsonLDKeyword.ID ) {
				this.namedFragment.name = property.modified.value;
			}
			rawNode[ key ] = property.added.value;
		} );
		return rawNode;
	}

	private initData() {
		this.state = States.READ;
		this.rootNode = this.namedFragment.copy;
		if( ! ! this.namedFragment.records ) this.records = this.namedFragment.records;
		this.updateExistingProperties();
	}

	ngOnInit() {
		this.initData();
	}

	ngOnChanges( changes:SimpleChanges ) {
		if( "namedFragment" in changes ) {
			const change:SimpleChange = changes.namedFragment;
			this.namedFragment = change.currentValue;
			this.initData();
		}
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


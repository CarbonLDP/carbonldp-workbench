import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import * as RDFNode from "carbonldp/RDF/Node";

import { BlankNodeRow } from "../blank-nodes/blank-node.component";
import { Property, PropertyRow, Modes } from "../property/property.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-named-fragment",
	templateUrl: "./named-fragment.component.html",
	styles: [ ":host { display:block; }" ],
} )

export class NamedFragmentComponent implements AfterViewInit {

	element:ElementRef;
	$element:JQuery;
	modes:Modes = Modes;
	records:NamedFragmentRecords;
	copyOrAdded:string = "";
	tempPropertiesNames:string[] = [];

	rootNode:RDFNode.Class;
	properties:PropertyRow[];
	existingPropertiesNames:string[] = [];

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
		return this.namedFragmentHasChanged;
	}

	@Input() blankNodes:BlankNodeRow[] = [];
	@Input() namedFragments:NamedFragmentRow[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";

	private _namedFragment:NamedFragmentRow;
	@Input() set namedFragment( namedFragment:NamedFragmentRow ) {
		this._namedFragment = namedFragment;
		this.rootNode = namedFragment.copy;
		if( ! ! namedFragment.records ) this.records = namedFragment.records;
		this.getProperties();
	}

	get namedFragment():NamedFragmentRow { return this._namedFragment; }

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<NamedFragmentRow> = new EventEmitter<NamedFragmentRow>();


	constructor( element:ElementRef ) {
		this.element = element;
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

	changeProperty( property:PropertyRow, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new NamedFragmentRecords();
		if( typeof property.modified !== "undefined" ) {
			this.records.changes.set( property.modified.id, property );
		} else if( typeof property.added === "undefined" ) {
			this.records.changes.delete( property.copy.id );
		}
		if( typeof property.added !== "undefined" ) {
			this.records.additions.delete( property.added.id );
			property.added.id = property.added.name;
			this.records.additions.set( property.added.id, property );
		}
		this.updateExistingProperties();
	}

	deleteProperty( property:PropertyRow, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new NamedFragmentRecords();
		if( typeof property.added !== "undefined" ) {
			this.records.additions.delete( property.added.id );
			this.properties.splice( index, 1 );
		} else if( typeof property.deleted !== "undefined" ) {
			this.records.deletions.set( property.deleted.id, property );
		}
		this.updateExistingProperties();
	}

	addProperty( property:PropertyRow, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new NamedFragmentRecords();
		if( typeof property.added !== "undefined" ) {
			if( property.added.id === property.added.name ) {
				this.records.additions.set( property.added.id, property );
			} else {
				this.records.additions.delete( property.added.id );
				property.added.id = property.added.name;
				this.records.additions.set( property.added.name, property );
			}
		}
		this.updateExistingProperties();
	}

	createProperty( property:Property, propertyRow:PropertyRow ):void {
		let numberOfProperty:number = ! ! this.records ? (this.records.additions.size + 1) : 1;
		let newProperty:PropertyRow = {
			added: <Property>{
				id: "",
				name: "http://www.example.com#New Property " + numberOfProperty,
				value: []
			},
			isBeingCreated: true,
			isBeingModified: false,
			isBeingDeleted: false
		};
		this.properties.splice( 1, 0, newProperty );
		// Animates created property
		setTimeout( () => {
			let createdPropertyComponent:JQuery = this.$element.find( "cw-property.added-property" ).first();
			createdPropertyComponent.addClass( "transition hidden" );
			createdPropertyComponent.transition( { animation: "drop" } );
		} );
	}

	getProperties():void {
		this.updateExistingProperties();
	}

	updateExistingProperties():void {
		this.properties = [];
		this.existingPropertiesNames = Object.keys( this.rootNode );
		this.existingPropertiesNames.forEach( ( propName:string ) => {
			this.properties.push( {
				copy: {
					id: propName,
					name: propName,
					value: this.rootNode[ propName ]
				}
			} );
		} );
		if( ! this.records ) return;
		this.records.additions.forEach( ( value, key ) => {
			this.existingPropertiesNames.push( key );
			this.properties.splice( 1, 0, value );
		} );
		let idx:number;
		this.records.changes.forEach( ( value, key ) => {
			if( value.modified.id !== value.modified.name ) {
				idx = this.existingPropertiesNames.indexOf( value.modified.id );
				if( idx !== - 1 ) this.existingPropertiesNames.splice( idx, 1, value.modified.name );
			}
			idx = this.properties.findIndex( ( property:PropertyRow ) => { return ! ! property.copy && property.copy.id === key} );
			if( idx !== - 1 ) this.properties.splice( idx, 1, value );
		} );
		this.records.deletions.forEach( ( value, key ) => {
			idx = this.existingPropertiesNames.indexOf( key );
			if( idx !== - 1 ) this.existingPropertiesNames.splice( idx, 1 );

			idx = this.properties.findIndex( ( property:PropertyRow ) => { return ! ! property.copy && property.copy.id === key} );
			if( idx !== - 1 ) this.properties.splice( idx, 1 );
		} );
		this.namedFragmentHasChanged = this.records.changes.size > 0 || this.records.additions.size > 0 || this.records.deletions.size > 0;
	}

	getRawVersion():RDFNode.Class {
		let rawNode:RDFNode.Class = Object.assign( {}, this.namedFragment.added ? this.namedFragment.added : this.namedFragment.copy );
		this.records.deletions.forEach( ( property, key ) => {
			delete rawNode[ key ];
		} );
		this.records.changes.forEach( ( property, key ) => {
			if( property.modified.id === "@id" ) this.namedFragment.name = property.modified.value;
			if( property.modified.id !== property.modified.name ) {
				delete rawNode[ key ];
				rawNode[ property.modified.name ] = property.modified.value;
			} else {
				rawNode[ key ] = property.modified.value;
			}
		} );
		this.records.additions.forEach( ( property, key ) => {
			if( property.added.id === "@id" ) this.namedFragment.name = property.modified.value;
			rawNode[ key ] = property.added.value;
		} );
		return rawNode;
	}
}
export interface NamedFragmentRow {
	id?:string;
	name?:string;

	copy?:RDFNode.Class;
	added?:RDFNode.Class;
	modified?:RDFNode.Class;
	deleted?:RDFNode.Class;

	records?:NamedFragmentRecords;
}
export class NamedFragmentRecords {
	changes:Map<string,PropertyRow> = new Map<string, PropertyRow>();
	deletions:Map<string,PropertyRow> = new Map<string, PropertyRow>();
	additions:Map<string,PropertyRow> = new Map<string, PropertyRow>();
}


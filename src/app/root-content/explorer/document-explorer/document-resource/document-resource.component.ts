import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import * as RDFNode from "carbonldp/RDF/Node";

import { Property, PropertyRow, Modes } from "../property/property.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-document-resource",
	templateUrl: "./document-resource.component.html",
	styles: [ ":host { display:block; }" ],
} )

export class DocumentResourceComponent implements AfterViewInit {

	element:ElementRef;
	$element:JQuery;
	modes:Modes = Modes;
	properties:PropertyRow[] = [];
	existingPropertiesNames:string[] = [];
	records:RootRecords;
	private _rootHasChanged:boolean;
	set rootHasChanged( hasChanged:boolean ) {
		this._rootHasChanged = hasChanged;
		this.onChanges.emit( this.records );
	}

	get rootHasChanged() {
		return this._rootHasChanged;
	}

	@Input() displayOnly:string[] = [];
	@Input() hiddenProperties:string[] = [];
	@Input() blankNodes:RDFNode.Class[] = [];
	@Input() namedFragments:RDFNode.Class[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";
	private _rootNode:RDFNode.Class;
	@Input() set rootNode( value:RDFNode.Class ) {
		this._rootNode = value;
		this.records = new RootRecords();
		this.getProperties();
	}

	get rootNode() {
		return this._rootNode;
	}

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<RootRecords> = new EventEmitter<RootRecords>();


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

	canDisplay( propertyName:any ):boolean {
		if( typeof propertyName === "undefined" ) return false;
		if( this.displayOnly.length === 0 && this.hiddenProperties.length === 0 ) return true;
		if( this.displayOnly.length > 0 ) return this.displayOnly.indexOf( propertyName ) !== - 1 ? true : false;
		return this.hiddenProperties.indexOf( propertyName ) !== - 1 ? false : true;
	}

	changeProperty( property:PropertyRow, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new RootRecords();
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
		if( typeof this.records === "undefined" ) this.records = new RootRecords();
		if( typeof property.added !== "undefined" ) {
			this.records.additions.delete( property.added.id );
			this.properties.splice( index, 1 );
		} else if( typeof property.deleted !== "undefined" ) {
			this.records.deletions.set( property.deleted.id, property );
		}
		this.updateExistingProperties();
	}

	addProperty( property:PropertyRow, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new RootRecords();
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
		let newProperty:PropertyRow = <PropertyRow>{
			added: <Property>{
				id: "",
				name: "http://www.example.com#New Property " + numberOfProperty,
				value: []
			},
			isBeingCreated: true,
			isBeingModified: false,
			isBeingDeleted: false
		};
		this.properties.splice( 2, 0, newProperty );
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
			this.properties.splice( 2, 0, value );
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
		this.rootHasChanged = this.records.changes.size > 0 || this.records.additions.size > 0 || this.records.deletions.size > 0;
	}
}

export class RootRecords {
	changes:Map<string,PropertyRow> = new Map<string, PropertyRow>();
	deletions:Map<string,PropertyRow> = new Map<string, PropertyRow>();
	additions:Map<string,PropertyRow> = new Map<string, PropertyRow>();
}


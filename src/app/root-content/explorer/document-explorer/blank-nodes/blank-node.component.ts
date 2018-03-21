import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit } from "@angular/core";

import { RDFNode } from "carbonldp/RDF/Node"

import { Property, PropertyRow, Modes } from "../property/property.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-blank-node",
	templateUrl: "./blank-node.component.html",
	styles: [ ":host { display:block; }" ],
} )

export class BlankNodeComponent implements AfterViewInit {

	element:ElementRef;
	$element:JQuery;
	modes:Modes = Modes;
	records:BlankNodeRecords;
	nonEditableProperties:string[] = [ "@id" ];
	copyOrAdded:string = "";
	tempPropertiesNames:string[] = [];

	rootNode:RDFNode;
	properties:PropertyRow[];
	existingPropertiesNames:string[] = [];

	private _bNodeHasChanged:boolean;
	set bNodeHasChanged( hasChanged:boolean ) {
		this._bNodeHasChanged = hasChanged;
		delete this.blankNode.modified;
		delete this.blankNode.records;
		if( hasChanged ) {
			this.blankNode.records = this.records;
			if( typeof this.blankNode.added !== "undefined" ) this.blankNode.added = this.getRawVersion();
			else this.blankNode.modified = this.getRawVersion();
		}
		this.onChanges.emit( this.blankNode );
	}

	get bNodeHasChanged() {
		return this._bNodeHasChanged;
	}

	@Input() blankNodes:BlankNodeRow[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";

	private _blankNode:BlankNodeRow;
	@Input() set blankNode( blankNode:BlankNodeRow ) {
		this._blankNode = blankNode;
		this.rootNode = blankNode.copy;
		if( ! ! blankNode.records ) this.records = blankNode.records;
		this.getProperties();
	}

	get blankNode():BlankNodeRow { return this._blankNode; }

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<BlankNodeRow> = new EventEmitter<BlankNodeRow>();


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
		if( typeof this.records === "undefined" ) this.records = new BlankNodeRecords();
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
		if( typeof this.records === "undefined" ) this.records = new BlankNodeRecords();
		if( typeof property.added !== "undefined" ) {
			this.records.additions.delete( property.added.id );
			this.properties.splice( index, 1 );
		} else if( typeof property.deleted !== "undefined" ) {
			this.records.deletions.set( property.deleted.id, property );
		}
		this.updateExistingProperties();
	}

	addProperty( property:PropertyRow, index:number ):void {
		if( typeof this.records === "undefined" ) this.records = new BlankNodeRecords();
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

	canEditProperty( property:PropertyRow ):boolean {
		let copyOrAdded:string = ! ! property.added ? "added" : "copy";
		return (this.nonEditableProperties.indexOf( property[ copyOrAdded ].name ) === - 1) && this.canEdit;
	}

	getProperties():void {
		this.updateExistingProperties();
	}

	updateExistingProperties():void {
		this.properties = [];
		this.existingPropertiesNames = Object.keys( this.rootNode );
		this.sortFirstProperties( this.existingPropertiesNames, this.nonEditableProperties );
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
		this.bNodeHasChanged = this.records.changes.size > 0 || this.records.additions.size > 0 || this.records.deletions.size > 0;
	}

	getRawVersion():RDFNode {
		let rawNode:RDFNode = Object.assign( {}, this.blankNode.added ? this.blankNode.added : this.blankNode.copy );
		this.records.deletions.forEach( ( property, key ) => {
			delete rawNode[ key ];
		} );
		this.records.changes.forEach( ( property, key ) => {
			if( property.modified.id !== property.modified.name ) {
				delete rawNode[ key ];
				rawNode[ property.modified.name ] = property.modified.value;
			} else {
				rawNode[ key ] = property.modified.value;
			}
		} );
		this.records.additions.forEach( ( property, key ) => {
			rawNode[ key ] = property.added.value;
		} );
		return rawNode;
	}

	sortFirstProperties( propertiesNames:string[], firstPropertiesToShow:string[] ):void {
		let tempIdx:number = - 1;
		firstPropertiesToShow.forEach( ( propToShow:string, index:number ) => {
			tempIdx = propertiesNames.findIndex( ( propName:string ) => { return propName === propToShow} );
			if( tempIdx !== - 1 ) {
				let name:string = propertiesNames[ tempIdx ];
				propertiesNames.splice( tempIdx, 1 );
				propertiesNames.splice( index, 0, name );
			}
		} );
	}

	isTemporalId( property:PropertyRow ):boolean {
		let copyAddedOrModified:string = property.added ? "added" : property.modified ? "modified" : "copy";
		return property[ copyAddedOrModified ].id === "@id" && property[ copyAddedOrModified ].value.startsWith( "_:New_Blank_Node_Temporal_Id_" );
	}
}

export interface BlankNodeRow {
	id?:string;

	copy?:RDFNode;
	added?:RDFNode;
	modified?:RDFNode;
	deleted?:RDFNode;

	records?:BlankNodeRecords;
}

export class BlankNodeRecords {
	changes:Map<string, PropertyRow> = new Map<string, PropertyRow>();
	deletions:Map<string, PropertyRow> = new Map<string, PropertyRow>();
	additions:Map<string, PropertyRow> = new Map<string, PropertyRow>();
}

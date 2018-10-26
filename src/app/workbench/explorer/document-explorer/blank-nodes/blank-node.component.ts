import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { RDFNode } from "carbonldp/RDF/Node";


import { Property, PropertyStatus } from "../property/property.component";
import { JsonLDKeyword, Modes, ResourceFeatures, ResourceRecords } from "../document-explorer-library";

/*
*  Displays the contents of a Blank Node with all its properties
* */
@Component( {
	selector: "app-blank-node",
	templateUrl: "./blank-node.component.html",
	styles: [ ":host { display:block; }" ]
} )

export class BlankNodeComponent extends ResourceFeatures implements AfterViewInit {
	@Input() blankNodes:BlankNodeStatus[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() canEdit:boolean = true;
	@Input() documentURI:string = "";

	private _blankNode:BlankNodeStatus;
	@Input() set blankNode( blankNode:BlankNodeStatus ) {
		this._blankNode = blankNode;
		this.rootNode = blankNode.copy;
		if( ! ! blankNode.records ) this.records = blankNode.records;
		this.updateExistingProperties();
	}

	get blankNode():BlankNodeStatus {
		return this._blankNode;
	}

	@Output() onOpenBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onOpenNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChanges:EventEmitter<BlankNodeStatus> = new EventEmitter<BlankNodeStatus>();

	carbonldp:CarbonLDP;
	element:ElementRef;
	$element:JQuery;

	modes:typeof Modes = Modes;
	nonEditableProperties:string[] = [ JsonLDKeyword.ID ];

	private _blankNodeHasChanged:boolean;
	set blankNodeHasChanged( hasChanged:boolean ) {
		this._blankNodeHasChanged = hasChanged;
		delete this.blankNode.modified;
		delete this.blankNode.records;
		if( hasChanged ) {
			this.blankNode.records = this.records;
			if( typeof this.blankNode.added !== "undefined" ) this.blankNode.added = this.getRawVersion();
			else this.blankNode.modified = this.getRawVersion();
		}
		this.onChanges.emit( this.blankNode );
	}

	get blankNodeHasChanged() {
		return this._blankNodeHasChanged;
	}

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
			let createdPropertyComponent:JQuery = this.$element.find( "app-property.added-property" ).first();
			createdPropertyComponent.addClass( "transition hidden" );
			createdPropertyComponent.transition( { animation: "drop" } );
		} );
	}

	canEditProperty( property:PropertyStatus ):boolean {
		let status:string = ! ! property.added ? "added" : "copy";
		return (this.nonEditableProperties.indexOf( property[ status ].name ) === - 1) && this.canEdit;
	}

	updateExistingProperties():void {
		super.updateExistingProperties();
		this.blankNodeHasChanged = this.resourceHasChanged;
	}

	/*
	*   Returns the blank node converted into its JSON+LD representation
	* */
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

	isTemporalId( property:PropertyStatus ):boolean {
		let copyAddedOrModified:string = property.added ? "added" : property.modified ? "modified" : "copy";
		return property[ copyAddedOrModified ].id === JsonLDKeyword.ID && property[ copyAddedOrModified ].value.startsWith( "_:New_Blank_Node_Temporal_Id_" );
	}
}

export interface BlankNodeStatus {
	id?:string;

	copy?:RDFNode;
	added?:RDFNode;
	modified?:RDFNode;
	deleted?:RDFNode;

	records?:ResourceRecords;
}

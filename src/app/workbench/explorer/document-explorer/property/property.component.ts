import { Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";

import { RDFNode } from "carbonldp/RDF"

import { NamedFragmentStatus } from "../named-fragments/named-fragment.component";
import { Modes } from "../document-explorer-library";


@Component( {
	selector: "app-property",
	templateUrl: "./property.component.html",
	styleUrls: [ "./property.component.scss" ],
	host: {
		"[class.has-changed]": "property.modified && !property.added",
		"[class.deleted-property]": "property.deleted",
		"[class.added-property]": "property.added"
	},
} )

export class PropertyComponent {

	element:ElementRef;
	$element:JQuery;

	propertyName:string = "";


	@Input() mode:string = Modes.READ;
	@Input() documentURI:string = "";
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() isPartOfNamedFragment:boolean = false;
	@Input() canEdit:boolean = true;
	@Input() existingProperties:string[] = [];
	@Input() accessPointsHasMemberRelationProperties:string[] = [];
	private _property:PropertyStatus;
	@Input() set property( property:PropertyStatus ) {
		this._property = property;
		this.propertyName = property[ ! ! property.added ? "added" : ! ! property.modified ? "modified" : "copy" ].name;
	}

	get property():PropertyStatus { return this._property; };

	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChangeProperty:EventEmitter<Property> = new EventEmitter<Property>();
	@Output() onDeleteProperty:EventEmitter<PropertyStatus> = new EventEmitter<PropertyStatus>();
	@Output() onCancelProperty:EventEmitter<PropertyStatus> = new EventEmitter<PropertyStatus>();
	@Output() onSaveNewProperty:EventEmitter<Property> = new EventEmitter<Property>();


	constructor() {}

	goToBlankNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}

	deleteProperty( property ):void {
		this.onDeleteProperty.emit( this.property );
	}

	saveNewProperty( property:any ):void {
		this.onSaveNewProperty.emit( property );
	}

	changeProperty( property:any ):void {
		this.onChangeProperty.emit( property );
	}

	cancelProperty( property:any ):void {
		this.onCancelProperty.emit( property );
	}

}

export interface PropertyStatus {
	copy?:any;
	added?:any;
	modified?:any;
	deleted?:any;

	isBeingCreated?:boolean;
}

export interface Property {
	id:string;
	name:string;
	value:any;
}

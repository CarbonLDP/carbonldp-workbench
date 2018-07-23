import { Component, Input, Output, EventEmitter, ElementRef } from "@angular/core";

import { RDFNode } from "carbonldp/RDF/Node"

import { LiteralStatus } from "../literals/literal.component";
import { PointerRow } from "../pointers/pointer.component";
import { ListRow } from "../lists/list.component";
import { NamedFragmentRow } from "../named-fragments/named-fragment.component";


@Component( {
	selector: "cw-property",
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
	literals:LiteralStatus[] = [];
	pointers:PointerRow[] = [];
	lists:ListRow[] = [];
	tempLiterals:LiteralStatus[];
	tempPointers:PointerRow[];
	tempLists:ListRow[];
	tempProperty:Property = <Property>{};
	copyOrAdded:string;
	existingFragments:string[] = [];

	name:string;
	originalName:string;
	value:any[] | string = [];


	@Input() mode:string = Modes.READ;
	@Input() documentURI:string = "";
	@Input() bNodes:RDFNode[] = [];
	@Input() namedFragments:NamedFragmentRow[] = [];
	@Input() isPartOfNamedFragment:boolean = false;
	@Input() canEdit:boolean = true;
	@Input() existingProperties:string[] = [];
	@Input() accessPointsHasMemberRelationProperties:string[] = [];
	private _property:PropertyRow;
	@Input() set property( property:PropertyRow ) {
		this._property = property;
		this.name = property[ ! ! property.added ? "added" : ! ! property.modified ? "modified" : "copy" ].name;
		console.log( "%o: %o", this.name, this.property );
	}

	get property():PropertyRow { return this._property; };

	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChangeProperty:EventEmitter<Property> = new EventEmitter<Property>();
	@Output() onDeleteProperty:EventEmitter<PropertyRow> = new EventEmitter<PropertyRow>();
	@Output() onSaveNewProperty:EventEmitter<Property> = new EventEmitter<Property>();


	constructor() {}

	goToBlankNode( id:string ):void {
		console.log( "goToBlankNode: %o", id );
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		console.log( "goToNamedFragment: %o", id );
		this.onGoToNamedFragment.emit( id );
	}

	deleteProperty( property ):void {
		console.log( "deleteProperty: %o", property );
		this.onDeleteProperty.emit( this.property );
	}

	saveNewProperty( property:any ):void {
		console.log( "saveNewProperty: %o", property );
		this.onSaveNewProperty.emit( property );
	}

	changeProperty( property:any ):void {
		console.log( "changeProperty: %o", property );
		this.onChangeProperty.emit( property );
	}

}

export interface PropertyRow {
	copy?:any;
	added?:any;
	modified?:any;
	deleted?:any;

	isBeingCreated?:boolean;
	isBeingModified?:boolean;
	isBeingDeleted?:boolean;

	modifiedLiterals?:LiteralStatus[];
	modifiedPointers?:PointerRow[];
	modifiedLists?:ListRow[];
}

export interface Property {
	id:string;
	name:string;
	value:any;
}

export class Modes {
	static EDIT:string = "EDIT";
	static READ:string = "READ";
}

export enum PropertyToken {
	ID = "@id",
	TYPE = "@type",
	LIST = "@list",
	SET = "@set"
}

import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnInit, ViewChild } from "@angular/core";

import { RDFLiteral } from "carbonldp/RDF/Literal";
import { RDFList } from "carbonldp/RDF/List";
import { URI } from "carbonldp/RDF/URI";
import { RDFNode } from "carbonldp/RDF/Node"
import { isArray } from "carbonldp/Utils";

import { Literal, LiteralRow } from "../literals/literal.component";
import { Pointer, PointerRow } from "../pointers/pointer.component";
import { List, ListRow } from "../lists/list.component";
import { NamedFragmentRow } from "../named-fragments/named-fragment.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "cw-property",
	templateUrl: "./property.component.html",
	styleUrls: [ "./property.component.scss" ],
	host: { "[class.has-changed]": "property.modified", "[class.deleted-property]": "property.deleted", "[class.added-property]": "property.added" },
} )

export class PropertyComponent implements AfterViewInit, OnInit {

	element:ElementRef;
	$element:JQuery;
	literals:LiteralRow[] = [];
	pointers:PointerRow[] = [];
	lists:ListRow[] = [];
	tempLiterals:LiteralRow[];
	tempPointers:PointerRow[];
	tempLists:ListRow[];
	tempProperty:Property = <Property>{};
	copyOrAdded:string;
	existingFragments:string[] = [];

	id:string;
	originalId:string;
	name:string;
	originalName:string;
	value:any[] | string = [];

	addNewLiteral:EventEmitter<boolean> = new EventEmitter<boolean>();
	addNewPointer:EventEmitter<boolean> = new EventEmitter<boolean>();
	addNewList:EventEmitter<boolean> = new EventEmitter<boolean>();
	commonToken:string[] = [ "@id", "@type", "@value" ];
	modes:Modes = Modes;
	@ViewChild( "nameInput" ) nameInputControl;
	@ViewChild( "idInput" ) idInputControl;

	@Input() mode:string = Modes.READ;
	@Input() documentURI:string = "";
	@Input() bNodes:RDFNode[] = [];
	@Input() namedFragments:NamedFragmentRow[] = [];
	@Input() isPartOfNamedFragment:boolean = false;
	@Input() canEdit:boolean = true;
	@Input() existingProperties:string[] = [];
	@Input() accessPointsHasMemberRelationProperties:string[] = [];
	private _property:PropertyRow;
	@Input()
	set property( prop:PropertyRow ) {
		this.copyOrAdded = ! ! prop.copy ? (! ! prop.modified ? "modified" : "copy") : "added";
		this._property = prop;

		this.id = prop[ this.copyOrAdded ].id;
		this.tempProperty.id = prop[ this.copyOrAdded ].id;
		this.originalId = prop[ this.copyOrAdded ].value;

		this.name = prop[ this.copyOrAdded ].name;
		this.tempProperty.name = prop[ this.copyOrAdded ].name;
		this.originalName = this.name;
		if( isArray( prop[ this.copyOrAdded ].value ) ) {
			this.value = [];
			prop[ this.copyOrAdded ].value.forEach( ( literalOrRDFNode ) => { (<Array<any>>this.value).push( Object.assign( literalOrRDFNode ) ) } )
		} else {
			this.value = prop[ this.copyOrAdded ].value;
		}
	}

	get property():PropertyRow { return this._property; }

	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChangeProperty:EventEmitter<Property> = new EventEmitter<Property>();
	@Output() onDeleteProperty:EventEmitter<PropertyRow> = new EventEmitter<PropertyRow>();
	@Output() onDeleteNewProperty:EventEmitter<PropertyRow> = new EventEmitter<PropertyRow>();
	@Output() onSaveNewProperty:EventEmitter<Property> = new EventEmitter<Property>();
	@Output() onChangeNewProperty:EventEmitter<Property> = new EventEmitter<Property>();

	nameHasChanged:boolean = false;
	valueHasChanged:boolean = false;
	literalsHaveChanged:boolean = false;
	pointersHaveChanged:boolean = false;
	listsHaveChanged:boolean = false;

	get propertyHasChanged():boolean { return this.nameHasChanged || this.valueHasChanged || this.literalsHaveChanged || this.pointersHaveChanged || this.listsHaveChanged; }

	get isAccessPointHasMemberRelationProperty():boolean { return this.accessPointsHasMemberRelationProperties.indexOf( this.id ) !== - 1; }

	// TODO: Add @lists and @sets support
	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngOnInit():void {
		if( isArray( this.value ) ) this.fillLiteralsAndPointers();
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializeAccordions();
		this.initializePropertyButtons();
		this.initializeDeletionDimmer();
	}

	getDisplayName( uri:string ):string {
		if( this.commonToken.indexOf( uri ) > - 1 ) return uri;
		if( URI.hasFragment( uri ) ) return this.unescape( this.getFragment( uri ) );
		return this.unescape( URI.getSlug( uri ) );
	}

	getParentURI( uri:string ):string {
		let slug:string = this.getSlug( uri );
		return uri.substr( 0, uri.indexOf( slug ) );
	}

	getSlug( uri:string ) {
		return URI.getSlug( uri );
	}

	getFragment( uri:string ):string {
		let parts:string[] = uri.split( "#" );
		uri = "".concat( parts[ 0 ] ).concat( "#" + parts[ 1 ] );
		return URI.getFragment( uri );
	}

	isArray( property:any ):boolean {
		return isArray( property );
	}

	isUrl( uri:string ):boolean {
		let r = /^(ftp|http|https):\/\/[^ "]+$/;
		return r.test( uri );
	}

	goToBNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}

	getTypeIcon( type:string ):string {
		switch( this.getDisplayName( type ) ) {
			case "RDFSource":
				return "file outline";
			case "Container":
				return "cubes";
			case "BasicContainer":
				return "cube";
			default:
				return "file excel outline";
		}
	}

	initializeAccordions():void {
		this.$element.find( ".ui.accordion" ).accordion();
	}

	initializePropertyButtons():void {
		this.$element.find( ".ui.options.dropdown.button" ).dropdown( {
			transition: "swing up"
		} );
		this.$element.find( ".ui.save-cancel.buttons .dropdown.button" ).dropdown();
	}

	initializeDeletionDimmer():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( { closable: false } );
	}

	onEditName():void {
		this.mode = Modes.EDIT;
		this.name = this.unescape( (this.name) );
	}

	onEditId():void {
		this.mode = Modes.EDIT;
		this.existingFragments = [];
		this.namedFragments.forEach( ( nameFragment:NamedFragmentRow ) => { this.existingFragments.push( nameFragment.name ); } );
		this.value = this.unescape( <string>this.value );
	}

	cancelDeletion():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	cancelModification():void {
		if( this.nameInputControl.valid ) {
			this.mode = Modes.READ;
		}
		if( this.property.isBeingCreated ) this.onDeleteNewProperty.emit( this.property );
	}

	cancelIdModification():void {
		if( this.idInputControl.valid ) {
			this.mode = Modes.READ;
		}
	}

	askToConfirmDeletion():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( "show" );
	}

	deleteProperty():void {
		if( typeof this.property.added !== "undefined" ) {
			this.onDeleteNewProperty.emit( this.property );
		} else {
			this.property.deleted = this.property.copy;
			this.onDeleteProperty.emit( this.property );
		}
	}

	save():void {
		this.checkForChangesOnName( this.sanitize( this.name ) );
		this.mode = Modes.READ;
	}

	saveId():void {
		this.checkForChangesOnId( this.sanitize( <string>this.value ) );//check changes on idInput
		this.mode = Modes.READ;
	}

	sanitize( value:string ):string {
		let sanitized:string = value;
		let slug:string = this.getSlug( value );
		let parts:string[] = value.split( slug );
		if( parts.length > 0 ) sanitized = parts[ 0 ] + this.escape( slug );
		return sanitized;
	}

	fillLiteralsAndPointers():void {
		this.literals = [];
		this.tempLiterals = [];
		this.pointers = [];
		this.tempPointers = [];
		this.lists = [];
		this.tempLists = [];
		if( typeof this.property.modifiedLiterals !== "undefined" ) {
			this.literals = this.property.modifiedLiterals;
			this.tempLiterals = this.property.modifiedLiterals;
		} else {
			this.property[ this.copyOrAdded ].value.forEach( ( literalOrRDFNode ) => {
				if( RDFLiteral.is( literalOrRDFNode ) ) {
					this.literals.push( <LiteralRow>{ copy: literalOrRDFNode } );
					this.tempLiterals.push( <LiteralRow>{ copy: literalOrRDFNode } );
				}
			} );
		}
		if( typeof this.property.modifiedPointers !== "undefined" ) {
			this.pointers = this.property.modifiedPointers;
			this.tempPointers = this.property.modifiedPointers;
		} else {
			this.property[ this.copyOrAdded ].value.forEach( ( literalOrRDFNode ) => {
				if( RDFNode.is( literalOrRDFNode ) ) {
					this.pointers.push( <PointerRow>{ copy: literalOrRDFNode } );
					this.tempPointers.push( <PointerRow>{ copy: literalOrRDFNode } );
				}
			} );
		}
		if( typeof this.property.modifiedLists !== "undefined" ) {
			this.lists = this.property.modifiedLists;
			this.tempLists = this.property.modifiedLists;
		} else {
			this.property[ this.copyOrAdded ].value.forEach( ( literalOrRDFNodeOrList ) => {
				if( RDFList.is( literalOrRDFNodeOrList ) ) {
					this.lists.push( <ListRow>{ copy: literalOrRDFNodeOrList[ "@list" ].map( ( item ) => { return { copy: item } } ) } );
					this.tempLists.push( <ListRow>{ copy: literalOrRDFNodeOrList } );
				}
			} );
		}
	}

	addLiteral():void {
		// Notify LiteralsComponent to add literal
		this.addNewLiteral.emit( true );
	}

	addPointer():void {
		// Notify PointersComponent to add pointer
		this.addNewPointer.emit( true );
	}

	addList():void {
		// Notify ListsComponent to add pointer
		this.addNewList.emit( true );
	}

	checkForChangesOnName( newName:string ):void {
		this.name = newName;
		if( typeof this.name !== "undefined" && (this.name !== this.property[ this.copyOrAdded ].name || this.name !== this.tempProperty.name) ) {
			this.tempProperty.name = this.name;
			this.changePropertyContent();
		}
	}

	checkForChangesOnId( newId:string ):void {
		this.value = newId;
		if( typeof this.value !== "undefined" && (this.value !== this.property[ this.copyOrAdded ].value || this.value !== this.tempProperty.value) ) {
			this.tempProperty.value = this.value;
			this.changePropertyContent();
		}
	}

	checkForChangesOnLiterals( literals:LiteralRow[] ):void {
		this.tempLiterals = literals;
		this.changePropertyContent();
	}

	checkForChangesOnPointers( pointers:PointerRow[] ):void {
		this.tempPointers = pointers;
		this.changePropertyContent();
	}

	checkForChangesOnLists( lists:ListRow[] ):void {
		this.lists = lists;
		this.tempLists = lists;
		this.changePropertyContent();
	}

	convertToListRow( lists:ListRow[] ):ListRow[] {
		let resultingLists:ListRow[] = [];
		lists.forEach( ( list:ListRow ) => {
			let resultingList:ListRow = {};
			if( list[ "added" ] ) {
				resultingList.added = { "@list": this.getRDFList( list, "added" ) };
			} else if( list[ "deleted" ] ) {
				resultingList.deleted = { "@list": this.getRDFList( list, "deleted" ) };
			} else if( list[ "modified" ] ) {
				resultingList.modified = { "@list": this.getRDFList( list, "modified" ) };
			} else if( list[ "copy" ] ) {
				resultingList.copy = { "@list": this.getRDFList( list, "copy" ) };
			}
			resultingLists.push( resultingList );
		} );
		return resultingLists;
	}

	getRDFList( list:ListRow, copyOrAddedOrModified:string ):any[] {
		let resultingListContent:any[] = [];
		list[ copyOrAddedOrModified ].forEach( ( literalOrPointer:any ) => {
			if( ! ! literalOrPointer[ "deleted" ] ) return;
			if( copyOrAddedOrModified === "copy" )
				resultingListContent.push( literalOrPointer[ "copy" ] );
			else
				resultingListContent.push( literalOrPointer[ ! ! literalOrPointer[ "modified" ] ? "modified" : ! ! literalOrPointer[ "added" ] ? "added" : "copy" ] );
		} );
		return resultingListContent;
	}

	changePropertyContent():void {
		this.tempProperty.id = this.id;
		this.tempProperty.name = this.name;
		this.tempProperty.value = this.value;

		this.nameHasChanged = false;
		this.valueHasChanged = false;

		// Change name
		if( (! ! this.property.copy) ) {
			if( (this.tempProperty.name !== this.property.copy.name) ) {
				this.property.modified = this.tempProperty;
				this.nameHasChanged = true;
			} else { this.nameHasChanged = false; }
		}

		// Change literals and pointers
		if( isArray( this.value ) ) {
			this.tempProperty.value = [];
			let tempLists:any[] = this.convertToListRow( this.tempLists );
			[].concat( this.tempLiterals ).concat( this.tempPointers ).concat( tempLists ).forEach( ( literalOrPointerOrListRow ) => {
				if( ! literalOrPointerOrListRow.deleted )
					this.tempProperty.value.push( ! ! literalOrPointerOrListRow.added ? literalOrPointerOrListRow.added : ! ! literalOrPointerOrListRow.modified ? literalOrPointerOrListRow.modified : literalOrPointerOrListRow.copy );
			} );
			this.literalsHaveChanged = ! ! this.tempLiterals.find( ( literalRow ) => {return ! ! literalRow.modified || ! ! literalRow.added || ! ! literalRow.deleted } );
			this.pointersHaveChanged = ! ! this.tempPointers.find( ( pointerRow ) => {return ! ! pointerRow.modified || ! ! pointerRow.added || ! ! pointerRow.deleted } );
			this.listsHaveChanged = ! ! tempLists.find( ( listRow ) => {return ! ! listRow.modified || ! ! listRow.added || ! ! listRow.deleted } );

			if( this.literalsHaveChanged ) { this.property.modifiedLiterals = this.tempLiterals; }
			else { delete this.property.modifiedLiterals; }

			if( this.pointersHaveChanged ) { this.property.modifiedPointers = this.tempPointers; }
			else { delete this.property.modifiedPointers; }

			if( this.listsHaveChanged ) { this.property.modifiedLists = this.tempLists; }
			else { delete this.property.modifiedLists; }

		} else {

			// Change value because it is a single string
			if( (! ! this.property.copy) ) {
				if( (this.tempProperty.value !== this.property.copy.value) ) {
					this.property.modified = this.tempProperty;
					this.valueHasChanged = true;
				} else { this.valueHasChanged = false; }
			}
		}

		this.property.isBeingCreated = false;

		if( ! ! this.property.copy ) {
			if( this.propertyHasChanged ) this.property.modified = this.tempProperty;
			else delete this.property.modified;
			this.onChangeProperty.emit( this.tempProperty );
		} else if( ! ! this.property.added ) {
			if( (this.tempProperty.name !== this.property.added.name) ) {
				this.id = this.name;
			}
			this.property.added = this.tempProperty;
			if( this.existingProperties.indexOf( this.tempProperty.id ) === - 1 )
				this.onSaveNewProperty.emit( this.tempProperty );
			else
				this.onChangeNewProperty.emit( this.tempProperty );
		}
	}

	private escape( uri:string ):string {
		return encodeURI( uri );
	}

	private unescape( uri:string ):string {
		return decodeURI( uri );
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

	modifiedLiterals?:LiteralRow[];
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


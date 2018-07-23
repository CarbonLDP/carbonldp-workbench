import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnInit, ViewChild } from "@angular/core";

import { RDFLiteral } from "carbonldp/RDF/Literal";
import { RDFList } from "carbonldp/RDF/List";
import { URI } from "carbonldp/RDF/URI";
import { RDFNode } from "carbonldp/RDF/Node"
import { isArray } from "carbonldp/Utils";

import { LiteralStatus } from "./../../literals/literal.component";
import { PointerRow } from "./../../pointers/pointer.component";
import { ListRow } from "./../../lists/list.component";
import { NamedFragmentRow } from "./../../named-fragments/named-fragment.component";
import { DocumentExplorerLibrary } from "app/workbench/explorer/document-explorer/document-explorer-library";

@Component( {
	selector: "cw-property-content",
	templateUrl: "./property-content.component.html",
	styleUrls: [ "./property-content.component.scss" ],
	host: { "[class.has-changed]": "property.modified", "[class.deleted-property]": "property.deleted", "[class.added-property]": "property.added" },
} )

export class PropertyContentComponent implements AfterViewInit, OnInit {

	element:ElementRef;
	$element:JQuery;
	literals:LiteralStatus[] = [];
	pointers:PointerRow[] = [];
	lists:ListRow[] = [];
	tempLiterals:LiteralStatus[];
	tempPointers:PointerRow[];
	tempLists:ListRow[];
	tempProperty:Property = <Property>{};
	state:string;
	existingFragments:string[] = [];

	id:string;
	originalId:string;
	propertyName:string;
	originalName:string;
	value:any[] | string = [];

	addNewLiteral:EventEmitter<boolean> = new EventEmitter<boolean>();
	addNewPointer:EventEmitter<boolean> = new EventEmitter<boolean>();
	addNewList:EventEmitter<boolean> = new EventEmitter<boolean>();
	commonToken:string[] = [ "@id", "@type", "@value" ];
	modes:Modes = Modes;
	@ViewChild( "nameInput" ) nameInputControl;

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
		this._property = prop;
		this.state = ! ! prop.copy ? (! ! prop.modified ? "modified" : "copy") : "added";

		this.id = prop[ this.state ].id;
		this.tempProperty.id = prop[ this.state ].id;
		this.originalId = prop[ this.state ].value;

		this.propertyName = prop[ this.state ].name;
		this.tempProperty.name = prop[ this.state ].name;
		this.originalName = this.propertyName;
		if( isArray( prop[ this.state ].value ) ) {
			this.value = [];
			prop[ this.state ].value.forEach( ( literalOrRDFNode ) => { (<Array<any>>this.value).push( Object.assign( literalOrRDFNode ) ) } )
		} else {
			this.value = prop[ this.state ].value;
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


	get nameHasChanged():boolean { return ! ! this.property.copy && this.property.copy.name !== this.tempProperty.name; };

	get valueHasChanged():boolean { return ! ! this.property.copy && this.property.copy.value !== this.tempProperty.value; };

	get literalsHaveChanged():boolean { return ! ! this.tempLiterals.find( ( literalStatus ) => {return ! ! literalStatus.modified || ! ! literalStatus.added || ! ! literalStatus.deleted; } ) };

	get pointersHaveChanged():boolean { return ! ! this.tempPointers.find( ( pointerStatus ) => {return ! ! pointerStatus.modified || ! ! pointerStatus.added || ! ! pointerStatus.deleted; } ) };

	get listsHaveChanged():boolean { return ! ! this.tempLists.find( ( listStatus ) => {return ! ! listStatus.modified || ! ! listStatus.added || ! ! listStatus.deleted; } ) };

	get propertyHasChanged():boolean { return this.nameHasChanged || this.valueHasChanged || this.literalsHaveChanged || this.pointersHaveChanged || this.listsHaveChanged; }

	get isAccessPointHasMemberRelationProperty():boolean { return this.accessPointsHasMemberRelationProperties.indexOf( this.id ) !== - 1; }


	// TODO: Add @lists and @sets support
	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngOnInit():void {
		this.fillLiteralsAndPointers();
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializeAccordions();
		this.initializePropertyButtons();
		this.initializeDeletionDimmer();
	}

	private getSlug( uri:string ) {
		return URI.getSlug( uri );
	}

	isUrl( uri:string ):boolean {
		let r = /^(ftp|http|https):\/\/[^ "]+$/;
		return r.test( uri );
	}

	goToBlankNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}

	private initializeAccordions():void {
		this.$element.find( ".ui.accordion" ).accordion();
	}

	/*
	*   Initializes the options dropdown for the property
	*   allowing to edit its name or delete the property
	* */
	private initializePropertyButtons():void {
		this.$element.find( ".ui.options.dropdown.button" ).dropdown( {
			transition: "swing up"
		} );
		this.$element.find( ".ui.save-cancel.buttons .dropdown.button" ).dropdown();
	}

	/*
	*   Initializes the delete property confirmation message
	* */
	private initializeDeletionDimmer():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( { closable: false } );
	}

	onEditName():void {
		this.mode = Modes.EDIT;
	}

	cancelDeletion():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	cancelModification():void {
		if( this.nameInputControl.valid ) this.mode = Modes.READ;
		if( this.property.isBeingCreated ) this.onDeleteNewProperty.emit( this.property );
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
		this.checkForChangesOnName( this.sanitize( this.propertyName ) );
		this.mode = Modes.READ;
	}

	private sanitize( value:string ):string {
		let sanitized:string = value;
		let slug:string = this.getSlug( value );
		let parts:string[] = value.split( slug );
		if( parts.length > 0 ) sanitized = parts[ 0 ] + this.escape( slug );
		return sanitized;
	}

	/*
	*   Clean the variables that hold the literals, pointers and lists
	*   and fills them with the modified or the original versions of them
	* */
	private fillLiteralsAndPointers():void {
		this.literals = [];
		this.tempLiterals = [];
		this.pointers = [];
		this.tempPointers = [];
		this.lists = [];
		this.tempLists = [];

		// If there are modified literals, assign them ...
		if( this.property.modifiedLiterals !== void 0 ) {
			this.literals = this.property.modifiedLiterals;
			this.tempLiterals = this.property.modifiedLiterals;
		} else {
			// ... otherwise fill them with the original values
			this.property[ this.state ].value.forEach( ( literalOrRDFNode ) => {
				if( ! RDFLiteral.is( literalOrRDFNode ) ) return;
				this.literals.push( { copy: literalOrRDFNode } );
				this.tempLiterals.push( { copy: literalOrRDFNode } );
			} );
		}

		// If there are modified pointers, assign them ...
		if( this.property.modifiedPointers !== void 0 ) {
			this.pointers = this.property.modifiedPointers;
			this.tempPointers = this.property.modifiedPointers;
		} else {
			// ... otherwise fill them with the original values
			this.property[ this.state ].value.forEach( ( literalOrRDFNode ) => {
				if( ! RDFNode.is( literalOrRDFNode ) ) return;
				this.pointers.push( <PointerRow>{ copy: literalOrRDFNode } );
				this.tempPointers.push( <PointerRow>{ copy: literalOrRDFNode } );
			} );
		}

		// If there are modified literals, assign them ...
		if( this.property.modifiedLists !== void 0 ) {
			this.lists = this.property.modifiedLists;
			this.tempLists = this.property.modifiedLists;
		} else {
			// ... otherwise fill them with the original values
			this.property[ this.state ].value.forEach( ( literalOrRDFNodeOrList ) => {
				if( ! RDFList.is( literalOrRDFNodeOrList ) ) return;
				this.lists.push( <ListRow>{ copy: literalOrRDFNodeOrList[ "@list" ].map( ( item ) => { return { copy: item } } ) } );
				this.tempLists.push( <ListRow>{ copy: literalOrRDFNodeOrList } );
			} );
		}
	}

	/*
	* Notify LiteralsComponent to add a literal
	* */
	addLiteral():void {
		this.addNewLiteral.emit( true );
	}

	/*
	* Notify PointersComponent to add a pointer
	* */
	addPointer():void {
		this.addNewPointer.emit( true );
	}

	/*
	* Notify ListsComponent to add a list
	* */
	addList():void {
		this.addNewList.emit( true );
	}

	/*
	* Checks for changes in the name of the property
	* */
	checkForChangesOnName( newName:string ):void {
		this.propertyName = newName;
		if( (this.propertyName !== void 0) &&
			((this.propertyName !== this.property[ this.state ].name) || (this.propertyName !== this.tempProperty.name)) ||
			this.property.isBeingCreated ) {

			this.tempProperty.name = this.propertyName;
			this.changePropertyContent();
		}
	}

	checkForChangesOnLiterals( literals:LiteralStatus[] ):void {
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

	convertToListWithStates( lists:ListRow[] ):ListRow[] {
		let resultingLists:ListRow[] = [];
		lists.forEach( ( list:ListRow ) => {
			let state:string = (! ! list.added) ? "added" : (! ! list.deleted) ? "deleted" : (! ! list.modified) ? "modified" : "copy";
			let resultingList:ListRow = {
				[ state ]: {
					[ PropertyToken.LIST ]: this.getRDFList( list, state )
				}
			};
			resultingLists.push( resultingList );
		} );
		return resultingLists;
	}

	getRDFList( list:ListRow, state:string ):any[] {
		let resultingListContent:any[] = [];
		list[ state ].forEach( ( literalOrPointer:any ) => {
			if( ! ! literalOrPointer.deleted ) return;
			if( state === "copy" ) {
				resultingListContent.push( literalOrPointer.copy );
			} else {
				let literalOrPointerState:string = (! ! literalOrPointer.modified) ? "modified" : (! ! literalOrPointer.added) ? "added" : "copy";
				resultingListContent.push( literalOrPointer[ literalOrPointerState ] );
			}
		} );
		return resultingListContent;
	}

	changePropertyContent():void {
		this.tempProperty.id = this.id;
		this.tempProperty.name = this.propertyName;
		this.tempProperty.value = this.value;


		// If the value of the property is an array, change the values of its literals/pointers/lists ...

		this.tempProperty.value = [];
		let tempLists:any[] = this.convertToListWithStates( this.tempLists );
		[]
			.concat( this.tempLiterals )
			.concat( this.tempPointers )
			.concat( tempLists )
			.forEach( ( literalOrPointerOrList:LiteralStatus | PointerRow | ListRow ) => {
				if( literalOrPointerOrList.deleted ) return;

				let state:string = (! ! literalOrPointerOrList.modified) ? "modified" : (! ! literalOrPointerOrList.added) ? "added" : "copy";

				this.tempProperty.value.push( literalOrPointerOrList[ state ] );
			} );


		if( this.propertyHasChanged ) {

			if( this.literalsHaveChanged ) {
				this.property.modifiedLiterals = this.tempLiterals;
			} else {
				delete this.property.modifiedLiterals;
			}

			if( this.pointersHaveChanged ) {
				this.property.modifiedPointers = this.tempPointers;
			} else {
				delete this.property.modifiedPointers;
			}

			if( this.listsHaveChanged ) {
				this.property.modifiedLists = this.tempLists;
			} else {
				delete this.property.modifiedLists;
			}
		}

		if( ! ! this.property.copy ) {

			if( this.propertyHasChanged ) {
				this.property.modified = this.tempProperty;
			} else {
				delete this.property.modified;
			}
			this.onChangeProperty.emit( this.tempProperty );

		} else if( ! ! this.property.added ) {

			if( this.tempProperty.name !== this.property.added.name ) {}

			this.id = this.propertyName;
			this.property.added = this.tempProperty;
			this.property.isBeingCreated = false;

			if( this.existingProperties.indexOf( this.tempProperty.id ) === - 1 ) {
				this.onSaveNewProperty.emit( this.tempProperty );
			} else {
				this.onChangeNewProperty.emit( this.tempProperty );
			}
		}
	}

	private escape( uri:string ):string {
		return encodeURI( uri );
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
}

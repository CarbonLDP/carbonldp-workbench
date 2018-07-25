import { Component, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnInit, ViewChild } from "@angular/core";

import { RDFLiteral } from "carbonldp/RDF/Literal";
import { RDFList } from "carbonldp/RDF/List";
import { URI } from "carbonldp/RDF/URI";
import { RDFNode } from "carbonldp/RDF/Node"

import { LiteralStatus } from "./../../literals/literal.component";
import { PointerStatus } from "./../../pointers/pointer.component";
import { ListStatus } from "./../../lists/list.component";
import { NamedFragmentStatus } from "./../../named-fragments/named-fragment.component";
import { Property, PropertyStatus, Modes } from "./../property.component";
import { JsonLDKeyword } from "./../../document-explorer-library";

@Component( {
	selector: "cw-property-content",
	templateUrl: "./property-content.component.html",
	styleUrls: [ "./property-content.component.scss" ],
} )

export class PropertyContentComponent implements AfterViewInit, OnInit {

	element:ElementRef;
	$element:JQuery;
	literals:LiteralStatus[] = [];
	pointers:PointerStatus[] = [];
	lists:ListStatus[] = [];

	// Variable that will have the JSON object of the property
	// with all the changes made to the original property.
	tempProperty:Property = <Property>{};
	status:string;

	id:string;
	propertyName:string;
	originalName:string;
	value:any[] = [];

	addNewLiteral:EventEmitter<boolean> = new EventEmitter<boolean>();
	addNewPointer:EventEmitter<boolean> = new EventEmitter<boolean>();
	addNewList:EventEmitter<boolean> = new EventEmitter<boolean>();
	modes:Modes = Modes;
	@ViewChild( "nameInput" ) nameInputControl;

	@Input() mode:string = Modes.READ;
	@Input() documentURI:string = "";
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() isPartOfNamedFragment:boolean = false;
	@Input() canEdit:boolean = true;
	@Input() existingProperties:string[] = [];
	@Input() accessPointsHasMemberRelationProperties:string[] = [];
	private _property:PropertyStatus;
	@Input() set property( prop:PropertyStatus ) {
		this._property = prop;
		this.status = ! ! prop.copy ? (! ! prop.modified ? "modified" : "copy") : "added";

		// Assign the id of the property
		this.id = prop[ this.status ].id;
		this.tempProperty.id = prop[ this.status ].id;

		// Assign the name of the property
		this.propertyName = prop[ this.status ].name;
		this.tempProperty.name = prop[ this.status ].name;
		this.originalName = this.propertyName;

		// Assign the value of the property
		this.value = [];
		prop[ this.status ].value.forEach( ( literalOrPointerOrList ) => { this.value.push( Object.assign( literalOrPointerOrList ) ) } )
	}

	get property():PropertyStatus { return this._property; }

	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onChangeProperty:EventEmitter<Property> = new EventEmitter<Property>();
	@Output() onDeleteProperty:EventEmitter<PropertyStatus> = new EventEmitter<PropertyStatus>();
	@Output() onSaveNewProperty:EventEmitter<Property> = new EventEmitter<Property>();


	get nameHasChanged():boolean { return ! ! this.property.copy && this.property.copy.name !== this.tempProperty.name; };

	get literalsHaveChanged():boolean { return ! ! this.literals.find( ( literalStatus ) => {return ! ! literalStatus.modified || ! ! literalStatus.added || ! ! literalStatus.deleted; } ) };

	get pointersHaveChanged():boolean { return ! ! this.pointers.find( ( pointerStatus ) => {return ! ! pointerStatus.modified || ! ! pointerStatus.added || ! ! pointerStatus.deleted; } ) };

	get listsHaveChanged():boolean { return ! ! this.lists.find( ( listStatus ) => {return ! ! listStatus.modified || ! ! listStatus.added || ! ! listStatus.deleted; } ) };

	get propertyHasChanged():boolean { return this.nameHasChanged || this.literalsHaveChanged || this.pointersHaveChanged || this.listsHaveChanged; }

	get isAccessPointHasMemberRelationProperty():boolean { return this.accessPointsHasMemberRelationProperties.indexOf( this.id ) !== - 1; }


	// TODO: Add @lists and @sets support
	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngOnInit():void {
		this.fillLiteralsPointersAndLists();
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializeAccordions();
		this.initializePropertyButtons();
		this.initializeDeletionDimmer();
	}

	goToBlankNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}

	onEditName():void {
		this.mode = Modes.EDIT;
	}

	cancelDeletion():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	cancelModification():void {
		if( this.nameInputControl.valid ) this.mode = Modes.READ;
		if( this.property.isBeingCreated ) this.onDeleteProperty.emit( this.property );
	}

	askToConfirmDeletion():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( "show" );
	}

	deleteProperty():void {
		if( this.property.added === void 0 ) {
			this.property.deleted = this.property.copy;
		}
		this.onDeleteProperty.emit( this.property );
	}

	save():void {
		this.checkForChangesOnName( this.sanitize( this.propertyName ) );
		this.mode = Modes.READ;
	}

	/*
	*   Clean the variables that hold the literals, pointers and lists
	*   and fills them with the original versions of them
	* */
	private fillLiteralsPointersAndLists():void {
		this.literals = [];
		this.pointers = [];
		this.lists = [];

		this.property[ this.status ].value.forEach( ( literalOrRDFNodeOrList ) => {
			if( RDFLiteral.is( literalOrRDFNodeOrList ) ) {
				this.literals.push( { copy: literalOrRDFNodeOrList } );
			} else if( RDFNode.is( literalOrRDFNodeOrList ) ) {
				this.pointers.push( <PointerStatus>{ copy: literalOrRDFNodeOrList } );
			} else if( RDFList.is( literalOrRDFNodeOrList ) ) {
				this.lists.push( <ListStatus>{ copy: literalOrRDFNodeOrList[ "@list" ].map( ( item ) => { return { copy: item } } ) } );
			}
		} );
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


	checkForChangesOnName( newName:string ):void {
		this.propertyName = newName;
		if( (this.propertyName !== void 0) &&
			((this.propertyName !== this.property[ this.status ].name) || (this.propertyName !== this.tempProperty.name)) ||
			this.property.isBeingCreated ) {

			this.tempProperty.name = this.propertyName;
			this.changePropertyContent();
		}
	}

	checkForChangesOnLiterals( literals:LiteralStatus[] ):void {
		this.literals = literals;
		this.changePropertyContent();
	}

	checkForChangesOnPointers( pointers:PointerStatus[] ):void {
		this.pointers = pointers;
		this.changePropertyContent();
	}

	checkForChangesOnLists( lists:ListStatus[] ):void {
		this.lists = lists;
		this.changePropertyContent();
	}

	private convertToListWithStates( lists:ListStatus[] ):ListStatus[] {
		let resultingLists:ListStatus[] = [];
		lists.forEach( ( list:ListStatus ) => {
			let state:string = (! ! list.added) ? "added" : (! ! list.deleted) ? "deleted" : (! ! list.modified) ? "modified" : "copy";
			let resultingList:ListStatus = {
				[ state ]: {
					[ JsonLDKeyword.LIST ]: this.getRDFList( list, state )
				}
			};
			resultingLists.push( resultingList );
		} );
		return resultingLists;
	}

	private getRDFList( list:ListStatus, state:string ):any[] {
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
		this.tempProperty.value = this.getValueWithChanges();
		delete this.property.modified;

		if( ! ! this.property.copy ) {
			if( this.propertyHasChanged ) {
				this.property.modified = this.tempProperty;
			}
			this.onChangeProperty.emit( this.tempProperty );

		} else if( ! ! this.property.added ) {

			this.id = this.propertyName;
			this.property.added = this.tempProperty;
			this.property.isBeingCreated = false;

			if( this.existingProperties.indexOf( this.tempProperty.id ) === - 1 ) {
				this.onSaveNewProperty.emit( this.tempProperty );
			} else {
				this.onChangeProperty.emit( this.tempProperty );
			}
		}
	}

	/*
	*   Creates a new array with the new value created by concatenating
	*   the original/modified/added literals, pointers and lists
	* */
	private getValueWithChanges():Array<LiteralStatus | PointerStatus | ListStatus> {
		let tempValue:Array<LiteralStatus | PointerStatus | ListStatus> = [];
		let tempLists:ListStatus[] = this.convertToListWithStates( this.lists );

		// Concat the literals with the pointers and the lists
		// and add them to the returning value
		[ ...this.literals, ...this.pointers, ...tempLists ]
			.forEach( ( literalOrPointerOrList:LiteralStatus | PointerStatus | ListStatus ) => {
				if( literalOrPointerOrList.deleted ) return;

				let state:string = (! ! literalOrPointerOrList.modified) ? "modified" : (! ! literalOrPointerOrList.added) ? "added" : "copy";

				tempValue.push( literalOrPointerOrList[ state ] );
			} );

		return tempValue;
	}

	private sanitize( value:string ):string {
		let sanitized:string = value;
		let slug:string = this.getSlug( value );
		let parts:string[] = value.split( slug );
		if( parts.length > 0 ) sanitized = parts[ 0 ] + this.escape( slug );
		return sanitized;
	}

	private getSlug( uri:string ) {
		return URI.getSlug( uri );
	}

	private escape( uri:string ):string {
		return encodeURI( uri );
	}

	private initializeAccordions():void {
		this.$element.find( ".ui.accordion" ).accordion();
	}

	private initializePropertyButtons():void {
		this.$element.find( ".ui.options.dropdown.button" ).dropdown( {
			transition: "swing up"
		} );
		this.$element.find( ".ui.save-cancel.buttons .dropdown.button" ).dropdown();
	}

	private initializeDeletionDimmer():void {
		this.$element.find( ".property.confirm-deletion.dimmer" ).dimmer( { closable: false } );
	}

}

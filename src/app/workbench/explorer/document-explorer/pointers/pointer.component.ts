import { Component, ElementRef, Input, Output, SimpleChange, EventEmitter, OnChanges } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

import { Modes } from "../property/property.component";
import { BlankNodeRow } from "../blank-nodes/blank-node.component";
import { NamedFragmentRow } from "../named-fragments/named-fragment.component";


@Component( {
	selector: "tr.cw-pointer",
	templateUrl: "./pointer.component.html",
	styleUrls: [ "./pointer.component.scss" ],
} )

export class PointerComponent implements OnChanges {

	$element:JQuery;
	element:ElementRef;
	private tempPointer:any = {};
	pointersDropdown:JQuery;
	isBlankNode:boolean = false;
	isNamedFragment:boolean = false;
	existsOnPointers:boolean = false;

	private _mode = Modes.READ;
	@Input() set mode( value:string ) {
		this._mode = value;
		this.onEditMode.emit( this.mode === Modes.EDIT );
		if( this.mode === Modes.EDIT ) {
			this.initializePointersDropdown();
		}
	}

	get mode() {
		return this._mode;
	}

	modes:typeof Modes = Modes;


	// Inputs and Outputs
	private _pointer = <PointerRow>{};
	get pointer() { return this._pointer; }

	@Input() set pointer( value:PointerRow ) {
		this._pointer = value;
		if( this.pointer.added ) { this.mode = Modes.EDIT; }

		if( typeof this.pointer.modified !== "undefined" ) {
			this.id = this.pointer.modified[ "@id" ];
		} else if( typeof this.pointer.copy !== "undefined" ) {
			this.id = this.pointer.copy[ "@id" ];
		} else if( typeof this.pointer.added !== "undefined" ) {
			this.id = this.pointer.added[ "@id" ];
		}
	}

	@Input() documentURI:string = "";
	@Input() blankNodes:BlankNodeRow[] = [];
	@Input() namedFragments:NamedFragmentRow[] = [];
	@Input() canEdit:boolean = true;
	@Input() partOfList:boolean = false;
	@Input() isFirstItem:boolean = false;
	@Input() isLastItem:boolean = false;

	@Output() onEditMode:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSave:EventEmitter<any> = new EventEmitter<any>();
	@Output() onDeletePointer:EventEmitter<PointerRow> = new EventEmitter<PointerRow>();
	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onMoveUp:EventEmitter<PointerRow> = new EventEmitter<PointerRow>();
	@Output() onMoveDown:EventEmitter<PointerRow> = new EventEmitter<PointerRow>();

	// Literal Value;
	private _id:string = "";
	get id():string {return this._id;}

	set id( id:string ) {
		this._id = id;
		this.checkForChangesOnPointers();
	}


	constructor( element:ElementRef ) {
		this.element = element;
	}

	onEdit( event:Event ):void {
		this.mode = Modes.EDIT;
	}

	deletePointer():void {
		if( typeof this.pointer.added === "undefined" ) {
			this.pointer.deleted = this.pointer.copy;
		}
		this.onDeletePointer.emit( this.pointer );
	}

	ngOnChanges( changes:{ [ propName:string ]:SimpleChange } ):void {
		if( (! ! changes.blankNodes && changes.blankNodes.currentValue !== changes.blankNodes.previousValue) ||
			(! ! changes.namedFragments && changes.namedFragments.currentValue !== changes.namedFragments.previousValue) ) {
			this.checkForChangesOnPointers();
		}
	}

	checkForChangesOnPointers():void {
		if( typeof this.id === "undefined" ) return;
		let idx:number = this.blankNodes.concat( this.namedFragments ).findIndex( ( nfOrBN ) => {return nfOrBN[ "name" ] === this.id || nfOrBN[ "id" ] === this.id;} );
		this.isBlankNode = URI.isBNodeID( <string>this.id );
		this.isNamedFragment = URI.isFragmentOf( this.id, this.documentURI );
		this.existsOnPointers = idx !== - 1;
	}

	cancelEdit():void {
		this.mode = Modes.READ;
		let initialStatus:string = typeof this.pointer.copy !== "undefined" ? "copy" : "added";

		if( this.tempPointer[ PointerToken.ID ] === void 0 ) {
			this.id = this.pointer[ initialStatus ][ PointerToken.ID ];
			delete this.tempPointer[ PointerToken.ID ];
		} else {
			this.id = this.tempPointer[ PointerToken.ID ];
		}

		// If canceling a new Pointer without previous id, delete it
		if( this.pointer.added !== void 0 && this.id === void 0 ) {
			this.onDeletePointer.emit( this.pointer );
		}
	}

	save():void {
		let initialStatus:string = typeof this.pointer.copy !== "undefined" ? "copy" : "added";
		let initialId:string = this.pointer[ initialStatus ][ PointerToken.ID ];

		if( (this.id !== void 0) &&
			(this.id !== initialId || this.id !== this.tempPointer[ PointerToken.ID ]) ) {
			this.tempPointer[ PointerToken.ID ] = this.id;
		}

		switch( initialStatus ) {
			case "copy":
				if( initialId === this.tempPointer[ PointerToken.ID ] ) {
					delete this.tempPointer[ PointerToken.ID ];
					delete this.pointer.modified;
				} else {
					this.pointer.modified = this.tempPointer;
				}
				break;
			case "added":
				this.pointer.added = this.tempPointer;
				break;
		}

		this.onSave.emit( this.pointer );
		this.mode = Modes.READ;
	}

	private initializePointersDropdown():void {
		this.pointersDropdown = $( this.element.nativeElement.querySelector( ".fragments.search.dropdown" ) );
		if( ! ! this.pointersDropdown ) {
			this.pointersDropdown.dropdown( {
				allowAdditions: true,
				onChange: this.changeId.bind( this )
			} );
		}
		this.pointersDropdown.dropdown( "set selected", this.id );
		this.pointersDropdown.dropdown( "set text", this.id );
	}

	changeId( id:string, text?:string, choice?:JQuery ):void {
		if( id === "empty" ) id = null;
		this.id = id;
	}

	getFriendlyName( uri:string ):string {
		if( URI.hasFragment( uri ) ) return URI.getFragment( uri );
		return URI.getSlug( uri );
	}

	goToBlankNode( id:string ):void {
		let idx:number = this.blankNodes.findIndex( ( blankNode:BlankNodeRow ) => { return blankNode.id === id; } );
		this.existsOnPointers = idx !== - 1;
		if( this.existsOnPointers ) this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		let idx:number = this.namedFragments.findIndex( ( namedFragment:NamedFragmentRow ) => { return namedFragment.name === id; } );
		this.existsOnPointers = idx !== - 1;
		if( this.existsOnPointers ) this.onGoToNamedFragment.emit( id );
	}

	moveUp():void {
		this.onMoveUp.emit( this.pointer );
	}

	moveDown():void {
		this.onMoveDown.emit( this.pointer );
	}
}

export enum PointerToken {
	ID = "@id"
}

export interface PointerRow {
	copy:Pointer;
	modified?:Pointer;
	added?:Pointer;
	deleted?:Pointer;
}

export interface Pointer {
	"@id":string;
}


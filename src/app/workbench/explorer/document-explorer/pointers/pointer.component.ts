import { Component, ElementRef, Input, Output, SimpleChange, EventEmitter, OnChanges } from "@angular/core";

import { URI } from "carbonldp/RDF/URI";

import { BlankNodeStatus } from "../blank-nodes/blank-node.component";
import { NamedFragmentStatus } from "../named-fragments/named-fragment.component";
import { Modes, JsonLDKeyword } from "../document-explorer-library";


/*
*  Displays the id of a pointer
* */
@Component( {
	selector: "tr.cw-pointer",
	templateUrl: "./pointer.component.html",
	styleUrls: [ "./pointer.component.scss" ],
} )

export class PointerComponent implements OnChanges {

	$element:JQuery;
	element:ElementRef;

	/**
	 *  Temporarily contains all the changes made to
	 *  the pointer (@id) before modifying the
	 *  original pointers.
	 * */
	private tempPointer:any = {};
	pointersDropdown:JQuery;
	isBlankNode:boolean = false;
	isNamedFragment:boolean = false;
	existsOnPointers:boolean = false;

	private _mode = Modes.READ;
	@Input() set mode( value:string ) {
		setTimeout( () => {
			this._mode = value;
			this.onEditMode.emit( this.mode === Modes.EDIT );
			if( this.mode !== Modes.EDIT ) return;
			this.initializePointersDropdown();
		}, 0 );
	}

	get mode() { return this._mode; }

	modes:typeof Modes = Modes;


	// Inputs and Outputs
	private _pointer = <PointerStatus>{};
	get pointer() { return this._pointer; }

	@Input() set pointer( value:PointerStatus ) {
		this._pointer = value;
		if( this.pointer.added ) { this.mode = Modes.EDIT; }

		/**
		 *  Check if its going to use the modified,
		 *  the original or the added values of the
		 *  pointer.
		 * */
		if( this.pointer.modified !== void 0 ) {
			this.id = this.pointer.modified[ JsonLDKeyword.ID ];
		} else if( this.pointer.copy !== void 0 ) {
			this.id = this.pointer.copy[ JsonLDKeyword.ID ];
		} else if( this.pointer.added !== void 0 ) {
			this.id = this.pointer.added[ JsonLDKeyword.ID ];
		}
	}

	@Input() documentURI:string = "";
	@Input() blankNodes:BlankNodeStatus[] = [];
	@Input() namedFragments:NamedFragmentStatus[] = [];
	@Input() canEdit:boolean = true;
	@Input() partOfList:boolean = false;
	@Input() isFirstItem:boolean = false;
	@Input() isLastItem:boolean = false;

	@Output() onEditMode:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSave:EventEmitter<any> = new EventEmitter<any>();
	@Output() onDeletePointer:EventEmitter<PointerStatus> = new EventEmitter<PointerStatus>();
	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();
	@Output() onMoveUp:EventEmitter<PointerStatus> = new EventEmitter<PointerStatus>();
	@Output() onMoveDown:EventEmitter<PointerStatus> = new EventEmitter<PointerStatus>();

	// Pointer Value;
	private _id:string = "";
	get id():string { return this._id; }

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
		if( this.pointer.added === void 0 ) {
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
		if( this.id === void 0 ) return;
		let idx:number =
			[
				...this.blankNodes,
				...this.namedFragments
			].findIndex( ( nfOrBN ) => { return nfOrBN[ "name" ] === this.id || nfOrBN[ "id" ] === this.id; } );
		this.isBlankNode = URI.isBNodeID( <string>this.id );
		this.isNamedFragment = URI.isFragmentOf( this.id, this.documentURI );
		this.existsOnPointers = idx !== - 1;
	}

	cancelEdit():void {
		this.mode = Modes.READ;
		let initialStatus:string = typeof this.pointer.copy !== "undefined" ? "copy" : "added";

		if( this.tempPointer[ JsonLDKeyword.ID ] === void 0 ) {
			this.id = this.pointer[ initialStatus ][ JsonLDKeyword.ID ];
			delete this.tempPointer[ JsonLDKeyword.ID ];
		} else {
			this.id = this.tempPointer[ JsonLDKeyword.ID ];
		}

		// If canceling a new Pointer without previous id, delete it
		if( this.pointer.added !== void 0 && this.id === void 0 ) {
			this.onDeletePointer.emit( this.pointer );
		}
	}

	save():void {
		let initialStatus:string = ! ! this.pointer.copy ? "copy" : "added";
		let initialId:string = this.pointer[ initialStatus ][ JsonLDKeyword.ID ];

		if( (this.id !== void 0) &&
			(this.id !== initialId || this.id !== this.tempPointer[ JsonLDKeyword.ID ]) ) {
			this.tempPointer[ JsonLDKeyword.ID ] = this.id;
		}

		switch( initialStatus ) {
			case "copy":
				if( initialId === this.tempPointer[ JsonLDKeyword.ID ] ) {
					delete this.tempPointer[ JsonLDKeyword.ID ];
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

	private changeId( id:string, text?:string, choice?:JQuery ):void {
		if( id === "empty" ) id = null;
		this.id = id;
	}

	goToBlankNode( id:string ):void {
		let idx:number = this.blankNodes.findIndex( ( blankNode:BlankNodeStatus ) => { return blankNode.id === id; } );
		this.existsOnPointers = idx !== - 1;
		if( this.existsOnPointers ) this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		let idx:number = this.namedFragments.findIndex( ( namedFragment:NamedFragmentStatus ) => { return namedFragment.name === id; } );
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

export interface PointerStatus {
	copy:Pointer;
	modified?:Pointer;
	added?:Pointer;
	deleted?:Pointer;
}

export interface Pointer {
	"@id":string;
}


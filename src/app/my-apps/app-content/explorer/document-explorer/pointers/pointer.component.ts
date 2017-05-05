import { Component, ElementRef, Input, Output, SimpleChange, EventEmitter, OnChanges } from "@angular/core";

import * as URI from "carbonldp/RDF/URI";

import { Modes } from "./../property/property.component";
import { BlankNodeRow } from "./../blank-nodes/blank-node.component";
import { NamedFragmentRow } from "./../named-fragments/named-fragment.component";

import * as $ from "jquery";
import "semantic-ui/semantic";

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
	isBNode:boolean = false;
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
		if( this.pointer.isBeingCreated ) this.mode = Modes.EDIT;

		if( typeof this.pointer.modified !== "undefined" ) {
			this.id = ! ! this.tempPointer[ "@id" ] ? this.tempPointer[ "@id" ] : this.pointer.modified[ "@id" ];
		} else if( typeof this.pointer.copy !== "undefined" ) {
			this.id = ! ! this.tempPointer[ "@id" ] ? this.tempPointer[ "@id" ] : this.pointer.copy[ "@id" ];
		} else if( typeof this.pointer.added !== "undefined" ) {
			this.id = ! ! this.tempPointer[ "@id" ] ? this.tempPointer[ "@id" ] : this.pointer.added[ "@id" ];
		}
	}

	@Input() documentURI:string = "";
	@Input() bNodes:BlankNodeRow[] = [];
	@Input() namedFragments:NamedFragmentRow[] = [];
	@Input() canEdit:boolean = true;
	@Input() partOfList:boolean = false;
	@Input() isFirstItem:boolean = false;
	@Input() isLastItem:boolean = false;

	@Output() onEditMode:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSave:EventEmitter<any> = new EventEmitter<any>();
	@Output() onDeletePointer:EventEmitter<PointerRow> = new EventEmitter<PointerRow>();
	@Output() onGoToBNode:EventEmitter<string> = new EventEmitter<string>();
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

	ngOnChanges( changes:{ [propName:string]:SimpleChange } ):void {
		if( ( ! ! changes[ "bNodes" ] && changes[ "bNodes" ].currentValue !== changes[ "bNodes" ].previousValue ) ||
			( ! ! changes[ "namedFragments" ] && changes[ "namedFragments" ].currentValue !== changes[ "namedFragments" ].previousValue ) ) {
			this.checkForChangesOnPointers();
		}
	}

	checkForChangesOnPointers():void {
		if( typeof this.id === "undefined" ) return;
		let idx:number = this.bNodes.concat( this.namedFragments ).findIndex( ( nfOrBN ) => {return nfOrBN[ "name" ] === this.id || nfOrBN[ "id" ] === this.id;} );
		this.isBNode = URI.Util.isBNodeID( <string>this.id );
		this.isNamedFragment = URI.Util.isFragmentOf( this.id, this.documentURI );
		this.existsOnPointers = idx !== - 1;
	}

	cancelEdit():void {
		this.mode = Modes.READ;
		let copyOrAdded:string = typeof this.pointer.copy !== "undefined" ? "copy" : "added";

		if( typeof this.tempPointer[ "@id" ] === "undefined" ) {
			this.id = this.pointer[ copyOrAdded ][ "@id" ];
			delete this.tempPointer[ "@id" ];
		} else this.id = this.tempPointer[ "@id" ];


		if( typeof this.pointer.added !== "undefined" && (typeof this.id === "undefined" || this.id.length === 0) ) {
			this.onDeletePointer.emit( this.pointer );
		}
	}

	save():void {
		let copyOrAdded:string = typeof this.pointer.copy !== "undefined" ? "copy" : "added";

		if( typeof this.id !== "undefined" && (this.id !== this.pointer[ copyOrAdded ][ "@id" ] || this.id !== this.tempPointer[ "@id" ] ) ) {
			this.tempPointer[ "@id" ] = this.id;
		}

		if( (! ! this.pointer.copy) && (this.tempPointer[ "@id" ] === this.pointer.copy[ "@id" ] ) ) {
			delete this.tempPointer[ "@id" ];
			delete this.pointer.modified;
		} else if( ! ! this.pointer.added ) {
			this.pointer.added = this.tempPointer;
		} else {
			this.pointer.modified = this.tempPointer;
		}

		this.onSave.emit( this.tempPointer );
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
	}

	changeId( id:string, text?:string, choice?:JQuery ):void {
		if( id === "empty" ) id = null;
		this.id = id;
	}

	getFriendlyName( uri:string ):string {
		if( URI.Util.hasFragment( uri ) )return URI.Util.getFragment( uri );
		return URI.Util.getSlug( uri );
	}

	goToBNode( id:string ):void {
		let idx:number = this.bNodes.findIndex( ( blankNode:BlankNodeRow ) => { return blankNode.id === id; } );
		this.existsOnPointers = idx !== - 1;
		if( this.existsOnPointers ) this.onGoToBNode.emit( id );
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
export interface PointerRow {
	copy:Pointer;
	modified?:Pointer;
	added?:Pointer;
	deleted?:Pointer;

	isBeingCreated?:boolean;
}
export interface Pointer {
	"@id":string;
}


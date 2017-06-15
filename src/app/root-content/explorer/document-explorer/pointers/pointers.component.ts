import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import * as RDFNode from "carbonldp/RDF/Node";

import { Modes } from "../property/property.component";
import { Pointer, PointerRow } from "./pointer.component";

import "semantic-ui/semantic";


@Component( {
	selector: "cw-pointers",
	templateUrl: "./pointers.component.html",
	styleUrls: [  "./pointers.component.scss"  ],
} )

export class PointersComponent implements OnInit {

	modes:Modes = Modes;
	tokens:string[] = [ "@id", "@type" ];
	tempPointers:Pointer[] = [];
	isEditingPointer:boolean = false;
	canDisplayPointers:boolean = false;

	@Input() documentURI:string = "";
	@Input() pointers:PointerRow[] = [];
	@Input() onAddNewPointer:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() bNodes:RDFNode.Class[] = [];
	@Input() namedFragments:RDFNode.Class[] = [];
	@Input() canEdit:boolean = true;

	@Output() onPointersChanges:EventEmitter<PointerRow[]> = new EventEmitter<PointerRow[]>();
	@Output() onGoToBNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();

	constructor() { }

	ngOnInit():void {
		this.onAddNewPointer.subscribe( () => {
			this.addNewPointer();
		} );
		this.updateCanDisplayPointers();
	}

	addNewPointer():void {
		let newPointerRow:PointerRow = <PointerRow>{};
		newPointerRow.added = <Pointer>{};
		newPointerRow.isBeingCreated = true;
		this.pointers.splice( 0, 0, newPointerRow );
		this.updateCanDisplayPointers();
	}

	savePointer( modifiedPointer:Pointer, originalPointer:Pointer, index:number ) {
		if( typeof this.pointers[ index ].added !== "undefined" ) delete this.pointers[ index ].isBeingCreated;
		this.onPointersChanges.emit( this.pointers );
		this.updateCanDisplayPointers();
	}

	deletePointer( deletingPointer:PointerRow, index:number ):void {
		if( typeof deletingPointer.added !== "undefined" ) this.pointers.splice( index, 1 );
		this.onPointersChanges.emit( this.pointers );
		this.updateCanDisplayPointers();
	}

	updateCanDisplayPointers():void {
		this.canDisplayPointers = this.getUntouchedPointers().length > 0 || this.getAddedPointers().length > 0 || this.getModifiedPointers().length > 0;
	}

	getAddedPointers():PointerRow[] {
		return this.pointers.filter( ( pointer:PointerRow ) => typeof pointer.added !== "undefined" );
	}

	getModifiedPointers():PointerRow[] {
		return this.pointers.filter( ( pointer:PointerRow ) => typeof pointer.modified !== "undefined" && typeof pointer.deleted === "undefined" );
	}

	getDeletedPointers():PointerRow[] {
		return this.pointers.filter( ( pointer:PointerRow ) => typeof pointer.deleted !== "undefined" );
	}

	getUntouchedPointers():PointerRow[] {
		return this.pointers.filter( ( pointer:PointerRow ) => typeof pointer.modified === "undefined" && typeof pointer.deleted === "undefined" );
	}

	goToBNode( id:string ):void {
		this.onGoToBNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}
}

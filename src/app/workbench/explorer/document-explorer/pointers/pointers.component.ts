import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { RDFNode } from "carbonldp/RDF/Node"

import { Modes } from "../property/property.component";
import { Pointer, PointerStatus } from "./pointer.component";


@Component( {
	selector: "cw-pointers",
	templateUrl: "./pointers.component.html",
	styleUrls: [ "./pointers.component.scss" ],
} )

export class PointersComponent implements OnInit {

	modes:Modes = Modes;
	tempPointers:Pointer[] = [];
	canDisplayPointers:boolean = false;

	@Input() documentURI:string = "";
	@Input() pointers:PointerStatus[] = [];
	@Input() onAddNewPointer:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() canEdit:boolean = true;

	@Output() onPointersChanges:EventEmitter<PointerStatus[]> = new EventEmitter<PointerStatus[]>();
	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();

	constructor() { }

	ngOnInit():void {
		this.onAddNewPointer.subscribe( () => {
			this.addNewPointer();
		} );
		this.updateCanDisplayPointers();
	}

	addNewPointer():void {
		let newPointerStatus:PointerStatus = <PointerStatus>{};
		newPointerStatus.added = <Pointer>{};
		this.pointers.splice( 0, 0, newPointerStatus );
		this.updateCanDisplayPointers();
	}

	savePointer() {
		this.onPointersChanges.emit( this.pointers );
		this.updateCanDisplayPointers();
	}

	deletePointer( deletingPointer:PointerStatus, index:number ):void {
		if( typeof deletingPointer.added !== "undefined" ) this.pointers.splice( index, 1 );
		this.onPointersChanges.emit( this.pointers );
		this.updateCanDisplayPointers();
	}

	updateCanDisplayPointers():void {
		this.canDisplayPointers = this.getUntouchedPointers().length > 0 || this.getAddedPointers().length > 0 || this.getModifiedPointers().length > 0;
	}

	getAddedPointers():PointerStatus[] {
		return this.pointers.filter( ( pointer:PointerStatus ) => typeof pointer.added !== "undefined" );
	}

	getModifiedPointers():PointerStatus[] {
		return this.pointers.filter( ( pointer:PointerStatus ) => typeof pointer.modified !== "undefined" && typeof pointer.deleted === "undefined" );
	}

	getDeletedPointers():PointerStatus[] {
		return this.pointers.filter( ( pointer:PointerStatus ) => typeof pointer.deleted !== "undefined" );
	}

	getUntouchedPointers():PointerStatus[] {
		return this.pointers.filter( ( pointer:PointerStatus ) => typeof pointer.modified === "undefined" && typeof pointer.deleted === "undefined" );
	}

	goToBlankNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}
}

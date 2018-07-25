import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { RDFNode } from "carbonldp/RDF/Node"

import { Modes } from "../property/property.component";
import { List, ListStatus } from "./list.component";


/*
*   Contains all the lists of a property
* */
@Component( {
	selector: "cw-lists",
	templateUrl: "./lists.component.html",
	styleUrls: [ "./lists.component.scss" ],
} )

export class ListsComponent implements OnInit {

	modes:Modes = Modes;
	canDisplayLists:boolean = false;

	@Input() documentURI:string = "";
	@Input() lists:ListStatus[] = [];
	@Input() onAddNewList:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:RDFNode[] = [];
	@Input() canEdit:boolean = true;

	@Output() onListsChanges:EventEmitter<ListStatus[]> = new EventEmitter<ListStatus[]>();
	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();

	constructor() { }

	ngOnInit():void {
		this.onAddNewList.subscribe( () => {
			this.addNewList();
		} );
		this.updateCanDisplayLists();
	}

	addNewList():void {
		let newListStatus:ListStatus = <ListStatus>{};
		newListStatus.added = [];
		newListStatus.isBeingCreated = true;
		this.lists.splice( 0, 0, newListStatus );
		this.saveList( null, null, 0 );
	}

	saveList( modifiedList:List, originalList:List, index:number ) {
		if( typeof this.lists[ index ].added !== "undefined" ) delete this.lists[ index ].isBeingCreated;
		this.onListsChanges.emit( this.lists );
		this.updateCanDisplayLists();
	}

	deleteList( deletingList:ListStatus, index:number ):void {
		if( typeof deletingList.added !== "undefined" ) this.lists.splice( index, 1 );
		this.onListsChanges.emit( this.lists );
		this.updateCanDisplayLists();
	}

	updateCanDisplayLists():void {
		this.canDisplayLists = this.getUntouchedLists().length > 0 || this.getAddedLists().length > 0 || this.getModifiedLists().length > 0;
	}

	getAddedLists():ListStatus[] {
		return this.lists.filter( ( list:ListStatus ) => typeof list.added !== "undefined" );
	}

	getDeletedLists():ListStatus[] {
		return this.lists.filter( ( list:ListStatus ) => typeof list.deleted !== "undefined" );
	}

	getModifiedLists():ListStatus[] {
		return this.lists.filter( ( list:ListStatus ) => typeof list.modified !== "undefined" && typeof list.deleted === "undefined" );
	}

	getUntouchedLists():ListStatus[] {
		return this.lists.filter( ( list:ListStatus ) => typeof list.modified === "undefined" && typeof list.deleted === "undefined" );
	}

	goToBlankNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}
}

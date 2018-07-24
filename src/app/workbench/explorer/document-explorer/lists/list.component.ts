import { ElementRef, Component, Input, Output, EventEmitter } from "@angular/core";

import "semantic-ui/semantic";

import { RDFLiteral } from "carbonldp/RDF/Literal";
import { RDFNode } from "carbonldp/RDF/Node"
import { ObjectUtils } from "carbonldp/Utils";

import { Literal, LiteralStatus } from "../literals/literal.component";
import { Pointer, PointerStatus } from "../pointers/pointer.component";


@Component( {
	selector: "cw-list",
	templateUrl: "./list.component.html",
	styleUrls: [ "./list.component.scss" ],
	host: { "[class.modified]": "list.modified", "[class.deleted]": "list.deleted", "[class.added]": "list.added" },
} )

export class ListComponent {

	element:ElementRef;
	$element:JQuery;

	copyOrAddedOrModified:string;
	tempList:any[] = [];
	orderHasChanged:boolean = false;


	private _list:ListRow;
	get list() { return this._list; }

	@Input() set list( list:ListRow ) {
		this.copyOrAddedOrModified = ! ! list.copy ? (! ! list.modified ? "modified" : "copy") : "added";
		this._list = list;
		list[ this.copyOrAddedOrModified ].forEach( ( literalOrPointer ) => {
			(<Array<any>>this.tempList).push( Object.assign( {}, literalOrPointer ) );
		} );
	}

	@Input() documentURI:string = "";
	@Input() pointers:PointerStatus[] = [];
	@Input() blankNodes:RDFNode[] = [];
	@Input() namedFragments:RDFNode[] = [];

	@Output() onSave:EventEmitter<ListRow> = new EventEmitter<ListRow>();
	@Output() onDeleteList:EventEmitter<ListRow> = new EventEmitter<ListRow>();
	@Output() onGoToBlankNode:EventEmitter<string> = new EventEmitter<string>();
	@Output() onGoToNamedFragment:EventEmitter<string> = new EventEmitter<string>();

	headers:string[] = [];

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngAfterViewInit():void {
		this.$element = $( this.element.nativeElement );
		this.initializeDeletionDimmer();
	}

	isLiteral( item:any ):boolean {
		return RDFLiteral.is( item[ ! ! item.copy ? (! ! item.modified ? "modified" : "copy") : "added" ] );
	}

	isPointer( item:any ):boolean {
		return RDFNode.is( item[ ! ! item.copy ? (! ! item.modified ? "modified" : "copy") : "added" ] );
	}

	moveUp( pointerOrLiteral:PointerStatus | LiteralStatus, index:number ):void {
		this.tempList.splice( index, 1 );
		this.tempList.splice( index - 1, 0, pointerOrLiteral );
		if( typeof this.list.copy === "undefined" ) return;
		this.orderHasChanged = ! this.areEquals( this.list.copy, this.tempList );
		this.updateTempList();
	}

	moveDown( pointerOrLiteral:PointerStatus | LiteralStatus, index:number ):void {
		this.tempList.splice( index, 1 );
		this.tempList.splice( index + 1, 0, pointerOrLiteral );
		if( typeof this.list.copy === "undefined" ) return;
		this.orderHasChanged = ! this.areEquals( this.list.copy, this.tempList );
		this.updateTempList();
	}

	addPointer():void {
		let newPointerStatus:PointerStatus = <PointerStatus>{};
		newPointerStatus.added = <Pointer>{ "@id": "" };
		this.tempList.splice( this.tempList.length, 0, newPointerStatus );
		this.updateTempList();
	}

	addLiteral():void {
		let newLiteralStatus:LiteralStatus = <LiteralStatus>{};
		newLiteralStatus.added = <Literal>{ "@value": "" };
		this.tempList.splice( this.tempList.length, 0, newLiteralStatus );
		this.updateTempList();
	}

	saveItem( modifiedPointer:PointerStatus, originalPointer:PointerStatus, index:number ) {
		this.updateTempList();
	}

	deleteItem( deletingItem:PointerStatus | LiteralStatus, index:number ):void {
		if( typeof deletingItem.added !== "undefined" ) this.tempList.splice( index, 1 );
		this.updateTempList();
	}

	getAddedItems():PointerStatus[] | LiteralStatus[] {
		return this.tempList.filter( ( item:PointerStatus | LiteralStatus ) => typeof item.added !== "undefined" );
	}

	getDeletedItems():PointerStatus[] | LiteralStatus[] {
		return this.tempList.filter( ( item:PointerStatus | LiteralStatus ) => typeof item.deleted !== "undefined" );
	}

	getModifiedItems():PointerStatus[] | LiteralStatus[] {
		return this.tempList.filter( ( item:PointerStatus | LiteralStatus ) => typeof item.modified !== "undefined" && typeof item.deleted === "undefined" );
	}

	getUntouchedItems():Array<PointerStatus | LiteralStatus> {
		return this.tempList.filter( ( item:PointerStatus | LiteralStatus ) => typeof item.modified === "undefined" && typeof item.deleted === "undefined" );
	}

	areEquals( original:Array<LiteralStatus | PointerStatus>, modified:Array<ListRow | PointerStatus> ):boolean {
		return ObjectUtils.areEqual( original, modified, { arrays: true, objects: true } );
	}

	updateTempList():void {
		let hasBeenModified:boolean = this.hasBeenModified();
		if( typeof this.list.copy !== "undefined" && hasBeenModified ) {
			this.list.modified = this.tempList;
		} else if( typeof this.list.copy !== "undefined" && ! hasBeenModified ) {
			delete this.list.modified;
		} else {
			this.list.added = this.tempList;
		}
		this.onSave.emit( this.list );
	}

	hasBeenModified():boolean {
		return this.orderHasChanged || (this.tempList.findIndex( ( item:PointerStatus | LiteralStatus ) => { return typeof item.modified !== "undefined" || typeof item.added !== "undefined" || typeof item.deleted !== "undefined"} ) !== - 1);
	}

	goToBlankNode( id:string ):void {
		this.onGoToBlankNode.emit( id );
	}

	goToNamedFragment( id:string ):void {
		this.onGoToNamedFragment.emit( id );
	}

	initializeDeletionDimmer():void {
		this.$element.find( ".list.confirm-deletion.dimmer" ).dimmer( { closable: false } );
	}

	askToConfirmDeletion():void {
		this.$element.find( ".list.confirm-deletion.dimmer" ).dimmer( "show" );
	}

	cancelDeletion():void {
		this.$element.find( ".list.confirm-deletion.dimmer" ).dimmer( "hide" );
	}

	deleteList():void {
		if( this.list.added ) this.onDeleteList.emit( this.list );
		if( this.list.copy ) {
			this.list.deleted = this.list.copy;
			this.updateTempList();
		}
	}

}

export interface ListRow {
	copy?:any;
	added?:any;
	modified?:any;
	deleted?:any;

	isBeingCreated?:boolean
}

export interface List {
	"@list":any[];
}

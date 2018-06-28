import { Injectable, EventEmitter } from "@angular/core";

@Injectable()
export class HeaderService {
	logo:HeaderLogo;

	private _items:HeaderItem[] = [];

	constructor() {
		this._items = [];
	}

	get items():HeaderItem[] {
		return this._items;
	}

	addItems( items:HeaderItem[] ):void {
		items.forEach( ( item ) => this.items.push( item ) );
		this.sortItems( this.items );
	}

	addItem( item:HeaderItem ):void {
		this.items.push( item );
		this.sortItems( this.items );
	}

	private sortItems( items:HeaderItem[] ):HeaderItem[] {
		items.sort( ( itemA, itemB ):number => {
			let indexA:number = "index" in itemA && typeof itemA.index === "number" && ! isNaN( itemA.index ) ? itemA.index : 0;
			let indexB:number = "index" in itemB && typeof itemB.index === "number" && ! isNaN( itemB.index ) ? itemB.index : 0;

			if( indexA > indexB ) return 1;
			else if( indexA < indexB ) return - 1;
			else return 0;
		} );

		items.filter( ( item ) => ! ! item.children ).map( ( item ) => item.children ).forEach( ( children ) => this.sortItems( children ) );

		return items;
	}

	clear():void {
		this.items.splice( 0, this.items.length );
	}
}

export interface HeaderItem {
	name:string;
	icon?:string;

	route?:any[];
	onClick?:EventEmitter<any>;

	index?:number;

	children?:HeaderItem[];
}

export interface HeaderLogo {
	image:string;
	route:any[];
}

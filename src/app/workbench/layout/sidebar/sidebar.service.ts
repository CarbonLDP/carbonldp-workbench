import { Injectable, EventEmitter } from "@angular/core";

@Injectable()
export class SidebarService {

	public base:string = "";
	private _items:SidebarItem[] = [];
	private _toggleEmitter:EventEmitter<any> = new EventEmitter<any>();
	private _toggledEmitter:EventEmitter<boolean> = new EventEmitter<boolean>();
	private _isVisible:boolean;

	get items():SidebarItem[] {
		return this._items;
	}

	get toggleEmitter():EventEmitter<any> {
		return this._toggleEmitter;
	}

	get toggledEmitter():EventEmitter<any> {
		return this._toggledEmitter;
	}

	get isVisible():boolean {
		return this._isVisible;
	}

	constructor() {
		this.toggledEmitter.subscribe( ( isVisible:boolean ) => {
			this._isVisible = isVisible;
		} );
	}

	addAppEmitter:EventEmitter<any> = new EventEmitter();

	addItem( item:SidebarLink | SidebarSubmenu | SidebarDivider | SidebarGroup ):void {
		this.items.push( item );
		this.sortItems( this._items );
	}

	addItems( items:(SidebarLink | SidebarSubmenu | SidebarDivider | SidebarGroup)[] ):void {
		items.forEach( ( item ) => this.items.push( item ) );
		this.sortItems( this._items );
	}

	removeItem( item:SidebarLink | SidebarSubmenu | SidebarDivider | SidebarGroup ):void {
		let index:number = this._items.indexOf( item );
		if( index === - 1 ) return;
		this._items.splice( index, 1 );
	}

	toggle():void {
		this.toggleEmitter.emit( null );
	}

	private sortItems( items:SidebarItem[] ):SidebarItem[] {
		items.sort( ( itemA, itemB ):number => {
			let indexA:number = "index" in itemA && typeof itemA.index === "number" && ! isNaN( itemA.index ) ? itemA.index : 0;
			let indexB:number = "index" in itemB && typeof itemB.index === "number" && ! isNaN( itemB.index ) ? itemB.index : 0;

			if( indexA > indexB ) return 1;
			else if( indexA < indexB ) return - 1;
			else return 0;
		} );

		items.filter( ( item ) => "children" in item && (<any>item).children ).map( ( item ) => (<any>item).children ).forEach( ( children ) => this.sortItems( children ) );

		return items;
	}

	clear():void {
		this.items.splice( 0, this.items.length );
	}
}

export interface SidebarItem {
	type:"link" | "submenu" | "divider" | "group";
	index?:number;
}

export interface SidebarLink extends SidebarItem {
	type:"link";
	name:string;
	route:any[];
	icon?:string;
}

export interface SidebarSubmenu extends SidebarItem {
	type:"submenu";
	name:string;
	children:(SidebarLink | SidebarSubmenu | SidebarDivider | SidebarGroup)[];
	open?:boolean;
	closeable?:boolean;
	onClose?:EventEmitter<any>;
	icon?:string;
}

export interface SidebarDivider extends SidebarItem {
	type:"divider";
	name:string;
	icon?:string;
}

export interface SidebarGroup extends SidebarItem {
	type:"group";
	children:(SidebarLink | SidebarSubmenu | SidebarDivider | SidebarGroup)[];
}


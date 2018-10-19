import { AfterContentInit, ContentChild, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";

@Directive( {
	selector: ".title"
} )
export class CollapsibleTitleDirective {
	@HostBinding( "class.active" ) active:boolean = false;
	element:ElementRef;

	constructor( element:ElementRef ) {
		this.element = element;
	}
}

@Directive( {
	selector: ".content"
} )
export class CollapsibleContentDirective {
	@HostBinding( "class.active" ) active:boolean = false;
}

@Directive( {
	selector: "[suiCollapsible]"
} )
export class CollapsibleDirective implements AfterContentInit {
	@ContentChild( CollapsibleContentDirective )
	content:CollapsibleContentDirective;

	@ContentChild( CollapsibleTitleDirective )
	title:CollapsibleTitleDirective;

	@Output( "suiActiveChange" )
	activeChange:EventEmitter<boolean> = new EventEmitter<boolean>();

	element:ElementRef;

	get active():boolean {
		return this.content ? this.content.active : this._active;
	}

	@Input( "suiActive" )
	set active( active:boolean ) {
		if( active === this._active && this._activeJustChanged ) {
			this._activeJustChanged = false;
			return;
		}

		this._active = active;
		if( this.content ) this.content.active = active;
		if( this.title ) this.title.active = active;

		this._activeJustChanged = true;
		this.activeChange.emit( active );
	}

	private _active:boolean;
	private _activeJustChanged:boolean = false;

	constructor( element:ElementRef ) {
		this.element = element;
	}

	ngAfterContentInit():void {
		this.content.active = this._active;
		this.title.active = this._active;
	}

	@HostListener( "click", [ "$event" ] )
	onClick( event:MouseEvent ):void {
		if( event.target === this.title.element.nativeElement || this.title.element.nativeElement.contains( event.target ) ) this.toggleContent();
	}

	toggleContent():void {
		this.active = ! this.active;
	}
}


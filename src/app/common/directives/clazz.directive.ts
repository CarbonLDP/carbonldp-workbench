import { ComponentRef, Directive, DoCheck, ElementRef, Inject, Injector, Input, IterableChanges, IterableDiffer, IterableDiffers, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2, ViewContainerRef, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify } from "@angular/core";

@Directive( {
	selector: "[clazz]"
} )
export class ClazzDirective implements DoCheck {
	private _iterableDiffer:IterableDiffer<string> | null;
	private _keyValueDiffer:KeyValueDiffer<string, any> | null;
	private _initialClasses:string[] = [];
	private _rawClass:string[] | Set<string> | { [ klass:string ]:any };

	private readonly _block:string;

	constructor(
		private _iterableDiffers:IterableDiffers,
		private _keyValueDiffers:KeyValueDiffers,
		private _ngEl:ElementRef,
		private _renderer:Renderer2,
		private _viewContainerRef:ViewContainerRef,
	) {
		this._block = ( _viewContainerRef as any)._view.parentNodeDef.renderParent.element.name;
	}

	@Input( "class" )
	set klass( value:string ) {
		this._removeClasses( this._initialClasses );
		this._initialClasses = typeof value === "string" ? value.split( /\s+/ ) : [];
		this._applyClasses( this._initialClasses );
		this._applyClasses( this._rawClass );
	}

	@Input()
	set clazz( value:string | string[] | Set<string> | { [ klass:string ]:any } ) {
		this._removeClasses( this._rawClass );
		this._applyClasses( this._initialClasses );

		this._iterableDiffer = null;
		this._keyValueDiffer = null;

		this._rawClass = typeof value === "string" ? value.split( /\s+/ ) : value;

		if( this._rawClass ) {
			if( isListLikeIterable( this._rawClass ) ) {
				this._iterableDiffer = this._iterableDiffers.find( this._rawClass ).create();
			} else {
				this._keyValueDiffer = this._keyValueDiffers.find( this._rawClass ).create();
			}
		}
	}

	ngDoCheck():void {
		if( this._iterableDiffer ) {
			const iterableChanges = this._iterableDiffer.diff( this._rawClass as string[] );
			if( iterableChanges ) {
				this._applyIterableChanges( iterableChanges );
			}
		} else if( this._keyValueDiffer ) {
			const keyValueChanges = this._keyValueDiffer.diff( this._rawClass as{ [ k:string ]:any } );
			if( keyValueChanges ) {
				this._applyKeyValueChanges( keyValueChanges );
			}
		}
	}

	private _applyKeyValueChanges( changes:KeyValueChanges<string, any> ):void {
		changes.forEachAddedItem( ( record ) => this._toggleClass( `${this._block}__${record.key}`, record.currentValue ) );
		changes.forEachChangedItem( ( record ) => this._toggleClass( `${this._block}__${record.key}`, record.currentValue ) );
		changes.forEachRemovedItem( ( record ) => {
			if( record.previousValue ) {
				this._toggleClass( `${this._block}__${record.key}`, false );
			}
		} );
	}

	private _applyIterableChanges( changes:IterableChanges<string> ):void {
		changes.forEachAddedItem( ( record ) => {
			if( typeof record.item === "string" ) {
				this._toggleClass( `${this._block}__${record.item}`, true );
			} else {
				throw new Error(
					`NgClass can only toggle CSS classes expressed as strings, got ${stringify( record.item )}` );
			}
		} );

		changes.forEachRemovedItem( ( record ) => this._toggleClass( `${this._block}__${record.item}`, false ) );
	}

	/**
	 * Applies a collection of CSS classes to the DOM element.
	 *
	 * For argument of type Set and Array CSS class names contained in those collections are always
	 * added.
	 * For argument of type Map CSS class name in the map's key is toggled based on the value (added
	 * for truthy and removed for falsy).
	 */
	private _applyClasses( rawClassVal:string[] | Set<string> | { [ klass:string ]:any } ) {
		if( rawClassVal ) {
			if( Array.isArray( rawClassVal ) || rawClassVal instanceof Set ) {
				(<any>rawClassVal).forEach( ( klass:string ) => this._toggleClass( `${this._block}__${klass}`, true ) );
			} else {
				Object.keys( rawClassVal ).forEach( klass => this._toggleClass( `${this._block}__${klass}`, ! ! rawClassVal[ klass ] ) );
			}
		}
	}

	/**
	 * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
	 * purposes.
	 */
	private _removeClasses( rawClassVal:string[] | Set<string> | { [ klass:string ]:any } ) {
		if( rawClassVal ) {
			if( Array.isArray( rawClassVal ) || rawClassVal instanceof Set ) {
				(<any>rawClassVal).forEach( ( klass:string ) => this._toggleClass( `${this._block}__${klass}`, false ) );
			} else {
				Object.keys( rawClassVal ).forEach( klass => this._toggleClass( `${this._block}__${klass}`, false ) );
			}
		}
	}

	private _toggleClass( klass:string, enabled:boolean ):void {
		klass = klass.trim();
		if( klass ) {
			klass.split( /\s+/g ).forEach( klass => {
				if( enabled ) {
					this._renderer.addClass( this._ngEl.nativeElement, klass );
				} else {
					this._renderer.removeClass( this._ngEl.nativeElement, klass );
				}
			} );
		}
	}
}

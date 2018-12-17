import { Directive, ElementRef, HostListener } from "@angular/core";

/**
 * Adds the <code>.ag-focused</code> class to the host component when the component or one of its children has the browser's focus.
 */
@Directive( {
	selector: "[appFocused]",
	host: {
		"[class.ag-focused]": "focused",
	},
} )
export class FocusedDirective {
	public focused:boolean = false;

	constructor(
		private element:ElementRef,
	) {}

	/**
	 * Event listener to detect if the component lost focus
	 * @param event
	 */
	@HostListener( "document:click", [ "$event" ] )
	onClick( event:MouseEvent ) {
		if( ! event.target ) return;
		this.focused = this.element.nativeElement.contains( event.target );
	}
}

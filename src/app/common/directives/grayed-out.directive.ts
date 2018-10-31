import { Directive, ElementRef } from '@angular/core';

@Directive( {
	selector: '[app-grayed-out]'
} )

export class GrayedOutDirective {

	constructor( el:ElementRef ) {
		el.nativeElement.style.color = "#bdbaba";
	}

}

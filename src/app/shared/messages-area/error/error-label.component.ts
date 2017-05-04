import { Component, Input, ElementRef } from "@angular/core";

@Component( {
	selector: "cw-error-label",
	templateUrl: "./error-label.component.html",
	styleUrls: [ "./error-label.component.scss" ],
	host: {
		class: "ui red basic error label"
	}
} )

export class ErrorLabelComponent {

	private element:ElementRef;
	private $element:JQuery;
	@Input() message:string|string[];

	constructor( element:ElementRef ) {
		this.element = element;
		this.$element = $( this.element.nativeElement );
	}

}

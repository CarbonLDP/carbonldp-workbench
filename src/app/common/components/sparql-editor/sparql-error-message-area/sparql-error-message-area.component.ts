import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from "@angular/core";

@Component( {
	selector: "app-sparql-error-message-area",
	templateUrl: "./sparql-error-message-area.component.html",
	styleUrls: [ "./sparql-error-message-area.component.scss" ]
} )
export class SparqlErrorMessageAreaComponent implements OnChanges {

	@Input() errorMessage;

	hasError:boolean;

	ngOnChanges( changes:SimpleChanges ) {
		if( "errorMessage" in changes ) {
			const change:SimpleChange = changes.errorMessage;
			this.errorMessage = change.currentValue;
			this.hasError = this.errorMessage.trim().length < 1;
		}
	}
}

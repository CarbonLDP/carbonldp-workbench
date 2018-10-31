import { Component, Input, OnInit } from "@angular/core";

@Component( {
	selector: "app-sparql-error-message-area",
	templateUrl: "./sparql-error-message-area.component.html",
	styleUrls: [ "./sparql-error-message-area.component.scss" ]
} )
export class SparqlErrorMessageAreaComponent implements OnInit {

	private _errorMessage:string;
	hasError:boolean;

	@Input() set errorMessage( text ) {
		this.hasError = text.trim().length < 1;
		this._errorMessage = text;
	}

	get errorMessage() {
		return this._errorMessage;
	}

	constructor() { }

	ngOnInit() {
	}

}

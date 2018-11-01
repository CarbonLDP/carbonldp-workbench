import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component( {
	selector: "app-sparql-editor-tool-bar",
	templateUrl: "./sparql-editor-tool-bar.component.html",
	styleUrls: [ "./sparql-editor-tool-bar.component.scss" ]
} )
export class SparqlEditorToolBarComponent implements OnInit {

	@Output() event_handler:EventEmitter<string> = new EventEmitter<string>();

	constructor() { }

	ngOnInit() {
	}

	handlePetrify() {
		this.event_handler.emit( "petrify" )
	}

}

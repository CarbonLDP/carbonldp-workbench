import { Component, EventEmitter, Output } from "@angular/core";

@Component( {
	selector: "app-sparql-editor-tool-bar",
	templateUrl: "./sparql-editor-tool-bar.component.html",
	styleUrls: [ "./sparql-editor-tool-bar.component.scss" ]
} )
export class SparqlEditorToolBarComponent {

	@Output() event_handler:EventEmitter<string> = new EventEmitter<string>();

	handlePrettify() {
		this.event_handler.emit( "prettify" )
	}

}

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Mode } from "../code-mirror/code-mirror.component";
import * as SPARQL from "sparqljs";

@Component( {
	selector: "app-sparql-editor",
	templateUrl: "./sparql-editor.component.html",
	styleUrls: [ "./sparql-editor.component.scss" ]
} )
export class SparqlEditorComponent implements OnInit {

	@Input() mode:string = Mode.JAVASCRIPT;
	@Input() readOnly:boolean = false;
	@Input() noCursor:boolean = false;
	@Input() showLineNumbers:boolean = true;
	@Input() scroll:boolean = true;

	@Input() value:string = "";
	@Output() valueChange:EventEmitter<string> = new EventEmitter<string>();

	private parser;
	private generator;
	private textMarkers = [];

	errorMessage:string = "";
	errorObject:ParserErrorObject = { message: "" };

	constructor() {
		this.parser = new SPARQL.Parser();
		this.generator = new SPARQL.Generator();
	}

	ngOnInit() {
	}

	app_code_mirror_updateValue( lastUpdate:string ):void {
		if( this.mode === Mode.SPARQL ) this.validateQuery( lastUpdate );
		this.valueChange.emit( lastUpdate );
	}

	private validateQuery( currentString:string ) {
		try {
			this.parser.parse( currentString );
			this.errorObject = { message: "" };
			this.errorMessage = "";
		} catch( error ) {
			if( "message" in error && error.message.startsWith( "Parse error" ) ) {
				this.displayParseError( error );
			} else {
				this.errorObject = { message: "" };
				this.errorMessage = "";
				console.error( "Unexpected error while parsing the query", error );
			}
		}
	}


	private displayParseError( error ) {
		let start = {
			line: error.hash.loc.first_line - 1,
			ch: error.hash.loc.first_column - 1
		};
		let end = {
			line: error.hash.loc.last_line - 1,
			ch: error.hash.loc.last_column + 1
		};

		this.errorObject = { message: error.message, start: start, end: end };

		this.errorMessage = error.message;
	}
}

export interface ParserErrorObject {
	message:string;
	start?:CodeMirror.Position;
	end?:CodeMirror.Position;
}

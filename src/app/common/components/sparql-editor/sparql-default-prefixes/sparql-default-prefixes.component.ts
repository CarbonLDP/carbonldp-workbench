import { Component, OnInit, ViewChild } from "@angular/core";
import * as CodeMirrorComponent from "app/common/components/code-mirror/code-mirror.component";

@Component( {
	selector: "app-sparql-default-prefixes",
	templateUrl: "./sparql-default-prefixes.component.html",
	styleUrls: [ "./sparql-default-prefixes.component.scss" ]
} )
export class SparqlDefaultPrefixesComponent implements OnInit {
	readonly codeMirrorMode:typeof CodeMirrorComponent.Mode = CodeMirrorComponent.Mode;
	prefixes:string = `PREFIX c: <https://carbonldp.com/ns/v1/platform#>
PREFIX ldp: <http://www.w3.org/ns/ldp#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	`;
	@ViewChild( "prefixesInput" ) prefixesInput:CodeMirrorComponent.Class;

	constructor() { }

	ngOnInit() {
	}

}

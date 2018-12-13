import { Injectable } from "@angular/core";
import { QueryEntity } from "@datorama/akita";

import { RDFDocument } from "carbonldp/RDF";

import { DocumentsState, DocumentsStore } from "./documents.store";

@Injectable( {
	providedIn: "root"
} )
export class DocumentsQuery extends QueryEntity<DocumentsState, RDFDocument> {
	constructor( protected store:DocumentsStore ) {
		super( store );
	}
}

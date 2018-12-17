import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";

import { RDFDocument } from "carbonldp/RDF";

export interface DocumentsState extends EntityState<RDFDocument> {}

@Injectable( { providedIn: "root" } )
@StoreConfig( { name: "documents", idKey: "@id" } )
export class DocumentsStore extends EntityStore<DocumentsState, RDFDocument> {
	constructor() {
		super();
	}
}


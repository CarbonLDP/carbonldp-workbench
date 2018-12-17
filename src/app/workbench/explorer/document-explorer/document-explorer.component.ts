import { Component, ViewChild, EventEmitter } from "@angular/core";

import { faPlus, faSync, faTrash } from "@fortawesome/free-solid-svg-icons";
import { DocumentsQuery } from "./state/documents.query";
import { DocumentsService } from "./state/documents.service";
import { DocumentCreatorComponent } from "./document-creator/document-creator.component";
import { DocumentDeleterComponent } from "./document-deleter/document-deleter.component";
import { AccessPointCreatorComponent } from "./access-point-creator/access-point-creator.component";

@Component( {
	selector: "app-document-explorer",
	templateUrl: "./document-explorer.component.html",
	styleUrls: [ "./document-explorer.component.scss" ],
	providers: [
		DocumentsQuery,
		DocumentsService,
	],
} )
export class DocumentExplorerComponent {
	// FontAwesome icons
	readonly faPlus = faPlus;
	readonly faSync = faSync;
	readonly faTrash = faTrash;

	selectedDocumentIDs:string[] = [];

	openDocument$ = this.documentsQuery.selectActive();

	refreshDocument$ = new EventEmitter<string>();

	@ViewChild( DocumentCreatorComponent ) documentCreator:DocumentCreatorComponent;
	@ViewChild( AccessPointCreatorComponent ) accessPointCreator:AccessPointCreatorComponent;
	@ViewChild( DocumentDeleterComponent ) documentDeleter:DocumentDeleterComponent;

	constructor(
		private documentsQuery:DocumentsQuery,
		private documentsService:DocumentsService,
	) {
	}

	on_tree_selectDocuments( documentIDs:string[] ) {
		this.selectedDocumentIDs = documentIDs;
	}

	on_tree_openDocument( documentID:string ) {
		this.documentsService
			.fetchOne( documentID )
			.subscribe( document => this.documentsService.setActive( document[ "@id" ] ) );
	}

	on_documentCreator_success( parentID:string ) {
		this.refreshDocument$.emit( parentID );
	}

	on_accessPointCreator_success( parentID:string ) {
		this.refreshDocument$.emit( parentID );
	}
}

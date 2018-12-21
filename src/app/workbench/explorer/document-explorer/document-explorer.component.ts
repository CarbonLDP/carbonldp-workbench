import { merge } from "rxjs";

import { Component, ViewChild, ElementRef } from "@angular/core";

import { faPlus, faSync, faTrash } from "@fortawesome/free-solid-svg-icons";
import { DocumentsQuery } from "./state/documents.query";
import { DocumentsService } from "./state/documents.service";
import { DocumentCreatorComponent } from "./document-creator/document-creator.component";
import { DocumentDeleterComponent } from "./document-deleter/document-deleter.component";
import { AccessPointCreatorComponent } from "./access-point-creator/access-point-creator.component";
import { DocumentTreeNodesService } from "app/workbench/explorer/document-explorer/document-tree/state/document-tree-nodes.service";
import { DocumentExplorerLibrary } from "app/workbench/explorer/document-explorer/document-explorer-library";

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

	@ViewChild( DocumentCreatorComponent ) documentCreator:DocumentCreatorComponent;
	@ViewChild( AccessPointCreatorComponent ) accessPointCreator:AccessPointCreatorComponent;
	@ViewChild( DocumentDeleterComponent ) documentDeleter:DocumentDeleterComponent;

	constructor(
		private elementRef:ElementRef,
		private documentsQuery:DocumentsQuery,
		private documentsService:DocumentsService,
		private documentTreeNodesService:DocumentTreeNodesService,
	) {}

	on_createDocument_click( event:MouseEvent ) {
		this.documentCreator.show();
	}

	on_createAccessPoint_click( event:MouseEvent ) {
		this.accessPointCreator.show();
	}

	on_refreshDocuments_click( event:MouseEvent ) {
		// FIXME: Use a method that allows refreshing multiple documents at once
		merge(
			// The array expansion is needed because the "merge" expects varargs
			...this.selectedDocumentIDs.map( documentID => this.documentTreeNodesService.refresh( documentID ) )
		).subscribe();
	}

	on_deleteDocuments_click( event:MouseEvent ) {
		this.documentDeleter.show();
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
		this.documentTreeNodesService.refresh( parentID ).subscribe( () => {
			// Expand the node once it finishes refreshing to show the new child
			this.documentTreeNodesService.expand( parentID );
		} );
	}

	on_accessPointCreator_success( parentID:string ) {
		this.documentTreeNodesService.refresh( parentID ).subscribe();
	}

	on_documentDeleter_success( documentsIDs:string[] ) {
		const parentIDs = [ ...new Set(
			// FIXME: Use another method to get the parent ID
			documentsIDs.map( DocumentExplorerLibrary.getParentURI )
		) ];

		// FIXME: Use a method that allows refreshing multiple documents at once
		merge(
			// The array expansion is needed because the "merge" expects varargs
			...parentIDs.map( documentID => this.documentTreeNodesService.refresh( documentID ) )
		).subscribe();
	}
}

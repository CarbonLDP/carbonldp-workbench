import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component( {
	selector: "app-create-document-dialog",
	templateUrl: "./create-document-dialog.component.html",
	styleUrls: [ "./create-document-dialog.component.scss" ]
} )
export class CreateDocumentDialogComponent {
	constructor(
		public dialogRef:MatDialogRef<CreateDocumentDialogComponent>,
		@Inject( MAT_DIALOG_DATA ) public data:any,
	) {}
}

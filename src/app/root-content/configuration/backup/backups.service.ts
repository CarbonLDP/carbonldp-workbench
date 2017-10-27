import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as HTTP from "carbonldp/HTTP";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as Pointer from "carbonldp/Pointer";
import * as NS from "carbonldp/NS";

@Injectable()
export class BackupsService {

	carbon:Carbon;
	BACKUPS_URI:string = "";

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.BACKUPS_URI = this.carbon.baseURI + ".system/backups/";
		this.extendSchemasForBackups();
	}

	upload( file:Blob ):Promise<[ Pointer.Class, HTTP.Response.Class ]> {
		return this.carbon.documents.upload( this.BACKUPS_URI, file ).then( ( [ uploadedBackupPointer, uploadResponse ]:[ Pointer.Class, HTTP.Response.Class ] ):any => {
			return this.convertToNonRDFSource( uploadedBackupPointer ).then( () => {
				return [ uploadedBackupPointer, uploadResponse ];
			} )
		} );
	}

	getAll():Promise<[ PersistedDocument.Class[], HTTP.Response.Class ]> {
		return this.carbon.documents.getChildren( this.BACKUPS_URI );
	}

	getDownloadURL( documentURI:string ):Promise<string> {
		return this.carbon.documents.getDownloadURL( documentURI ).then( ( documentDownloadURI:string ) => {
			return documentDownloadURI;
		} );
	}

	delete( uri:string ):Promise<HTTP.Response.Class> {
		return this.carbon.documents.delete( uri );
	}

	private convertToNonRDFSource( backupPointer:Pointer.Class ):Promise<[ PersistedDocument.Class, HTTP.Response.Class ]> {
		return backupPointer.resolve().then( ( [ backupDocument, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			backupDocument.defaultInteractionModel = Pointer.Factory.create( NS.LDP.Class.NonRDFSource );
			return backupDocument.save();
		} );
	}

	private extendSchemasForBackups():void {
		this.carbon.extendObjectSchema( {
			"xsd": "http://www.w3.org/2001/XMLSchema#",
			"fileIdentifier": {
				"@id": "https://carbonldp.com/ns/v1/platform#fileIdentifier",
				"@type": "xsd:string"
			},
		} );
	}
}

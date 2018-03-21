import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Response } from "carbonldp/HTTP";
import { PersistedDocument } from "carbonldp/PersistedDocument";
import * as Pointer from "carbonldp/Pointer";
import { LDP } from "carbonldp/Vocabularies";

@Injectable()
export class BackupsService {

	carbonldp:CarbonLDP;
	BACKUPS_URI:string = "";

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this.BACKUPS_URI = this.carbonldp.baseURI + ".system/backups/";
		this.extendSchemasForBackups();
	}

	upload( file:Blob ):Promise<[ Pointer.Class, Response.Response ]> {
		return this.carbonldp.documents.upload( this.BACKUPS_URI, file ).then( ( [ uploadedBackupPointer, uploadResponse ]:[ Pointer.Class, Response.Response ] ):any => {
			return this.convertToNonRDFSource( uploadedBackupPointer ).then( () => {
				return [ uploadedBackupPointer, uploadResponse ];
			} )
		} );
	}

	getAll():Promise<[ PersistedDocument[], Response.Response ]> {
		return this.carbonldp.documents.getChildren( this.BACKUPS_URI );
	}

	getDownloadURL( documentURI:string ):Promise<string> {
		return this.carbonldp.documents.getDownloadURL( documentURI ).then( ( documentDownloadURI:string ) => {
			return documentDownloadURI;
		} );
	}

	delete( uri:string ):Promise<Response.Response> {
		return this.carbonldp.documents.delete( uri );
	}

	private convertToNonRDFSource( backupPointer:Pointer.Class ):Promise<[ PersistedDocument, Response.Response ]> {
		return backupPointer.resolve().then( ( [ backupDocument, response ]:[ PersistedDocument, Response.Response ] ) => {
			backupDocument.defaultInteractionModel = Pointer.Factory.create( LDP.NonRDFSource );
			return backupDocument.save();
		} );
	}

	private extendSchemasForBackups():void {
		this.carbonldp.extendObjectSchema( {
			"xsd": "http://www.w3.org/2001/XMLSchema#",
			"fileIdentifier": {
				"@id": "https://carbonldp.com/ns/v1/platform#fileIdentifier",
				"@type": "xsd:string"
			},
		} );
	}
}

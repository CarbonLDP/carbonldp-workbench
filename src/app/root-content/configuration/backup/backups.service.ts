import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Response } from "carbonldp/HTTP";
import { PersistedDocument } from "carbonldp/PersistedDocument";
import { Pointer } from "carbonldp/Pointer";
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

	upload( file:Blob ):Promise<void> {
		return Promise.resolve();
	}

	getAll():Promise<PersistedDocument[]> {
		return this.carbonldp.documents.getChildren( this.BACKUPS_URI );
	}

	getDownloadURL( documentURI:string ):Promise<string> {
		return this.carbonldp.documents.getDownloadURL( documentURI ).then( ( documentDownloadURI:string ) => {
			return documentDownloadURI;
		} );
	}

	delete( uri:string ):Promise<void> {
		return this.carbonldp.documents.delete( uri );
	}

	private convertToNonRDFSource( backupPointer:Pointer ):Promise<PersistedDocument> {
		return backupPointer.resolve().then( ( backupDocument:PersistedDocument ) => {
			backupDocument.defaultInteractionModel = Pointer.create( LDP.NonRDFSource );
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

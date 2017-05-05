import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as HTTP from "carbonldp/HTTP";
import * as SDKContext from "carbonldp/SDKContext";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as Pointer from "carbonldp/Pointer";
import * as NS from "carbonldp/NS";

@Injectable()
export class BackupsService {

	carbon:Carbon;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.extendSchemasForBackups();
	}

	upload( file:Blob, appContext:SDKContext.Class ):Promise<[ Pointer.Class, HTTP.Response.Class ]> {
		let uri:string = (<App.Context>appContext).app.id + "backups/";
		return this.carbon.documents.upload( uri, file ).then( ( [ uploadedBackupPointer, uploadResponse ]:[ Pointer.Class, HTTP.Response.Class ] ) => {
			return this.convertToNonRDFSource( uploadedBackupPointer ).then( ( []:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
				return [ uploadedBackupPointer, uploadResponse ];
			} );
		} );
	}

	getAll( appContext:SDKContext.Class ):Promise<[ PersistedDocument.Class[], HTTP.Response.Class ]> {
		let uri:string = (<App.Context>appContext).app.id + "backups/";
		return this.carbon.documents.getChildren( uri ).then( ( [ backups, response ]:[ PersistedDocument.Class[], HTTP.Response.Class ] ) => {
			return [ backups, response ];
		} );
	}

	getDownloadURL( documentURI:string ):Promise<string> {
		return this.carbon.documents.getDownloadURL( documentURI ).then( ( documentDownloadURI:string ) => {
			return documentDownloadURI;
		} );
	}

	delete( uri:string, appContext:SDKContext.Class ):Promise<HTTP.Response.Class> {
		return appContext.documents.delete( uri );
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

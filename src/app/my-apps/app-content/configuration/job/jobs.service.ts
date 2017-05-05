import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as App from "carbonldp/App";
import * as HTTP from "carbonldp/HTTP";
import * as Response from "carbonldp/HTTP/Response";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as Utils from "carbonldp/Utils";
import * as Pointer from "carbonldp/Pointer";

import * as Job from "./job"

@Injectable()
export class JobsService {

	carbon:Carbon;

	appContextsJobs:Map<string, Map<string, PersistedDocument.Class>>;

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.appContextsJobs = new Map < string, Map < string, PersistedDocument.Class >>();
	}

	getJobOfType( type:string, appContext:App.Context ):Promise<PersistedDocument.Class> {
		if( ! type ) return <any> Promise.reject( new Error( "Provide a job type." ) );
		if( ! appContext ) return <any> Promise.reject( new Error( "Provide an appContext." ) );

		if( ! this.appContextsJobs.has( appContext.getBaseURI() ) ) this.appContextsJobs.set( appContext.getBaseURI(), new Map<string, PersistedDocument.Class>() );
		let jobs:Map < string, PersistedDocument.Class > = this.appContextsJobs.get( appContext.getBaseURI() );

		let jobsArray:PersistedDocument.Class[] = Utils.A.from( jobs.values() );
		let job:PersistedDocument.Class = jobsArray.find( ( job:PersistedDocument.Class ) => job.types.indexOf( type ) !== - 1 );
		if( ! ! job ) return Promise.resolve( job );

		return this.getAll( appContext ).then(
			( jobs:PersistedDocument.Class[] ) => {
				let jobsArray:PersistedDocument.Class[] = Utils.A.from( jobs.values() );
				return jobsArray.find( ( job:PersistedDocument.Class ) => job.types.indexOf( type ) !== - 1 );
			}
		);
	}

	getAll( appContext:App.Context ):Promise<PersistedDocument.Class[]> {
		let uri:string = appContext.app.id + "jobs/";
		let jobs:Map < string, PersistedDocument.Class > = this.appContextsJobs.get( appContext.getBaseURI() );
		return this.carbon.documents.getChildren( uri ).then( ( [ existingJobs, response ]:[ PersistedDocument.Class[], HTTP.Response.Class ] ) => {
			existingJobs.filter( ( job:PersistedDocument.Class ) => ! jobs.has( job.id ) )
				.forEach( ( job:PersistedDocument.Class ) => jobs.set( job.id, job ) );
			return Utils.A.from( jobs.values() );
		} );
	}

	createExportBackup( appContext:App.Context ):Promise<PersistedDocument.Class> {
		let jobs:Map < string, PersistedDocument.Class > = this.appContextsJobs.get( appContext.getBaseURI() );
		return new Promise<PersistedDocument.Class>(
			( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
				let uri:string = appContext.app.id + "jobs/";
				let tempJob:any = {};
				tempJob[ "types" ] = [ Job.Type.EXPORT_BACKUP ];
				this.carbon.documents.createChild( uri, tempJob ).then( ( [ pointer, response ]:[ Pointer.Class, Response.Class ] ) => {
					pointer.resolve().then( ( [ importJob, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
						resolve( importJob );
						jobs.set( importJob.id, importJob );
					} );
				} ).catch( ( error ) => reject( error ) );
			}
		);
	}

	createImportBackup( backupURI:string, appContext:App.Context ):Promise<PersistedDocument.Class> {
		let uri:string = appContext.app.id + "jobs/",
			tempJob:any = {},
			backup = appContext.documents.getPointer( backupURI );
		tempJob[ "types" ] = [ Job.Type.IMPORT_BACKUP ];
		tempJob[ Job.namespace + "backup" ] = appContext.documents.getPointer( backupURI );

		let jobs:Map < string, PersistedDocument.Class > = this.appContextsJobs.get( appContext.getBaseURI() );
		return this.carbon.documents.createChild( uri, tempJob ).then( ( [ pointer, response ]:[ Pointer.Class, Response.Class ] ) => {
			return pointer.resolve();
		} ).then( ( [ importJob, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			jobs.set( importJob.id, importJob );
			return importJob;
		} );
	}

	runJob( job:PersistedDocument.Class ):Promise<PersistedDocument.Class> {
		let tempJob:any = {};
		tempJob[ "types" ] = [ Job.namespace + "Execution" ];
		return this.carbon.documents.createChild( job.id, tempJob ).then( ( [ pointer, response ]:[ Pointer.Class, Response.Class ] ) => {
			return pointer.resolve();
		} ).then( ( [ importJob, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			return importJob;
		} );
	}

	checkJobExecution( jobExecution:PersistedDocument.Class ):Promise<PersistedDocument.Class> {
		if( jobExecution.isResolved() ) {
			return jobExecution.refresh().then(
				( [ resolvedJobExecution, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
					return resolvedJobExecution;
				} ).catch( ( error ) => { return Promise.reject( error ) } );
		} else {
			return this.carbon.documents.get( jobExecution.id ).then(
				( [ resolvedJobExecution, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
					return resolvedJobExecution;
				} ).catch( ( error ) => { return Promise.reject( error ) } );
		}
	}
}

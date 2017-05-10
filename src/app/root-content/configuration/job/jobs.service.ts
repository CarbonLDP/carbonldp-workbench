import { Injectable } from "@angular/core";

import { Class as Carbon } from "carbonldp/Carbon";
import * as HTTP from "carbonldp/HTTP";
import * as Response from "carbonldp/HTTP/Response";
import * as PersistedDocument from "carbonldp/PersistedDocument";
import * as Utils from "carbonldp/Utils";
import * as Pointer from "carbonldp/Pointer";

import * as Job from "./job"

@Injectable()
export class JobsService {

	carbon:Carbon;

	jobs:Map<string, PersistedDocument.Class>;
	jobsUri:string = "";

	constructor( carbon:Carbon ) {
		this.carbon = carbon;
		this.jobs = new Map<string, PersistedDocument.Class>();
		this.jobsUri = this.carbon.getBaseURI() + ".system/jobs/";
	}

	getJobOfType( type:string ):Promise<PersistedDocument.Class> {
		if( ! type ) return <any> Promise.reject( new Error( "Provide a job type." ) );

		let jobsArray:PersistedDocument.Class[] = Utils.A.from( this.jobs.values() );
		let job:PersistedDocument.Class = jobsArray.find( ( job:PersistedDocument.Class ) => job.types.indexOf( type ) !== - 1 );
		if( ! ! job ) return Promise.resolve( job );

		return this.getAll().then(
			( jobs:PersistedDocument.Class[] ) => {
				let jobsArray:PersistedDocument.Class[] = Utils.A.from( jobs.values() );
				return jobsArray.find( ( job:PersistedDocument.Class ) => job.types.indexOf( type ) !== - 1 );
			}
		);
	}

	getAll():Promise<PersistedDocument.Class[]> {
		return this.carbon.documents.getChildren( this.jobsUri ).then( ( [ existingJobs, response ]:[ PersistedDocument.Class[], HTTP.Response.Class ] ) => {
			existingJobs.filter( ( job:PersistedDocument.Class ) => ! this.jobs.has( job.id ) )
				.forEach( ( job:PersistedDocument.Class ) => this.jobs.set( job.id, job ) );
			return Utils.A.from( this.jobs.values() );
		} );
	}

	createExportBackup():Promise<PersistedDocument.Class> {
		return new Promise<PersistedDocument.Class>(
			( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
				let tempJob:any = {};
				tempJob[ "types" ] = [ Job.Type.EXPORT_BACKUP ];
				this.carbon.documents.createChild( this.jobsUri, tempJob ).then( ( [ pointer, response ]:[ Pointer.Class, Response.Class ] ) => {
					pointer.resolve().then( ( [ importJob, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
						resolve( importJob );
						this.jobs.set( importJob.id, importJob );
					} );
				} ).catch( ( error ) => reject( error ) );
			}
		);
	}

	createImportBackup( backupURI:string ):Promise<PersistedDocument.Class> {
		let tempJob:any = {},
			backup = this.carbon.documents.getPointer( backupURI );
		tempJob[ "types" ] = [ Job.Type.IMPORT_BACKUP ];
		tempJob[ Job.namespace + "backup" ] = this.carbon.documents.getPointer( backupURI );

		return this.carbon.documents.createChild( this.jobsUri, tempJob ).then( ( [ pointer, response ]:[ Pointer.Class, Response.Class ] ) => {
			return pointer.resolve();
		} ).then( ( [ importJob, response ]:[ PersistedDocument.Class, HTTP.Response.Class ] ) => {
			this.jobs.set( importJob.id, importJob );
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

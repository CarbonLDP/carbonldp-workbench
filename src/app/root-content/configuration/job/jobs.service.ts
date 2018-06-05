import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Response } from "carbonldp/HTTP";
import { Document } from "carbonldp/Document";
import { ArrayUtils } from "carbonldp/Utils";
import { Pointer } from "carbonldp/Pointer";

import * as Job from "./job"

@Injectable()
export class JobsService {

	carbonldp:CarbonLDP;

	jobs:Map<string, Document>;
	jobsUri:string = "";

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
		this.jobs = new Map<string, Document>();
		this.jobsUri = this.carbonldp.baseURI + ".system/jobs/";
	}

	getJobOfType( type:string ):Promise<Document> {
		if( ! type ) return <any> Promise.reject( new Error( "Provide a job type." ) );

		let jobsArray:Document[] = ArrayUtils.from( this.jobs.values() );
		let job:Document = jobsArray.find( ( job:Document ) => job.types.indexOf( type ) !== - 1 );
		if( ! ! job ) return Promise.resolve( job );

		return this.getAll().then(
			( jobs:Document[] ) => {
				let jobsArray:Document[] = ArrayUtils.from( jobs.values() );
				return jobsArray.find( ( job:Document ) => job.types.indexOf( type ) !== - 1 );
			}
		);
	}

	getAll():Promise<Document[]> {
		return this.carbonldp.documents.getChildren( this.jobsUri ).then( ( existingJobs:Document[] ) => {
			existingJobs.filter( ( job:Document ) => ! this.jobs.has( job.id ) )
				.forEach( ( job:Document ) => this.jobs.set( job.id, job ) );
			return ArrayUtils.from( this.jobs.values() );
		} );
	}

	createExportBackup():Promise<Document> {
		return new Promise<Document>(
			( resolve:( result:any ) => void, reject:( error:Error ) => void ) => {
				let tempJob:any = {};
				tempJob[ "types" ] = [ Job.Type.EXPORT_BACKUP ];
				this.carbonldp.documents.createChild( this.jobsUri, tempJob ).then( ( [ pointer, response ]:[ Pointer, Response ] ) => {
					pointer.resolve().then( ( importJob:Document ) => {
						resolve( importJob );
						this.jobs.set( importJob.id, importJob );
					} );
				} ).catch( ( error ) => reject( error ) );
			}
		);
	}

	createImportBackup( backupURI:string ):Promise<Document> {
		let tempJob:any = {},
			backup = this.carbonldp.documents.getPointer( backupURI );
		tempJob[ "types" ] = [ Job.Type.IMPORT_BACKUP ];
		tempJob[ Job.namespace + "backup" ] = this.carbonldp.documents.getPointer( backupURI );

		return this.carbonldp.documents.createChild( this.jobsUri, tempJob ).then( ( [ pointer, response ]:[ Pointer, Response ] ) => {
			return pointer.resolve();
		} ).then( ( importJob:Document ) => {
			this.jobs.set( importJob.id, importJob );
			return importJob;
		} );
	}

	runJob( job:Document ):Promise<Document> {
		let tempJob:any = {};
		tempJob[ "types" ] = [ Job.namespace + "Execution" ];
		return this.carbonldp.documents.createChild( job.id, tempJob ).then( ( [ pointer, response ]:[ Pointer, Response ] ) => {
			return pointer.resolve();
		} ).then( ( importJob:Document ) => {
			return importJob;
		} );
	}

	checkJobExecution( jobExecution:Document | Pointer ):Promise<Document> {
		if( jobExecution.isResolved() ) {
			return (<Document>jobExecution).refresh().then(
				( resolvedJobExecution:Document ) => {
					return resolvedJobExecution;
				} ).catch( ( error ) => { return Promise.reject( error ) } );
		} else {
			return this.carbonldp.documents.get( jobExecution.id ).then(
				( resolvedJobExecution:Document ) => {
					return resolvedJobExecution;
				} ).catch( ( error ) => { return Promise.reject( error ) } );
		}
	}
}

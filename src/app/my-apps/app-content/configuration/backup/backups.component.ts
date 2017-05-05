import { Component, Input, ViewChild, OnInit } from "@angular/core";

import * as App from "carbonldp/App";
import * as PersistedDocument from "carbonldp/PersistedDocument";

import { JobsService } from "../job/jobs.service";
import * as Job from "../job/job";

import { BackupsListComponent } from "./backups-list/backups-list.component"

import "semantic-ui/semantic";

@Component( {
	selector: "cw-backup",
	templateUrl: "./backups.component.html",
	styleUrls: [  "./backups.component.scss"  ],
} )

export class BackupsComponent implements OnInit {

	backupJob:PersistedDocument.Class;
	jobsService:JobsService;

	@ViewChild( BackupsListComponent ) backupsListComponent:BackupsListComponent;
	@Input() appContext:App.Context;

	constructor( jobsService:JobsService ) {
		this.jobsService = jobsService;
	}

	ngOnInit():void {
		this.jobsService.getJobOfType( Job.Type.EXPORT_BACKUP, this.appContext ).then( ( job:PersistedDocument.Class ) => {
			if( ! ! job ) this.backupJob = job;
			else this.jobsService.createExportBackup( this.appContext ).then( ( exportBackupJob:PersistedDocument.Class ) => {
				this.backupJob = exportBackupJob;
			} );
		} );
	}

	invokeRefreshBackupsList():void {
		this.backupsListComponent.fetchBackupsList.emit( true );
	}

}


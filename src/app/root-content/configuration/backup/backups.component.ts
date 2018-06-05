import { Component, ViewChild, OnInit } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { Document } from "carbonldp/Document";

import { JobsService } from "../job/jobs.service";
import * as Job from "../job/job";

import { BackupsListComponent } from "./backups-list/backups-list.component"

import "semantic-ui/semantic";

@Component( {
	selector: "cw-backup",
	templateUrl: "./backups.component.html",
	styleUrls: [ "./backups.component.scss" ],
} )

export class BackupsComponent implements OnInit {
	carbonldp:CarbonLDP;
	jobsService:JobsService;
	backupJob:Document;

	@ViewChild( BackupsListComponent ) backupsListComponent:BackupsListComponent;

	constructor( jobsService:JobsService, carbonldp:CarbonLDP ) {
		this.jobsService = jobsService;
		this.carbonldp = carbonldp;
	}

	ngOnInit():void {
		this.jobsService.getJobOfType( Job.Type.EXPORT_BACKUP ).then( ( job:Document ) => {
			if( ! ! job ) this.backupJob = job;
			else this.jobsService.createExportBackup().then( ( exportBackupJob:Document ) => {
				this.backupJob = exportBackupJob;
			} );
		} );
	}

	invokeRefreshBackupsList():void {
		this.backupsListComponent.fetchBackupsList.emit( true );
	}

}


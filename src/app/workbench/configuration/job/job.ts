export const namespace:string = "https://carbonldp.com/ns/v1/platform#";

export class Class { }

export class Type {
	static EXPORT_BACKUP:string = namespace + "ExportBackupJob";
	static IMPORT_BACKUP:string = namespace + "ImportBackupJob";
}

export class ExecutionStatus {
	static QUEUED:string = namespace + "Queued";
	static FINISHED:string = namespace + "Finished";
	static ABORTED:string = namespace + "Aborted";
	static ERROR:string = namespace + "Error";
	static RUNNING:string = namespace + "Running";
	static UNKNOWN:string = namespace + "Unknown";
}
export class Execution {
	static STATUS:string = namespace + "status";
	static ERROR_DESCRIPTION:string = namespace + "errorDescription";
}
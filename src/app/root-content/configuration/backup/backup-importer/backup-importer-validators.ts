import { Directive, Input, OnChanges, SimpleChanges } from "@angular/core";
import { AbstractControl, Validator, NG_VALIDATORS, FormGroup } from "@angular/forms";

@Directive( {
	selector: "[cw-backup-file]",
	providers: [ { provide: NG_VALIDATORS, useExisting: BackupFileValidator, multi: true } ]
} )

export class BackupFileValidator implements Validator, OnChanges {
	@Input() backupFileBlob;
	@Input() control;

	ngOnChanges( changes:SimpleChanges ) {
		this.backupFileBlob = changes[ "backupFileBlob" ].currentValue;
		this.control.control.updateValueAndValidity( false, true );
	}

	validate( control:AbstractControl ):any {
		if( ! ! this.backupFileBlob && this.backupFileBlob.type === "application/zip" ) return null;
		if( ! this.backupFileBlob ) return { "emptyBackupFile": true };
		return { "invalidBackupFileFormat": true };
	}
}

// Checks all controls. If at least one is valid, then no errors are found, if none are valid then "invalidForm" error is added.
@Directive( {
	selector: "[cw-import-form-valid]",
	providers: [ { provide: NG_VALIDATORS, useExisting: AtLeastOneValidValidator, multi: true } ]
} )
export class AtLeastOneValidValidator implements Validator {

	validate( formGroup:FormGroup ):{ [key:string]:any; } {
		for( let control in formGroup.controls ) {
			if( ! ! formGroup.controls[ control ].valid ) return null;
		}
		return { "invalidForm": true };
	}
}
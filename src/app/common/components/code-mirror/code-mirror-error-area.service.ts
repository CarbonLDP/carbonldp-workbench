import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class CodeMirrorErrorAreaService {
	errorMessage:String = "";
	public _dataSource = new BehaviorSubject<String>( this.errorMessage );
	dataSource$ = this._dataSource.asObservable();

	set message( val ) {
		this.errorMessage = val;
		this._dataSource.next( val );
	}

	get message() {
		return this.errorMessage;
	}
}
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ResizeBarService {

	bar_position:number = 300;

	public _dataSource = new BehaviorSubject<number>( this.bar_position );
	dataSource$ = this._dataSource.asObservable();

	set position( val ) {
		this.bar_position = val;
		this._dataSource.next( val );
	}

	get position() {
		return this.bar_position;
	}
}
import { Injectable, Input, EventEmitter } from '@angular/core';
import * as App from "./app";

@Injectable()
export class AppContentService {

	private _activeapp:App.Class;

	public set activeApp( app:App.Class ) {
		this._activeapp = app;
		this.onAppHasChanged.emit( this.activeApp );
	}

	public get activeApp():App.Class {
		return this._activeapp;
	}

	public onAppHasChanged:EventEmitter<App.Class> = new EventEmitter<App.Class>();

	constructor() { }

}
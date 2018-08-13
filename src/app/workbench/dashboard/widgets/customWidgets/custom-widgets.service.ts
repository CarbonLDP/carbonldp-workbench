import { Injectable } from "@angular/core";

import { CarbonLDP } from "carbonldp";
import { PlatformMetadata } from "carbonldp/System/PlatformMetadata";
import { SPARQLSelectResults } from "carbonldp/SPARQL/SelectResults";
import { CustomWidget } from "../../../dashboard/widgets/widgets.component";
import { SPARQLQuery } from "../../../sparql-client/response/response.component";
import { C } from "carbonldp/Vocabularies";

/*
*  Services used by the widgets
* */
@Injectable()
export class CustomWidgetsService {
	carbonldp:CarbonLDP;
	savedWidgets: Array<CustomWidget>;

	constructor( carbonldp:CarbonLDP ) {
		this.carbonldp = carbonldp;
	}


	getAllSavedWidgets():Array<CustomWidget> {
		this.savedWidgets = this.getLocalSavedWidgets();
		return this.savedWidgets;
	}

	saveWidget( savedWidget: CustomWidget ):Promise<boolean> {
		return this.saveLocalWidgets( savedWidget );
	}

	removeWidget( widgettoDelete:CustomWidget ):Array<CustomWidget> {
		return this.removeLocalWidget(widgettoDelete);
	}

	getLocalSavedWidgets():CustomWidget[] {
		if( ! ! window.localStorage.getItem( "savedWidgets" ) )
			return <CustomWidget[]>JSON.parse( window.localStorage.getItem( "savedWidgets" ) );
	}

	saveLocalWidgets( savedWidget:CustomWidget ):Promise<boolean> {
		this.savedWidgets = this.getAllSavedWidgets() || [];
		if(!!savedWidget.id){
			let i:number = this.savedWidgets.findIndex((widget:CustomWidget)=>{
				return widget.id === savedWidget.id;
			});
			this.savedWidgets[i] = savedWidget;
		}else{
			savedWidget.id = 3 + this.savedWidgets.length;
			this.savedWidgets.push( savedWidget );
		}

		return this.saveAllWidgets(this.savedWidgets);

	}

	removeLocalWidget(widgettoDelete:CustomWidget ): Array<CustomWidget>{
		this.savedWidgets = this.getAllSavedWidgets() || [];
		let index:number = this.savedWidgets.findIndex(( widget:CustomWidget )=>{
			return widget.id === widgettoDelete.id;
		});
		this.savedWidgets.splice( index, 1 );
		this.saveAllWidgets(this.savedWidgets);
		return this.savedWidgets;
	}

	saveAllWidgets( savedWidgets:Array<CustomWidget> ): Promise<boolean> {
		return new Promise( ( resolve, reject ) => {
			window.localStorage.setItem( "savedWidgets", JSON.stringify( savedWidgets ) );
			resolve( true );
		} );
	}
}
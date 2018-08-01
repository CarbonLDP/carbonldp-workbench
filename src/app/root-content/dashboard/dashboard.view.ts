import { Component} from "@angular/core";
import { CustomWidget, Widget } from "./widgets/widgets.component"
import "semantic-ui/semantic";
import { WidgetsService } from "app/root-content/dashboard/widgets/widgets.service";
import { CarbonLDP } from "carbonldp";

@Component( {
	selector: "cw-dashboard-view",
	templateUrl: "./dashboard.view.html",
	styleUrls: [ "./dashboard.view.scss" ],
} )
export class DashboardView {

	widgetsService: WidgetsService;
	carbonldp: CarbonLDP;
	constructor( carbonldp:CarbonLDP, widgetsService:WidgetsService ) {
		this.widgetsService = widgetsService;
		this.carbonldp = carbonldp;
	}

	widgetsList: Array<Widget | CustomWidget> = [
		{ id: 1, name: "totalDocuments", title: "Documents", hide: false, customWidget:false },
		{ id: 2, name: "totalTriples", title: "Triples", hide: false , customWidget:false} ];

	ngOnInit(){
		this.getCustomWidgetsOnLocalStorage();
	}

	public getCustomWidgetsOnLocalStorage() {
		this.widgetsList = [ ...this.widgetsList , ...this.widgetsService.getCustomWidgetsOnLocalStorage()];
	}
}


import { collapsibleSpecs } from "./collapsible.directive.spec";
import { tabComponentSpecs } from "./tab.component.spec";
import { tabsComponentSpecs } from "./tabs.component.spec";

describe( "SemanticModule", () => {

	collapsibleSpecs();

	tabComponentSpecs();

	tabsComponentSpecs();

} );
import { directivesSpecs } from "./directives/directives.module.spec";
import { errorLabelSpecs } from "./components/messages-area/error/error-label.component.spec";
import { errorMessageGeneratorSpecs } from "./components/messages-area/error/error-message-generator.spec";
import { messageComponentSpecs } from "./components/messages-area/message.component.spec";
import { messageAreaComponentSpecs } from "./components/messages-area/messages-area.component.spec";
import { paginatorSpecs } from "./components/paginator/paginator.component.spec";
import { messageAreaServiceSpecs } from "./components/messages-area/messages-area.service.spec";
import { codeMirrorSpecs } from "./components/code-mirror/code-mirror.component.spec";

describe( "AppCommonModule", () => {

	directivesSpecs();

	errorLabelSpecs();

	errorMessageGeneratorSpecs();

	messageComponentSpecs();

	messageAreaComponentSpecs();

	paginatorSpecs();

	messageAreaServiceSpecs();

	codeMirrorSpecs();
} );
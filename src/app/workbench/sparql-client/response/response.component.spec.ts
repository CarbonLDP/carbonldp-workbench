import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { By }              from "@angular/platform-browser";
import { DebugElement }    from "@angular/core";
import { ResponseComponent, SPARQLResponseType } from "./response.component";

import { SharedModule } from "app/shared/shared.module";
import { SPARQLClientResponse } from "./response.component";
import { ResultsetTableComponent } from "./../resultset-table/resultset-table.component";
import { RelativizeURIPipe } from "./../resultset-table/relativize-uri.pipe";
import { PrefixURIPipe } from "./../resultset-table/prefix-uri.pipe";

describe( "ResponseComponent", () => {

	let comp:ResponseComponent;
	let fixture:ComponentFixture<ResponseComponent>;
	let de:DebugElement;
	let el:HTMLElement;
	let mockedResponse:SPARQLClientResponse = new SPARQLClientResponse();


	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [
				SharedModule.forRoot()
			],
			declarations: [
				ResponseComponent,
				ResultsetTableComponent,
				RelativizeURIPipe,
				PrefixURIPipe,
			], // declare the test component
		} ).compileComponents();  // compile template and css
	} ) );

	beforeEach( () => {
		fixture = TestBed.createComponent( ResponseComponent );
		comp = fixture.componentInstance;
		de = fixture.debugElement;

		mockedResponse.duration = 102;
		mockedResponse.resultset = {
			"head": {
				"vars": [
					"s",
					"p",
					"o"
				]
			},
			"results": {
				"bindings": [
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/"
						},
						"o": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#BasicContainer"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#contains"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/"
						},
						"o": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#hasMemberRelation"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/"
						},
						"o": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#member"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#member"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/"
						},
						"o": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#created"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/"
						},
						"o": {
							"datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
							"type": "literal",
							"value": "2017-06-23T17:25:53.838Z"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#modified"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/"
						},
						"o": {
							"datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
							"type": "literal",
							"value": "2017-06-23T17:25:53.838Z"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						},
						"o": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#BasicContainer"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#contains"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						},
						"o": {
							"type": "uri",
							"value": "http://localhost:8083/.system/platform/"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#hasMemberRelation"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						},
						"o": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#member"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/ns/ldp#member"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						},
						"o": {
							"type": "uri",
							"value": "http://localhost:8083/.system/platform/"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#created"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						},
						"o": {
							"datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
							"type": "literal",
							"value": "2017-06-23T17:25:53.865Z"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#modified"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/"
						},
						"o": {
							"datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
							"type": "literal",
							"value": "2017-06-23T17:25:53.865Z"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/platform/"
						},
						"o": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#VolatileResource"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#created"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/platform/"
						},
						"o": {
							"datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
							"type": "literal",
							"value": "2017-06-23T17:25:53.867Z"
						}
					},
					{
						"p": {
							"type": "uri",
							"value": "https://carbonldp.com/ns/v1/platform#modified"
						},
						"s": {
							"type": "uri",
							"value": "http://localhost:8083/.system/platform/"
						},
						"o": {
							"datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
							"type": "literal",
							"value": "2017-06-23T17:25:53.867Z"
						}
					}
				]
			}
		};
		mockedResponse.query = {
			content: "select ?s ?p ?o where { ?s ?p ?o }",
			endpoint: "http://localhost:8083/",
			format: "table",
			id: 0,
			name: "Select all",
			operation: "SELECT",
			type: "Query",
		};
		mockedResponse.result = SPARQLResponseType.success;
		mockedResponse.isReExecuting = false;
		mockedResponse.setData( mockedResponse.resultset );
		let prefixes:{ [ prefix:string ]:string } = {
			"acl": "http://www.w3.org/ns/auth/acl#",
			"api": "http://purl.org/linked-data/api/vocab#",
			"c": "https://carbonldp.com/ns/v1/platform#",
			"cs": "https://carbonldp.com/ns/v1/security#",
			"cw": "https://carbonldp.com/ns/v1/patch#",
			"cc": "http://creativecommons.org/ns#",
			"cert": "http://www.w3.org/ns/auth/cert#",
			"dbp": "http://dbpedia.org/property/",
			"dc": "http://purl.org/dc/terms/",
			"dc11": "http://purl.org/dc/elements/1.1/",
			"dcterms": "http://purl.org/dc/terms/",
			"doap": "http://usefulinc.com/ns/doap#",
			"example": "http://example.org/ns#",
			"ex": "http://example.org/ns#",
			"exif": "http://www.w3.org/2003/12/exif/ns#",
			"fn": "http://www.w3.org/2005/xpath-functions#",
			"foaf": "http://xmlns.com/foaf/0.1/",
			"geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
			"geonames": "http://www.geonames.org/ontology#",
			"gr": "http://purl.org/goodrelations/v1#",
			"http": "http://www.w3.org/2006/http#",
			"ldp": "http://www.w3.org/ns/ldp#",
			"log": "http://www.w3.org/2000/10/swap/log#",
			"owl": "http://www.w3.org/2002/07/owl#",
			"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
			"rei": "http://www.w3.org/2004/06/rei#",
			"rsa": "http://www.w3.org/ns/auth/rsa#",
			"rss": "http://purl.org/rss/1.0/",
			"sd": "http://www.w3.org/ns/sparql-service-description#",
			"sfn": "http://www.w3.org/ns/sparql#",
			"sioc": "http://rdfs.org/sioc/ns#",
			"skos": "http://www.w3.org/2004/02/skos/core#",
			"swrc": "http://swrc.ontoware.org/ontology#",
			"types": "http://rdfs.org/sioc/types#",
			"vcard": "http://www.w3.org/2001/vcard-rdf/3.0#",
			"wot": "http://xmlns.com/wot/0.1/",
			"xhtml": "http://www.w3.org/1999/xhtml#",
			"xsd": "http://www.w3.org/2001/XMLSchema#",
		};
		comp.response = mockedResponse;
		comp.prefixes = prefixes;
	} );


	it( "Should collapse when clicking collapse button", () => {

		fixture.detectChanges();
		comp.ngAfterViewInit();

		let collapseBtn:HTMLButtonElement = fixture.debugElement.query( By.css( "button.btn-collapse" ) ).nativeElement;
		let responseContainer:any = fixture.debugElement.query( By.css( ".content" ) ).nativeElement;

		expect( responseContainer.className ).toContain( "active" );

		collapseBtn.click();
		fixture.detectChanges();
		comp.ngAfterViewInit();

		setTimeout( () => { // Wait for animation to finish
			expect( responseContainer.className ).not.toContain( "active" );
		}, 1000 );
	} );


	it( "Should emit response onConfigureResponse", () => {

		spyOn( comp.onConfigure, "emit" );

		let editBtn:HTMLButtonElement = fixture.nativeElement.querySelector( "button.btn-edit" );
		editBtn.click();
		expect( comp.onConfigure.emit ).toHaveBeenCalledWith( mockedResponse );

	} );


	it( "Should emit response onReExecuteResponse", () => {

		spyOn( comp.onReExecute, "emit" );

		let reExecuteBtn:HTMLButtonElement = fixture.nativeElement.querySelector( "button.btn-refresh" );
		comp.ngAfterViewInit();
		reExecuteBtn.click();
		expect( comp.onReExecute.emit ).toHaveBeenCalledWith( mockedResponse );

	} );


	it( "Should emit response onRemoveResponse", () => {

		spyOn( comp.onRemove, "emit" );

		let editBtn:HTMLButtonElement = fixture.nativeElement.querySelector( "button.btn-close" );
		editBtn.click();
		expect( comp.onRemove.emit ).toHaveBeenCalledWith( mockedResponse );

	} );


	describe( "Unsuccessful call", () => {

		beforeEach( () => {
			fixture = TestBed.createComponent( ResponseComponent );
			comp = fixture.componentInstance;
			de = fixture.debugElement;

			mockedResponse.duration = 102;
			mockedResponse.resultset = {
				content: "There was a problem processing the request. Error: 400",
				endpoint: "http://localhost:8083/",
				statusCode: "400",
				statusMessage: "Bad Request",
				title: "Bad Request",
				type: "error"
			};
			mockedResponse.query = {
				content: "select ?s ?p ?o where { ?s ?p ?o }",
				endpoint: "http://localhost:8083/",
				format: "table",
				id: 0,
				name: "Select all",
				operation: "SELECT",
				type: "Query",
			};
			mockedResponse.result = SPARQLResponseType.error;
			mockedResponse.isReExecuting = false;
			mockedResponse.setData( mockedResponse.resultset );
			let prefixes:{ [ prefix:string ]:string } = {
				"acl": "http://www.w3.org/ns/auth/acl#",
				"api": "http://purl.org/linked-data/api/vocab#",
				"c": "https://carbonldp.com/ns/v1/platform#",
				"cs": "https://carbonldp.com/ns/v1/security#",
				"cw": "https://carbonldp.com/ns/v1/patch#",
				"cc": "http://creativecommons.org/ns#",
				"cert": "http://www.w3.org/ns/auth/cert#",
				"dbp": "http://dbpedia.org/property/",
				"dc": "http://purl.org/dc/terms/",
				"dc11": "http://purl.org/dc/elements/1.1/",
				"dcterms": "http://purl.org/dc/terms/",
				"doap": "http://usefulinc.com/ns/doap#",
				"example": "http://example.org/ns#",
				"ex": "http://example.org/ns#",
				"exif": "http://www.w3.org/2003/12/exif/ns#",
				"fn": "http://www.w3.org/2005/xpath-functions#",
				"foaf": "http://xmlns.com/foaf/0.1/",
				"geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
				"geonames": "http://www.geonames.org/ontology#",
				"gr": "http://purl.org/goodrelations/v1#",
				"http": "http://www.w3.org/2006/http#",
				"ldp": "http://www.w3.org/ns/ldp#",
				"log": "http://www.w3.org/2000/10/swap/log#",
				"owl": "http://www.w3.org/2002/07/owl#",
				"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
				"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
				"rei": "http://www.w3.org/2004/06/rei#",
				"rsa": "http://www.w3.org/ns/auth/rsa#",
				"rss": "http://purl.org/rss/1.0/",
				"sd": "http://www.w3.org/ns/sparql-service-description#",
				"sfn": "http://www.w3.org/ns/sparql#",
				"sioc": "http://rdfs.org/sioc/ns#",
				"skos": "http://www.w3.org/2004/02/skos/core#",
				"swrc": "http://swrc.ontoware.org/ontology#",
				"types": "http://rdfs.org/sioc/types#",
				"vcard": "http://www.w3.org/2001/vcard-rdf/3.0#",
				"wot": "http://xmlns.com/wot/0.1/",
				"xhtml": "http://www.w3.org/1999/xhtml#",
				"xsd": "http://www.w3.org/2001/XMLSchema#",
			};
			comp.response = mockedResponse;
			comp.prefixes = prefixes;
		} );


		it( "Should display error message", () => {

			comp.ngAfterViewInit();
			let errorMessage:HTMLElement = fixture.nativeElement.querySelector( ".error.message" );

			expect( errorMessage ).toBeDefined();

		} );

	} );

} );
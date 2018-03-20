import { Component, ElementRef, Input, Output, AfterViewChecked, EventEmitter, ViewChild, ChangeDetectorRef } from "@angular/core";

import { XSD } from "carbonldp/Vocabularies";
import * as Utils from "carbonldp/Utils";
import * as URI from "carbonldp/RDF/URI";

import { Modes } from "../property/property.component"

import * as $ from "jquery";
import "semantic-ui/semantic";

@Component( {
	selector: "tr.cw-literal",
	templateUrl: "./literal.component.html",
	styleUrls: [ "./literal.component.scss" ]
} )

export class LiteralComponent implements AfterViewChecked {

	element:ElementRef;
	private cdRef:ChangeDetectorRef;

	private _mode = Modes.READ;
	private tempLiteral:any = {};
	searchDropdown:JQuery;
	languageDropdown:JQuery;

	@Input() set mode( value:string ) {
		setTimeout( () => {
			this._mode = value;
			this.onEditMode.emit( this.mode === Modes.EDIT );
			if( this.mode === Modes.EDIT ) {
				this.initializeTypesDropdown();
				this.initializeLanguageDropdown()
			}
		}, 1 );
	}

	get mode() {
		return this._mode;
	}

	modes:typeof Modes = Modes;
	dataTypes:any = this.getDataTypes();
	isStringType:boolean = (! this.type || this.type === XSD.string);
	languages:{ code:string, name:string }[] = [
		{
			code: "aa",
			name: "Afar"
		},
		{
			code: "ab",
			name: "Abkhaz"
		},
		{
			code: "ae",
			name: "Avestan"
		},
		{
			code: "af",
			name: "Afrikaans"
		},
		{
			code: "ak",
			name: "Akan"
		},
		{
			code: "am",
			name: "Amharic"
		},
		{
			code: "an",
			name: "Aragonese"
		},
		{
			code: "ar",
			name: "Arabic"
		},
		{
			code: "as",
			name: "Assamese"
		},
		{
			code: "av",
			name: "Avaric"
		},
		{
			code: "ay",
			name: "Aymara"
		},
		{
			code: "az",
			name: "Azerbaijani"
		},
		{
			code: "ba",
			name: "Bashkir"
		},
		{
			code: "be",
			name: "Belarusian"
		},
		{
			code: "bg",
			name: "Bulgarian"
		},
		{
			code: "bh",
			name: "Bihari"
		},
		{
			code: "bi",
			name: "Bislama"
		},
		{
			code: "bm",
			name: "Bambara"
		},
		{
			code: "bn",
			name: "Bengali, Bangla"
		},
		{
			code: "bo",
			name: "Tibetan Standard, Tibetan, Central"
		},
		{
			code: "br",
			name: "Breton"
		},
		{
			code: "bs",
			name: "Bosnian"
		},
		{
			code: "ca",
			name: "Catalan"
		},
		{
			code: "ce",
			name: "Chechen"
		},
		{
			code: "ch",
			name: "Chamorro"
		},
		{
			code: "co",
			name: "Corsican"
		},
		{
			code: "cr",
			name: "Cree"
		},
		{
			code: "cs",
			name: "Czech"
		},
		{
			code: "cu",
			name: "Old Church Slavonic, Church Slavonic, Old Bulgarian"
		},
		{
			code: "cv",
			name: "Chuvash"
		},
		{
			code: "cy",
			name: "Welsh"
		},
		{
			code: "da",
			name: "Danish"
		},
		{
			code: "de",
			name: "German"
		},
		{
			code: "dv",
			name: "Divehi, Dhivehi, Maldivian"
		},
		{
			code: "dz",
			name: "Dzongkha"
		},
		{
			code: "ee",
			name: "Ewe"
		},
		{
			code: "el",
			name: "Greek (modern)"
		},
		{
			code: "en",
			name: "English"
		},
		{
			code: "eo",
			name: "Esperanto"
		},
		{
			code: "es",
			name: "Spanish"
		},
		{
			code: "et",
			name: "Estonian"
		},
		{
			code: "eu",
			name: "Basque"
		},
		{
			code: "fa",
			name: "Persian (Farsi)"
		},
		{
			code: "ff",
			name: "Fula, Fulah, Pulaar, Pular"
		},
		{
			code: "fi",
			name: "Finnish"
		},
		{
			code: "fj",
			name: "Fijian"
		},
		{
			code: "fo",
			name: "Faroese"
		},
		{
			code: "fr",
			name: "French"
		},
		{
			code: "fy",
			name: "Western Frisian"
		},
		{
			code: "ga",
			name: "Irish"
		},
		{
			code: "gd",
			name: "Scottish Gaelic, Gaelic"
		},
		{
			code: "gl",
			name: "Galician"
		},
		{
			code: "gn",
			name: "Guaraní"
		},
		{
			code: "gu",
			name: "Gujarati"
		},
		{
			code: "gv",
			name: "Manx"
		},
		{
			code: "ha",
			name: "Hausa"
		},
		{
			code: "he",
			name: "Hebrew (modern)"
		},
		{
			code: "hi",
			name: "Hindi"
		},
		{
			code: "ho",
			name: "Hiri Motu"
		},
		{
			code: "hr",
			name: "Croatian"
		},
		{
			code: "ht",
			name: "Haitian, Haitian Creole"
		},
		{
			code: "hu",
			name: "Hungarian"
		},
		{
			code: "hy",
			name: "Armenian"
		},
		{
			code: "hz",
			name: "Herero"
		},
		{
			code: "ia",
			name: "Interlingua"
		},
		{
			code: "id",
			name: "Indonesian"
		},
		{
			code: "ie",
			name: "Interlingue"
		},
		{
			code: "ig",
			name: "Igbo"
		},
		{
			code: "ii",
			name: "Nuosu"
		},
		{
			code: "ik",
			name: "Inupiaq"
		},
		{
			code: "io",
			name: "Ido"
		},
		{
			code: "is",
			name: "Icelandic"
		},
		{
			code: "it",
			name: "Italian"
		},
		{
			code: "iu",
			name: "Inuktitut"
		},
		{
			code: "ja",
			name: "Japanese"
		},
		{
			code: "jv",
			name: "Javanese"
		},
		{
			code: "ka",
			name: "Georgian"
		},
		{
			code: "kg",
			name: "Kongo"
		},
		{
			code: "ki",
			name: "Kikuyu, Gikuyu"
		},
		{
			code: "kj",
			name: "Kwanyama, Kuanyama"
		},
		{
			code: "kk",
			name: "Kazakh"
		},
		{
			code: "kl",
			name: "Kalaallisut, Greenlandic"
		},
		{
			code: "km",
			name: "Khmer"
		},
		{
			code: "kn",
			name: "Kannada"
		},
		{
			code: "ko",
			name: "Korean"
		},
		{
			code: "kr",
			name: "Kanuri"
		},
		{
			code: "ks",
			name: "Kashmiri"
		},
		{
			code: "ku",
			name: "Kurdish"
		},
		{
			code: "kv",
			name: "Komi"
		},
		{
			code: "kw",
			name: "Cornish"
		},
		{
			code: "ky",
			name: "Kyrgyz"
		},
		{
			code: "la",
			name: "Latin"
		},
		{
			code: "lb",
			name: "Luxembourgish, Letzeburgesch"
		},
		{
			code: "lg",
			name: "Ganda"
		},
		{
			code: "li",
			name: "Limburgish, Limburgan, Limburger"
		},
		{
			code: "ln",
			name: "Lingala"
		},
		{
			code: "lo",
			name: "Lao"
		},
		{
			code: "lt",
			name: "Lithuanian"
		},
		{
			code: "lu",
			name: "Luba-Katanga"
		},
		{
			code: "lv",
			name: "Latvian"
		},
		{
			code: "mg",
			name: "Malagasy"
		},
		{
			code: "mh",
			name: "Marshallese"
		},
		{
			code: "mi",
			name: "Māori"
		},
		{
			code: "mk",
			name: "Macedonian"
		},
		{
			code: "ml",
			name: "Malayalam"
		},
		{
			code: "mn",
			name: "Mongolian"
		},
		{
			code: "mr",
			name: "Marathi (Marāṭhī)"
		},
		{
			code: "ms",
			name: "Malay"
		},
		{
			code: "mt",
			name: "Maltese"
		},
		{
			code: "my",
			name: "Burmese"
		},
		{
			code: "na",
			name: "Nauruan"
		},
		{
			code: "nb",
			name: "Norwegian Bokmål"
		},
		{
			code: "nd",
			name: "Northern Ndebele"
		},
		{
			code: "ne",
			name: "Nepali"
		},
		{
			code: "ng",
			name: "Ndonga"
		},
		{
			code: "nl",
			name: "Dutch"
		},
		{
			code: "nn",
			name: "Norwegian Nynorsk"
		},
		{
			code: "no",
			name: "Norwegian"
		},
		{
			code: "nr",
			name: "Southern Ndebele"
		},
		{
			code: "nv",
			name: "Navajo, Navaho"
		},
		{
			code: "ny",
			name: "Chichewa, Chewa, Nyanja"
		},
		{
			code: "oc",
			name: "Occitan"
		},
		{
			code: "oj",
			name: "Ojibwe, Ojibwa"
		},
		{
			code: "om",
			name: "Oromo"
		},
		{
			code: "or",
			name: "Oriya"
		},
		{
			code: "os",
			name: "Ossetian, Ossetic"
		},
		{
			code: "pa",
			name: "Panjabi, Punjabi"
		},
		{
			code: "pi",
			name: "Pāli"
		},
		{
			code: "pl",
			name: "Polish"
		},
		{
			code: "ps",
			name: "Pashto, Pushto"
		},
		{
			code: "pt",
			name: "Portuguese"
		},
		{
			code: "qu",
			name: "Quechua"
		},
		{
			code: "rc",
			name: "Reunionese,Reunion Creole"
		},
		{
			code: "rm",
			name: "Romansh"
		},
		{
			code: "rn",
			name: "Kirundi"
		},
		{
			code: "ro",
			name: "Romanian"
		},
		{
			code: "ru",
			name: "Russian"
		},
		{
			code: "rw",
			name: "Kinyarwanda"
		},
		{
			code: "sa",
			name: "Sanskrit (Saṁskṛta)"
		},
		{
			code: "sc",
			name: "Sardinian"
		},
		{
			code: "sd",
			name: "Sindhi"
		},
		{
			code: "se",
			name: "Northern Sami"
		},
		{
			code: "sg",
			name: "Sango"
		},
		{
			code: "si",
			name: "Sinhalese, Sinhala"
		},
		{
			code: "sk",
			name: "Slovak"
		},
		{
			code: "sl",
			name: "Slovene"
		},
		{
			code: "sm",
			name: "Samoan"
		},
		{
			code: "sn",
			name: "Shona"
		},
		{
			code: "so",
			name: "Somali"
		},
		{
			code: "sq",
			name: "Albanian"
		},
		{
			code: "sr",
			name: "Serbian"
		},
		{
			code: "ss",
			name: "Swati"
		},
		{
			code: "st",
			name: "Southern Sotho"
		},
		{
			code: "su",
			name: "Sundanese"
		},
		{
			code: "sv",
			name: "Swedish"
		},
		{
			code: "sw",
			name: "Swahili"
		},
		{
			code: "ta",
			name: "Tamil"
		},
		{
			code: "te",
			name: "Telugu"
		},
		{
			code: "tg",
			name: "Tajik"
		},
		{
			code: "th",
			name: "Thai"
		},
		{
			code: "ti",
			name: "Tigrinya"
		},
		{
			code: "tk",
			name: "Turkmen"
		},
		{
			code: "tl",
			name: "Tagalog"
		},
		{
			code: "tn",
			name: "Tswana"
		},
		{
			code: "to",
			name: "Tonga (Tonga Islands)"
		},
		{
			code: "tr",
			name: "Turkish"
		},
		{
			code: "ts",
			name: "Tsonga"
		},
		{
			code: "tt",
			name: "Tatar"
		},
		{
			code: "tw",
			name: "Twi"
		},
		{
			code: "ty",
			name: "Tahitian"
		},
		{
			code: "ug",
			name: "Uyghur"
		},
		{
			code: "uk",
			name: "Ukrainian"
		},
		{
			code: "ur",
			name: "Urdu"
		},
		{
			code: "uz",
			name: "Uzbek"
		},
		{
			code: "ve",
			name: "Venda"
		},
		{
			code: "vi",
			name: "Vietnamese"
		},
		{
			code: "vo",
			name: "Volapük"
		},
		{
			code: "wa",
			name: "Walloon"
		},
		{
			code: "wo",
			name: "Wolof"
		},
		{
			code: "xh",
			name: "Xhosa"
		},
		{
			code: "yi",
			name: "Yiddish"
		},
		{
			code: "yo",
			name: "Yoruba"
		},
		{
			code: "za",
			name: "Zhuang, Chuang"
		},
		{
			code: "zh",
			name: "Chinese"
		},
		{
			code: "zu",
			name: "Zulu"
		}
	];

	// Literal Value;
	private _value:string | boolean | number = "";
	get value() { return this._value; }

	set value( value:string | boolean | number ) {
		this._value = value;
	}

	// Literal Type;
	private _type:string = XSD.string;
	get type() {return this._type;}

	set type( type:string ) {
		if( type === "empty" ) {type = null;}
		else if( ! type || type.length === 0 ) type = XSD.string;
		this._type = type;
		this.isStringType = type === XSD.string;
	}

	// Literal Language;
	private _language:string = "";
	get language() { return this._language; }

	set language( language:string ) {
		this._language = language;
		if( ! ! this.languageDropdown && ! this.language ) this.languageDropdown.dropdown( "set selected", "empty" );
	}

	// Inputs and Outputs
	private _literal = <LiteralRow>{};
	get literal() { return this._literal; }

	@Input() set literal( value:LiteralRow ) {
		this._literal = value;
		if( this.literal.isBeingCreated ) setTimeout(()=> { this.mode = Modes.EDIT; }, 1);

		if( typeof this.literal.modified !== "undefined" ) {
			this.value = ! ! this.tempLiteral[ "@value" ] ? this.tempLiteral[ "@value" ] : this.literal.modified[ "@value" ];
			this.type = ! ! this.tempLiteral[ "@type" ] ? this.tempLiteral[ "@type" ] : this.literal.modified[ "@type" ];
			this.language = ! ! this.tempLiteral[ "@language" ] ? this.tempLiteral[ "@language" ] : this.literal.modified[ "@language" ];

		} else if( typeof this.literal.copy !== "undefined" ) {
			this.value = ! ! this.tempLiteral[ "@value" ] ? this.tempLiteral[ "@value" ] : this.literal.copy[ "@value" ];
			this.type = ! ! this.tempLiteral[ "@type" ] ? this.tempLiteral[ "@type" ] : this.literal.copy[ "@type" ];
			this.language = ! ! this.tempLiteral[ "@language" ] ? this.tempLiteral[ "@language" ] : this.literal.copy[ "@language" ];

		} else if( typeof this.literal.added !== "undefined" ) {
			this.value = ! ! this.tempLiteral[ "@value" ] ? this.tempLiteral[ "@value" ] : this.literal.added[ "@value" ];
			this.type = ! ! this.tempLiteral[ "@type" ] ? this.tempLiteral[ "@type" ] : this.literal.added[ "@type" ];
			this.language = ! ! this.tempLiteral[ "@language" ] ? this.tempLiteral[ "@language" ] : this.literal.added[ "@language" ];
		}

	}

	@Input() canEdit:boolean = true;
	@Input() canDisplayLanguage:boolean = false;
	@Input() partOfList:boolean = false;
	@Input() isFirstItem:boolean = false;
	@Input() isLastItem:boolean = false;

	@Output() onEditMode:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() onSave:EventEmitter<any> = new EventEmitter<any>();
	@Output() onDeleteLiteral:EventEmitter<LiteralRow> = new EventEmitter<LiteralRow>();
	@Output() onMoveUp:EventEmitter<LiteralRow> = new EventEmitter<LiteralRow>();
	@Output() onMoveDown:EventEmitter<LiteralRow> = new EventEmitter<LiteralRow>();

	@ViewChild( "valueInput" ) valueInputControl;

	constructor( element:ElementRef, cdRef:ChangeDetectorRef ) {
		this.element = element;
		this.cdRef = cdRef;
	}

	ngAfterViewChecked() {
		this.cdRef.detectChanges();
	}

	onEdit( event:Event ):void {
		this.mode = Modes.EDIT;
	}

	deleteLiteral():void {
		if( typeof this.literal.added === "undefined" ) {
			this.literal.deleted = this.literal.copy;
		}
		this.onDeleteLiteral.emit( this.literal );
	}

	cancelEdit():void {
		this.mode = Modes.READ;
		let copyOrAdded:string = typeof this.literal.copy !== "undefined" ? "copy" : "added";

		if( typeof this.tempLiteral[ "@value" ] === "undefined" ) {
			this.value = this.literal[ copyOrAdded ][ "@value" ];
			delete this.tempLiteral[ "@value" ];
		} else this.value = this.tempLiteral[ "@value" ];

		if( typeof this.tempLiteral[ "@type" ] === "undefined" ) {
			this.type = this.literal[ copyOrAdded ][ "@type" ];
			delete this.tempLiteral[ "@type" ];
		} else this.type = this.tempLiteral[ "@type" ];

		if( typeof this.tempLiteral[ "@language" ] === "undefined" ) {
			this.language = this.literal[ copyOrAdded ][ "@language" ];
			delete this.tempLiteral[ "@language" ];
		} else this.language = this.tempLiteral[ "@language" ];

		if( typeof this.literal.added !== "undefined" && typeof this.value === "undefined" || this.value === "" ) {
			this.onDeleteLiteral.emit( this.literal );
		}
	}

	save():void {
		let copyOrAdded:string = typeof this.literal.copy !== "undefined" ? "copy" : "added";

		if( typeof this.value !== "undefined" && (this.value !== this.literal[ copyOrAdded ][ "@value" ] || this.value !== this.tempLiteral[ "@value" ] ) ) {
			this.tempLiteral[ "@value" ] = this.value;
		}
		if( typeof this.type !== "undefined" && (this.type !== this.literal[ copyOrAdded ][ "@type" ] || this.type !== this.tempLiteral[ "@type" ] ) ) {
			this.tempLiteral[ "@type" ] = this.type;
		}
		if( typeof this.language !== "undefined" && ( this.language !== this.literal[ copyOrAdded ][ "@language" ] || this.language !== this.tempLiteral[ "@language" ] ) ) {
			this.tempLiteral[ "@language" ] = this.language;
		}

		if( this.tempLiteral[ "@type" ] !== XSD.string ) delete this.tempLiteral[ "@language" ];
		if( this.tempLiteral[ "@type" ] === XSD.string || this.type === XSD.string ) delete this.tempLiteral[ "@type" ];

		// Check for tempLiteral to contain valid json+ld for literals
		// 1. @value always present, if not clean whole object.
		// 2. If @type empty or XSD.string, then delete @type from tempLiteral.
		// 3. If @language empty or when @type different than XSD.string, then delete @language from tempLiteral.
		if( this.tempLiteral[ "@type" ] === null || typeof this.tempLiteral[ "@type" ] === "undefined" ) delete this.tempLiteral[ "@type" ];
		if( this.tempLiteral[ "@language" ] === null || typeof this.tempLiteral[ "@language" ] === "undefined" || (typeof this.tempLiteral[ "@type" ] !== "undefined" && this.tempLiteral[ "@type" ] !== XSD.string) ) {
			delete this.tempLiteral[ "@language" ];
		}
		if( this.tempLiteral[ "@value" ] === null || typeof this.tempLiteral[ "@value" ] === "undefined" ) {
			delete this.tempLiteral[ "@value" ];
			delete this.tempLiteral[ "@type" ];
			delete this.tempLiteral[ "@language" ];
		}

		if( ! ! this.literal.copy ) {
			if( (this.tempLiteral[ "@value" ] === this.literal.copy[ "@value" ] ) &&
				(this.tempLiteral[ "@type" ] === this.literal.copy[ "@type" ] ) &&
				(this.tempLiteral[ "@language" ] === this.literal.copy[ "@language" ] ) ) {
				delete this.tempLiteral[ "@value" ];
				delete this.tempLiteral[ "@type" ];
				delete this.tempLiteral[ "@language" ];
				delete this.literal.modified;
			} else {
				this.literal.modified = this.tempLiteral;
			}
		} else if( ! ! this.literal.added ) {
			this.literal.added = this.tempLiteral;
		}

		this.onSave.emit( this.literal );
		this.mode = Modes.READ;
	}

	changeType( type:string, text?:string, choice?:JQuery ):void {
		this.isStringType = type === XSD.string;
		if( type === XSD.string ) { type = null; }
		if( ! this.isStringType ) { this.language = null; }
		this.type = type;
	}

	changeLanguage( language:string, text?:string, choice?:JQuery ):void {
		if( language === "empty" ) language = null;
		this.language = language;
	}

	private initializeLanguageDropdown():void {
		this.languageDropdown = $( this.element.nativeElement.querySelector( ".dropdown.languages" ) );
		this.languageDropdown.dropdown( {
			allowAdditions: false,
			onChange: this.changeLanguage.bind( this )
		} );
		this.languageDropdown.dropdown( "set selected", this.language );
	}

	private initializeTypesDropdown():void {
		this.searchDropdown = $( this.element.nativeElement.querySelector( ".dropdown.types" ) );
		this.searchDropdown.dropdown( {
			allowAdditions: true,
			onChange: this.changeType.bind( this )
		} );
		this.searchDropdown.dropdown( "set selected", this.type );
	}

	private getDataTypes():any {
		let dataTypes:any[] = [];
		let xsdDataTypes:any[] = this.getXSDDataTypes();
		dataTypes = dataTypes.concat( xsdDataTypes );
		return dataTypes;
	}

	private getXSDDataTypes():any[] {
		let xsdDataTypes:any[] = [];
		Utils.forEachOwnProperty( XSD, ( key:string, value:any ):void => {
			if( URI.Util.isAbsolute( key ) ) {
				xsdDataTypes.push( {
					title: value,
					description: XSD[ value ],
					value: XSD[ value ],
				} );
			}
		} );
		return xsdDataTypes;
	}

	moveUp():void {
		this.onMoveUp.emit( this.literal );
	}

	moveDown():void {
		this.onMoveDown.emit( this.literal );
	}

}
export interface LiteralRow {
	copy:Literal;
	modified?:Literal;
	added?:Literal;
	deleted?:Literal;

	isBeingCreated?:boolean;
}
export interface Literal {
	"@value":string | number | boolean;
	"@type"?:string;
	"@language"?:string;
}

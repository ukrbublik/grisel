
grisel.defaultOptions = jQuery.extend(grisel.defaultOptions, {
	'gridRows': 5,
	'gridColumns': 3,
	'minPagesForExt': 3,
	'isExt': -1, //-1 for auto (see minPagesForExt), 0/1 to force
	'anyVal': 'a-n-y',
	'hideAny': false,
	//1 - fill items in left-to-right direction (horizontal) (in html group by rows), 0 - up-to-down direction (vertical) (in html group by cols)
	'gridDirectionHorizontal': false,
	//1 - force group by rows (not cols) in html for vertical direction (to make all elements in one row having equal height)
	'useRowsStyleForVerticalDirection': true,
	'openOnHover': false,
	'areInnerCtrlsFocuable': false,
	//when set to 2: for 3+ selected values text will be "X values", for 1-2 - "valA, valB", for 0 - one of allStr/anyStr/allStrDefault;
	//when set to -1: always "X values"
	'maxCntToShowListAsValStr': 3,
	
	//show/hide:
	//
	'showPagesList': false,
	'showSearch': true,
	'showIndex': true,
	'showControls': true,
	'hidePageControlsWhenThereIsPegeList': true,
	'showCtrlSaveSelection': true,
	'showCtrlShowSelection': false,
	'showCtrlGotoSelection': false,
	'showCtrlClearAll': true,
	'showCloseCross': false,
	
	//sizes:
	//
	//-2 - equal to <select>'s width, -1 - equal to wrapper's width, 0 - auto, > 0 - concrete width
	'divSelWidth': 0,
	//-2 - equal to <select>'s height, -1 - equal to wrapper's height, 0 - auto, > 0 - concrete height
	'divSelHeight': 0,
	'divSelPaddingLeft': 8,
	'divSelIsMultiline': false,
	'divSelClasses': '',
	//-2 - equal to wrapper's width, -1 - equal to sel's width, 0 - auto, > 0 - concrete width
	'divPopupWidth': 540,
	//0 - use css, > 0 - concrete height
	'divPopupHeight': 0,
	//for auto popup width - set min checkbox/radio's labels width
	'divPopupLabelsMinWidth': 0,
	'divPopupClasses': 'grisel-popup-domplus',
	'divWrapperClasses': '',
	//when page with long labels appeared, keep new bigger popup height for all other pages
	'tryToKeepConstPopupHeight': false,
	//reserve (once) more height for popup (for case of appearing long labels at next pages), in px
	'reserveForPopupHeight': 0,
	
	//animation:
	//
	//'animatePopupDuration': [250, 300],
	'animatePopupDuration': [0, 0],
	'isElasticPopupAnimation': [1, 0],
	'animatePopupEasing': ['easeOutBack', 'easeInOutBack'],
	//'animatePageDuration': 150,
	'animatePageDuration': 0,
	'animatePageEasing': 'swing',
	
	//"legacy" options (made for domplus.com.ua)
	//
	'flushSearchStringAfterSelection': true,
	'showSelectedItemsBeforeSearched': true,
	'showSelectedItemsWhenNoFound': false, //or true?
	//only for showSelectedItemsBeforeSearched==1
	'maxSelectionLimit': 3*5,
});

grisel.optionsBySelId = {
	's_district': {
		'gridRows': 4,
		'gridColumns': 3,
	},
	's_city': {
	},
	's_city_block': {
	},
	's_district_region': {
		'gridRows': 4,
		'gridColumns': 3,
	},
	's_street': {
		'divPopupWidth': 0,
		'divPopupClasses': 'grisel-popup-domplus grisel-popup-wide1',
		'divWrapperClasses': 'grisel-wrapper-wide1',
	},
	's_subway': {
	},
	's_purpose': {
	},
	's_purpose_land': {
	},
};


grisel.defaultLang = 'ru';

grisel.defaultStrings = jQuery.extend(grisel.defaultStrings, {
	'ru': {
		'indexAll': 'Все',
		'ctrlSaveSelection': 'Сохранить',
		'ctrlGotoSelection': 'Перейти к выбранному',
		'ctrlShowSelection': 'Показать выбранные',
		'ctrlClearAll': ['Сбросить все', 'Сбросить выбор'], //[<for multiple>, <for single>]
		'allStr': '',
		'allStrDefault': ['Все', 'Любой'],
		//only for hideAny == 1
		'noSelectionMsg': 'Нет выбранных элементов',
		'noResultsMsg': 'Не найдено, измените, пожалуйста, параметры поиска',
		'inputPlaceholder': 'Введите название',
		'cntFmt': '{cnt} {cnt_name}',
		'cntNames': ['значение', 'значения', 'значений'],
		//only for showSelectedItemsBeforeSearched==1 ("legacy")
		'maxSelectionMsg': 'Количество выбранных Вами элементов достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
	}
});

grisel.stringsBySelId = {
	's_street': {
		'ru': {
			'cntNames': ['улица', 'улицы', 'улиц'],
			'allStr': 'Все улицы Киева',
			'inputPlaceholder': 'Введите название улицы Киева',
			'noResultsMsg': 'Данной улицы Киева нет в списке, измените, пожалуйста, параметры поиска',
			'maxSelectionMsg': 'Количество выбранных Вами улиц Киева достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
		}
	},
	's_district': {
		'ru': {
			'allStr': 'Все районы',
			'inputPlaceholder': 'Введите название района Киева',
			'noResultsMsg': 'Данного района Киева нет в списке, измените, пожалуйста, параметры поиска',
			'maxSelectionMsg': 'Количество выбранных Вами районов Киева достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
		}
	},
};

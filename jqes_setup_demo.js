
jqes.defaultOptions = jQuery.extend(jqes.defaultOptions, {
	'divSelWidth': 300,
	'divSelHeight': 30,
	'divPopupWidth': 0,
	'divPopupLabelsMinWidth': 100,
	'tryToKeepConstPopupHeight': 1,
	'reserveForPopupHeight': 50,
});

jqes.optionsBySelId = {
	's_street': {
	},
	's_street2': {
	},
	's_street3': {
	},
	's_street4': {
	},
	's_street5': {
	},
	's_street6': {
	},
	's_street7': {
	},
	's_street8': {
	},
};


jqes.defaultLang = 'ru';

jqes.defaultStrings = jQuery.extend(jqes.defaultStrings, {
});

jqes.stringsBySelId = {
	's_street': {
		'ru': {
			'cntNames': ['улица', 'улицы', 'улиц'],
			'allStr': 'Все улицы Киева',
			'inputPlaceholder': 'Введите название улицы Киева',
			'noResultsMsg': 'Данной улицы Киева нет в списке, измените, пожалуйста, параметры поиска',
			'maxSelectionMsg': 'Количество выбранных Вами улиц Киева достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
		}
	},
};

grisel.defaultOptions = jQuery.extend(grisel.defaultOptions, {
	'divSelWidth': 300,
	'divSelHeight': 30,
	'divPopupWidth': 0,
	'divPopupLabelsMinWidth': 100,
	'tryToKeepConstPopupHeight': 1,
	'reserveForPopupHeight': 50,
});

grisel.optionsBySelId = {
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


grisel.defaultLang = 'ru';

grisel.defaultStrings = jQuery.extend(grisel.defaultStrings, {
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
};

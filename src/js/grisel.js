/**
 * grisel
 *
 * Custom select control.
 * Represents options as paginated grid.
 * Features search and filter by first letter.
 * Customizable. Has cool animations. Useful for big list of options.
 *
 * Requires: browser with CSS3 support (for flex), jQuery, jQuery easing plugin
 *
 * @version 2.2.8
 * @homepage https://github.com/ukrbublik/grisel
 * @author ukrbublik
 * @license MIT
 *
 * Copyright (c) 2015 Oblogin Denis <ukrbublik>
 */

/**
 * TODO:
 * [+] destroy method
 * [+] scroll instead of dots
 * [+] changing pages on mobile devices with swipe (http://kenwheeler.github.io/slick/)
 * [+] modify look on mobile devices - full-screen popup for small screens, for tablets - ?
 * [+] choose optional position of popup according to potiotion of select on window
 * [+] disable controls (ctrlGotoSelection, ctrlShowSelection, ctrlClearAll) if need to
 * [+] sort options?
 *
 * Maybe later:
 * [b] sometimes at first run (clear cache, try different broser etc.) - bad width (equals to width of window) - why???
 * [+] different icons for every option (example: countries)
 * [+] skins with different colors?
 * [+] groups of options?
 *
 */


//
// Class grisel
//
function grisel(s, options, strings, lang) {
	/**
	 * Vars
	 */
	this.$sel = jQuery();
	this.$divSel = jQuery();
	this.$divPopup = jQuery();
	this.divWrapper = jQuery();
	
	this.isBadInst = false;
	this.selId = '';
	this.valStr = '';
	this.items = []; //array of string
	this.firstChars = {};
	this.opts = []; //array of [ text, isSel, isAny ]
	this.anyOpt = false;
	this.selectedItems = []; //array of string
	this.selectedItemsInds = []; //array of indexes
	this.anyItemInd = -1;
	this.areAllSelected = false;
	this.currPage = -1;
	this.visibleItems = false; //array of string or false
	this.visibleItemsInds = false; //array of indexes or false
	this.filteredItems = false; //array of string or false
	this.filteredItemsInds = false; //array of indexes or false
	this.filterStr = '';
	this.filterFChar = '';
	this.fitlerBySel = false;
	this.anyStr = '';
	this.isMultiple = false;
	this.lang = false;
	
	/**
	 * Ctor
	 */
	this.ctor = function(s, _options, _strings, _lang) {
		//Get original <select>
		if(typeof s === 'string') {
			this.selId = s;
			this.$sel = jQuery('#'+this.selId);
		} else if(typeof s === 'object' && s instanceof jQuery && s.length == 1) {
			this.$sel = s;
			this.selId = this.$sel.attr('id');
		} else if(typeof s === 'object' && !(s instanceof jQuery)) {
			this.$sel = jQuery(s);
			this.selId = this.$sel.attr('id');
		} else {
			this.isBadInst = true;
			return null;
		}
		var selClasses = [];
		if(this.$sel.attr('class'))
			selClasses = this.$sel.attr('class').split(' ');
		
		if(!grisel.canInit(this.$sel)) {
			this.isBadInst = true;
			return null;
		}
		if(grisel.isInited(this.$sel))
			return grisel.getInstance(this.selId);
		
		//Lang
		this.lang = _lang ? _lang : grisel.defaultLang;
		
		//Build options
		this.options = jQuery.extend({}, grisel.defaultOptions);
		for(var i = 0 ; i < selClasses.length ; i++) {
			if(typeof grisel.optionsBySelClass[selClasses[i]] != 'undefined')
				this.options = jQuery.extend(this.options, grisel.optionsBySelClass[selClasses[i]]);
		}
		if(typeof grisel.optionsBySelId[this.selId] != 'undefined')
			this.options = jQuery.extend(this.options, grisel.optionsBySelId[this.selId]);
		var optionsKeys = Object.keys(grisel.defaultOptions);
		for(var i = 0 ; i < optionsKeys.length ; i++) {
			var k = optionsKeys[i], v = this.$sel.data(k);
			if(v !== undefined)
				this.options[k] = v;
		}
		if(_options)
			this.options = jQuery.extend(this.options, _options);
		
		//Build strings
		this.strings = jQuery.extend({}, grisel.defaultStrings[this.lang]);
		for(var i = 0 ; i < selClasses.length ; i++) {
			if(typeof grisel.stringsBySelClass[selClasses[i]] != 'undefined' && typeof grisel.stringsBySelClass[selClasses[i]][this.lang] != 'undefined')
				this.strings = jQuery.extend(this.strings, grisel.stringsBySelClass[selClasses[i]][this.lang]);
		}
		if(typeof grisel.stringsBySelId[this.selId] != 'undefined' && typeof grisel.stringsBySelId[this.selId][this.lang] != 'undefined')
			this.strings = jQuery.extend(this.strings, grisel.stringsBySelId[this.selId][this.lang]);
		if(_strings)
			this.strings = jQuery.extend(this.strings, _strings);
		
		//Init
		this.doInitOnce();
		
		grisel._instances[this.selId] = this;
		
		return this;
	};
	
	return this.ctor(s, options, strings, lang);
}

// ------------------------------------------------ Strings

grisel.defaultLang = 'ru';

grisel.defaultStrings = {
	'en': {
		//First button in index by first char, which clears filter by first char
		'indexAll': 'All',
		//Button that closes popup, like 'X' at bottom-right
		'ctrlSaveSelection': 'Save',
		//Button to goto page with selected option (for single-select)
		'ctrlGotoSelection': 'Go to selected',
		//Button to show only selected options
		'ctrlShowSelection': 'Show selected',
		//Button to clear selection. First for multi-select, second for single-select
		'ctrlClearAll': ['Clear all', 'Clear selection'],
		//Selector text when all options are selected, for overriding in 'stringsBySelId', 'stringsBySelClass'
		'allStr': '',
		//Default selector text when all options are selected. First for multi-select, second for single-select
		'allStrDefault': ['All', 'Any'],
		//Text when no option is selected
		'noSelectionMsg': 'No selected',
		//Text when filter gaven't any results
		'noResultsMsg': 'Nothing found',
		//Placeholder text for search input
		'inputPlaceholder': 'Enter a name',
		//Template to format selector text
		'cntFmt': '{cnt} {cnt_name}',
		//Declensions of word 'value': for english - [singular, plural, plural], for russian - [ед.им., ед.род., мн.род.]
		'cntNames': ['value', 'values', 'values'],
		//Warning text when count of selected items > maxSelectionLimit
		'maxSelectionMsg': 'You reached max number of selected elements.<br>Please save your selection',
	},
	'ru': {
		'indexAll': 'Все',
		'ctrlSaveSelection': 'Сохранить',
		'ctrlGotoSelection': 'Перейти к выбранному',
		'ctrlShowSelection': 'Показать выбранные',
		'ctrlClearAll': ['Сбросить все', 'Сбросить выбор'],
		'allStr': '',
		'allStrDefault': ['Все', 'Любой'],
		'noSelectionMsg': 'Нет выбранных элементов',
		'noResultsMsg': 'Не найдено, измените, пожалуйста, параметры поиска',
		'inputPlaceholder': 'Введите название',
		'cntFmt': '{cnt} {cnt_name}',
		'cntNames': ['значение', 'значения', 'значений'],
		'maxSelectionMsg': 'Количество выбранных Вами элементов достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
	}
};
grisel.stringsBySelClass = {
};
grisel.stringsBySelId = {
};

// ------------------------------------------------ Options

grisel.defaultOptions = {
	//General:
	//
	//Number of options rows in grid
	'gridRows': 5,
	//Number of options columns in grid
	'gridColumns': 3,
	//If list of options has pages >= this value, popup will be in extended view mode (with search and filter by first char)
	'minPagesForExt': 3,
	//Show popup in extended view mode?
	//-1 for auto applying extended mode (by option minPagesForExt), 1/0 to force extended mode on/off
	'isExt': -1,
	//Value attribute of special <oprion> "All values" (or "Any value") (if there is one in options)
	'anyVal': 'a-n-y',
	//Hide special "any"-option?
	'hideAny': false,
	//How options should be filled in grid?
	//1 - fill items in left-to-right direction (horizontal) (in html group by rows), 0 - up-to-down direction (vertical) (in html group by cols)
	'gridDirectionHorizontal': false,
	//1 - force group by rows (not cols) in html for vertical direction (to make all elements in one row having equal height).
	//1 is highly recommended (also because of animation problems with cols)
	'useRowsStyleForVerticalDirection': true,
	//1 - open popup by hover on selector, 0 - open by click
	'openOnHover': false,
	//Add tabindex attribute for all controls (options, inputs, buttons) in popup?
	'areInnerCtrlsFocuable': false,
	//For example. When set to 4: for 5+ selected values selector text will be "X values", for 1-4 - "valA, valB, valC, valD", for 0 - one of allStr option / text of "any"-option / allStrDefault option.
	//When set to -1: always "X values"
	'maxCntToShowListAsValStr': 3,
	
	//Show/hide elements:
	//
	'showPagesList': true,
	'showSearch': true,
	'showIndex': true,
	'showControls': true,
	'hidePageControlsWhenThereIsPageList': true,
	'showCtrlSaveSelection': false,
	'showCtrlShowSelection': true,
	'showCtrlGotoSelection': true,
	'showCtrlClearAll': true,
	'showCloseCross': true,
	
	//Sizes:
	//
	//-2 - equal to <select>'s width, -1 - equal to wrapper's width, 0 - auto, > 0 - concrete width
	'divSelWidth': 0,
	//-2 - equal to <select>'s height, -1 - equal to wrapper's height, 0 - auto, > 0 - concrete height
	'divSelHeight': 0,
	//Left padding of selector's text, in px
	'divSelPaddingLeft': 8,
	//Show selector's text as multiline?
	'divSelIsMultiline': false,
	//Optional list of classes for selector divided by ' '
	'divSelClasses': '',
	//-2 - equal to wrapper's width, -1 - equal to sel's width, 0 - auto, > 0 - concrete width
	'divPopupWidth': 0,
	//0 - use css, > 0 - concrete height
	'divPopupHeight': 0,
	//For auto popup width - set min checkbox/radio's labels width
	'divPopupLabelsMinWidth': 0,
	//Optional list of classes for popup divided by ' '
	'divPopupClasses': '',
	//Optional list of classes for selector's wrapper divided by ' '
	'divWrapperClasses': '',
	//When page with long labels appeared, keep new bigger popup height for all other pages
	'tryToKeepConstPopupHeight': true,
	//Eeserve (once) more height for popup (for case of appearing long labels at next pages), in px
	'reserveForPopupHeight': 0,
	
	//Animation:
	//
	//Duration in ms for open & close animations
	'animatePopupDuration': [600, 400],
	//Is animation elastic for open & close? If yes, some tricks will be applied for smoother animation
	'isElasticPopupAnimation': [1, 0],
	//Easing function names for open & close animations
	'animatePopupEasing': ['easeOutElastic', 'easeInOutBack'],
	//Duration of animation of switching pages
	'animatePageDuration': 150,
	//Easing function name of animation of switching pages
	'animatePageEasing': 'swing',
	
	//"Legacy" options (made for dom-plus.ua)
	//
	//When using search, clear search string after every selection
	'flushSearchStringAfterSelection': false,
	//When using search and no options found, show selected items anyway
	'showSelectedItemsWhenNoFound': false,
	//In options list show selected items first, but after "any"-option
	'showSelectedItemsFirst': false,
	//Only for showSelectedItemsFirst==1. If count of selected items > this value, warning (see string "maxSelectionMsg") will be shown
	'maxSelectionLimit': 0,
};
grisel.optionsBySelClass = {
};
grisel.optionsBySelId = {
};

// ------------------------------------------------ Static stuff

grisel._instances = {};

grisel.getInstance = function(selId) {
	var inst = grisel._instances[selId];
	if(inst === undefined)
		inst = null;
	return inst;
};

grisel.fCharToGroup = function(fChar) {
	var gr = fChar;
	var chLC = fChar.toLowerCase();
	if(fChar >= '0' && fChar <= '9')
		gr = '0-9';
	else if(!(chLC >= "а" && chLC <= "я" || chLC >= "a" && chLC <= "z"))
		gr = '*';
	return gr;
};

grisel.isFCharInGroup = function(fChar, gr) {
	var chLC = fChar.toLowerCase();
	if(gr == '0-9')
		return (fChar >= '0' && fChar <= '9');
	else if(gr == '*')
		return (!(chLC >= "а" && chLC <= "я" || chLC >= "a" && chLC <= "z"));
	else
		return fChar == gr;
};

//helpers
grisel.getFullWidth = function($el, width_margin) {
	return parseFloat($el.width()) + grisel.getWidthOverhead($el, width_margin);
};
grisel.getFullHeight = function($el, width_margin) {
	return parseFloat($el.height()) + grisel.getHeightOverhead($el, width_margin);
};
grisel.getWidthOverhead = function($el, width_margin) {
	if(width_margin === undefined)
		width_margin = false;
	return parseFloat($el.css('padding-left')) + parseFloat($el.css('padding-right')) + parseFloat($el.css('border-left-width')) + parseFloat($el.css('border-right-width')) + (width_margin ? parseFloat($el.css('margin-left')) + parseFloat($el.css('margin-right')) : 0);
};
grisel.getHeightOverhead = function($el, width_margin) {
	if(width_margin === undefined)
		width_margin = false;
	return parseFloat($el.css('padding-top')) + parseFloat($el.css('padding-bottom')) + parseFloat($el.css('border-top-width')) + parseFloat($el.css('border-bottom-width')) + (width_margin ? parseFloat($el.css('margin-top')) + parseFloat($el.css('margin-bottom')) : 0);
};
grisel.getFloatWidth = function($el) {
	var rect = $el[0].getBoundingClientRect();
	var width;
	if (rect.width) { //IE9+
		width = rect.width;
	} else {
		width = rect.right - rect.left;
	}
	return width;
};
grisel.getFloatHeight = function($el) {
	var rect = $el[0].getBoundingClientRect();
	var height;
	if (rect.height) { //IE9+
		height = rect.height;
	} else {
		height = rect.bottom - rect.top;
	}
	return height;
};

grisel.localizeCntName = function(cnt, cnt_names) {
	var i;
	if(cnt > 10 && cnt < 20)
		i = 2;
	else if(cnt % 10 == 1)
		i = 0;
	else if(cnt % 10 == 2 || cnt % 10 == 3 || cnt % 10 == 4)
		i = 1;
	else
		i = 2;
	return cnt_names[i];
};

// ------------------------------------------------ Model - sync

/**
 * Build human string representing current selection
 */
grisel.prototype.selectedItemsToStr = function(arr, areAll) {
	var val = '';
	if(this.isMultiple && arr.length == 0 || areAll)
		val = (this.strings.allStr != '' ? this.strings.allStr : (this.anyStr != '' ? this.anyStr : this.strings.allStrDefault[this.isMultiple ? 0 : 1]));
	else if(this.isMultiple && this.options.maxCntToShowListAsValStr >= 0 && arr.length > this.options.maxCntToShowListAsValStr)
		val = this.strings.cntFmt.replace('{cnt}', arr.length).replace('{cnt_name}', grisel.localizeCntName(arr.length, this.strings.cntNames));
	else if(arr.length)
		val = arr.join(', ');
	else if(!this.isMultiple && arr.length == 0)
		val = '';
	return val;
};

/**
 * Load model from original <select>
 */
grisel.prototype.getOptsFromSelect = function(initial /* = false*/) {
	var opts = [];
	var $optns = this.$sel.find("option");
	var self = this;
	var areAll = false;
	var isMultiple = (this.$sel.attr('multiple') == 'multiple');
	
	$optns.each(function(ind, el) {
		var $el = jQuery(el);
		var text = $el.text();
		var val = $el.attr('value');
		var isAny = (val == self.options.anyVal);
		var isSelected;
		if(initial)
			isSelected = ($el.attr('selected') == 'selected'); //TIP: get from attr, not prop, to allow zero selection for single <select>
		else
			isSelected = ($el.prop('selected') == true);
		if(isAny) {
			areAll = isSelected;
			isSelected = false; //TIP: don't allow a-n-y option to add to в this.selectedItemsInds
		}
		var opt = [
			text,
			isSelected,
			isAny,
			-1
		];
		if(isAny)
			self.anyOpt = opt;
		if(!(isAny && self.options.hideAny)) {
			opt[3] = opts.length;
			opts.push(opt);
		}
	});
	return {'opts': opts, 'areAll': areAll, 'isMultiple': isMultiple};
};

/**
 * Sync model from original <select>
 */
grisel.prototype.mSyncFromSelect = function(initial /* = false*/) {
	this.$sel.data('syncing_from', 1);
	
	//sync items
	var tmp = this.getOptsFromSelect(initial);
	this.opts = tmp.opts;
	this.areAllSelected = tmp.areAll;
	this.isMultiple = tmp.isMultiple;
	this.items = [];
	this.selectedItems = [];
	this.selectedItemsInds = [];
	//this.filteredItems = false; //TIP: will be done later in mSetNoFilter()
	//this.filteredItemsInds = false;
	this.firstChars = [];
	for(var i = 0 ; i < this.opts.length ; i++) {
		var opt = this.opts[i];
		if(opt[2]) {
			this.anyItemInd = i;
			if(this.anyStr == '')
				this.anyStr = opt[0];
		}
		this.items.push(opt[0]);
		if(opt[1] && !opt[2]) {
			this.selectedItems.push(opt[0]);
			this.selectedItemsInds.push(i);
		}
		if(!opt[2] && opt[0].length) {
			var fChar = opt[0][0];
			var gr = grisel.fCharToGroup(fChar);
			if(typeof this.firstChars[gr] == 'undefined')
				this.firstChars[gr] = 1;
			else
				this.firstChars[gr]++;
		}
	}
	this.mUpdSelection();
	
	this._allowZeroSelection();
	
	this.valStr = this.selectedItemsToStr(this.selectedItems, this.areAllSelected);
	
	this.$sel.data('syncing_from', 0);
};

grisel.prototype._allowZeroSelection = function() {
	if(!this.isMultiple && this.anyOpt === false && this.areAllSelected) {
		this.$sel.val('');
	}
};

/**
 * Sync model to original <select>
 *
 * lite == 1 - only check "selected" flags, lite == 0 - check all options and its order
 */
grisel.prototype.mSyncToSelect = function(lite) {
	this.$sel.data('syncing_to', 1);
	
	//tmp (will be reversed)
	if(this.options.hideAny) {
		this.opts.unshift(this.anyOpt);
		this.items.unshift(this.anyOpt[0]);
		this.anyItemInd = 0;
		for(var i = 0 ; i < this.selectedItemsInds.length ; i++)
			this.selectedItemsInds[i]++;
	}
	
	var $optns = this.$sel.find("option");
	var tmp = {};
	for(var i = 0 ; i < this.items.length ; i++) {
		tmp[i] = -1;
	}
	for(var i = 0 ; i < $optns.length ; i++) {
		var el = $optns[i];
		var $el = jQuery(el);
		var text = $el.text();
		var val = $el.attr('value');
		var isAny = (val == this.options.anyVal);
		var isSelected = ($el.prop('selected') == true);
		var ind = this.items.indexOf(text);
		if(ind != -1) {
			//match
			tmp[ind] = i;
			var shouldBeSelected = (ind == this.anyItemInd ? this.areAllSelected : this.selectedItemsInds.indexOf(ind) != -1);
			if(shouldBeSelected != isSelected) {
				if(shouldBeSelected)
					$el.attr('selected', 'selected');
				else
					$el.removeAttr('selected');
				$el.prop('selected', shouldBeSelected ? 'selected' : false);
			}
		} else {
			if(!lite) {
				//del
				$el.remove();
				$optns.splice(i, 1);
				i--;
			}
		}
	}
	
	if(!lite) {
		for(var i = 0 ; i < this.items.length ; i++) {
			var opt = this.opts[i];
			var isSel = (opt[2] ? this.areAllSelected : this.selectedItemsInds.indexOf(i) != -1);
			var text = opt[0];
			var val = opt[2] ? this.options.anyVal : text;
			if(tmp[i] == -1) {
				//add (and insert before or after neighnour)
				var $opt = jQuery("<option" + (isSel ? " selected='selected'" : "") + " value='" + val + "'>" + text + "</option>");
				var aftI = i - 1;
				while(1) {
					if(aftI == -1 || tmp[aftI] != -1)
						break;
					aftI--;
				}
				var befI = i + 1;
				while(1) {
					if(befI == this.items.length || tmp[befI] != -1)
						break;
					befI++;
				}
				if(befI != -1)
					befI = tmp[befI];
				if(aftI != -1)
					aftI = tmp[aftI];
				if(befI == -1 && aftI == -1) {
					$opt.appendTo(this.$sel);
					$optns.push($opt);
					tmp[i] = $optns.length - 1;
				} else if(befI != -1) {
					$opt.insertBefore($optns[befI]);
					$optns.splice(befI, 0, $opt);
					tmp[i] = befI;
					for(var j = 0 ; j < this.items.length ; j++) {
						if(j != i && tmp[j] >= befI)
							tmp[j]++;
					}
				} else if(aftI != -1) {
					$opt.insertAfter($optns[aftI]);
					$optns.splice(aftI + 1, 0, $opt);
					tmp[i] = aftI + 1;
					for(var j = 0 ; j < this.items.length ; j++) {
						if(j != i && tmp[j] > aftI)
							tmp[j]++;
					}
				}
			}
		}
		for(var i = 0 ; i < this.items.length ; i++) {
			if(tmp[i] != i) {
				//sort
				var $opt = jQuery($optns[tmp[i]]);
				if(i == 0)
					$opt.prependTo(this.$sel);
				else
					$opt.insertAfter($optns[tmp[i-1]]);
				$optns.splice(tmp[i], 1); //tmp[i] - old place
				$optns.splice(i, 0, $opt); //i - new place
				for(var j = 0 ; j < this.items.length ; j++) {
					//TIP: we actually use only move up
					if(j != i && i < tmp[i] /*move up*/ && tmp[j] < tmp[i] && tmp[j] >= i)
						tmp[j]++;
					else if(j != i && i > tmp[i] /*move down*/ && tmp[j] > tmp[i] && tmp[j] <= i)
						tmp[j]--;
				}
				tmp[i] = i;
			}
		}
	}
	
	//tmp - reverse
	if(this.options.hideAny) {
		this.opts.shift();
		this.items.shift();
		this.anyItemInd = -1;
		for(var i = 0 ; i < this.selectedItemsInds.length ; i++)
			this.selectedItemsInds[i]--;
	}
	
	this.$sel.trigger('change');
	
	this.$sel.data('syncing_to', 0);
};

// ------------------------------------------------ Model - filtering

grisel.prototype.mBuildVisibleItems = function() {
	if(this.isFullExtView() && this.options.showSelectedItemsFirst && this.getFilterMode() != 'sel') {
		this.mSortSelectedItems();
		this.visibleItems = [];
		this.visibleItemsInds = [];
		
		if(this.getFilterMode() == '' && !this.options.hideAny && this.anyItemInd != -1) {
			var it = this.anyOpt;
			var ind = this.anyItemInd;
			this.visibleItemsInds.push(ind);
			this.visibleItems.push(it);
		}
		for(var i = 0 ; i < this.selectedItemsInds.length ; i++) {
			var ind = this.selectedItemsInds[i];
			var it = this.selectedItems[i];
			this.visibleItemsInds.push(ind);
			this.visibleItems.push(it);
		}
		for(var i = 0 ; i < (this.filteredItemsInds !== false ? this.filteredItemsInds.length : this.opts.length) ; i++) {
			var ind = (this.filteredItemsInds !== false ? this.filteredItemsInds[i] : i);
			var it = (this.filteredItemsInds !== false ? this.filteredItems[i] : this.items[i]);
			var si = this.selectedItemsInds.indexOf(ind);
			if(si == -1 && ind != this.anyItemInd) {
				this.visibleItemsInds.push(ind);
				this.visibleItems.push(it);
			}
		}
	} else {
		this.visibleItems = false;
		this.visibleItemsInds = false;
	}
};

grisel.prototype.mFilterItemsBySearchString = function(str) {
	if(str == '') {
		this.filteredItemsInds = false;
		this.filteredItems = false;
	} else {
		this.filteredItemsInds = [];
		this.filteredItems = [];
		for(var i = 0 ; i < this.items.length ; i++) {
			var it = this.items[i];
			if(i != this.anyItemInd && it.match(new RegExp('(^| )'+str, 'i'))) {
				this.filteredItemsInds.push(i);
				this.filteredItems.push(it);
			}
		}
	}
	this.mBuildVisibleItems();
};

grisel.prototype.mFilterItemsByFirstChar = function(gr) {
	if(gr == '') {
		this.filteredItemsInds = false;
		this.filteredItems = false;
	} else {
		this.filteredItemsInds = [];
		this.filteredItems = [];
		for(var i = 0 ; i < this.items.length ; i++) {
			var it = this.items[i];
			if(it.length > 0) {
				var fChar = it[0];
				if(grisel.isFCharInGroup(fChar, gr) && this.anyItemInd != i) {
					this.filteredItemsInds.push(i);
					this.filteredItems.push(it);
				}
			}
		}
	}
	this.mBuildVisibleItems();
};

grisel.prototype.mFilterItemsBySelected = function() {
	//copy selectedItems to filteredItems
	this.filteredItemsInds = [];
	this.filteredItems = [];
	if(this.areAllSelected && !this.options.hideAny && this.anyItemInd != -1) {
		this.filteredItemsInds.push(this.anyItemInd);
		this.filteredItems.push(this.items[this.anyItemInd]);
	}
	for(var i = 0 ; i < this.selectedItemsInds.length ; i++) {
		var ind = this.selectedItemsInds[i];
		var it = this.selectedItems[i];
		this.filteredItemsInds.push(ind);
		this.filteredItems.push(it);
	}
	this.mBuildVisibleItems();
};

grisel.prototype.mFilterItemsByNone = function() {
	this.filteredItemsInds = false;
	this.filteredItems = false;
	this.mBuildVisibleItems();
};
grisel.prototype.mSetFilterByFirstChar = function(gr) {
	this.filterFChar = gr;
	this.filterStr = '';
	this.fitlerBySel = false;
};
grisel.prototype.mSetFilterBySelected = function(sel) {
	this.filterFChar = '';
	this.filterStr = '';
	this.fitlerBySel = sel;
};
grisel.prototype.mSetFilterBySearchString = function(str) {
	this.filterFChar = '';
	this.filterStr = str;
	this.fitlerBySel = false;
};
grisel.prototype.mSetNoFilter = function() {
	this.filterFChar = '';
	this.filterStr = '';
	this.fitlerBySel = false;
};
grisel.prototype.getFilterMode = function() {
	var mode = '';
	if(this.fitlerBySel) {
		mode = 'sel';
	} else if(this.filterFChar) {
		mode = 'fchar';
	} else if(this.filterStr) {
		mode = 'search';
	} else {
		mode = '';
	}
	return mode;
};
grisel.prototype.isNoFilter = function() {
	return this.getFilterMode() == '';
};

grisel.prototype.mSortSelectedItems = function() {
	this.selectedItems.sort();
	var self = this;
	this.selectedItemsInds.sort(function(ind1, ind2) {
		var it1 = self.items[ind1];
		var it2 = self.items[ind2];
		return (it1 < it2 ? -1 : (it1 > it2 ? 1 : 0));
	});
};

// ------------------------------------------------ Model - changings

grisel.prototype.mSelectItem = function(info) {
	var ind = info.ind, text = info.text, isSel = info.isSel;
	var changed = false;
	var oldAreAllSelected = this.areAllSelected;
	if(ind == this.anyItemInd) {
		if(!isSel && this.selectedItems.length == 0)
			isSel = true; //if nothing is selected, then all is selected
		this.areAllSelected = isSel;
		changed = (oldAreAllSelected != this.areAllSelected);
	} else {
		this.areAllSelected = false;
		if(!isSel) {
			var tmp = this.selectedItemsInds.indexOf(ind);
			if(tmp != -1) {
				this.selectedItemsInds.splice(tmp, 1);
				this.selectedItems.splice(tmp, 1);
				this.opts[ind][1] = false;
				changed = true;
			}
		} else {
			var tmp = this.selectedItemsInds.indexOf(ind);
			if(tmp == -1) {
				if(!this.isMultiple) {
					for(var i = 0 ; i < this.selectedItemsInds.length ; i++)
						this.opts[ this.selectedItemsInds[i] ][1] = false;
					this.selectedItemsInds = [];
					this.selectedItems = [];
				}
				this.selectedItemsInds.push(ind);
				this.selectedItems.push(this.items[ind]);
				this.opts[ind][1] = true;
				changed = true;
			}
		}
	}
	changed = changed || (oldAreAllSelected != this.areAllSelected);
	if(changed)
		this.mUpdSelection();
	
	var ch_stat = 0;
	if(oldAreAllSelected != this.areAllSelected || ind == this.anyItemInd)
		//if clicked on a-n-y option, we should check it back
		ch_stat = 2; 
	else if(changed)
		ch_stat = 1;
	return ch_stat;
};

grisel.prototype.mUpdSelection = function() {
	//flag - are all options selected (not by a-n-y option)?
	var tmp = true;
	//flag - is any option selected?
	var tmp2 = false;
	if(!this.areAllSelected) {
		for(var i = 0 ; i < this.opts.length ; i++) {
			var opt = this.opts[i];
			if(!opt[2] && !opt[1])
				tmp = false;
			if(!opt[2] && opt[1])
				tmp2 = true;
		}
	}
	this.areAllSelected = this.areAllSelected || tmp || !tmp2;
	if(this.areAllSelected && this.selectedItems.length) {
		this.selectedItems = [];
		this.selectedItemsInds = [];
		for(var i = 0 ; i < this.opts.length ; i++) {
			var opt = this.opts[i];
			if(opt[2])
				opt[1] = true;
			else
				opt[1] = false;
		}
	}
	this.mBuildVisibleItems();
};

// ------------------------------------------------ Model - getting slices of items list

grisel.prototype.getFilteredItems = function() {
	return this.filteredItems !== false ?  this.filteredItems : this.items;
};
grisel.prototype.getVisibleItems = function() {
	return this.visibleItems !== false ?  this.visibleItems : this.getFilteredItems();
};
grisel.prototype.getVisibleItemsInds = function() {
	return this.visibleItemsInds !== false ?  this.visibleItemsInds : this.filteredItemsInds;
};
grisel.prototype.getVisibleOptInd = function(i) {
	var inds = this.getVisibleItemsInds();
	return inds !== false ? inds[i] : i;
};
grisel.prototype.getVisibleOpt = function(i) {
	return this.opts[ this.getVisibleOptInd(i) ];
};

grisel.prototype.getPages = function() {
	return Math.ceil( 1.0 * this.getVisibleItems().length / (this.options.gridRows * this.options.gridColumns) );
};

grisel.prototype.getTotalPages = function() {
	return Math.ceil( 1.0 * this.items.length / (this.options.gridRows * this.options.gridColumns) );
};

grisel.prototype.getItemsCountWoAll = function() {
	return this.items.length - (this.anyItemInd != -1 ? 1 : 0);
};

grisel.prototype.canGoToPage = function(page) {
	return (page == -1 && this.getPages() == 0 || page >= 0 && page < this.getPages()) && !(this.$divPopup.data('changing-page') && this.$divPopup.data('changing-page-from') == page);
};

grisel.prototype.getMaxUsedGridRows = function() {
	return Math.min( this.options.gridRows, !this.options.gridDirectionHorizontal ? this.items.length : Math.ceil(1.0 * this.items.length / this.options.gridColumns) );
};
grisel.prototype.getMaxUsedGridColumns = function() {
	return Math.min( this.options.gridColumns, this.options.gridDirectionHorizontal ? this.items.length : Math.ceil(1.0 * this.items.length / this.options.gridRows) );
};
grisel.prototype.getUsedGridRowsForPage = function(page) {
	return Math.min( this.options.gridRows, !this.options.gridDirectionHorizontal ? this.getVisibleItemsCntForPage(page) : Math.ceil(1.0 * this.getVisibleItemsCntForPage(page) / this.options.gridColumns) );
};
grisel.prototype.getUsedGridColumnsForPage = function(page) {
	return Math.min( this.options.gridColumns, this.options.gridDirectionHorizontal ? this.getVisibleItemsCntForPage(page) : Math.ceil(1.0 * this.getVisibleItemsCntForPage(page) / this.options.gridRows) );
};

grisel.prototype.getItemsRangeForPage = function(page) {
	var rng = false;
	if(this.canGoToPage(page) && page >= 0) {
		var len = (this.options.gridRows * this.options.gridColumns);
		var start = page * len;
		if((start + len-1) >= this.getVisibleItems().length)
			len = (this.getVisibleItems().length - start);
		rng = [start, start + len-1];
	}
	return rng;
};
grisel.prototype.getVisibleItemsCntForPage = function(page) {
	if(page === undefined)
		page = this.currPage;
	var rng = this.getItemsRangeForPage(page);
	var cnt = 0;
	if(rng !== false)
		cnt = rng[1] - rng[0] + 1;
	return cnt;
};

grisel.prototype.getSearchedCnt = function() {
	return this.getFilterMode() == 'search' ? this.filteredItems.length : -1;
};

grisel.prototype.getPageForInd = function(ind) {
	var page = -1;
	var pos = this.getVisibleOptInd(ind);
	if(pos != -1 && this.getSearchedCnt() == 0 && !this.options.showSelectedItemsWhenNoFound)
		pos = -1;
	if(pos != -1)
		page = Math.floor( 1.0 * pos / (this.options.gridRows * this.options.gridColumns) );
	return page;
};

grisel.prototype.getPageForCurrSel = function() {
	var page = -1;
	for(var i = 0 ; i < this.selectedItemsInds.length ; i++) {
		var ind = this.selectedItemsInds[i];
		var p = this.getPageForInd(ind);
		if(p != -1 && (page == -1 || p < page))
			page = p;
	}
	return page;
};

grisel.prototype.getFirstPage = function() {
	return this.getPages() > 0 ? 0 : -1;
};

// ------------------------------------------------ View

grisel.prototype.isExtView = function() {
	return this.getTotalPages() >= this.options.minPagesForExt;
};
grisel.prototype.isFullExtView = function() {
	return this.options.isExt == 1 || this.options.isExt == -1 && this.isExtView();
};
grisel.prototype.isCompactExtView = function() {
	return this.options.isExt == 0 || this.options.isExt == -1 && !this.isExtView();
};

grisel.canInit = function($sel) {
	var selId = $sel.attr('id');
	var ok = (selId && jQuery('#'+selId).length == 1 && $sel.is('select'));
	return ok;
};
grisel.isInited = function($sel) {
	var $divSel = $sel.next();
	var $divEms = $sel.next().next();
	var is = $sel.is(':hidden') && $divSel.is('.grisel-select') && $divEms.is('.grisel-popup');
	return is;
};

//open, close
//
grisel.prototype.isPopupOpened = function() {
	return !this.$divPopup.hasClass('hidden');
};

grisel.prototype.vOpenPopup = function(animate) {
	var canOpen = !this.isPopupOpened() && !this.$divPopup.data('opening') && !this.$divPopup.data('closing');
	//"queue" open task
	if(this.$divPopup.data('closing'))
		this.$divPopup.data('to_open', 1);
	if(!canOpen)
		return;
	var self = this;
	
	var minw = Math.max(parseFloat(this.$divPopup.css('min-width')), grisel.getFullWidth(this.$divSel));
	this.$divPopup.css('min-width', minw);
	this.$divPopup.removeClass('hidden');
	var isFullRows = this.getUsedGridRowsForPage(this.currPage) == this.getMaxUsedGridRows() && this.getMaxUsedGridRows() == this.options.gridRows;
	if(isFullRows && this.options.reserveForPopupHeight > 0) {
		//reserve (once) more height for popup (for case of appearing long labels at next pages)
		var bh0 = this.$divPopup.$body.height();
		bh0 += this.options.reserveForPopupHeight;
		this.$divPopup.$body.height(bh0);
		this.options.reserveForPopupHeight = -1 * this.options.reserveForPopupHeight;
	}
	this.onShowPopup();
	this.$divPopup.focus();
	var	w_to = grisel.getFullWidth(this.$divPopup),
		h_to = grisel.getFullHeight(this.$divPopup),
		w_from = grisel.getFullWidth(this.$divSel),
		h_from = grisel.getFullHeight(this.$divSel),
		l_to = 0,
		t_to = 0,
		l_from = 0,
		t_from = 0;
	var aniTo = {
		width: w_to, 
		height: h_to,
		left: l_to,
		top: t_to,
		opacity: 1,
	};
	var cssRestore = {
		'min-width': minw,
		width: (this.options.divPopupWidth > 0 ? this.options.divPopupWidth : (this.options.divPopupWidth == -1 ? w_from : '')),
		height: (this.options.divPopupHeight ? this.options.divPopupHeight : ''),
		opacity: 1,
	};
	var aniFrom = {
		'min-width': '',
		width: w_from,
		height: h_from,
		left: l_from,
		top: t_from,
		opacity: 0,
	};
	var aniOnComplete = function() {
		//revert temp fixes
		self._vRevertTempFixesAfterAnimationOpCl();
		//restore state as before animation
		self.$divPopup.css(cssRestore);
		self._vFixBodyHeight();
		self.$divPopup.data('opening', 0);
		//"dequeue" close task
		if(self.$divPopup.data('to_close')) {
			self.$divPopup.data('to_close', 0);
			setTimeout(function() {
				self.vClosePopup();
			}, 1);
		}
	};
	var aniOpts = {
		duration: this.options.animatePopupDuration[0], 
		easing: this.options.animatePopupEasing[0],
		complete: aniOnComplete
	};
	if(this.options.isElasticPopupAnimation[0]) {
		//todo
		aniFrom.left = Math.min(w_from, w_to / 2);
		aniFrom.top = h_from;
		aniFrom.width = Math.max(1, w_from - aniFrom.left);
		aniFrom.height = Math.max(1, h_from - aniFrom.top);
	}
	
	var doAnimate = this.options.animatePopupDuration[0] > 0 && (animate === undefined || animate == true);
	if(doAnimate) {
		this.$divPopup.data('opening', 1);
		//temp fixes for smooth animation
		this._vTempFixesBeforeAnimationOpCl();
		//animate
		this.$divPopup.css(aniFrom);
		this.$divPopup.animate(aniTo, aniOpts);
	} else {
		self._vFixBodyHeight();
	}
};

grisel.prototype.vClosePopup = function(animate) {
	var canClose = this.isPopupOpened() && !this.$divPopup.data('opening') && !this.$divPopup.data('closing');
	//"queue" close task
	if(this.$divPopup.data('opening'))
		this.$divPopup.data('to_close', 1);
	if(!canClose)
		return;
	var self = this;
	
	var minw = parseFloat(this.$divPopup.css('min-width'));
	var	w_from = grisel.getFullWidth(this.$divPopup),
		h_from = grisel.getFullHeight(this.$divPopup),
		w_to = grisel.getFullWidth(this.$divSel),
		h_to = grisel.getFullHeight(this.$divSel),
		l_to = 0,
		t_to = 0,
		l_from = 0,
		t_from = 0;
	var aniTo = {
		width: w_to,
		height: h_to,
		left: l_to,
		top: t_to,
		opacity: 0,
	};
	var cssRestore = {
		'min-width': minw,
		width: (this.options.divPopupWidth > 0 ? this.options.divPopupWidth : (this.options.divPopupWidth == -1 ? w_to : '')),
		height: (this.options.divPopupHeight ? this.options.divPopupHeight : ''),
		opacity: 1,
		left: 0, 
		top: 0
	};
	var aniFrom = {
		'min-width': '',
		width: w_from, 
		height: h_from,
		left: l_from,
		top: t_from,
		opacity: 1,
	};
	var aniOnComplete = function() {
		//revert temp fixes
		self._vRevertTempFixesAfterAnimationOpCl();
		//restore state as before animation
		self.$divPopup.css(cssRestore);
		self.$divPopup.addClass('hidden');
		self.onHidePopup();
		self.$divPopup.data('closing', 0);
		//"dequeue" open task
		if(self.$divPopup.data('to_open')) {
			self.$divPopup.data('to_open', 0);
			setTimeout(function() {
				self.vOpenPopup();
			}, 1);
		}
	};
	var aniOpts = {
		duration: this.options.animatePopupDuration[1], 
		easing: this.options.animatePopupEasing[1],
		complete: aniOnComplete
	};
	if(this.options.isElasticPopupAnimation[1]) {
		//todo
		aniTo.left = Math.min(w_to, w_from / 2);
		aniTo.top = h_to;
		aniTo.width = Math.max(1, w_to - aniTo.left);
		aniTo.height = Math.max(1, h_to - aniTo.top);
	}
	
	var doAnimate = this.options.animatePopupDuration[1] > 0 && (animate === undefined || animate == true)
	if(doAnimate) {
		self.$divPopup.data('closing', 1);
		//temp fixes for smooth animation
		this._vTempFixesBeforeAnimationOpCl();
		//animate
		this.$divPopup.css(aniFrom);
		this.$divPopup.animate(aniTo, aniOpts);
	} else {
		this.$divPopup.addClass('hidden');
	}
};

grisel.prototype._vTempFixesBeforeAnimationOpCl = function() {
	var self = this;
	var bodyHeight = grisel.getFullHeight(this.$divPopup.$body, true);
	var bodyWrapperHeight = grisel.getFullHeight(this.$divPopup.$bodyWrapper, true);
	var tmp = [];
	this.$divPopup.$body.find('.prch2-text-wrapper').each(function(i, el) {
		var $el = jQuery(el);
		var w = grisel.getFloatWidth($el), h = grisel.getFloatHeight($el);
		tmp.push([ $el, w, h ]);
	});
	for(var i = 0 ; i < tmp.length ; i++) {
		tmp[i][0].css({
			'max-width': tmp[i][1],
			'min-width': tmp[i][1],
			'max-height': tmp[i][2],
			'min-height': tmp[i][2],
		});
	}
	var isConcrete = this.$divPopup.hasClass('grisel-concrete-height');
	this.$divPopup.data('_isConcrete', isConcrete);
	if(this.$divPopup.$bodyWrapper.css('min-height'))
		this.$divPopup.$bodyWrapper.data('_min-height', this.$divPopup.$bodyWrapper.css('min-height')).css('min-height', '');
	if(this.$divPopup.$bodyWrapper.css('min-width'))
		this.$divPopup.$bodyWrapper.data('_min-width', this.$divPopup.$bodyWrapper.css('min-width')).css('min-width', '');
	if(this.$divPopup.$bodyWrapper.css('max-width'))
		this.$divPopup.$bodyWrapper.data('_max-width', this.$divPopup.$bodyWrapper.css('max-width')).css('max-width', '');
	this.$divPopup.$bodyWrapper.addClass('grisel-body-wrapper-flex');
	this.$divPopup.$body.css('flex-grow', bodyHeight);
	this.$divPopup.$bodyAniHelper.css('flex-grow', bodyWrapperHeight - bodyHeight);
	if(!isConcrete)
		this.$divPopup.addClass('grisel-concrete-height');
};

grisel.prototype._vRevertTempFixesAfterAnimationOpCl = function() {
	var self = this;
	var isConcrete = this.$divPopup.data('_isConcrete');
	if(!isConcrete)
		this.$divPopup.removeClass('grisel-concrete-height');
	if(this.$divPopup.$bodyWrapper.data('_min-height'))
		this.$divPopup.$bodyWrapper.css('min-height', this.$divPopup.$bodyWrapper.data('_min-height')).data('_min-height', '');
	if(this.$divPopup.$bodyWrapper.data('_min-width'))
		this.$divPopup.$bodyWrapper.css('min-width', this.$divPopup.$bodyWrapper.data('_min-width')).data('_min-width', '');
	if(this.$divPopup.$bodyWrapper.data('_max-width'))
		this.$divPopup.$bodyWrapper.css('max-width', this.$divPopup.$bodyWrapper.data('_max-width')).data('_max-width', '');
	this.$divPopup.$body.find('.prch2-text-wrapper').each(function(i, el) {
		var $el = jQuery(el);
		$el.css({
			'max-width': '',
			'min-width': (self.options.divPopupLabelsMinWidth > 0 ? self.options.divPopupLabelsMinWidth : ''),
			'max-height': '',
			'min-height': '',
		});
	});
	this.$divPopup.$bodyWrapper.removeClass('grisel-body-wrapper-flex');
}

grisel.prototype._vBodyFlexOn = function() {
	var bodyHeight = grisel.getFullHeight(this.$divPopup.$body, true);
	var bodyWrapperHeight = grisel.getFullHeight(this.$divPopup.$bodyWrapper, true);
	this.$divPopup.$bodyWrapper.addClass('grisel-body-wrapper-flex');
	this.$divPopup.$body.css('flex-grow', bodyHeight);
	this.$divPopup.$bodyAniHelper.css('flex-grow', bodyWrapperHeight - bodyHeight);
};
grisel.prototype._vBodyFlexOff = function() {
	this.$divPopup.$bodyWrapper.removeClass('grisel-body-wrapper-flex');
};

//render
//
grisel.prototype.vConvertSelectOnce = function() {
	if(grisel.isInited(this.$sel))
		return false;
	var self = this;
	
	//replace original <select> with our custom sel & popup divs
	this.$sel.hide();
	this.$sel.wrap(this.htmlForWrapper());
	this.$divWrapper = this.$sel.parent();
	this._allowZeroSelection(); //TIP: need to fix after wrap() call
	this.$divSel = jQuery(this.htmlForSel());
	this.$divPopup = jQuery(this.htmlForPopup());
	this.$divSel.insertAfter(this.$sel);
	this.$divPopup.insertAfter(this.$divSel);
	
	//create references to all html elements we need later
	this.$divSel.$span = this.$divSel.find('span');
	this.$divPopup.$close = this.$divPopup.find('.grisel-close');
	this.$divPopup.$head = this.$divPopup.find('.grisel-head');
	this.$divPopup.$search = this.$divPopup.find('.grisel-search');
	this.$divPopup.$pagesList = this.$divPopup.find('.grisel-pages-list');
	this.$divPopup.$pagesList.$dotsViewContainer = function() { return self.$divPopup.$pagesList.find('.grisel-pages-dots-wrapper') };
	this.$divPopup.$pagesList.$dotsContainer = function() { return self.$divPopup.$pagesList.find('.grisel-pages-dots') };
	this.$divPopup.$pagesList.$dotsWrappers = function() { return self.$divPopup.$pagesList.find('.grisel-page-dot-wrapper') };
	this.$divPopup.$pagesList.$currDotWrapper = function() { return self.$divPopup.$pagesList.find('.grisel-page-dot-wrapper.grisel-page-dot-current') };
	this.$divPopup.$pagesList.$dots = function() { return self.$divPopup.$pagesList.find('.grisel-page-dot-wrapper .grisel-page-dot') };
	this.$divPopup.$pagesList.$currDot = function() { return self.$divPopup.$pagesList.find('.grisel-page-dot-wrapper.grisel-page-dot-current .grisel-page-dot') };
	this.$divPopup.$pagesList.$ctrlPrev = function() { return self.$divPopup.$pagesList.find('.grisel-pages-prev') };
	this.$divPopup.$pagesList.$ctrlNext = function() { return self.$divPopup.$pagesList.find('.grisel-pages-next') };
	this.$divPopup.$pagesList.$ctrlFirst = function() { return self.$divPopup.$pagesList.find('.grisel-pages-first') };
	this.$divPopup.$pagesList.$ctrlLast = function() { return self.$divPopup.$pagesList.find('.grisel-pages-last') };
	this.$divPopup.$pagesList.$gradLeft = function() { return self.$divPopup.$pagesList.find('.grisel-pages-grad-left') };
	this.$divPopup.$pagesList.$gradRight = function() { return self.$divPopup.$pagesList.find('.grisel-pages-grad-right') };
	this.$divPopup.$ctrlsWrapper = this.$divPopup.find('.grisel-ctrls');
	this.$divPopup.$ctrls = function() { return self.$divPopup.$ctrlsWrapper.find('> .grisel-ctrl') };
	this.$divPopup.$ctrlPages = this.$divPopup.find('.grisel-ctrls-pag');
	this.$divPopup.$ctrlClearAll = this.$divPopup.find('.grisel-ctrl-clear-all');
	this.$divPopup.$ctrlShowSelection = this.$divPopup.find('.grisel-ctrl-show-selection');
	this.$divPopup.$ctrlGotoSelection = this.$divPopup.find('.grisel-ctrl-goto-selection');
	this.$divPopup.$ctrlSaveSelection = this.$divPopup.find('.grisel-ctrl-save-selection');
	this.$divPopup.$btnLeft = this.$divPopup.find('.grisel-btn-left');
	this.$divPopup.$btnRight = this.$divPopup.find('.grisel-btn-right');
	this.$divPopup.$bodyWrapper = this.$divPopup.find(".grisel-body-wrapper");
	this.$divPopup.$body = this.$divPopup.find(".grisel-body:not(.grisel-body-ghost)");
	this.$divPopup.$bodyGhost = this.$divPopup.find(".grisel-body-ghost");
	this.$divPopup.$bodyAniHelper = this.$divPopup.find(".grisel-body-ani-helper");
	this.$divPopup.$msg = this.$divPopup.find(".grisel-msg");
	this.$divPopup.$msgSpan = this.$divPopup.find(".grisel-msg span");
	this.$divPopup.$index = this.$divPopup.find(".grisel-index");
	this.$divPopup.$indexChars = function() { return self.$divPopup.$index.find('.grisel-char') };
	this.$divPopup.$body.$checkboxes = this.$divPopup.$bodyGhost.$checkboxes = function() { return jQuery(this).find("input[type=checkbox], input[type=radio]") };
	this.$divPopup.getCheckboxInfo = function($checkbox) {
		var info = {};
		info.text = $checkbox.next('label').text();
		info.ind = parseInt($checkbox.attr('realInd'));
		info.isSel = $checkbox.is(':checked');
		info.isAny = $checkbox.is('.grisel-checkbox-any');
		return info;
	};
	this.$divPopup.getCharInfo = function($char) {
		var info = {};
		info.gr = $char.attr('fChar');
		return info;
	};
	
	//enable tabindexes
	this.$divSel.add(this.$divPopup).attr('tabindex', 0);
	var $list = $();
	$.each([
		this.$divPopup.$close, 
		this.$divPopup.$search, 
		this.$divPopup.$btnLeft, 
		this.$divPopup.$btnRight, 
		this.$divPopup.$ctrlClearAll,
		this.$divPopup.$ctrlShowSelection,
		this.$divPopup.$ctrlGotoSelection,
		this.$divPopup.$ctrlSaveSelection
	], function(i, $o) {
		$list = $list.add($o);
	});
	if(this.options.areInnerCtrlsFocuable)
		$list.attr('tabindex', this.options.areInnerCtrlsFocuable ? 0 : -1);
	
	//apply sizes options
	if(this.options.divSelWidth == -2)
		this.$divSel.css('width', grisel.getFullWidth(this.$sel));
	else if(this.options.divSelWidth == -1)
		this.$divSel.addClass('grisel-select-auto-width');
	else if(this.options.divSelWidth > 0)
		this.$divSel.css('width', parseFloat(this.options.divSelWidth));
	if(this.options.divSelHeight == -2)
		this.$divSel.css('height', grisel.getFullHeight(this.$sel));
	else if(this.options.divSelHeight == -1)
		this.$divSel.addClass('grisel-select-auto-height');
	else if(this.options.divSelHeight > 0)
		this.$divSel.css('height', parseFloat(this.options.divSelHeight));
	if(this.options.divSelPaddingLeft) {
		setTimeout(function() {
			self.$divSel.css('padding-left', parseFloat(self.options.divSelPaddingLeft));
			self.$divSel.css('padding-right', parseFloat(self.options.divSelPaddingLeft) + grisel.getFullWidth(self.$divSel.find('.cuselFrameRight'), true) - 8);
		}, 5);
	}
	if(this.options.divSelIsMultiline)
		this.$divSel.addClass('grisel-select-multiline');
	if(this.options.divSelClasses)
		this.$divSel.addClass(this.options.divSelClasses);
	if(this.options.divPopupWidth == -2)
		this.$divPopup.addClass('grisel-popup-auto-width');
	else if(this.options.divPopupWidth == -1)
		this.$divPopup.css('width', grisel.getFullWidth(this.$divSel));
	else if(this.options.divPopupWidth > 0)
		this.$divPopup.css('width', parseFloat(this.options.divPopupWidth));
	if(this.options.divPopupHeight > 0) {
		this.$divPopup.addClass('grisel-concrete-height');
		this.$divPopup.css('height', parseFloat(this.options.divPopupHeight));
	}
	if(this.options.divPopupClasses)
		this.$divPopup.addClass(this.options.divPopupClasses);
	if(this.options.divWrapperClasses)
		this.$divWrapper.addClass(this.options.divWrapperClasses);
};

grisel.prototype.vRenderPage = function(page, oldPage, animate, callback) {
	var self = this;
	
	//enable/disable, show/hide controls
	this.$divPopup.$btnLeft.toggleClass('grisel-enabled', (page > 0));
	this.$divPopup.$btnRight.toggleClass('grisel-enabled', (page >= 0 && page < (this.getPages() - 1)));
	this.$divPopup.$btnLeft.toggleClass('grisel-disabled', !(page > 0));
	this.$divPopup.$btnRight.toggleClass('grisel-disabled', !(page >= 0 && page < (this.getPages() - 1)));
	this.$divPopup.$ctrlPages.toggle( this.getPages() > 1 && !this.isFullExtView() );
	this.$divPopup.$ctrlsWrapper.toggle( this.$divPopup.$ctrls().filter(function() { return $(this).css("display") != "none" }).length > 0 );
	
	//post-render page list
	this.vPostRenderPagesList(true);
	
	//get html to render
	var tmp = this.htmlForPage(page);
	
	//render msg
	this.$divPopup.$msgSpan.html(tmp.msg);
	this.$divPopup.$msg.toggleClass('visible', tmp.msg != '');
	
	//render page w/ or w/o animation
	var doAnimate = (animate == true && page != oldPage && page >= 0 && oldPage >= 0 && this.options.animatePageDuration && !this.$divPopup.$body.is(':empty'));
	var isFullRows = this.getUsedGridRowsForPage(page) == this.getMaxUsedGridRows() && this.getMaxUsedGridRows() == this.options.gridRows;
	var wasFullRows = this.getUsedGridRowsForPage(oldPage) == this.getMaxUsedGridRows() && this.getMaxUsedGridRows() == this.options.gridRows;
	if(!doAnimate) {
		this.$divPopup.$bodyGhost.html('');
		this.vRenderPageTo(tmp, this.$divPopup.$body);
		var r = self._vPreFixBodyHeight(false);
		callback();
	} else {
		var w = this.$divPopup.$body.width();
		var h = this.$divPopup.$body.height();
		var isSimultAnims = this.$divPopup.$bodyGhost.is(':visible');
		if(isSimultAnims) {
			this.vRenderPageTo(tmp, this.$divPopup.$bodyGhost);
		} else {
			this.$divPopup.data('changing-page', 1).data('changing-page-from', oldPage).data('changing-page-to', page).addClass('grisel-animating-change-page');
			this.vRenderPageTo(tmp, this.$divPopup.$bodyGhost);
			this.$divPopup.$bodyGhost.removeClass('grisel-hidden');
			this.$divPopup.$bodyGhost.css({
				width: w,
				top: 0,
				left: (page > oldPage ? w : -w)
			});
			
			var r = self._vPreFixBodyHeight(true);
			this.$divPopup.$bodyWrapper.css({
				height: r.bodyWrapperOldH
			});
			this.$divPopup.$body.addClass('grisel-body-ghost').removeClass('grisel-hidden').css({
				width: w,
				height: h,
				top: 0,
				left: 0
			});
			var bodyWrapperAniTo = {
				height: r.bodyWrapperNewH
			};
			var bodyAniTo = {
				left: (page > oldPage ? -w : w)
			};
			var bodyGhostAniTo = {
				left: 0
			};
			var bodyWrapperCssRestore = {
				height: '',
			};
			var bodyCssRestore = {
				width: '',
				height: (r.gh_ ? r.gh_ : ''),
				top: '',
				left: ''
			};
			var bodyGhostCssRestore = {
				width: '',
				height: '',
				top: '',
				left: ''
			};
			var aniCnt = 0;
			var aniOnAllComplete = function() {
				var isSimultAnims = !self.$divPopup.$body.hasClass('grisel-body-ghost');
				if(isSimultAnims) {
					//fix
					var $tmp = self.$divPopup.$body;
					self.$divPopup.$body = self.$divPopup.$bodyGhost;
					self.$divPopup.$bodyGhost = $tmp;
				}
				self.$divPopup.$bodyGhost.removeClass('grisel-body-ghost').css(bodyCssRestore);
				self.$divPopup.$body.css(bodyGhostCssRestore);
				self.$divPopup.$bodyWrapper.css(bodyWrapperCssRestore);
				var $tmp = self.$divPopup.$body;
				self.$divPopup.$body = self.$divPopup.$bodyGhost;
				self.$divPopup.$bodyGhost = $tmp;
				self.$divPopup.$bodyGhost.addClass('grisel-hidden');
				self.$divPopup.$body.removeClass('grisel-hidden');
				self._vFixBodyHeight();
				self.$divPopup.data('changing-page', 0).removeData('changing-page-from').removeData('changing-page-to').removeClass('grisel-animating-change-page');
				callback();
			};
			var aniOnOneComplete = function() {
				aniCnt--;
				if(aniCnt == 0)
					aniOnAllComplete();
			};
			var aniOpts = {
				duration: this.options.animatePageDuration, 
				easing: this.options.animatePageEasing,
				queue: false,
				complete: aniOnOneComplete
			};
			this.$divPopup.$bodyWrapper.animate(bodyWrapperAniTo, aniOpts);
			aniCnt++;
			this.$divPopup.$body.animate(bodyAniTo, aniOpts);
			aniCnt++;
			this.$divPopup.$bodyGhost.animate(bodyGhostAniTo, aniOpts);
			aniCnt++;
		}
	}
};

grisel.prototype.vRenderPageTo = function(tmp, $body) {
	$body.html(tmp.html);
	
	//add dynamic styles
	$body.find('.grisel-row .grisel-el').css('width', (1.0 * 100 / this.getMaxUsedGridColumns())+'%');
	$body.find('.grisel-col').css('width', (1.0 * 100 / this.getMaxUsedGridColumns())+'%');
	$body.find('.grisel-col .grisel-el').css('height', (1.0 * 100 / this.getMaxUsedGridRows())+'%');
	
	//customize checkboxes
	var $checkboxes = $body.$checkboxes();
	$checkboxes.filter(':not(.prch2-hidden)').prettyCheckboxes2();
	//enable tabindexes
	if(this.options.areInnerCtrlsFocuable)
		$checkboxes.filter('.prch2-hidden').next('label').next('.prch2-label').attr('tabindex', this.options.areInnerCtrlsFocuable ? 0 : -1);
	
	if(this.options.divPopupLabelsMinWidth > 0)
		$body.find('.prch2-text-wrapper').css('min-width', this.options.divPopupLabelsMinWidth);
	
	this._vFixBodyHeight();
};

grisel.prototype.vRenderValStr = function(str) {
	this.$divSel.$span.text(str);
};

grisel.prototype.vRenderFirstChars = function() {
	if(this.options.showIndex) {
		var html = this.htmlForFirstChars();
		this.$divPopup.$index.html(html);
		
		//enable tabindexes
		var $indexChars = this.$divPopup.$indexChars();
		if(this.options.areInnerCtrlsFocuable)
			$indexChars.attr('tabindex', this.options.areInnerCtrlsFocuable ? 0 : -1);
	} else {
		this.$divPopup.$index.hide();
	}
};

grisel.prototype.vRenderPagesList = function() {
	if(this.options.showPagesList) {
		var html = this.htmlForPagesList();
		this.$divPopup.$pagesList.html(html);
		
		this.$divPopup.$pagesList.toggle( this.getTotalPages() > 1 );
	} else {
		this.$divPopup.$pagesList.hide();
	}
};

grisel.prototype.vPostRenderPagesList = function(animate) {
	if(!this.$divPopup.$pagesList.is(':visible'))
		return;
	
	//change classes
	this.$divPopup.$pagesList.$ctrlFirst().toggleClass('grisel-enabled', this.currPage > 0);
	this.$divPopup.$pagesList.$ctrlFirst().toggleClass('grisel-disabled', !(this.currPage > 0));
	this.$divPopup.$pagesList.$ctrlPrev().toggleClass('grisel-enabled', this.currPage > 0);
	this.$divPopup.$pagesList.$ctrlPrev().toggleClass('grisel-disabled', !(this.currPage > 0));
	this.$divPopup.$pagesList.$ctrlLast().toggleClass('grisel-enabled', this.currPage >= 0 && this.currPage < (this.getPages()-1));
	this.$divPopup.$pagesList.$ctrlLast().toggleClass('grisel-disabled', !(this.currPage >= 0 && this.currPage < (this.getPages()-1)));
	this.$divPopup.$pagesList.$ctrlNext().toggleClass('grisel-enabled', this.currPage >= 0 && this.currPage < (this.getPages()-1));
	this.$divPopup.$pagesList.$ctrlNext().toggleClass('grisel-disabled', !(this.currPage >= 0 && this.currPage < (this.getPages()-1)));
	this.$divPopup.$pagesList.$dotsWrappers().filter('.grisel-page-dot-current').not("[page="+this.currPage+"]").removeClass('grisel-page-dot-current');
	this.$divPopup.$pagesList.$dotsWrappers().filter("[page="+this.currPage+"]").not('.grisel-page-dot-current').addClass('grisel-page-dot-current');
	
	//show/hide
	this.$divPopup.$pagesList.$ctrlFirst().toggle( this.getPages() > 2 );
	this.$divPopup.$pagesList.$ctrlLast().toggle( this.getPages() > 2 );
	
	//limit number of page dots
	var listW = this.$divPopup.$pagesList.width();
	var dotsFW = this.$divPopup.$pagesList.$dotsContainer().width();
	var dotsVW = this.$divPopup.$pagesList.$dotsViewContainer().width();
	var $dots = this.$divPopup.$pagesList.$dotsWrappers();
	var $currDot = this.$divPopup.$pagesList.$currDotWrapper();
	var currDotI = $dots.index($currDot);
	var dotW = $dots.length ? grisel.getFullWidth($dots.first(), true) : 0;
	var dotsCnt = $dots.length;
	var maxDotCnt = dotW ? Math.floor(1.0 * dotsVW / dotW) : 0;
	if(dotW && dotsCnt > maxDotCnt) {
		var rngLen = maxDotCnt;
		var rngStart = currDotI - Math.floor(1.0 * (rngLen - 1) / 2);
		if(rngStart + rngLen > dotsCnt)
			rngStart -= (rngStart + rngLen - dotsCnt);
		if(rngStart < 0)
			rngStart = 0;
		var $dotsToHide = jQuery();
		if(rngStart > 0)
			$dotsToHide = $dotsToHide.add( $dots.slice(0, rngStart) );
		if((rngStart + rngLen) < dotsCnt)
			$dotsToHide = $dotsToHide.add( $dots.slice(rngStart + rngLen, dotsCnt) );
		var $visDots = $dots.not($dotsToHide);
		var offs = 0;
		if($visDots.length)
			offs = $visDots.first().position().left;
		if((rngStart + rngLen) == dotsCnt)
			offs = dotsCnt * dotW - dotsVW;
		var doAnimate = this.options.animatePageDuration > 0 && (animate === undefined || animate == true);
		var aniTo = {
			'left': (-1 * offs)+'px'
		};
		if(!doAnimate) {
			this.$divPopup.$pagesList.$dotsContainer().css(aniTo);
		} else {
			var aniOpts = {
				duration: this.options.animatePageDuration, 
				easing: this.options.animatePageEasing,
			};
			this.$divPopup.$pagesList.$dotsContainer().animate(aniTo, aniOpts);
		}
		this.$divPopup.$pagesList.$gradLeft().toggle( rngStart > 0 );
		this.$divPopup.$pagesList.$gradRight().toggle( (rngStart + rngLen) < dotsCnt );
	} else {
		this.$divPopup.$pagesList.$gradLeft().hide();
		this.$divPopup.$pagesList.$gradRight().hide();
	}
};

//upd view after some actions
//

/**
 * If option 'tryToKeepConstPopupHeight' is set, keep body height const (only for full rows) (if labels on page are shorter, there will be more distance between elements).
 * If option 'reserveForPopupHeight' is set and on curr page there is "deficit" of rows, add % of reserve to these rows.
 * (This fixes will force body to keep 'width' css-style)
 */
grisel.prototype._vPreFixBodyHeight = function(applyToBodyGhost) {
	var $trgBody = (applyToBodyGhost ? this.$divPopup.$bodyGhost : this.$divPopup.$body);
	var isFullRows = this.getUsedGridRowsForPage(this.currPage) == this.getMaxUsedGridRows() && this.getMaxUsedGridRows() == this.options.gridRows;
	var bodyWrapperOldH = grisel.getFullHeight(this.$divPopup.$bodyWrapper, true);
	$trgBody.css('height', '');
	var gh1 = grisel.getFullHeight($trgBody, true);
	var gh = $trgBody.height();
	var gh1_ = 0, gh_ = 0; //forced height
	if(!isFullRows && this.options.reserveForPopupHeight < 0) {
		var dh = this.getUsedGridRowsForPage(this.currPage) / this.getMaxUsedGridRows() * -1 * this.options.reserveForPopupHeight;
		gh1_ = gh1 + dh;
	}
	if(this.options.tryToKeepConstPopupHeight && isFullRows && gh1 && gh1 < bodyWrapperOldH) {
		gh1_ = bodyWrapperOldH;
	}
	if(gh1_) {
		gh1 = gh1_;
		gh_ = gh1_ - grisel.getHeightOverhead($trgBody, true);
		gh = gh_;
	}
	if(gh)
		$trgBody.css('height', gh);
	var bh1 = grisel.getFullHeight(this.$divPopup.$body, true);
	var bodyWrapperNewH = Math.max(bh1, gh1);
	
	var r = {gh1: gh1, gh: gh, gh1_: gh1_, gh_: gh_, bodyWrapperOldH: bodyWrapperOldH, bodyWrapperNewH: bodyWrapperNewH};
	return r;
};

/**
 * If on new page there are less options than on old one, popup height will normally decrease - we don't want that, so fix!
 * This fix will force bodyWrapper to keep 'min-height' css-style.
 * Also if option 'tryToKeepConstPopupHeight' is set, body will keep const height (only for full rows) via 'width' css-style.
 */
grisel.prototype._vFixBodyHeight = function() {
	var self = this;
	var $divToRender = self.$divPopup.$bodyWrapper;
	if(this.$divPopup.hasClass('grisel-concrete-height')) {
	} else {
		var isFullRows = this.getUsedGridRowsForPage(this.currPage) == this.getMaxUsedGridRows() && this.getMaxUsedGridRows() == this.options.gridRows;
		
		var r = self._vPreFixBodyHeight(false);
		
		var h = parseFloat($divToRender.height());
		var w = parseFloat($divToRender.width());
		var minh = parseFloat($divToRender.css('min-height'));
		var _minh = parseFloat($divToRender.data('_min-height'));
		var minw = parseFloat($divToRender.css('min-width'));
		if(isNaN(_minh)) _minh = 0;
		if(isNaN(minh)) minh = 0;
		if(isNaN(minw)) minw = 0;
		if(self.$divPopup.$msg.hasClass('visible') && self.$divPopup.$body.is(':empty')) {
			//body is empty and msg is not
			var msgH = grisel.getFullHeight(self.$divPopup.$msg, true);
			if(!_minh) {
				$divToRender.css('min-height', (minh-msgH)+'px');
				$divToRender.data('_min-height', minh+'px');
			}
		} else {
			if(_minh) {
				$divToRender.data('_min-height', false);
				minh = _minh;
				$divToRender.css('min-height', minh+'px');
			}
			if(!minh || h > minh) {
				minh = h;
				$divToRender.css('min-height', minh+'px');
			}
			/** don't need (?), see _vPreFixBodyHeight() above **
			if(this.options.tryToKeepConstPopupHeight && minh && isFullRows) {
				self.$divPopup.$body.css('height', minh - grisel.getHeightOverhead(this.$divPopup.$body, true));
			}
			*/
		}
		if(!minw && w /* || w > minw*/ && this.options.divPopupWidth == 0) {
			$divToRender.css('min-width', w+'px');
			$divToRender.css('max-width', w+'px');
		}
	}
};

grisel.prototype.vAfterFilterChange = function() {
	var self = this;
	this.$divPopup.$ctrlShowSelection.toggleClass('selected', this.fitlerBySel);
	this.$divPopup.$indexChars().each(function(ind, el) {
		var ch = jQuery(el).attr('fChar');
		jQuery(el).toggleClass('selected', (ch == '' ? self.isNoFilter() : self.filterFChar == ch));
	});
	if(this.$divPopup.$search.val() != this.filterStr)
		this.$divPopup.$search.val(this.filterStr);
};

grisel.prototype.vAfterSingleChanged = function($chkbx) {
	var $inputToUncheck = this.$divPopup.$body.find("input"+(this.selectedItemsInds.length ? "[realind!="+this.selectedItemsInds[0]+"]" : "")+":checked").not($chkbx);
	$inputToUncheck.prop('checked', false).trigger('change');
};

grisel.prototype.vAfterAllSelectedChanged = function($chkbx) {
	var $inputAnyChecked = this.$divPopup.$body.find("input.grisel-checkbox-any:checked").not($chkbx);
	var $inputAnyUnhecked = this.$divPopup.$body.find("input.grisel-checkbox-any:not(:checked)").not($chkbx);
	var $inputsNotAnyChecked = this.$divPopup.$body.find("input:not(.grisel-checkbox-any):checked").not($chkbx);
	
	if(this.areAllSelected) {
		//if no options are selected, check only a-n-y option
		$inputsNotAnyChecked.prop('checked', false).trigger('change');
		$inputAnyUnhecked.prop('checked', true).trigger('change');
	} else {
		//if at least one option is selected, oncheck a-n-y option
		$inputAnyChecked.prop('checked', false).trigger('change');
	}
	
	//allow zero selection for single select
	this._allowZeroSelection();
};

grisel.prototype.vAfterUpdateItems = function() {
	var classAreaPopup = (this.isFullExtView() ? 'grisel-popup-ext' : (this.isCompactExtView() ? 'grisel-popup-comp' : 'grisel-popup-norm'));
	this.$divPopup.removeClass('grisel-popup-ext');
	this.$divPopup.removeClass('grisel-popup-comp');
	this.$divPopup.removeClass('grisel-popup-norm');
	this.$divPopup.addClass(classAreaPopup);
	
	this.$divPopup.$ctrlClearAll.toggle( this.getItemsCountWoAll() > 0 );
	this.$divPopup.$ctrlShowSelection.toggle( this.getItemsCountWoAll() > 0 );
	this.$divPopup.$ctrlSaveSelection.toggle( this.getItemsCountWoAll() > 0 );
	this.$divPopup.$bodyWrapper.toggle( this.items.length > 0 );
};

// ------------------------------------------------ View - generate html for rendering

grisel.prototype.htmlForSel = function() {
	var divSelHtml = "<div class='grisel-select" + (this.isMultiple ? "" : " grisel-select-single") + "'><div class='grisel-select-text'><span>" + this.valStr + "</span></div><div class='cuselFrameRight'></div></div>";
	return divSelHtml;
};

grisel.prototype.htmlForWrapper = function() {
	return "<div class='grisel-wrapper'></div>";
};

grisel.prototype.htmlForPopup = function() {
	var classAreaPopup = (this.isFullExtView() ? 'grisel-popup-ext' : (this.isCompactExtView() ? 'grisel-popup-comp' : 'grisel-popup-norm'));
	
	var textClearAll = 		this.strings.ctrlClearAll instanceof Array		? this.strings.ctrlClearAll[this.isMultiple ? 0 : 1]		: this.strings.ctrlClearAll;
	var textShowSelection =	this.strings.ctrlShowSelection instanceof Array	? this.strings.ctrlShowSelection[this.isMultiple ? 0 : 1]	: this.strings.ctrlShowSelection;
	var textGotoSelection =	this.strings.ctrlGotoSelection instanceof Array ? this.strings.ctrlGotoSelection[this.isMultiple ? 0 : 1]	: this.strings.ctrlGotoSelection;
	var textSaveSelection =	this.strings.ctrlSaveSelection instanceof Array ? this.strings.ctrlSaveSelection[this.isMultiple ? 0 : 1]	: this.strings.ctrlSaveSelection;
	
	var divPopupHtml = '';
	divPopupHtml += "<div class='hidden grisel-popup " + classAreaPopup + (this.isMultiple ? "" : " grisel-popup-single") + "'>";
		if(this.options.showCloseCross) {
			divPopupHtml += "<div class='grisel-close'></div>";
		}
		if(this.options.showSearch) {
			divPopupHtml += "<div class='grisel-head'>";
				divPopupHtml += "<input class='grisel-search' type='text' placeholder='" + this.strings.inputPlaceholder + "'/>";
				if(!(this.options.hidePageControlsWhenThereIsPageList && this.options.showPagesList)) {
					divPopupHtml += "<div class='grisel-btn grisel-btn-left'></div>";
					divPopupHtml += "<div class='grisel-btn grisel-btn-right'></div>";
				}
			divPopupHtml += "</div>";
		}
		divPopupHtml += "<div class='grisel-msg'><span></span></div>";
		divPopupHtml += "<div class='grisel-body-wrapper " + (this.options.gridDirectionHorizontal || this.options.useRowsStyleForVerticalDirection ? 'grisel-dir-horz' : 'grisel-dir-vert') + " grisel-cols-x grisel-cols-" + this.options.gridColumns + " grisel-rows-x grisel-rows-" + this.options.gridRows + "'>";
			divPopupHtml += "<div class='grisel-body'>";
				//... look at this.vRenderPage(page)
			divPopupHtml += "</div>";
			divPopupHtml += "<div class='grisel-body grisel-body-ghost grisel-hidden'>";
				//... look at this.vRenderPage(page)
			divPopupHtml += "</div>";
			divPopupHtml += "<div class='grisel-body-ani-helper'></div>";
		divPopupHtml += "</div>";
		if(this.options.showPagesList) {
			divPopupHtml += "<div class='grisel-pages-list'>";
				//... look at this.vRenderPagesList()
			divPopupHtml += "</div>";
		}
		if(this.options.showControls) {
			divPopupHtml += "<div class='grisel-ctrls'>";
				if(!(this.options.hidePageControlsWhenThereIsPageList && this.options.showPagesList)) {
					divPopupHtml += "<div class='grisel-ctrl grisel-ctrls-pag'>";
						divPopupHtml += "<div class='grisel-btn grisel-btn-left'></div>";
						divPopupHtml += "<div class='grisel-btn grisel-btn-right'></div>";
						divPopupHtml += "<div class='grisel-clr'></div>";
					divPopupHtml += "</div>";
				}
				if(this.options.showCtrlClearAll)
					divPopupHtml += "<div class='grisel-ctrl grisel-ctrl-link grisel-ctrl-clear-all'>" + textClearAll + "</div>";
				if(this.isMultiple && this.options.showCtrlShowSelection)
					divPopupHtml += "<div class='grisel-ctrl grisel-ctrl-link grisel-ctrl-show-selection'>" + textShowSelection + "</div>";
				if(!this.isMultiple && this.options.showCtrlGotoSelection)
					divPopupHtml += "<div class='grisel-ctrl grisel-ctrl-link grisel-ctrl-goto-selection'>" + textGotoSelection + "</div>";
				divPopupHtml += "<div class='grisel-ctrl-space'></div>";
				if(this.options.showCtrlSaveSelection)
					divPopupHtml += "<div class='grisel-ctrl grisel-ctrl-link grisel-ctrl-save-selection'>" + textSaveSelection + "<div class='cuselFrameRightUp'></div></div>";
			divPopupHtml += "</div>";
		}
		if(this.options.showIndex) {
			divPopupHtml += "<div class='grisel-index'" + ">";
				//... look at this.vRenderFirstChars()
			divPopupHtml += "</div>";
		}
	divPopupHtml += "</div>";
	return divPopupHtml;
}

grisel.prototype.htmlForPage = function(page) {
	var msg = '';
	var html = '';
	var rng = this.getItemsRangeForPage(page);
	
	if(this.options.maxSelectionLimit && this.selectedItems.length > this.options.maxSelectionLimit && this.options.showSelectedItemsFirst) {
		msg = this.strings.maxSelectionMsg;
	}
	
	var doRenderBody = true;
	if(this.getSearchedCnt() == 0) {
		msg = this.strings.noResultsMsg;
		doRenderBody = this.selectedItems.length && this.options.showSelectedItemsWhenNoFound;
	} else if(this.getPages() == 0) {
		if(this.getFilterMode() == 'sel')
			msg = this.strings.noSelectionMsg;
		else
			msg = "Empty!";
		doRenderBody = false;
	} else if(!this.canGoToPage(page)) {
		msg = "Error! Wrong page " + page;
		doRenderBody = false;
	} else if(rng === false) {
		doRenderBody = false;
	}
	if(doRenderBody) {
		var indStart = rng[0];
		var indEnd = rng[1];
		var cnt = indEnd - indStart + 1;
		
		var renderEl = function(self, html, ind) {
			var html = '';
			var opt = self.getVisibleOpt(ind);
			var realInd = self.getVisibleOptInd(ind);
			var id = self.selId + '_item_' + realInd;
			var name = self.selId + '_items';
			var text = opt[0];
			var checked = opt[2] ? self.areAllSelected : opt[1];
			html += "<div class='grisel-el'>";
				html += "<input type='"+(self.isMultiple ? 'checkbox' : 'radio')+"' class='" + (opt[2] ? "grisel-checkbox-any" : "") + "' realInd='" + realInd + "' name='" + name + "' id='" + id + "' " + (checked ? " checked" : "") + ">";
				html += "<label for='" + id + "' _class='" + (opt[2] ? "grisel-label-any" : "") + "'>" + text + "</label>";
			html += "</div>";
			return html;
		};
		
		var renderColStart = function(self, html, c) {
			var html = "<div class='grisel-col' id='grisel-col-" + c + "'>";
			return html;
		};
		var renderColEnd = function(self, html, c) {
			var html = "</div>";
			return html;
		};
		
		var renderRowStart = function(self, html, r) {
			var html = "<div class='grisel-row grisel-body-rows-x grisel-body-rows-" + self.getMaxUsedGridRows() + "' id='grisel-row-" + r + "'>";
			return html;
		};
		var renderRowEnd = function(self, html, r) {
			var html = "</div>";
			return html;
		};
		if(this.options.gridDirectionHorizontal || this.options.useRowsStyleForVerticalDirection) {
			for(var r = 0 ; r < this.options.gridRows ; r++) {
				for(var c = 0 ; c < this.options.gridColumns ; c++) {
					var i;
					if(this.options.gridDirectionHorizontal)
						i = r * this.options.gridColumns + c;
					else
						i = c * this.options.gridRows + r;
					var ind = indStart + i;
					if(ind > indEnd) {
						if(c > 0)
							html += renderRowEnd(this, html, r);
						break;
					}
					if(c == 0)
						html += renderRowStart(this, html, r);
					html += renderEl(this, html, ind);
					if(c == (this.options.gridColumns - 1) || ind == indEnd)
						html += renderRowEnd(this, html, r);
				}
			}
		} else {
			for(var c = 0 ; c < this.options.gridColumns ; c++) {
				for(var r = 0 ; r < this.options.gridRows ; r++) {
					var i = c * this.options.gridRows + r;
					var ind = indStart + i;
					if(ind > indEnd)
						break;
					if(r == 0)
						html += renderColStart(this, html, c);
					html += renderEl(this, html, ind);
					if(r == (this.options.gridRows - 1) || ind == indEnd)
						html += renderColEnd(this, html, c);
				}
			}
		}
		
		html += "<div style='clear:both'></div>";
	}
	return {html: html, msg: msg};
};

grisel.prototype.htmlForPagesList = function() {
	var html = '';
	
	if(this.getPages() > 0) {
		html += "<div class='grisel-pages-ctrl grisel-pages-first "+(this.currPage > 0 ? 'grisel-enabled' : 'grisel-disabled')+"'><span class='grisel-ui-icon grisel-ui-icon-seek-first'></span></div>";
		html += "<div class='grisel-pages-ctrl grisel-pages-prev "+(this.currPage > 0 ? 'grisel-enabled' : 'grisel-disabled')+"'><span class='grisel-ui-icon grisel-ui-icon-triangle-1-w'></span></div>";
		
		html += "<div class='grisel-pages-dots-wrapper'>";
			html += "<div class='grisel-pages-grad-left'></div>";
			html += "<div class='grisel-pages-dots'>";
				for(var p = 0 ; p < this.getPages() ; p++) {
					html += "<div class='grisel-page-dot-wrapper"+ (p == this.currPage ? " grisel-page-dot-current" : "") +"' id='grisel-page-dot-wrapper-"+p+"' page='"+p+"'>";
						html += "<div class='grisel-page-dot' page='"+p+"'>";
							html += "<div class='grisel-page-dot-inner'></div>";
						html += "</div>";
					html += "</div>";
				}
			html += "</div>";
			html += "<div class='grisel-pages-grad-right'></div>";
		html += "</div>";
		
		html += "<div class='grisel-pages-ctrl grisel-pages-next "+(this.currPage >= 0 && this.currPage < (this.getPages()-1) ? 'grisel-enabled' : 'grisel-disabled')+"'><span class='grisel-ui-icon grisel-ui-icon-triangle-1-e'></span></div>";
		html += "<div class='grisel-pages-ctrl grisel-pages-last "+(this.currPage >= 0 && this.currPage < (this.getPages()-1) ? 'grisel-enabled' : 'grisel-disabled')+"'><span class='grisel-ui-icon grisel-ui-icon-seek-end'></span></div>";
	}
	
	return html;
};

grisel.prototype.htmlForFirstChars = function() {
	var html = '';
	
	var cntAll = this.items.length;
	var fCharAll = '';
	html += "<div class='grisel-char' fChar='" + fCharAll + "' fCharCnt='" + cntAll + "'>" + this.strings.indexAll + "</div>";
	
	for(var fChar in this.firstChars) if (this.firstChars.hasOwnProperty(fChar)) {
		var cnt = this.firstChars[fChar];
		html += "<div class='grisel-char' fChar='" + fChar + "' fCharCnt='" + cnt + "'>" + fChar + "</div>";
	}
	return html;
};

// ------------------------------------------------ Controller

//init
//
grisel.prototype.doInitOnce = function() {
	if(grisel.isInited(this.$sel))
		return false;
	var self = this;
	
	this.mSyncFromSelect(true);
	
	this.doPrepareHtmlOnce();
	this.vAfterUpdateItems();
	
	this.doSetNoFilter();
	this.doApplyFilterAndGotoFirstPage();
	this.doRenderFirstChars();
	this.doRenderValStr();
	
	//sync back on original <select> change
	this.$sel.change(function() {
		if(!self.$sel.data('syncing_to')) {
			setTimeout(function() {
				self.doUpdateItems();
			}, 1);
		}
	});
};

grisel.prototype.doPrepareHtmlOnce = function() {
	if(grisel.isInited(this.$sel))
		return false;
	
	//render - replace original <select> with new sel & popup divs
	//and create references to html elements we need
	this.vConvertSelectOnce();
	
	//press enter == click
	var $list = $();
	$.each([
		this.$divPopup.$close, 
		this.$divPopup.$btnLeft, 
		this.$divPopup.$btnRight, 
		this.$divPopup.$ctrlClearAll,
		this.$divPopup.$ctrlShowSelection,
		this.$divPopup.$ctrlGotoSelection,
		this.$divPopup.$ctrlSaveSelection
	], function(i, $o) {
		$list = $list.add($o);
	});
	this.$divSel.keypress(function(e) {
		if(e.which == 13 || e.keyCode == 13) {
			$(this).click();
		}
	});
	if(this.options.areInnerCtrlsFocuable)
		$list.keypress(function(e) {
			if(e.which == 13 || e.keyCode == 13) {
				$(this).click();
			}
		});
	//press esc == close
	this.$divPopup.keyup(function(e) {
		if(e.which == 27 || e.keyCode == 27) {
			self.doClosePopup();
		}
	});
	
	//attach events
	var self = this;
	if(this.options.openOnHover) {
		this.$divSel.mouseenter(function(){
			self.doOpenPopup();
		});
		this.$divPopup.mouseleave(function(){
			self.doClosePopup();
		});
	} else {
		this.$divSel.click(function(){
			self.doTogglePopup();
		});
	}
	this.$divSel.focusin(function() { });
	this.$divSel.focusout(function() { });
	var popupFocusTimer = null;
	this.$divPopup.focusin(function() {
		if(popupFocusTimer !== null)
			clearTimeout(popupFocusTimer);
	});
	this.$divPopup.focusout(function() {
		popupFocusTimer = setTimeout(function() {
			if(!self.$divPopup.is(':focus')) {
				self.doClosePopup();
			}
		}, 1);
	});
	this.$divPopup.$close.click(function() {
		self.doClosePopup();
	});
	this.$divPopup.$search.bind('input', function(e) {
		var text = e.target.value;
		self.doSetFilterBySearchString(text);
		self.doApplyFilterAndGotoFirstPage();
	});
	this.$divPopup.$ctrlClearAll.click(function() {
		self.doClearAll();
	});
	this.$divPopup.$ctrlShowSelection.click(function() {
		self.doSetFilterBySelected(! self.fitlerBySel);
		self.doApplyFilterAndGotoFirstPage();
	});
	this.$divPopup.$ctrlGotoSelection.click(function() {
		self.doGotoSelection(true);
	});
	this.$divPopup.$ctrlSaveSelection.click(function() {
		self.doClosePopup();
	});
	this.$divPopup.$btnLeft.click(function() {
		if(self.canGoToPage(self.currPage - 1))
			self.doGotoPage(self.currPage - 1, true);
	});
	this.$divPopup.$btnRight.click(function() {
		if(self.canGoToPage(self.currPage + 1))
			self.doGotoPage(self.currPage + 1, true);
	});
	
	return true;	
};

//sync from original <select> if has been updated
//
grisel.prototype.doUpdateItems = function() {
	this.mSyncFromSelect(false);
	
	this.vAfterUpdateItems();
	
	this.doSetNoFilter();
	this.doApplyFilter();
	var pageForSel = this.getPageForCurrSel();
	this.doGotoPage(pageForSel != -1 ? pageForSel : this.getFirstPage(), false);
	this.doRenderFirstChars();
	this.doRenderValStr();
};

//open, close
//
grisel.prototype.doOpenPopup = function() {
	grisel.doCloseAppPopups();
	if(!this.isMultiple && this.selectedItemsInds.length)
		this.doGotoSelection(false);
	this.vOpenPopup();
};
grisel.prototype.doClosePopup = function() {
	this.vClosePopup();
};
grisel.prototype.doTogglePopup = function() {
	if(!this.isPopupOpened())
		this.doOpenPopup();
	else
		this.doClosePopup();
};
grisel.doCloseAppPopups = function() {
	for(var selId in grisel._instances) if (grisel._instances.hasOwnProperty(selId)) {
		var inst = grisel._instances[selId];
		inst.doClosePopup();
	}
};

//render
//
grisel.prototype.doGotoPage = function(page, animate) {
	var self = this;
	
	var oldPage = this.currPage;
	this.currPage = parseInt(page);
	
	this.vRenderPage(page, oldPage, animate, function() {
		//press enter == click
		if(self.options.areInnerCtrlsFocuable)
			self.$divPopup.$body.$checkboxes().filter('.prch2-hidden').next('label').next('.prch2-label').keypress(function(e) {
				if(e.which == 13 || e.keyCode == 13) {
					$(this).click();
				}
			});
		
		//attach events
		self.$divPopup.$body.$checkboxes().each(function(ind, el) {
			jQuery(el).change(function() {
				var info = self.$divPopup.getCheckboxInfo(jQuery(this));
				self.onSelectItem(info, jQuery(this));			
			});
		});
	});
	
};

grisel.prototype.doRenderCurrPage = function() {
	this.doGotoPage(this.currPage);
};

grisel.prototype.doRenderValStr = function() {
	this.vRenderValStr(this.valStr);
};

grisel.prototype.doRenderPagesList = function() {
	if(this.options.showPagesList) {
		var self = this;
		
		this.vRenderPagesList();
		
		//attach events
		this.$divPopup.$pagesList.$ctrlPrev().click(function() {
			if(self.canGoToPage(self.currPage - 1))
				self.doGotoPage(self.currPage - 1, true);
		});
		this.$divPopup.$pagesList.$ctrlNext().click(function() {
			if(self.canGoToPage(self.currPage + 1))
				self.doGotoPage(self.currPage + 1, true);
		});
		this.$divPopup.$pagesList.$ctrlFirst().click(function() {
			if(self.canGoToPage(0))
				self.doGotoPage(0, true);
		});
		this.$divPopup.$pagesList.$ctrlLast().click(function() {
			if(self.canGoToPage(self.getPages() - 1))
				self.doGotoPage(self.getPages() - 1, true);
		});
		this.$divPopup.$pagesList.$dots().click(function() {
			var p = parseInt(jQuery(this).attr('page'));
			if(self.canGoToPage(p) && p != self.currPage)
				self.doGotoPage(p, true);
		});
	}
};

grisel.prototype.doRenderFirstChars = function() {
	if(this.isFullExtView()) {
		var self = this;
		//render
		this.vRenderFirstChars();
		this.vAfterFilterChange();
		var $indexChars = this.$divPopup.$indexChars();
		
		//press enter == click
		if(this.options.areInnerCtrlsFocuable)
			$indexChars.keypress(function(e) {
				if(e.which == 13 || e.keyCode == 13) {
					$(this).click();
				}
			});
		
		//attach events
		$indexChars.each(function(ind, el) {
			jQuery(el).click(function() {
				var info = self.$divPopup.getCharInfo(jQuery(this));
				self.doSetFilterByFirstChar(info.gr);
				self.doApplyFilterAndGotoFirstPage();
			});
		});
	}
};

//filters
//
grisel.prototype.doSetFilterByFirstChar = function(gr) {
	this.mSetFilterByFirstChar(gr);
	this.vAfterFilterChange();
};
grisel.prototype.doSetFilterBySelected = function(sel) {
	this.mSetFilterBySelected(sel);
	this.vAfterFilterChange();
};
grisel.prototype.doSetFilterBySearchString = function(str) {
	this.mSetFilterBySearchString(str);
	this.vAfterFilterChange();
};
grisel.prototype.doSetNoFilter = function() {
	this.mSetNoFilter();
	this.vAfterFilterChange();
};

grisel.prototype.doApplyFilter = function() {
	var mode = this.getFilterMode();
	if(mode == 'sel') {
		this.mFilterItemsBySelected();
	} else if(mode == 'fchar') {
		this.mFilterItemsByFirstChar(this.filterFChar);
	} else if(mode == 'search') {
		this.mFilterItemsBySearchString(this.filterStr);
	} else if(mode == '') {
		this.mFilterItemsByNone();
	}
	
	this.doRenderPagesList();
};

grisel.prototype.doApplyFilterAndGotoFirstPage = function() {
	this.doApplyFilter();
	this.doGotoPage(this.getFirstPage());
};

grisel.prototype.doGotoSelection = function(animate) {
	var pageForSel = this.getPageForCurrSel();
	var resetFilter = (pageForSel == -1 || this.getSearchedCnt() == 0);
	if(resetFilter) {
		this.doSetNoFilter();
		this.doApplyFilter();
		pageForSel = this.getPageForCurrSel();
	}
	this.doGotoPage(pageForSel != -1 ? pageForSel : this.getFirstPage(), animate && !resetFilter);
};

grisel.prototype.doClearAll = function() {
	this.doUnselectAllItems();
	this.doSetNoFilter();
	this.doApplyFilterAndGotoFirstPage();
	if(!this.isMultiple)
		this.doClosePopup();
};

//selection events
//
grisel.prototype.onSelectItem = function(info, $chkbx) {
	var ch_stat = this.mSelectItem(info);
	if(ch_stat > 0 && !this.isMultiple) {
		this.vAfterSingleChanged($chkbx);
	}
	if(ch_stat == 2) {
		this.vAfterAllSelectedChanged($chkbx);
	}
	if(ch_stat > 0) {
		this.onSelectionChanged();
	}
	if(!this.isMultiple)
		this.doClosePopup();
};

grisel.prototype.onSelectionChanged = function() {
	if(this.getFilterMode() == 'sel') {
		this.mFilterItemsBySelected();
		this.doRenderPagesList();
		var page = this.currPage;
		//fix page
		if(!this.canGoToPage(page)) {
			if(this.getPages() == 0)
				page = -1;
			else if(this.getPages() > 0 && page > (this.getPages() - 1))
				page = this.getPages() - 1;
			else if(this.getPages() > 0 && page < 0)
				page = 0;
		}
		this.doGotoPage(page);
	} else if(this.options.showSelectedItemsFirst) {
		//re-render page
		this.doRenderCurrPage();
	}
	
	this.valStr = this.selectedItemsToStr(this.selectedItems, this.areAllSelected);
	this.doRenderValStr();
	this.mSyncToSelect(true);
	
	if(this.getFilterMode() == 'search' && this.options.flushSearchStringAfterSelection) {
		this.doSetFilterBySearchString('');
		this.doApplyFilterAndGotoFirstPage();
		this.$divPopup.$search.focus();
	}
};

grisel.prototype.doUnselectAllItems = function() {
	var oldAreAllSelected = this.areAllSelected;
	this.areAllSelected = true;
	if(oldAreAllSelected != this.areAllSelected) {
		this.mUpdSelection();
		this.vAfterAllSelectedChanged();
		this.onSelectionChanged();
	}
};

//other events
//
//things that can be done only when popup is visible
grisel.prototype.onShowPopup = function() {
	this.vPostRenderPagesList(false);
};

grisel.prototype.onHidePopup = function() {
};

// ------------------------------------------------

//
// jQuery extensions for class grisel
//

jQuery.fn.griselInit = function() {
	for(var i = 0 ; i < this.length ; i++) {
		var $sel = jQuery(this[i]);
		var grs = new grisel($sel);
	}
	return this;
};

jQuery.fn.griselUpdate = function() {
	for(var i = 0 ; i < this.length ; i++) {
		var $sel = jQuery(this[i]);
		var selId = $sel.attr('id');
		if(0 && !grisel.isInited($sel)) {
			$sel.griselInit();
		}
		if(grisel.isInited($sel)) {
			var grs = grisel.getInstance(selId);
			if(grs)
				grs.doUpdateItems();
		}
	}
	return this;
};

jQuery( document ).ready(function() {
	if (jQuery(".grisel").size() > 0) {
		jQuery(".grisel").griselInit();
	}
});



/* ------------------------------------------------------------------------
	prettyCheckboxes
	
	Developped By: Stephane Caron (http://www.no-margin-for-errors.com)
	Inspired By: All the non user friendly custom checkboxes solutions ;)
	Version: 1.1
	
	Copyright: Feel free to redistribute the script/modify it, as
			   long as you leave my infos at the top.
------------------------------------------------------------------------- */

/**
* Version 1.2 mod by ukrbublik
* - Don't use original <label>, create new <div> instead (to use focus on it)
* - Using namespace prefix 'prch2-' for css
*/

jQuery.fn.prettyCheckboxes2 = function(settings) {
	settings = jQuery.extend({
				checkboxWidth: 30,
				checkboxHeight: 30,
				className : 'prch2',
				display: 'inline', //'inline', 'list'
			}, settings);

	$(this).each(function() {
		var $input = $(this);
		var _id = $input.attr('id');
		var _name = $input.attr('name');
		var _type = $input.attr('type');
		
		$realLabel = $('label[for="'+_id+'"]:eq(0)');
		
		// Create custom labal
		$label = $("<div class='prch2-label'><span class='prch2-holderWrap'><span class='prch2-holder'></span></span><span class='prch2-text-wrapper'><span class='prch2-text'></span></span></div>").insertAfter($realLabel);
		$label.find('.prch2-text').text( $realLabel.text() );
		if($realLabel.attr('_class'))
			$label.addClass($realLabel.attr('_class'));
		
		// If the checkbox is checked, display it as checked
		if($input.is(':checked'))
			$label.addClass('prch2-checked');
		// Assign the classes on the label
		$label.addClass(settings.className).addClass('prch2-type-'+_type).addClass('prch2-'+settings.display);
		
		// Assign the dimensions to the checkbox display
		$label.find('span.prch2-holderWrap').width(settings.checkboxWidth).height(settings.checkboxHeight).css({
			'min-height': settings.checkboxHeight,
			'max-height': settings.checkboxHeight,
			'min-width': settings.checkboxWidth,
			'max-width': settings.checkboxWidth,
		});
		$label.find('span.prch2-holder').width(settings.checkboxWidth);
		
		// Hide the checkbox & real label
		$input.addClass('prch2-hidden');
		$realLabel.addClass('prch2-hidden');
		$input.attr('tabindex', -1);
		
		//Sync: label -> input
		$label.bind('click', function() {
			var $label = $(this);
			var $realLabel = $label.prev('label');
			var _for = $realLabel.attr('for');
			var $input = $('input#' + _for);
			var _name = $input.attr('name');
			var _id = $input.attr('id');
			
			//trigger click for input
			$input.trigger('click');
			
			//change .prch2-checked for custom label
			if($input.is(':checkbox')) {
				$label.toggleClass('prch2-checked', $input.is(':checked'));
			} else {
				var $inputs = $('input[name="'+_name+'"]');
				$inputs.each(function() {
					var $input = $(this);
					var _id = $input.attr('id');
					var $realLabel = $('label[for="' +_id+'"]');
					var $label = $realLabel.next('.prch2-label');
					$label.removeClass('prch2-checked');	
				});
				$label.addClass('prch2-checked');
			};
		});
		
		//Sync: input -> label
		var $inputs = $('input[name="'+_name+'"]');
		$input.change(function() {
			var $input = $(this);
			var _id = $input.attr('id');
			var $realLabel = $('label[for="' +_id+'"]');
			var $label = $realLabel.next('.prch2-label');
			var _name = $input.attr('name');
			
			//change .prch2-checked for custom label
			if($input.is(':checkbox')) {
				$label.toggleClass('prch2-checked', $input.is(':checked'));
			} else {
				var $inputs = $('input[name="'+_name+'"]');
				$inputs.each(function() {
					var $input = $(this);
					var _id = $input.attr('id');
					var $realLabel = $('label[for="' +_id+'"]');
					var $label = $realLabel.next('.prch2-label');
					$label.removeClass('prch2-checked');	
				});
				$label.addClass('prch2-checked');
			};
		});
		
	});
};

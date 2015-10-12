/**
 * dp2ems
 * 
 * Pretty looking and highly customizable multi-select (or single-select) control (over standard <select>). 
 * Features search and filter by first letter.
 * Useful for big list of options.
 *
 * Requires: browser with CSS3 support, jQuery, jQuery UI (effects, icons)
 *
 * @version 2.2
 * @homepage https://github.com/ukrbublik/dp2ems
 * @author ukrbublik
 * @license MIT
 *
 * Copyright (c) 2015 Oblogin Denis <ukrbublik>
 */

/**
 * TODO:
 * [+] choose optional position of popup according to potiotion of select on window
 *
 * Maybe later:
 * [b] sometimes at first run (clear cache, try different broser etc.) - bad width (equals to width of window) - why???
 * [+] skins with different colors?
 * [+] groups of options?
 * [?] for smooth animation without workarounds use html2canvas (http://html2canvas.hertzen.com/)
 */

//
// Class dp2ems
//
function dp2ems(s, options, strings, lang) {
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
	this.selectedAndFilteredItems = false; //array of string or false
	this.selectedAndFilteredItemsInds = false; //array of indexes or false
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
		
		if(!dp2ems.canInit(this.$sel)) {
			this.isBadInst = true;
			return null;
		}
		if(dp2ems.isInited(this.$sel))
			return dp2ems.getInstance(this.selId);
		
		//Build options
		this.options = jQuery.extend({}, dp2ems.defaultOptions);
		for(var i = 0 ; i < selClasses.length ; i++) {
			if(typeof dp2ems.optionsBySelClass[selClasses[i]] != 'undefined')
				this.options = jQuery.extend(this.options, dp2ems.optionsBySelClass[selClasses[i]]);
		}
		if(typeof dp2ems.optionsBySelId[this.selId] != 'undefined')
			this.options = jQuery.extend(this.options, dp2ems.optionsBySelId[this.selId]);
		var optionsKeys = Object.keys(dp2ems.defaultOptions);
		for(var i = 0 ; i < optionsKeys.length ; i++) {
			var k = optionsKeys[i], v = this.$sel.data(k);
			if(v !== undefined)
				this.options[k] = v;
		}
		if(_options)
			this.options = jQuery.extend(this.options, _options);
		
		//Lang
		this.lang = _lang ? _lang : dp2ems.defaultLang;
		
		//Build strings
		this.strings = jQuery.extend({}, dp2ems.defaultStrings[this.lang]);
		for(var i = 0 ; i < selClasses.length ; i++) {
			if(typeof dp2ems.stringsBySelClass[selClasses[i]] != 'undefined' && typeof dp2ems.stringsBySelClass[selClasses[i]][this.lang] != 'undefined')
				this.strings = jQuery.extend(this.strings, dp2ems.stringsBySelClass[selClasses[i]][this.lang]);
		}
		if(typeof dp2ems.stringsBySelId[this.selId] != 'undefined' && typeof dp2ems.stringsBySelId[this.selId][this.lang] != 'undefined')
			this.strings = jQuery.extend(this.strings, dp2ems.stringsBySelId[this.selId][this.lang]);
		if(_strings)
			this.strings = jQuery.extend(this.strings, _strings);
		
		//Init
		this.doInitOnce();
		
		dp2ems._instances[this.selId] = this;
		
		return this;
	};
	
	return this.ctor(s, options, strings, lang);
}

// ------------------------------------------------ Strings

dp2ems.defaultLang = 'ru';

dp2ems.defaultStrings = {
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
	},
	'en': {
		'indexAll': 'All',
		'ctrlSaveSelection': 'Save',
		'ctrlGotoSelection': 'Go to selected',
		'ctrlShowSelection': 'Show selected',
		'ctrlClearAll': ['Ckear all', 'Clear selection'],
		'allStr': '',
		'allStrDefault': ['All', 'Any'],
		//only for hideAny == 1
		'noSelectionMsg': 'No selected',
		'noResultsMsg': 'Nothing found',
		'inputPlaceholder': 'Enter a name',
		'cntFmt': '{cnt} {cnt_name}',
		'cntNames': ['value', 'values', 'values'],
		//only for showSelectedItemsBeforeSearched==1 ("legacy")
		'maxSelectionMsg': 'You reached max number of selected elements.<br>Please save your selection',
	}
};
dp2ems.stringsBySelClass = {
};
dp2ems.stringsBySelId = {
};

// ------------------------------------------------ Options

dp2ems.defaultOptions = {
	'gridRows': 5,
	'gridColumns': 3,
	'minPagesForExt': 3,
	'isExt': -1, //-1 for auto (see minPagesForExt), 0/1 to force
	'anyVal': 'a-n-y',
	'hideAny': false,
	//1 - fill items in left-to-right direction (horizontal) (in html group by rows), 0 - up-to-down direction (vertical) (in html group by cols)
	'gridDirectionHorizontal': false,
	//1 - force group by rows (not cols) in html for vertical direction (to make all elements in one row having equal height),
	// highly recommended (also because of animation problems with cols)
	'useRowsStyleForVerticalDirection': true,
	'openOnHover': false,
	'areInnerCtrlsFocuable': false,
	//when set to 2: for 3+ selected values text will be "X values", for 1-2 - "valA, valB", for 0 - one of allStr/anyStr/allStrDefault;
	//when set to -1: always "X values"
	'maxCntToShowListAsValStr': 3,
	
	//show/hide:
	//
	'showPagesList': true,
	'showSearch': true,
	'showIndex': true,
	'showControls': true,
	'hidePageControlsWhenThereIsPegeList': true,
	'showCtrlSaveSelection': false,
	'showCtrlShowSelection': true,
	'showCtrlGotoSelection': true,
	'showCtrlClearAll': true,
	'showCloseCross': true,
	
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
	'divPopupWidth': 0,
	//0 - use css, > 0 - concrete height
	'divPopupHeight': 0,
	//for auto popup width - set min checkbox/radio's labels width
	'divPopupLabelsMinWidth': 0,
	'divPopupClasses': '',
	'divWrapperClasses': '',
	//when page with long labels appeared, keep new bigger popup height for all other pages
	'tryToKeepConstPopupHeight': true,
	//reserve (once) more height for popup (for case of appearing long labels at next pages), in px
	'reserveForPopupHeight': 0,
	
	//animation:
	//
	'animatePopupDuration': [600, 400],
	'isElasticPopupAnimation': [1, 0],
	'animatePopupEasing': ['easeOutElastic', 'easeInOutBack'],
	'animatePageDuration': 150,
	'animatePageEasing': 'swing',
	
	//"legacy" options (made for domplus.com.ua)
	//
	'flushSearchStringAfterSelection': false,
	'showSelectedItemsBeforeSearched': false,
	'showSelectedItemsWhenNoFound': false,
	//only for showSelectedItemsBeforeSearched==1
	'maxSelectionLimit': 3*5,
};
dp2ems.optionsBySelClass = {
};
dp2ems.optionsBySelId = {
};

// ------------------------------------------------ Static stuff

dp2ems._instances = {};

dp2ems.getInstance = function(selId) {
	var inst = dp2ems._instances[selId];
	if(inst === undefined)
		inst = null;
	return inst;
};

dp2ems.fCharToGroup = function(fChar) {
	var gr = fChar;
	var chLC = fChar.toLowerCase();
	if(fChar >= '0' && fChar <= '9')
		gr = '0-9';
	else if(!(chLC >= "а" && chLC <= "я" || chLC >= "a" && chLC <= "z"))
		gr = '*';
	return gr;
};

dp2ems.isFCharInGroup = function(fChar, gr) {
	var chLC = fChar.toLowerCase();
	if(gr == '0-9')
		return (fChar >= '0' && fChar <= '9');
	else if(gr == '*')
		return (!(chLC >= "а" && chLC <= "я" || chLC >= "a" && chLC <= "z"));
	else
		return fChar == gr;
};

//helpers
dp2ems.getFullWidth = function($el, width_margin) {
	return parseFloat($el.width()) + dp2ems.getWidthOverhead($el, width_margin);
};
dp2ems.getFullHeight = function($el, width_margin) {
	return parseFloat($el.height()) + dp2ems.getHeightOverhead($el, width_margin);
};
dp2ems.getWidthOverhead = function($el, width_margin) {
	if(width_margin === undefined)
		width_margin = false;
	return parseFloat($el.css('padding-left')) + parseFloat($el.css('padding-right')) + parseFloat($el.css('border-left-width')) + parseFloat($el.css('border-right-width')) + (width_margin ? parseFloat($el.css('margin-left')) + parseFloat($el.css('margin-right')) : 0);
};
dp2ems.getHeightOverhead = function($el, width_margin) {
	if(width_margin === undefined)
		width_margin = false;
	return parseFloat($el.css('padding-top')) + parseFloat($el.css('padding-bottom')) + parseFloat($el.css('border-top-width')) + parseFloat($el.css('border-bottom-width')) + (width_margin ? parseFloat($el.css('margin-top')) + parseFloat($el.css('margin-bottom')) : 0);
};
dp2ems.getFloatWidth = function($el) {
	var rect = $el[0].getBoundingClientRect();
	var width;
	if (rect.width) { //IE9+
		width = rect.width;
	} else {
		width = rect.right - rect.left;
	}
	return width;
};
dp2ems.getFloatHeight = function($el) {
	var rect = $el[0].getBoundingClientRect();
	var height;
	if (rect.height) { //IE9+
		height = rect.height;
	} else {
		height = rect.bottom - rect.top;
	}
	return height;
};

dp2ems.localizeCntName = function(cnt, cnt_names) {
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
dp2ems.prototype.selectedItemsToStr = function(arr, areAll) {
	var val = '';
	if(this.isMultiple && arr.length == 0 || areAll)
		val = (this.strings.allStr != '' ? this.strings.allStr : (this.anyStr != '' ? this.anyStr : this.strings.allStrDefault[this.isMultiple ? 0 : 1]));
	else if(this.isMultiple && this.options.maxCntToShowListAsValStr >= 0 && arr.length > this.options.maxCntToShowListAsValStr)
		val = this.strings.cntFmt.replace('{cnt}', arr.length).replace('{cnt_name}', dp2ems.localizeCntName(arr.length, this.strings.cntNames));
	else if(arr.length)
		val = arr.join(', ');
	else if(!this.isMultiple && arr.length == 0)
		val = '';
	return val;
};

/**
 * Load model from original <select>
 */
dp2ems.prototype.getOptsFromSelect = function(initial /* = false*/) {
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
dp2ems.prototype.mSyncFromSelect = function(initial /* = false*/) {
	this.$sel.data('syncing_from', 1);
	
	//sync items
	var tmp = this.getOptsFromSelect(initial);
	this.opts = tmp.opts;
	this.areAllSelected = tmp.areAll;
	this.isMultiple = tmp.isMultiple;
	this.items = [];
	this.selectedItems = [];
	this.selectedItemsInds = [];
	//this.visibleItems = false; //TIP: will be done later in mSetNoFilter()
	//this.visibleItemsInds = false;
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
			var gr = dp2ems.fCharToGroup(fChar);
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

dp2ems.prototype._allowZeroSelection = function() {
	if(!this.isMultiple && this.anyOpt === false && this.areAllSelected) {
		this.$sel.val('');
	}
};

/**
 * Sync model to original <select>
 *
 * lite == 1 - only check "selected" flags, lite == 0 - check all options and its order
 */
dp2ems.prototype.mSyncToSelect = function(lite) {
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

dp2ems.prototype.mFilterItemsBySearchString = function(str) {
	if(str == '') {
		this.visibleItemsInds = false;
		this.visibleItems = false;
		this.selectedAndFilteredItems = false;
		this.selectedAndFilteredItemsInds = false;
	} else {
		this.visibleItemsInds = [];
		this.visibleItems = [];
		this.selectedAndFilteredItems = [];
		this.selectedAndFilteredItemsInds = [];
		if(this.options.showSelectedItemsBeforeSearched) {
			this.mSortSelectedItems();
			for(var i = 0 ; i < this.selectedItemsInds.length ; i++) {
				var ind = this.selectedItemsInds[i];
				var it = this.selectedItems[i];
				this.visibleItemsInds.push(ind);
				this.visibleItems.push(it);
			}
		}
		for(var i = 0 ; i < this.items.length ; i++) {
			var it = this.items[i];
			if(i != this.anyItemInd && it.match(new RegExp('(^| )'+str, 'i'))) {
				if(this.options.showSelectedItemsBeforeSearched) {
					if(this.selectedItemsInds.indexOf(i) == -1) {
						this.visibleItemsInds.push(i);
						this.visibleItems.push(it);
					} else {
						this.selectedAndFilteredItemsInds.push(i);
						this.selectedAndFilteredItems.push(it);
					}
				} else {
					this.visibleItemsInds.push(i);
					this.visibleItems.push(it);
				}
			}
		}
	}
};

dp2ems.prototype.mFilterItemsByFirstChar = function(gr) {
	if(gr == '') {
		this.visibleItemsInds = false;
		this.visibleItems = false;
		this.selectedAndFilteredItems = false;
		this.selectedAndFilteredItemsInds = false;
	} else {
		this.visibleItemsInds = [];
		this.visibleItems = [];
		this.selectedAndFilteredItems = false;
		this.selectedAndFilteredItemsInds = false;
		for(var i = 0 ; i < this.items.length ; i++) {
			var it = this.items[i];
			if(it.length > 0) {
				var fChar = it[0];
				if(dp2ems.isFCharInGroup(fChar, gr) && this.anyItemInd != i) {
					this.visibleItemsInds.push(i);
					this.visibleItems.push(it);
				}
			}
		}
	}
};

dp2ems.prototype.mFilterItemsBySelected = function() {
	//copy selectedItems to visibleItems
	this.visibleItemsInds = [];
	this.visibleItems = [];
	if(this.areAllSelected && !this.options.hideAny && this.anyItemInd != -1) {
		this.visibleItemsInds.push(this.anyItemInd);
		this.visibleItems.push(this.items[this.anyItemInd]);
	}
	for(var i = 0 ; i < this.selectedItemsInds.length ; i++) {
		var ind = this.selectedItemsInds[i];
		var it = this.selectedItems[i];
		this.visibleItemsInds.push(ind);
		this.visibleItems.push(it);
	}
	this.selectedAndFilteredItems = false;
	this.selectedAndFilteredItemsInds = false;
};

dp2ems.prototype.mFilterItemsByNone = function() {
	this.visibleItemsInds = false;
	this.visibleItems = false;
	this.selectedAndFilteredItems = false;
	this.selectedAndFilteredItemsInds = false;
};
dp2ems.prototype.mSetFilterByFirstChar = function(gr) {
	this.filterFChar = gr;
	this.filterStr = '';
	this.fitlerBySel = false;
};
dp2ems.prototype.mSetFilterBySelected = function(sel) {
	this.filterFChar = '';
	this.filterStr = '';
	this.fitlerBySel = sel;
};
dp2ems.prototype.mSetFilterBySearchString = function(str) {
	this.filterFChar = '';
	this.filterStr = str;
	this.fitlerBySel = false;
};
dp2ems.prototype.mSetNoFilter = function() {
	this.filterFChar = '';
	this.filterStr = '';
	this.fitlerBySel = false;
};
dp2ems.prototype.getFilterMode = function() {
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
dp2ems.prototype.isNoFilter = function() {
	return this.getFilterMode() == '';
};

dp2ems.prototype.mSortSelectedItems = function() {
	this.selectedItems.sort();
	var self = this;
	this.selectedItemsInds.sort(function(ind1, ind2) {
		var it1 = self.items[ind1];
		var it2 = self.items[ind2];
		return (it1 < it2 ? -1 : (it1 > it2 ? 1 : 0));
	});
};

// ------------------------------------------------ Model - changings

dp2ems.prototype.mSelectItem = function(info) {
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

dp2ems.prototype.mUpdSelection = function() {
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
};

// ------------------------------------------------ Model - getting slices of items list

dp2ems.prototype.getVisibleItems = function() {
	return this.visibleItems !== false ?  this.visibleItems : this.items;
};
dp2ems.prototype.getVisibleOpt = function(i) {
	return this.visibleItemsInds !== false ?  this.opts[ this.visibleItemsInds[i] ] : this.opts[i];
};
dp2ems.prototype.getVisibleOptInd = function(i) {
	return this.visibleItemsInds !== false ?  this.visibleItemsInds[i] : i;
};

dp2ems.prototype.getPages = function() {
	return Math.ceil( 1.0 * this.getVisibleItems().length / (this.options.gridRows * this.options.gridColumns) );
};

dp2ems.prototype.getTotalPages = function() {
	return Math.ceil( 1.0 * this.items.length / (this.options.gridRows * this.options.gridColumns) );
};

dp2ems.prototype.getItemsCountWoAll = function() {
	return this.items.length - (this.anyItemInd != -1 ? 1 : 0);
};

dp2ems.prototype.canGoToPage = function(page) {
	return (page == -1 && this.getPages() == 0 || page >= 0 && page < this.getPages()) && !(this.$divPopup.data('changing-page') && this.$divPopup.data('changing-page-from') == page);
};

dp2ems.prototype.getMaxUsedGridRows = function() {
	return Math.min( this.options.gridRows, !this.options.gridDirectionHorizontal ? this.items.length : Math.ceil(1.0 * this.items.length / this.options.gridColumns) );
};
dp2ems.prototype.getMaxUsedGridColumns = function() {
	return Math.min( this.options.gridColumns, this.options.gridDirectionHorizontal ? this.items.length : Math.ceil(1.0 * this.items.length / this.options.gridRows) );
};
dp2ems.prototype.getUsedGridRowsForPage = function(page) {
	return Math.min( this.options.gridRows, !this.options.gridDirectionHorizontal ? this.getVisibleItemsCntForPage(page) : Math.ceil(1.0 * this.getVisibleItemsCntForPage(page) / this.options.gridColumns) );
};
dp2ems.prototype.getUsedGridColumnsForPage = function(page) {
	return Math.min( this.options.gridColumns, this.options.gridDirectionHorizontal ? this.getVisibleItemsCntForPage(page) : Math.ceil(1.0 * this.getVisibleItemsCntForPage(page) / this.options.gridRows) );
};

dp2ems.prototype.getItemsRangeForPage = function(page) {
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
dp2ems.prototype.getVisibleItemsCntForPage = function(page) {
	if(page === undefined)
		page = this.currPage;
	var rng = this.getItemsRangeForPage(page);
	var cnt = 0;
	if(rng !== false)
		cnt = rng[1] - rng[0] + 1;
	return cnt;
};

dp2ems.prototype.getSearchedCnt = function() {
	return this.getFilterMode() == 'search' ? this.getVisibleItems().length - this.selectedItems.length + this.selectedAndFilteredItems.length : -1;
};

dp2ems.prototype.getPageForInd = function(ind) {
	var page = -1;
	var pos = this.visibleItemsInds !== false ?  this.visibleItemsInds.indexOf(ind) : ind;
	if(pos != -1 && this.getSearchedCnt() == 0 && !this.options.showSelectedItemsWhenNoFound)
		pos = -1;
	if(pos != -1)
		page = Math.floor( 1.0 * pos / (this.options.gridRows * this.options.gridColumns) );
	return page;
};

dp2ems.prototype.getPageForCurrSel = function() {
	var page = -1;
	for(var i = 0 ; i < this.selectedItemsInds.length ; i++) {
		var ind = this.selectedItemsInds[i];
		var p = this.getPageForInd(ind);
		if(p != -1 && (page == -1 || p < page))
			page = p;
	}
	return page;
};

dp2ems.prototype.getFirstPage = function() {
	return this.getPages() > 0 ? 0 : -1;
};

// ------------------------------------------------ View

dp2ems.prototype.isExtView = function() {
	return this.getTotalPages() >= this.options.minPagesForExt;
};
dp2ems.prototype.isFullExtView = function() {
	return this.options.isExt == 1 || this.options.isExt == -1 && this.isExtView();
};
dp2ems.prototype.isCompactExtView = function() {
	return this.options.isExt == 0 || this.options.isExt == -1 && !this.isExtView();
};

dp2ems.canInit = function($sel) {
	var selId = $sel.attr('id');
	var ok = (selId && jQuery('#'+selId).length == 1 && $sel.is('select'));
	return ok;
};
dp2ems.isInited = function($sel) {
	var $divSel = $sel.next();
	var $divEms = $sel.next().next();
	var is = $sel.is(':hidden') && $divSel.is('.dp2ems-select') && $divEms.is('.dp2ems-popup');
	return is;
};

//open, close
//
dp2ems.prototype.isPopupOpened = function() {
	return !this.$divPopup.hasClass('hidden');
};

dp2ems.prototype.vOpenPopup = function(animate) {
	var canOpen = !this.isPopupOpened() && !this.$divPopup.data('opening') && !this.$divPopup.data('closing');
	//"queue" open task
	if(this.$divPopup.data('closing'))
		this.$divPopup.data('to_open', 1);
	if(!canOpen)
		return;
	var self = this;
	
	var minw = Math.max(parseFloat(this.$divPopup.css('min-width')), dp2ems.getFullWidth(this.$divSel));
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
	var aniTo = {
		'min-width': minw,
		width: dp2ems.getFullWidth(this.$divPopup), 
		height: dp2ems.getFullHeight(this.$divPopup),
		opacity: this.$divPopup.css('opacity'),
	};
	var cssRestore = {
		width: (this.options.divPopupWidth > 0 ? this.options.divPopupWidth : (this.options.divPopupWidth == -1 ? dp2ems.getFullWidth(this.$divSel) : '')),
		height: (this.options.divPopupHeight ? this.options.divPopupHeight : ''),
		opacity: this.$divPopup.css('opacity'),
	};
	var aniFrom = {
		'min-width': '',
		width: dp2ems.getFullWidth(this.$divSel),
		height: dp2ems.getFullHeight(this.$divSel),
		opacity: 0,
	};
	if(this.options.isElasticPopupAnimation[0]) {
		aniTo.left = this.$divPopup.css('left');
		aniTo.top = this.$divPopup.css('top');
		aniFrom.left = Math.min(dp2ems.getFullWidth(this.$divSel), dp2ems.getFullWidth(this.$divPopup) / 2);
		aniFrom.top = dp2ems.getFullHeight(this.$divSel);
		aniFrom.width = Math.max(1, dp2ems.getFullWidth(this.$divSel) - aniFrom.left);
		aniFrom.height = Math.max(1, dp2ems.getFullHeight(this.$divSel) - aniFrom.top);
	}
	
	var doAnimate = this.options.animatePopupDuration[0] > 0 && (animate === undefined || animate == true);
	if(doAnimate) {
		this.$divPopup.data('opening', 1);
		//temp fixes for smooth animation
		this._vTempFixesBeforeAnimationOpCl();
		//animate
		var aniOpts = {
			duration: this.options.animatePopupDuration[0], 
			easing: this.options.animatePopupEasing[0],
			complete: function() {
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
			}
		};
		this.$divPopup.css(aniFrom).animate(aniTo, aniOpts);
	} else {
		self._vFixBodyHeight();
	}
};

dp2ems.prototype.vClosePopup = function(animate) {
	var canClose = this.isPopupOpened() && !this.$divPopup.data('opening') && !this.$divPopup.data('closing');
	//"queue" close task
	if(this.$divPopup.data('opening'))
		this.$divPopup.data('to_close', 1);
	if(!canClose)
		return;
	var self = this;
	
	var minw = parseFloat(this.$divPopup.css('min-width'));
	var aniTo = {
		width: dp2ems.getFullWidth(this.$divSel),
		height: dp2ems.getFullHeight(this.$divSel),
		opacity: 0,
	};
	var cssRestore = {
		'min-width': minw,
		width: (this.options.divPopupWidth > 0 ? this.options.divPopupWidth : (this.options.divPopupWidth == -1 ? dp2ems.getFullWidth(this.$divSel) : '')),
		height: (this.options.divPopupHeight ? this.options.divPopupHeight : ''),
		opacity: this.$divPopup.css('opacity'),
	};
	var aniFrom = {
		'min-width': '',
		width: dp2ems.getFullWidth(this.$divPopup), 
		height: dp2ems.getFullHeight(this.$divPopup),
		opacity: this.$divPopup.css('opacity'),
	};
	if(this.options.isElasticPopupAnimation[1]) {
		aniFrom.left = this.$divPopup.css('left');
		aniFrom.top = this.$divPopup.css('top');
		aniTo.left = Math.min(dp2ems.getFullWidth(this.$divSel), dp2ems.getFullWidth(this.$divPopup) / 2);
		aniTo.top = dp2ems.getFullHeight(this.$divSel);
		aniTo.width = Math.max(1, dp2ems.getFullWidth(this.$divSel) - aniTo.left);
		aniTo.height = Math.max(1, dp2ems.getFullHeight(this.$divSel) - aniTo.top);
	}
	
	var doAnimate = this.options.animatePopupDuration[1] > 0 && (animate === undefined || animate == true)
	if(doAnimate) {
		self.$divPopup.data('closing', 1);
		//temp fixes for smooth animation
		this._vTempFixesBeforeAnimationOpCl();
		//animate
		var aniOpts = {
			duration: this.options.animatePopupDuration[1], 
			easing: this.options.animatePopupEasing[1],
			complete: function() {
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
			}
		};
		this.$divPopup.css(aniFrom).animate(aniTo, aniOpts);
	} else {
		this.$divPopup.addClass('hidden');
	}
};

dp2ems.prototype._vTempFixesBeforeAnimationOpCl = function() {
	var self = this;
	var bodyHeight = dp2ems.getFullHeight(this.$divPopup.$body, true);
	var bodyWrapperHeight = dp2ems.getFullHeight(this.$divPopup.$bodyWrapper, true);
	var tmp = [];
	this.$divPopup.$body.find('.prch2-text-wrapper').each(function(i, el) {
		var $el = jQuery(el);
		var w = dp2ems.getFloatWidth($el), h = dp2ems.getFloatHeight($el);
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
	var isConcrete = this.$divPopup.hasClass('dp2ems-concrete-height');
	this.$divPopup.data('_isConcrete', isConcrete);
	if(this.$divPopup.$bodyWrapper.css('min-height'))
		this.$divPopup.$bodyWrapper.data('_min-height', this.$divPopup.$bodyWrapper.css('min-height')).css('min-height', '');
	if(this.$divPopup.$bodyWrapper.css('min-width'))
		this.$divPopup.$bodyWrapper.data('_min-width', this.$divPopup.$bodyWrapper.css('min-width')).css('min-width', '');
	if(this.$divPopup.$bodyWrapper.css('max-width'))
		this.$divPopup.$bodyWrapper.data('_max-width', this.$divPopup.$bodyWrapper.css('max-width')).css('max-width', '');
	this.$divPopup.$bodyWrapper.addClass('dp2ems-body-wrapper-flex');
	this.$divPopup.$body.css('flex-grow', bodyHeight);
	this.$divPopup.$bodyAniHelper.css('flex-grow', bodyWrapperHeight - bodyHeight);
	if(!isConcrete)
		this.$divPopup.addClass('dp2ems-concrete-height');
};

dp2ems.prototype._vRevertTempFixesAfterAnimationOpCl = function() {
	var self = this;
	var isConcrete = this.$divPopup.data('_isConcrete');
	if(!isConcrete)
		this.$divPopup.removeClass('dp2ems-concrete-height');
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
	this.$divPopup.$bodyWrapper.removeClass('dp2ems-body-wrapper-flex');
}

dp2ems.prototype._vBodyFlexOn = function() {
	var bodyHeight = dp2ems.getFullHeight(this.$divPopup.$body, true);
	var bodyWrapperHeight = dp2ems.getFullHeight(this.$divPopup.$bodyWrapper, true);
	this.$divPopup.$bodyWrapper.addClass('dp2ems-body-wrapper-flex');
	this.$divPopup.$body.css('flex-grow', bodyHeight);
	this.$divPopup.$bodyAniHelper.css('flex-grow', bodyWrapperHeight - bodyHeight);
};
dp2ems.prototype._vBodyFlexOff = function() {
	this.$divPopup.$bodyWrapper.removeClass('dp2ems-body-wrapper-flex');
};

//render
//
dp2ems.prototype.vConvertSelectOnce = function() {
	if(dp2ems.isInited(this.$sel))
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
	this.$divPopup.$close = this.$divPopup.find('.dp2ems-close');
	this.$divPopup.$head = this.$divPopup.find('.dp2ems-head');
	this.$divPopup.$search = this.$divPopup.find('.dp2ems-search');
	this.$divPopup.$pagesList = this.$divPopup.find('.dp2ems-pages-list');
	this.$divPopup.$pagesList.$dotsViewContainer = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-dots-wrapper') };
	this.$divPopup.$pagesList.$dotsContainer = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-dots') };
	this.$divPopup.$pagesList.$dotsWrappers = function() { return self.$divPopup.$pagesList.find('.dp2ems-page-dot-wrapper') };
	this.$divPopup.$pagesList.$currDotWrapper = function() { return self.$divPopup.$pagesList.find('.dp2ems-page-dot-wrapper.dp2ems-page-dot-current') };
	this.$divPopup.$pagesList.$dots = function() { return self.$divPopup.$pagesList.find('.dp2ems-page-dot-wrapper .dp2ems-page-dot') };
	this.$divPopup.$pagesList.$currDot = function() { return self.$divPopup.$pagesList.find('.dp2ems-page-dot-wrapper.dp2ems-page-dot-current .dp2ems-page-dot') };
	this.$divPopup.$pagesList.$ctrlPrev = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-prev') };
	this.$divPopup.$pagesList.$ctrlNext = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-next') };
	this.$divPopup.$pagesList.$ctrlFirst = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-first') };
	this.$divPopup.$pagesList.$ctrlLast = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-last') };
	this.$divPopup.$pagesList.$gradLeft = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-grad-left') };
	this.$divPopup.$pagesList.$gradRight = function() { return self.$divPopup.$pagesList.find('.dp2ems-pages-grad-right') };
	this.$divPopup.$ctrlsWrapper = this.$divPopup.find('.dp2ems-ctrls');
	this.$divPopup.$ctrls = function() { return self.$divPopup.$ctrlsWrapper.find('> .dp2ems-ctrl') };
	this.$divPopup.$ctrlPages = this.$divPopup.find('.dp2ems-ctrls-pag');
	this.$divPopup.$ctrlClearAll = this.$divPopup.find('.dp2ems-ctrl-clear-all');
	this.$divPopup.$ctrlShowSelection = this.$divPopup.find('.dp2ems-ctrl-show-selection');
	this.$divPopup.$ctrlGotoSelection = this.$divPopup.find('.dp2ems-ctrl-goto-selection');
	this.$divPopup.$ctrlSaveSelection = this.$divPopup.find('.dp2ems-ctrl-save-selection');
	this.$divPopup.$btnLeft = this.$divPopup.find('.dp2ems-btn-left');
	this.$divPopup.$btnRight = this.$divPopup.find('.dp2ems-btn-right');
	this.$divPopup.$bodyWrapper = this.$divPopup.find(".dp2ems-body-wrapper");
	this.$divPopup.$body = this.$divPopup.find(".dp2ems-body:not(.dp2ems-body-ghost)");
	this.$divPopup.$bodyGhost = this.$divPopup.find(".dp2ems-body-ghost");
	this.$divPopup.$bodyAniHelper = this.$divPopup.find(".dp2ems-body-ani-helper");
	this.$divPopup.$msg = this.$divPopup.find(".dp2ems-msg");
	this.$divPopup.$msgSpan = this.$divPopup.find(".dp2ems-msg span");
	this.$divPopup.$index = this.$divPopup.find(".dp2ems-index");
	this.$divPopup.$indexChars = function() { return self.$divPopup.$index.find('.dp2ems-char') };
	this.$divPopup.$body.$checkboxes = this.$divPopup.$bodyGhost.$checkboxes = function() { return jQuery(this).find("input[type=checkbox], input[type=radio]") };
	this.$divPopup.getCheckboxInfo = function($checkbox) {
		var info = {};
		info.text = $checkbox.next('label').text();
		info.ind = parseInt($checkbox.attr('realInd'));
		info.isSel = $checkbox.is(':checked');
		info.isAny = $checkbox.is('.dp2ems-checkbox-any');
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
		this.$divSel.css('width', dp2ems.getFullWidth(this.$sel));
	else if(this.options.divSelWidth == -1)
		this.$divSel.addClass('dp2ems-select-auto-width');
	else if(this.options.divSelWidth > 0)
		this.$divSel.css('width', parseFloat(this.options.divSelWidth));
	if(this.options.divSelHeight == -2)
		this.$divSel.css('height', dp2ems.getFullHeight(this.$sel));
	else if(this.options.divSelHeight == -1)
		this.$divSel.addClass('dp2ems-select-auto-height');
	else if(this.options.divSelHeight > 0)
		this.$divSel.css('height', parseFloat(this.options.divSelHeight));
	if(this.options.divSelPaddingLeft) {
		setTimeout(function() {
			self.$divSel.css('padding-left', parseFloat(self.options.divSelPaddingLeft));
			self.$divSel.css('padding-right', parseFloat(self.options.divSelPaddingLeft) + dp2ems.getFullWidth(self.$divSel.find('.cuselFrameRight'), true) - 8);
		}, 5);
	}
	if(this.options.divSelIsMultiline)
		this.$divSel.addClass('dp2ems-select-multiline');
	if(this.options.divSelClasses)
		this.$divSel.addClass(this.options.divSelClasses);
	if(this.options.divPopupWidth == -2)
		this.$divPopup.addClass('dp2ems-popup-auto-width');
	else if(this.options.divPopupWidth == -1)
		this.$divPopup.css('width', dp2ems.getFullWidth(this.$divSel));
	else if(this.options.divPopupWidth > 0)
		this.$divPopup.css('width', parseFloat(this.options.divPopupWidth));
	if(this.options.divPopupHeight > 0) {
		this.$divPopup.addClass('dp2ems-concrete-height');
		this.$divPopup.css('height', parseFloat(this.options.divPopupHeight));
	}
	if(this.options.divPopupClasses)
		this.$divPopup.addClass(this.options.divPopupClasses);
	if(this.options.divWrapperClasses)
		this.$divWrapper.addClass(this.options.divWrapperClasses);
};

dp2ems.prototype.vRenderPage = function(page, oldPage, animate, callback) {
	var self = this;
	
	//enable/disable, show/hide controls
	this.$divPopup.$btnLeft.toggleClass('dp2ems-enabled', (page > 0));
	this.$divPopup.$btnRight.toggleClass('dp2ems-enabled', (page >= 0 && page < (this.getPages() - 1)));
	this.$divPopup.$btnLeft.toggleClass('dp2ems-disabled', !(page > 0));
	this.$divPopup.$btnRight.toggleClass('dp2ems-disabled', !(page >= 0 && page < (this.getPages() - 1)));
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
			this.$divPopup.data('changing-page', 1).data('changing-page-from', oldPage).data('changing-page-to', page).addClass('dp2ems-animating-change-page');
			this.vRenderPageTo(tmp, this.$divPopup.$bodyGhost);
			this.$divPopup.$bodyGhost.removeClass('dp2ems-hidden');
			this.$divPopup.$bodyGhost.css({
				width: w,
				top: 0,
				left: (page > oldPage ? w : -w)
			});
			
			var r = self._vPreFixBodyHeight(true);
			this.$divPopup.$bodyWrapper.css({
				height: r.bodyWrapperOldH
			});
			this.$divPopup.$body.addClass('dp2ems-body-ghost').removeClass('dp2ems-hidden').css({
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
			var onAllComplete = function() {
				var isSimultAnims = !self.$divPopup.$body.hasClass('dp2ems-body-ghost');
				if(isSimultAnims) {
					//fix
					var $tmp = self.$divPopup.$body;
					self.$divPopup.$body = self.$divPopup.$bodyGhost;
					self.$divPopup.$bodyGhost = $tmp;
				}
				self.$divPopup.$bodyGhost.removeClass('dp2ems-body-ghost').css(bodyCssRestore);
				self.$divPopup.$body.css(bodyGhostCssRestore);
				self.$divPopup.$bodyWrapper.css(bodyWrapperCssRestore);
				var $tmp = self.$divPopup.$body;
				self.$divPopup.$body = self.$divPopup.$bodyGhost;
				self.$divPopup.$bodyGhost = $tmp;
				self.$divPopup.$bodyGhost.addClass('dp2ems-hidden');
				self.$divPopup.$body.removeClass('dp2ems-hidden');
				self._vFixBodyHeight();
				self.$divPopup.data('changing-page', 0).removeData('changing-page-from').removeData('changing-page-to').removeClass('dp2ems-animating-change-page');
				callback();
			};
			var onOneComplete = function() {
				aniCnt--;
				if(aniCnt == 0)
					onAllComplete();
			};
			var aniOpts = {
				duration: this.options.animatePageDuration, 
				easing: this.options.animatePageEasing,
				queue: false,
				complete: onOneComplete
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

dp2ems.prototype.vRenderPageTo = function(tmp, $body) {
	$body.html(tmp.html);
	
	//add dynamic styles
	$body.find('.dp2ems-row .dp2ems-el').css('width', (1.0 * 100 / this.getMaxUsedGridColumns())+'%');
	$body.find('.dp2ems-col').css('width', (1.0 * 100 / this.getMaxUsedGridColumns())+'%');
	$body.find('.dp2ems-col .dp2ems-el').css('height', (1.0 * 100 / this.getMaxUsedGridRows())+'%');
	
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

dp2ems.prototype.vRenderValStr = function(str) {
	this.$divSel.$span.text(str);
};

dp2ems.prototype.vRenderFirstChars = function() {
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

dp2ems.prototype.vRenderPagesList = function() {
	if(this.options.showPagesList) {
		var html = this.htmlForPagesList();
		this.$divPopup.$pagesList.html(html);
		
		this.$divPopup.$pagesList.toggle( this.getTotalPages() > 1 );
	} else {
		this.$divPopup.$pagesList.hide();
	}
};

dp2ems.prototype.vPostRenderPagesList = function(animate) {
	if(!this.$divPopup.$pagesList.is(':visible'))
		return;
	
	//change classes
	this.$divPopup.$pagesList.$ctrlFirst().toggleClass('dp2ems-enabled', this.currPage > 0);
	this.$divPopup.$pagesList.$ctrlFirst().toggleClass('dp2ems-disabled', !(this.currPage > 0));
	this.$divPopup.$pagesList.$ctrlPrev().toggleClass('dp2ems-enabled', this.currPage > 0);
	this.$divPopup.$pagesList.$ctrlPrev().toggleClass('dp2ems-disabled', !(this.currPage > 0));
	this.$divPopup.$pagesList.$ctrlLast().toggleClass('dp2ems-enabled', this.currPage >= 0 && this.currPage < (this.getPages()-1));
	this.$divPopup.$pagesList.$ctrlLast().toggleClass('dp2ems-disabled', !(this.currPage >= 0 && this.currPage < (this.getPages()-1)));
	this.$divPopup.$pagesList.$ctrlNext().toggleClass('dp2ems-enabled', this.currPage >= 0 && this.currPage < (this.getPages()-1));
	this.$divPopup.$pagesList.$ctrlNext().toggleClass('dp2ems-disabled', !(this.currPage >= 0 && this.currPage < (this.getPages()-1)));
	this.$divPopup.$pagesList.$dotsWrappers().filter('.dp2ems-page-dot-current').not("[page="+this.currPage+"]").removeClass('dp2ems-page-dot-current');
	this.$divPopup.$pagesList.$dotsWrappers().filter("[page="+this.currPage+"]").not('.dp2ems-page-dot-current').addClass('dp2ems-page-dot-current');
	
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
	var dotW = $dots.length ? dp2ems.getFullWidth($dots.first(), true) : 0;
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
dp2ems.prototype._vPreFixBodyHeight = function(applyToBodyGhost) {
	var $trgBody = (applyToBodyGhost ? this.$divPopup.$bodyGhost : this.$divPopup.$body);
	var isFullRows = this.getUsedGridRowsForPage(this.currPage) == this.getMaxUsedGridRows() && this.getMaxUsedGridRows() == this.options.gridRows;
	var bodyWrapperOldH = dp2ems.getFullHeight(this.$divPopup.$bodyWrapper, true);
	$trgBody.css('height', '');
	var gh1 = dp2ems.getFullHeight($trgBody, true);
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
		gh_ = gh1_ - dp2ems.getHeightOverhead($trgBody, true);
		gh = gh_;
	}
	if(gh)
		$trgBody.css('height', gh);
	var bh1 = dp2ems.getFullHeight(this.$divPopup.$body, true);
	var bodyWrapperNewH = Math.max(bh1, gh1);
	
	var r = {gh1: gh1, gh: gh, gh1_: gh1_, gh_: gh_, bodyWrapperOldH: bodyWrapperOldH, bodyWrapperNewH: bodyWrapperNewH};
	return r;
};

/**
 * If on new page there are less options than on old one, popup height will normally decrease - we don't want that, so fix!
 * This fix will force bodyWrapper to keep 'min-height' css-style.
 * Also if option 'tryToKeepConstPopupHeight' is set, body will keep const height (only for full rows) via 'width' css-style.
 */
dp2ems.prototype._vFixBodyHeight = function() {
	var self = this;
	var $divToRender = self.$divPopup.$bodyWrapper;
	if(this.$divPopup.hasClass('dp2ems-concrete-height')) {
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
			var msgH = dp2ems.getFullHeight(self.$divPopup.$msg, true);
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
				self.$divPopup.$body.css('height', minh - dp2ems.getHeightOverhead(this.$divPopup.$body, true));
			}
			*/
		}
		if(!minw && w /* || w > minw*/ && this.options.divPopupWidth == 0) {
			$divToRender.css('min-width', w+'px');
			$divToRender.css('max-width', w+'px');
		}
	}
};

dp2ems.prototype.vAfterFilterChange = function() {
	var self = this;
	this.$divPopup.$ctrlShowSelection.toggleClass('selected', this.fitlerBySel);
	this.$divPopup.$indexChars().each(function(ind, el) {
		var ch = jQuery(el).attr('fChar');
		jQuery(el).toggleClass('selected', (ch == '' ? self.isNoFilter() : self.filterFChar == ch));
	});
	if(this.$divPopup.$search.val() != this.filterStr)
		this.$divPopup.$search.val(this.filterStr);
};

dp2ems.prototype.vAfterSingleChanged = function($chkbx) {
	var $inputToUncheck = this.$divPopup.$body.find("input"+(this.selectedItemsInds.length ? "[realind!="+this.selectedItemsInds[0]+"]" : "")+":checked").not($chkbx);
	$inputToUncheck.prop('checked', false).trigger('change');
};

dp2ems.prototype.vAfterAllSelectedChanged = function($chkbx) {
	var $inputAnyChecked = this.$divPopup.$body.find("input.dp2ems-checkbox-any:checked").not($chkbx);
	var $inputAnyUnhecked = this.$divPopup.$body.find("input.dp2ems-checkbox-any:not(:checked)").not($chkbx);
	var $inputsNotAnyChecked = this.$divPopup.$body.find("input:not(.dp2ems-checkbox-any):checked").not($chkbx);
	
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

dp2ems.prototype.vAfterUpdateItems = function() {
	var classAreaPopup = (this.isFullExtView() ? 'dp2ems-popup-ext' : (this.isCompactExtView() ? 'dp2ems-popup-comp' : 'dp2ems-popup-norm'));
	this.$divPopup.removeClass('dp2ems-popup-ext');
	this.$divPopup.removeClass('dp2ems-popup-comp');
	this.$divPopup.removeClass('dp2ems-popup-norm');
	this.$divPopup.addClass(classAreaPopup);
	
	this.$divPopup.$ctrlClearAll.toggle( this.getItemsCountWoAll() > 0 );
	this.$divPopup.$ctrlShowSelection.toggle( this.getItemsCountWoAll() > 0 );
	this.$divPopup.$ctrlSaveSelection.toggle( this.getItemsCountWoAll() > 0 );
	this.$divPopup.$bodyWrapper.toggle( this.items.length > 0 );
};

// ------------------------------------------------ View - generate html for rendering

dp2ems.prototype.htmlForSel = function() {
	var divSelHtml = "<div class='dp2ems-select" + (this.isMultiple ? "" : " dp2ems-select-single") + "'><div class='dp2ems-select-text'><span>" + this.valStr + "</span></div><div class='cuselFrameRight'></div></div>";
	return divSelHtml;
};

dp2ems.prototype.htmlForWrapper = function() {
	return "<div class='dp2ems-wrapper'></div>";
};

dp2ems.prototype.htmlForPopup = function() {
	var classAreaPopup = (this.isFullExtView() ? 'dp2ems-popup-ext' : (this.isCompactExtView() ? 'dp2ems-popup-comp' : 'dp2ems-popup-norm'));
	
	var textClearAll = 		this.strings.ctrlClearAll instanceof Array		? this.strings.ctrlClearAll[this.isMultiple ? 0 : 1]		: this.strings.ctrlClearAll;
	var textShowSelection =	this.strings.ctrlShowSelection instanceof Array	? this.strings.ctrlShowSelection[this.isMultiple ? 0 : 1]	: this.strings.ctrlShowSelection;
	var textGotoSelection =	this.strings.ctrlGotoSelection instanceof Array ? this.strings.ctrlGotoSelection[this.isMultiple ? 0 : 1]	: this.strings.ctrlGotoSelection;
	var textSaveSelection =	this.strings.ctrlSaveSelection instanceof Array ? this.strings.ctrlSaveSelection[this.isMultiple ? 0 : 1]	: this.strings.ctrlSaveSelection;
	
	var divPopupHtml = '';
	divPopupHtml += "<div class='hidden dp2ems-popup " + classAreaPopup + (this.isMultiple ? "" : " dp2ems-popup-single") + "'>";
		if(this.options.showCloseCross) {
			divPopupHtml += "<div class='dp2ems-close'></div>";
		}
		if(this.options.showSearch) {
			divPopupHtml += "<div class='dp2ems-head'>";
				divPopupHtml += "<input class='dp2ems-search' type='text' placeholder='" + this.strings.inputPlaceholder + "'/>";
				if(!(this.options.hidePageControlsWhenThereIsPegeList && this.options.showPagesList)) {
					divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-left'></div>";
					divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-right'></div>";
				}
			divPopupHtml += "</div>";
		}
		divPopupHtml += "<div class='dp2ems-msg'><span></span></div>";
		divPopupHtml += "<div class='dp2ems-body-wrapper " + (this.options.gridDirectionHorizontal || this.options.useRowsStyleForVerticalDirection ? 'dp2ems-dir-horz' : 'dp2ems-dir-vert') + " dp2ems-cols-x dp2ems-cols-" + this.options.gridColumns + " dp2ems-rows-x dp2ems-rows-" + this.options.gridRows + "'>";
			divPopupHtml += "<div class='dp2ems-body'>";
				//... look at this.vRenderPage(page)
			divPopupHtml += "</div>";
			divPopupHtml += "<div class='dp2ems-body dp2ems-body-ghost dp2ems-hidden'>";
				//... look at this.vRenderPage(page)
			divPopupHtml += "</div>";
			divPopupHtml += "<div class='dp2ems-body-ani-helper'></div>";
		divPopupHtml += "</div>";
		if(this.options.showPagesList) {
			divPopupHtml += "<div class='dp2ems-pages-list'>";
				//... look at this.vRenderPagesList()
			divPopupHtml += "</div>";
		}
		if(this.options.showControls) {
			divPopupHtml += "<div class='dp2ems-ctrls'>";
				if(!(this.options.hidePageControlsWhenThereIsPegeList && this.options.showPagesList)) {
					divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrls-pag'>";
						divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-left'></div>";
						divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-right'></div>";
						divPopupHtml += "<div class='dp2ems-clr'></div>";
					divPopupHtml += "</div>";
				}
				if(this.options.showCtrlClearAll)
					divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-clear-all'>" + textClearAll + "</div>";
				if(this.isMultiple && this.options.showCtrlShowSelection)
					divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-show-selection'>" + textShowSelection + "</div>";
				if(!this.isMultiple && this.options.showCtrlGotoSelection)
					divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-goto-selection'>" + textGotoSelection + "</div>";
				divPopupHtml += "<div class='dp2ems-ctrl-space'></div>";
				if(this.options.showCtrlSaveSelection)
					divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-save-selection'>" + textSaveSelection + "<div class='cuselFrameRightUp'></div></div>";
			divPopupHtml += "</div>";
		}
		if(this.options.showIndex) {
			divPopupHtml += "<div class='dp2ems-index'" + ">";
				//... look at this.vRenderFirstChars()
			divPopupHtml += "</div>";
		}
	divPopupHtml += "</div>";
	return divPopupHtml;
}

dp2ems.prototype.htmlForPage = function(page) {
	var msg = '';
	var html = '';
	var rng = this.getItemsRangeForPage(page);
	
	if(this.getFilterMode() == 'search' && this.selectedItems.length >= this.options.maxSelectionLimit && this.options.showSelectedItemsBeforeSearched) {
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
			html += "<div class='dp2ems-el'>";
				html += "<input type='"+(self.isMultiple ? 'checkbox' : 'radio')+"' class='" + (opt[2] ? "dp2ems-checkbox-any" : "") + "' realInd='" + realInd + "' name='" + name + "' id='" + id + "' " + (checked ? " checked" : "") + ">";
				html += "<label for='" + id + "' _class='" + (opt[2] ? "dp2ems-label-any" : "") + "'>" + text + "</label>";
			html += "</div>";
			return html;
		};
		
		var renderColStart = function(self, html, c) {
			var html = "<div class='dp2ems-col' id='dp2ems-col-" + c + "'>";
			return html;
		};
		var renderColEnd = function(self, html, c) {
			var html = "</div>";
			return html;
		};
		
		var renderRowStart = function(self, html, r) {
			var html = "<div class='dp2ems-row dp2ems-body-rows-x dp2ems-body-rows-" + self.getMaxUsedGridRows() + "' id='dp2ems-row-" + r + "'>";
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

dp2ems.prototype.htmlForPagesList = function() {
	var html = '';
	
	if(this.getPages() > 0) {
		html += "<div class='dp2ems-pages-ctrl dp2ems-pages-first "+(this.currPage > 0 ? 'dp2ems-enabled' : 'dp2ems-disabled')+"'><span class='ui-icon ui-icon-seek-first'></span></div>";
		html += "<div class='dp2ems-pages-ctrl dp2ems-pages-prev "+(this.currPage > 0 ? 'dp2ems-enabled' : 'dp2ems-disabled')+"'><span class='ui-icon ui-icon-triangle-1-w'></span></div>";
		
		html += "<div class='dp2ems-pages-dots-wrapper'>";
			html += "<div class='dp2ems-pages-grad-left'></div>";
			html += "<div class='dp2ems-pages-dots'>";
				for(var p = 0 ; p < this.getPages() ; p++) {
					html += "<div class='dp2ems-page-dot-wrapper"+ (p == this.currPage ? " dp2ems-page-dot-current" : "") +"' id='dp2ems-page-dot-wrapper-"+p+"' page='"+p+"'>";
						html += "<div class='dp2ems-page-dot' page='"+p+"'>";
							html += "<div class='dp2ems-page-dot-inner'></div>";
						html += "</div>";
					html += "</div>";
				}
			html += "</div>";
			html += "<div class='dp2ems-pages-grad-right'></div>";
		html += "</div>";
		
		html += "<div class='dp2ems-pages-ctrl dp2ems-pages-next "+(this.currPage >= 0 && this.currPage < (this.getPages()-1) ? 'dp2ems-enabled' : 'dp2ems-disabled')+"'><span class='ui-icon ui-icon-triangle-1-e'></span></div>";
		html += "<div class='dp2ems-pages-ctrl dp2ems-pages-last "+(this.currPage >= 0 && this.currPage < (this.getPages()-1) ? 'dp2ems-enabled' : 'dp2ems-disabled')+"'><span class='ui-icon ui-icon-seek-end'></span></div>";
	}
	
	return html;
};

dp2ems.prototype.htmlForFirstChars = function() {
	var html = '';
	
	var cntAll = this.items.length;
	var fCharAll = '';
	html += "<div class='dp2ems-char' fChar='" + fCharAll + "' fCharCnt='" + cntAll + "'>" + this.strings.indexAll + "</div>";
	
	for(var fChar in this.firstChars) if (this.firstChars.hasOwnProperty(fChar)) {
		var cnt = this.firstChars[fChar];
		html += "<div class='dp2ems-char' fChar='" + fChar + "' fCharCnt='" + cnt + "'>" + fChar + "</div>";
	}
	return html;
};

// ------------------------------------------------ Controller

//init
//
dp2ems.prototype.doInitOnce = function() {
	if(dp2ems.isInited(this.$sel))
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

dp2ems.prototype.doPrepareHtmlOnce = function() {
	if(dp2ems.isInited(this.$sel))
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
dp2ems.prototype.doUpdateItems = function() {
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
dp2ems.prototype.doOpenPopup = function() {
	dp2ems.doCloseAppPopups();
	if(!this.isMultiple && this.selectedItemsInds.length)
		this.doGotoSelection(false);
	this.vOpenPopup();
};
dp2ems.prototype.doClosePopup = function() {
	this.vClosePopup();
};
dp2ems.prototype.doTogglePopup = function() {
	if(!this.isPopupOpened())
		this.doOpenPopup();
	else
		this.doClosePopup();
};
dp2ems.doCloseAppPopups = function() {
	for(var selId in dp2ems._instances) if (dp2ems._instances.hasOwnProperty(selId)) {
		var inst = dp2ems._instances[selId];
		inst.doClosePopup();
	}
};

//render
//
dp2ems.prototype.doGotoPage = function(page, animate) {
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

dp2ems.prototype.doRenderValStr = function() {
	this.vRenderValStr(this.valStr);
};

dp2ems.prototype.doRenderPagesList = function() {
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

dp2ems.prototype.doRenderFirstChars = function() {
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
dp2ems.prototype.doSetFilterByFirstChar = function(gr) {
	this.mSetFilterByFirstChar(gr);
	this.vAfterFilterChange();
};
dp2ems.prototype.doSetFilterBySelected = function(sel) {
	this.mSetFilterBySelected(sel);
	this.vAfterFilterChange();
};
dp2ems.prototype.doSetFilterBySearchString = function(str) {
	this.mSetFilterBySearchString(str);
	this.vAfterFilterChange();
};
dp2ems.prototype.doSetNoFilter = function() {
	this.mSetNoFilter();
	this.vAfterFilterChange();
};

dp2ems.prototype.doApplyFilter = function() {
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

dp2ems.prototype.doApplyFilterAndGotoFirstPage = function() {
	this.doApplyFilter();
	this.doGotoPage(this.getFirstPage());
};

dp2ems.prototype.doGotoSelection = function(animate) {
	var pageForSel = this.getPageForCurrSel();
	var resetFilter = (pageForSel == -1 || this.getSearchedCnt() == 0);
	if(resetFilter) {
		this.doSetNoFilter();
		this.doApplyFilter();
		pageForSel = this.getPageForCurrSel();
	}
	this.doGotoPage(pageForSel != -1 ? pageForSel : this.getFirstPage(), animate && !resetFilter);
};

dp2ems.prototype.doClearAll = function() {
	this.doUnselectAllItems();
	this.doSetNoFilter();
	this.doApplyFilterAndGotoFirstPage();
	if(!this.isMultiple)
		this.doClosePopup();
};

//selection events
//
dp2ems.prototype.onSelectItem = function(info, $chkbx) {
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

dp2ems.prototype.onSelectionChanged = function() {
	if(this.getFilterMode() == 'sel') {
		this.mFilterItemsBySelected();
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

dp2ems.prototype.doUnselectAllItems = function() {
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
dp2ems.prototype.onShowPopup = function() {
	this.vPostRenderPagesList(false);
};

dp2ems.prototype.onHidePopup = function() {
};

// ------------------------------------------------

//
// jQuery extensions for class dp2ems
//

jQuery.fn.dp2emsInit = function() {
	for(var i = 0 ; i < this.length ; i++) {
		var $sel = jQuery(this[i]);
		var ems = new dp2ems($sel);
	}
	return this;
};

jQuery.fn.dp2emsUpdate = function() {
	for(var i = 0 ; i < this.length ; i++) {
		var $sel = jQuery(this[i]);
		var selId = $sel.attr('id');
		if(0 && !dp2ems.isInited($sel)) {
			$sel.dp2emsInit();
		}
		if(dp2ems.isInited($sel)) {
			var ems = dp2ems.getInstance(selId);
			if(ems)
				ems.doUpdateItems();
		}
	}
	return this;
};

jQuery( document ).ready(function() {
	if (jQuery(".dp2ems").size() > 0) {
		jQuery(".dp2ems").dp2emsInit();
	}
});


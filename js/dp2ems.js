/**
 * TODO:
 *
 * - анимация перелистывания страниц
 * - показывать номера страниц (в виде точек)
 * - i18n
 */

//
// Class dp2ems
//
function dp2ems(s, options) {
	/**
	 * Vars
	 */
	this.$sel = jQuery();
	this.$divSel = jQuery();
	this.$divPopup = jQuery();
	
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
	
	/**
	 * Ctor
	 */
	this.ctor = function(s, _options) {
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
		if(typeof dp2ems.optionsBySelClass[this.selId] != 'undefined') {
			for(var i = 0 ; i < selClasses.length ; i++)
				this.options = jQuery.extend(this.options, dp2ems.optionsBySelClass[selClasses[i]]);
		}
		if(typeof dp2ems.optionsBySelId[this.selId] != 'undefined')
			this.options = jQuery.extend(this.options, dp2ems.optionsBySelId[this.selId]);
		if(_options)
			this.options = jQuery.extend(this.options, _options);
		
		//Init
		this.doInitOnce();
		
		dp2ems._instances[this.selId] = this;
		
		return this;
	};
	
	return this.ctor(s, options);
}

// ------------------------------------------------ Options

dp2ems.defaultOptions = {
	'gridRows': 5,
	'gridColumns': 3,
	'minPagesForExt': 3,
	'isExt': -1, //-1 for auto (see minPagesForExt), 0/1 to force
	'openOnHover': true,
	'anyVal': 'a-n-y',
	'hideAny': false,
	//1 - fill items in left-to-right direction (horizontal) (in html group by rows), 0 - up-to-down direction (vertical) (in html group by cols)
	'gridDirectionHorizontal': false,
	//1 - force group by rows (not cols) in html for vertical direction (to make all elements in one row having equal height)
	'useRowsStyleForVerticalDirection': true,
	'areInnerCtrlsFocuable': false,
	
	//sizes:
	//
	'autoWidth': false,
	'divSelWidth': 0,
	'divSelHeight': 0,
	'divSelPaddingLeft': 0,
	'divSelIsMultiline': false,
	'divSelClasses': '',
	'divPopupWidth': 0,
	'divPopupHeight': 0,
	'divPopupClasses': '',
	
	//animation:
	//
	'animatePopupDuration': [500, 400],
	'isElasticPopupAnimation': [1, 0],
	'animatePopupEasing': ['easeOutElastic', 'easeInCirc'],
	
	//"legacy" options (made for domplus.com.ua)
	//
	'hideShowSelectionControl': false,
	'flushSearchStringAfterSelection': false,
	'showSelectedItemsBeforeSearched': false,
	//only for showSelectedItemsBeforeSearched==1
	'maxSelectionLimit': 3*5,
	
	//strings:
	//
	'ctrlShowSelection': 'Сохранить',
	'ctrlGotoSelection': 'Перейти к выбранному',
	'ctrlShowSelection': 'Показать выбранные',
	'ctrlClearAll': ['Сбросить все', 'Сбросить выбор'],
	'allStr': '',
	'allStrDefault': ['Все', 'Любой'],
	//only for hideAny == 1
	'noSelectionMsg': 'Нет выбранных элементов',
	'noResultsMsg': 'Не найдено, измените, пожалуйста, параметры поиска',
	'inputPlaceholder': 'Введите название',
	'cntFmt': '{cnt} {cnt_name}',
	'cntNames': ['значение', 'значения', 'значений'],
	//when set to 2: for 3+ selected values text will be "X values", for 1-2 - "valA, valB", for 0 - one of allStr/anyStr/allStrDefault;
	//when set to -1: always "X values"
	'maxCntToShowListAsValStr': 3,
	//only for showSelectedItemsBeforeSearched==1 ("legacy")
	'maxSelectionMsg': 'Количество выбранных Вами элементов достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
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

dp2ems.getFullHeight = function($el) {
	return parseInt($el.height()) + parseInt($el.css('padding-top')) + parseInt($el.css('padding-bottom')) + parseInt($el.css('margin-top')) + parseInt($el.css('margin-bottom'));
};
dp2ems.getFullWidth = function($el) {
	return parseInt($el.width()) + parseInt($el.css('padding-left')) + parseInt($el.css('padding-right')) + parseInt($el.css('margin-left')) + parseInt($el.css('margin-right'));
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

// ------------------------------------------------ Model - sync

/**
 * Build human string representing current selection
 */
dp2ems.prototype.selectedItemsToStr = function(arr, areAll) {
	var val = '';
	if(this.isMultiple && arr.length == 0 || areAll)
		val = (this.options.allStr != '' ? this.options.allStr : (this.anyStr != '' ? this.anyStr : this.options.allStrDefault[this.isMultiple ? 0 : 1]));
	else if(this.isMultiple && this.options.maxCntToShowListAsValStr >= 0 && arr.length > this.options.maxCntToShowListAsValStr)
		val = this.options.cntFmt.replace('{cnt}', arr.length).replace('{cnt_name}', dp2ems.localizeCntName(arr.length, this.options.cntNames));
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
dp2ems.prototype.syncFromSelect = function(initial /* = false*/) {
	this.$sel.data('syncing_from', 1);
	
	//sync items
	var tmp = this.getOptsFromSelect(initial);
	this.opts = tmp.opts;
	this.areAllSelected = tmp.areAll;
	this.isMultiple = tmp.isMultiple;
	this.items = [];
	this.selectedItems = [];
	this.selectedItemsInds = [];
	//this.visibleItems = false; //TIP: will be done later in setNoFilter()
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
	this.updAreAllSelected();
	
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
dp2ems.prototype.syncToSelect = function(lite) {
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

dp2ems.prototype.filterItemsBySearchString = function(str) {
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
			this.sortSelectedItems();
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

dp2ems.prototype.filterItemsByFirstChar = function(gr) {
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
				if(dp2ems.isFCharInGroup(fChar, gr)) {
					this.visibleItemsInds.push(i);
					this.visibleItems.push(it);
				}
			}
		}
	}
};

dp2ems.prototype.filterItemsBySelected = function() {
	//copy selectedItems to visibleItems
	this.visibleItemsInds = [];
	this.visibleItems = [];
	if(this.areAllSelected && !this.options.hideAny) {
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

dp2ems.prototype.filterItemsByNone = function() {
	this.visibleItemsInds = false;
	this.visibleItems = false;
	this.selectedAndFilteredItems = false;
	this.selectedAndFilteredItemsInds = false;
};
dp2ems.prototype.setFilterByFirstChar = function(gr) {
	this.filterFChar = gr;
	this.filterStr = '';
	this.fitlerBySel = false;
};
dp2ems.prototype.setFilterBySelected = function(sel) {
	this.filterFChar = '';
	this.filterStr = '';
	this.fitlerBySel = sel;
};
dp2ems.prototype.setFilterBySearchString = function(str) {
	this.filterFChar = '';
	this.filterStr = str;
	this.fitlerBySel = false;
};
dp2ems.prototype.setNoFilter = function() {
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

dp2ems.prototype.sortSelectedItems = function() {
	this.selectedItems.sort();
	var self = this;
	this.selectedItemsInds.sort(function(ind1, ind2) {
		var it1 = self.items[ind1];
		var it2 = self.items[ind2];
		return (it1 < it2 ? -1 : (it1 > it2 ? 1 : 0));
	});
};

// ------------------------------------------------ Model - changings

dp2ems.prototype.selectItem = function(info) {
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
		this.updAreAllSelected();
	
	var ch_stat = 0;
	if(oldAreAllSelected != this.areAllSelected || ind == this.anyItemInd)
		//if clicked on a-n-y option, we should check it back
		ch_stat = 2; 
	else if(changed)
		ch_stat = 1;
	return ch_stat;
};

dp2ems.prototype.updAreAllSelected = function() {
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

dp2ems.prototype.canGoToPage = function(page) {
	return page == 0 && this.getPages() == 0 || page >= 0 && page < this.getPages();
};

dp2ems.prototype.getItemsRangeForPage = function(page) {
	var rng = false;
	if(this.canGoToPage(page)) {
		var len = (this.options.gridRows * this.options.gridColumns);
		var start = page * len;
		if((start + len-1) >= this.getVisibleItems().length)
			len = (this.getVisibleItems().length - start);
		rng = [start, start + len-1];
	}
	return rng;
};

dp2ems.prototype.getSearchedCnt = function() {
	return this.getFilterMode() == 'search' ? this.getVisibleItems().length - this.selectedItems.length + this.selectedAndFilteredItems.length : -1;
};

dp2ems.prototype.getPageForInd = function(ind) {
	var page = -1;
	var pos = this.visibleItemsInds !== false ?  this.visibleItemsInds.indexOf(ind) : ind;
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
	if(page == -1)
		page = 0;
	return page;
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
dp2ems.prototype.openPopup = function(animate) {
	var canOpen = !this.isPopupOpened() && !this.$divPopup.data('opening') && !this.$divPopup.data('closing');
	//"queue" open task
	if(this.$divPopup.data('closing'))
		this.$divPopup.data('to_open', 1);
	if(!canOpen)
		return;
	var self = this;
	
	this.$divPopup.removeClass('hidden');
	this.$divPopup.focus();
	
	var aniTo = {
		width: dp2ems.getFullWidth(this.$divPopup), 
		height: dp2ems.getFullHeight(this.$divPopup),
		opacity: this.$divPopup.css('opacity'),
	};
	var cssRestore = {
		width: (this.options.divPopupWidth ? this.options.divPopupWidth : ''),
		height: (this.options.divPopupHeight ? this.options.divPopupHeight : ''),
		opacity: this.$divPopup.css('opacity'),
	};
	var aniFrom = {
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
	
	if(animate === undefined && this.options.animatePopupDuration[1] > 0 || animate == true) {
		this.$divPopup.data('opening', 1);
		var isConcrete = this.$divPopup.hasClass('dp2ems-concrete-height');
		if(!isConcrete)
			this.$divPopup.addClass('dp2ems-concrete-height');
		this.$divPopup.css(aniFrom).animate(aniTo, this.options.animatePopupDuration[0], this.options.animatePopupEasing[0], function() {
			self.$divPopup.css(cssRestore);
			if(!isConcrete)
				self.$divPopup.removeClass('dp2ems-concrete-height');
			
			self.fixCheckboxesWrapperHeight();
			self.$divPopup.data('opening', 0);
			//"dequeue" close task
			if(self.$divPopup.data('to_close')) {
				self.$divPopup.data('to_close', 0);
				setTimeout(function() {
					self.closePopup();
				}, 1);
			}
		});
	} else {
		self.fixCheckboxesWrapperHeight();
	}
};

dp2ems.prototype.closePopup = function(animate) {
	var canClose = this.isPopupOpened() && !this.$divPopup.data('opening') && !this.$divPopup.data('closing');
	//"queue" close task
	if(this.$divPopup.data('opening'))
		this.$divPopup.data('to_close', 1);
	if(!canClose)
		return;
	var self = this;
	
	var aniTo = {
		width: dp2ems.getFullWidth(this.$divSel),
		height: dp2ems.getFullHeight(this.$divSel),
		opacity: 0,
	};
	var cssRestore = {
		width: (this.options.divPopupWidth ? this.options.divPopupWidth : ''),
		height: (this.options.divPopupHeight ? this.options.divPopupHeight : ''),
		opacity: this.$divPopup.css('opacity'),
	};
	var aniFrom = {
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
	
	if(animate === undefined && this.options.animatePopupDuration[1] > 0 || animate == true) {
		self.$divPopup.data('closing', 1);
		var isConcrete = this.$divPopup.hasClass('dp2ems-concrete-height');
		if(!isConcrete)
			this.$divPopup.addClass('dp2ems-concrete-height');
		this.$divPopup.css(aniFrom).animate(aniTo, this.options.animatePopupDuration[1], this.options.animatePopupEasing[1], function() {
			self.$divPopup.css(cssRestore);
			if(!isConcrete)
				self.$divPopup.removeClass('dp2ems-concrete-height');
			self.$divPopup.addClass('hidden');
			self.$divPopup.data('closing', 0);
			//"dequeue" open task
			if(self.$divPopup.data('to_open')) {
				self.$divPopup.data('to_open', 0);
				setTimeout(function() {
					self.openPopup();
				}, 1);
			}
		});
	} else {
		this.$divPopup.addClass('hidden');
	}
};

dp2ems.prototype.isPopupOpened = function() {
	return !this.$divPopup.hasClass('hidden');
};

//render
//
dp2ems.prototype.convertSelectOnce = function() {
	if(dp2ems.isInited(this.$sel))
		return false;
	var self = this;
	
	//replace original <select> with new sel & popup divs
	this.$sel.hide();
	this.$sel.wrap(this.htmlForWrapper());
	
	this._allowZeroSelection();
	
	this.$divSel = jQuery(this.htmlForSel());
	this.$divPopup = jQuery(this.htmlForPopup());
	this.$divSel.insertAfter(this.$sel);
	this.$divPopup.insertAfter(this.$divSel);
	
	//create references to html elements we need
	this.$divSel.$span = this.$divSel.find('span');
	this.$divPopup.$close = this.$divPopup.find('.dp2ems-close');
	this.$divPopup.$head = this.$divPopup.find('.dp2ems-head');
	this.$divPopup.$search = this.$divPopup.find('.dp2ems-search');
	this.$divPopup.$ctrls = this.$divPopup.find('.dp2ems-ctrls');
	this.$divPopup.$ctrlPages = this.$divPopup.find('.dp2ems-ctrls-pag');
	this.$divPopup.$ctrlClearAll = this.$divPopup.find('.dp2ems-ctrl-clear-all');
	this.$divPopup.$ctrlShowSelection = this.$divPopup.find('.dp2ems-ctrl-show-selection');
	this.$divPopup.$ctrlGotoSelection = this.$divPopup.find('.dp2ems-ctrl-goto-selection');
	this.$divPopup.$ctrlSaveSelection = this.$divPopup.find('.dp2ems-ctrl-save-selection');
	this.$divPopup.$btnLeft = this.$divPopup.find('.dp2ems-btn-left');
	this.$divPopup.$btnRight = this.$divPopup.find('.dp2ems-btn-right');
	this.$divPopup.$body = this.$divPopup.find(".dp2ems-body");
	this.$divPopup.$msg = this.$divPopup.find(".dp2ems-msg");
	this.$divPopup.$msgSpan = this.$divPopup.find(".dp2ems-msg span");
	this.$divPopup.$index = this.$divPopup.find(".dp2ems-index");
	this.$divPopup.$indexChars = function() { return self.$divPopup.$index.find('.dp2ems-char') };
	this.$divPopup.$checkboxes = function() { return self.$divPopup.$body.find("input[type=checkbox], input[type=radio]") };
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
	
	//Enable tabindexes
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
	if(this.options.autoWidth) {
		this.$divSel.addClass('dp2ems-select-auto-width');
		this.$divPopup.addClass('dp2ems-popup-auto-width');
	}
	if(this.options.divSelWidth)
		this.$divSel.css('width', parseInt(this.options.divSelWidth));
	if(this.options.divSelHeight)
		this.$divSel.css('height', parseInt(this.options.divSelHeight));
	if(this.options.divSelPaddingLeft) {
		setTimeout(function() {
			self.$divSel.css('padding-left', parseInt(self.options.divSelPaddingLeft));
			self.$divSel.css('padding-right', parseInt(self.options.divSelPaddingLeft) + dp2ems.getFullWidth(self.$divSel.find('.cuselFrameRight')) - 8);
		}, 5);
	}
	if(this.options.divSelIsMultiline)
		this.$divSel.addClass('dp2ems-select-multiline');
	if(this.options.divSelClasses)
		this.$divSel.addClass(this.options.divSelClasses);
	if(this.options.divPopupWidth)
		this.$divPopup.css('width', parseInt(this.options.divPopupWidth));
	if(this.options.divPopupHeight) {
		this.$divPopup.addClass('dp2ems-concrete-height');
		this.$divPopup.css('height', parseInt(this.options.divPopupHeight));
	}
	if(this.options.divPopupClasses)
		this.$divPopup.addClass(this.options.divPopupClasses);
};

dp2ems.prototype.renderPage = function(page) {
	this.$divPopup.$btnLeft.toggleClass('disabled', !(page != -1 && page > 0));
	this.$divPopup.$btnRight.toggleClass('disabled', !(page != -1 && page < (this.getPages() - 1)));
	this.$divPopup.$ctrlPages.toggle( this.getPages() > 1 && !this.isFullExtView() );
	this.$divPopup.$ctrls.toggle( this.$divPopup.$ctrls.find('> .dp2ems-ctrl').filter(function() { return $(this).css("display") != "none" }).length > 0 );
	
	//todo: effects
	var tmp = this.htmlForPage(page);
	this.$divPopup.$body.html(tmp.html);
	this.$divPopup.$msgSpan.html(tmp.msg);
	this.$divPopup.$msg.toggleClass('visible', tmp.msg != '');
	
	//Customize checkboxes
	var $checkboxes = this.$divPopup.$checkboxes();
	$checkboxes.filter(':not(.prch2-hidden)').prettyCheckboxes2();
	//Enable tabindexes
	if(this.options.areInnerCtrlsFocuable)
		$checkboxes.filter('.prch2-hidden').next('label').next('.prch2-label').attr('tabindex', this.options.areInnerCtrlsFocuable ? 0 : -1);
	
	this.fixCheckboxesWrapperHeight();
};

dp2ems.prototype.renderValStr = function(str) {
	this.$divSel.$span.text(str);
};

dp2ems.prototype.renderFirstChars = function() {
	var html = this.htmlForFirstChars();
	this.$divPopup.$index.html(html);
	//Enable tabindexes
	var $indexChars = this.$divPopup.$indexChars();
	if(this.options.areInnerCtrlsFocuable)
		$indexChars.attr('tabindex', this.options.areInnerCtrlsFocuable ? 0 : -1);
};

//upd html after *
//
/**
 * If on new page there are less options than on old one, popup height will normally decrease - we don't want that, so fix!
 */
dp2ems.prototype.fixCheckboxesWrapperHeight = function() {
	var self = this;
	if(this.$divPopup.hasClass('dp2ems-concrete-height')) {
	} else {
		var $divToRender = self.$divPopup.$body;
		var h = parseInt($divToRender.height());
		var minh = parseInt($divToRender.css('min-height'));
		var _minh = parseInt($divToRender.data('_min-height'));
		if(isNaN(_minh)) _minh = 0;
		if(isNaN(minh)) minh = 0;
		if(self.getSearchedCnt() == 0 && self.$divPopup.$msg.hasClass('visible')) {
			var msgH = dp2ems.getFullHeight(self.$divPopup.$msg);
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
			if(!minh || h > minh)
				$divToRender.css('min-height', h+'px');
		}
	}
};

dp2ems.prototype.updHtmlAfterFilterChange = function() {
	var self = this;
	this.$divPopup.$ctrlShowSelection.toggleClass('selected', this.fitlerBySel);
	this.$divPopup.$indexChars().each(function(ind, el) {
		var ch = jQuery(el).attr('fChar');
		jQuery(el).toggleClass('selected', (ch == '' ? self.isNoFilter() : self.filterFChar == ch));
	});
	if(this.$divPopup.$search.val() != this.filterStr)
		this.$divPopup.$search.val(this.filterStr);
};

dp2ems.prototype.updHtmlAfterSingleChanged = function($chkbx) {
	var $inputToUncheck = this.$divPopup.$body.find("input"+(this.selectedItemsInds.length ? "[realind!="+this.selectedItemsInds[0]+"]" : "")+":checked").not($chkbx);
	$inputToUncheck.prop('checked', false).trigger('change');
};

dp2ems.prototype.updHtmlAfterAllSelectedChanged = function($chkbx) {
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

dp2ems.prototype.updHtmlAfterUpdateItems = function() {
	var classAreaPopup = (this.isFullExtView() ? 'dp2ems-popup-ext' : (this.isCompactExtView() ? 'dp2ems-popup-comp' : 'dp2ems-popup-norm'));
	this.$divPopup.removeClass('dp2ems-popup-ext');
	this.$divPopup.removeClass('dp2ems-popup-comp');
	this.$divPopup.removeClass('dp2ems-popup-norm');
	this.$divPopup.addClass(classAreaPopup);
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
	
	var textClearAll = 		this.options.ctrlClearAll instanceof Array		? this.options.ctrlClearAll[this.isMultiple ? 0 : 1]		: this.options.ctrlClearAll;
	var textShowSelection =	this.options.ctrlShowSelection instanceof Array	? this.options.ctrlShowSelection[this.isMultiple ? 0 : 1]	: this.options.ctrlShowSelection;
	var textGotoSelection =	this.options.ctrlGotoSelection instanceof Array ? this.options.ctrlGotoSelection[this.isMultiple ? 0 : 1]	: this.options.ctrlGotoSelection;
	var textSaveSelection =	this.options.ctrlSaveSelection instanceof Array ? this.options.ctrlSaveSelection[this.isMultiple ? 0 : 1]	: this.options.ctrlSaveSelection;
	
	var divPopupHtml = '';
	divPopupHtml += "<div class='hidden dp2ems-popup " + classAreaPopup + (this.isMultiple ? "" : " dp2ems-popup-single") + "'>";
		divPopupHtml += "<div class='dp2ems-close'>";
		divPopupHtml += "</div>";
		divPopupHtml += "<div class='dp2ems-head'>";
			divPopupHtml += "<input class='dp2ems-search' type='text' placeholder='" + this.options.inputPlaceholder + "'/>";
			divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-left'></div>";
			divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-right'></div>";
		divPopupHtml += "</div>";
		divPopupHtml += "<div class='dp2ems-msg'><span></span></div>";
		divPopupHtml += "<div class='dp2ems-body " + (this.options.gridDirectionHorizontal || this.options.useRowsStyleForVerticalDirection ? 'dp2ems-body-dir-horz' : 'dp2ems-body-dir-vert') + " dp2ems-body-cols-" + this.options.gridColumns + " dp2ems-body-rows-" + this.options.gridRows + "'>";
			//... look at this.doRenderPage(page)
		divPopupHtml += "</div>";
		divPopupHtml += "<div class='dp2ems-ctrls'>";
			divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrls-pag'>";
				divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-left'></div>";
				divPopupHtml += "<div class='dp2ems-btn dp2ems-btn-right'></div>";
				divPopupHtml += "<div class='dp2ems-clr'></div>";
			divPopupHtml += "</div>";
			divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-clear-all'>" + textClearAll + "</div>";
			if(this.isMultiple && !this.options.hideShowSelectionControl)
				divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-show-selection'>" + textShowSelection + "</div>";
			if(!this.isMultiple)
				divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-goto-selection'>" + textGotoSelection + "</div>";
			divPopupHtml += "<div class='dp2ems-ctrl-space'></div>";
			divPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-save-selection'>" + textSaveSelection + "<div class='cuselFrameRightUp'></div></div>";
		divPopupHtml += "</div>";
		divPopupHtml += "<div class='dp2ems-index'" + ">";
			//... look at this.doRenderFirstChars()
		divPopupHtml += "</div>";
	divPopupHtml += "</div>";
	return divPopupHtml;
}

dp2ems.prototype.htmlForPage = function(page) {
	var msg = '';
	var html = '';
	var rng = this.getItemsRangeForPage(page);
	
	if(this.getFilterMode() == 'search' && this.selectedItems.length >= this.options.maxSelectionLimit && this.options.showSelectedItemsBeforeSearched) {
		msg = this.options.maxSelectionMsg;
	}
	
	if(this.getSearchedCnt() == 0) {
		msg = this.options.noResultsMsg;
	} else if(page == 0 && this.getPages() == 0) {
		if(this.getFilterMode() == 'sel')
			msg = this.options.noSelectionMsg;
		else
			msg = "Empty!";
	} else if(!this.canGoToPage(page)) {
		msg = "Error! Wrong page " + page;
	} else if(rng !== false) {
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
			var html = "<div class='dp2ems-row dp2ems-body-rows-" + self.options.gridRows + "' id='dp2ems-row-" + r + "'>";
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

dp2ems.prototype.htmlForFirstChars = function() {
	var html = '';
	
	var cntAll = this.items.length;
	var fCharAll = '';
	var allName = 'Все';
	html += "<div class='dp2ems-char' fChar='" + fCharAll + "' fCharCnt='" + cntAll + "'>" + allName + "</div>";
	
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
	
	this.syncFromSelect(true);
	
	this.doPrepareHtmlOnce();
	
	this.doSetNoFilter();
	this.doApplyFilterAndRender0();
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
	this.convertSelectOnce();
	
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
		self.doApplyFilterAndRender0();
	});
	this.$divPopup.$ctrlClearAll.click(function() {
		self.doUnselectAllItems();
		self.doSetNoFilter();
		self.doApplyFilterAndRender0();
		if(!self.isMultiple)
			self.doClosePopup();
	});
	this.$divPopup.$ctrlShowSelection.click(function() {
		self.doSetFilterBySelected(! self.fitlerBySel);
		self.doApplyFilterAndRender0();
	});
	this.$divPopup.$ctrlGotoSelection.click(function() {
		self.doSetNoFilter();
		self.doApplyFilter();
		self.doRenderPage(self.getPageForCurrSel());
	});
	this.$divPopup.$ctrlSaveSelection.click(function() {
		self.doClosePopup();
	});
	this.$divPopup.$btnLeft.click(function() {
		if(self.canGoToPage(self.currPage - 1))
			self.doRenderPage(self.currPage - 1);
	});
	this.$divPopup.$btnRight.click(function() {
		if(self.canGoToPage(self.currPage + 1))
			self.doRenderPage(self.currPage + 1);
	});
	
	return true;	
};

//sync from original <select> if has been updated
//
dp2ems.prototype.doUpdateItems = function() {
	this.syncFromSelect(false);
	
	this.updHtmlAfterUpdateItems();
	
	this.doSetNoFilter();
	this.doApplyFilter();
	this.doRenderPage(this.getPageForCurrSel());
	this.doRenderFirstChars();
	this.doRenderValStr();
};

//open, close
//
dp2ems.prototype.doOpenPopup = function() {
	dp2ems.closeAppPopups();
	this.openPopup();
};
dp2ems.prototype.doClosePopup = function() {
	this.closePopup();
};
dp2ems.prototype.doTogglePopup = function() {
	if(!this.isPopupOpened())
		this.doOpenPopup();
	else
		this.doClosePopup();
};
dp2ems.closeAppPopups = function() {
	for(var selId in dp2ems._instances) if (dp2ems._instances.hasOwnProperty(selId)) {
		var inst = dp2ems._instances[selId];
		inst.doClosePopup();
	}
};

//render
//
dp2ems.prototype.doRenderPage = function(page) {
	var self = this;
	this.currPage = page;
	
	//render
	this.renderPage(page);
	
	//press enter == click
	if(this.options.areInnerCtrlsFocuable)
		this.$divPopup.$checkboxes().filter('.prch2-hidden').next('label').next('.prch2-label').keypress(function(e) {
			if(e.which == 13 || e.keyCode == 13) {
				$(this).click();
			}
		});
	
	//attach events
	this.$divPopup.$checkboxes().each(function(ind, el) {
		jQuery(el).change(function() {
			var info = self.$divPopup.getCheckboxInfo(jQuery(this));
			self.onSelectItem(info, jQuery(this));			
		});
	});
};

dp2ems.prototype.doRenderValStr = function() {
	this.renderValStr(this.valStr);
};

dp2ems.prototype.doRenderFirstChars = function() {
	if(this.isFullExtView()) {
		var self = this;
		//render
		this.renderFirstChars();
		this.updHtmlAfterFilterChange();
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
				self.doApplyFilterAndRender0();
			});
		});
	}
};

//filters
//
dp2ems.prototype.doSetFilterByFirstChar = function(gr) {
	this.setFilterByFirstChar(gr);
	this.updHtmlAfterFilterChange();
};
dp2ems.prototype.doSetFilterBySelected = function(sel) {
	this.setFilterBySelected(sel);
	this.updHtmlAfterFilterChange();
};
dp2ems.prototype.doSetFilterBySearchString = function(str) {
	this.setFilterBySearchString(str);
	this.updHtmlAfterFilterChange();
};
dp2ems.prototype.doSetNoFilter = function() {
	this.setNoFilter();
	this.updHtmlAfterFilterChange();
};

dp2ems.prototype.doApplyFilter = function() {
	var mode = this.getFilterMode();
	if(mode == 'sel') {
		this.filterItemsBySelected();
	} else if(mode == 'fchar') {
		this.filterItemsByFirstChar(this.filterFChar);
	} else if(mode == 'search') {
		this.filterItemsBySearchString(this.filterStr);
	} else if(mode == '') {
		this.filterItemsByNone();
	}
};

dp2ems.prototype.doApplyFilterAndRender0 = function() {
	this.doApplyFilter();
	this.doRenderPage(0);
};

//selection
//
dp2ems.prototype.onSelectItem = function(info, $chkbx) {
	var ch_stat = this.selectItem(info);
	if(ch_stat > 0 && !this.isMultiple) {
		this.updHtmlAfterSingleChanged($chkbx);
	}
	if(ch_stat == 2) {
		this.updHtmlAfterAllSelectedChanged($chkbx);
	}
	if(ch_stat > 0) {
		this.onSelectionChanged();
	}
	if(!this.isMultiple)
		this.doClosePopup();
};

dp2ems.prototype.onSelectionChanged = function() {
	if(this.getFilterMode() == 'sel') {
		this.filterItemsBySelected();
		var page = this.currPage;
		if(!this.canGoToPage(page)) {
			if(this.getPages() == 0)
				page = 0;
			else if(page > this.getPages())
				page = this.getPages() - 1;
			else
				page = 0;
		}
		this.doRenderPage(page);
	}
	
	this.valStr = this.selectedItemsToStr(this.selectedItems, this.areAllSelected);
	this.doRenderValStr();
	this.syncToSelect(true);
	
	if(this.getFilterMode() == 'search' && this.options.flushSearchStringAfterSelection) {
		this.doSetFilterBySearchString('');
		this.doApplyFilterAndRender0();
		this.$divPopup.$search.focus();
	}
};

dp2ems.prototype.doUnselectAllItems = function() {
	var oldAreAllSelected = this.areAllSelected;
	this.areAllSelected = true;
	if(oldAreAllSelected != this.areAllSelected) {
		this.updAreAllSelected();
		this.updHtmlAfterAllSelectedChanged();
		this.onSelectionChanged();
	}
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


/**
 * TODO:
 * - размеры select/popup в options, передача кастомных классов popup и select в options
 * - показ popup по hover/click
 * - single-select вариант
 * - показывать номера страниц (в виде точек); перелистывать страницы с анимацией
 
 * .. глянуть showSelectedItemsBeforeSearched - если фигня, написать что это legacy для dp2.ua
 *   проверить, что вертик. направление работает вместе с отображением выбранных
 * .. -wide сделать в настройках как кстомный класс, в .css мне он нах не нужен
 * .. iscompact - определять по кол-ву страниц до 3 (options) или жестко, 
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
	this.$divAreaPopup = jQuery();
	
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
	this.allStr = '';
	
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
		this.initOnce();
		
		dp2ems._instances[this.selId] = this;
		
		return this;
	};
	
	return this.ctor(s, options);
}

// ------------------------ Options

dp2ems.defaultOptions = {
	'anyVal': 'a-n-y',
	'hideAny': false,
	'hideShowSelectionControl': false,
	'flushSearchStringAfterSelection': false,
	'showSelectedItemsBeforeSearched': false,
	'gridRows': 5,
	'gridColumns': 3,
	'maxSelectionLimit': 3*5,
	'isWide': false,
	'isCompact': false,
	//1 - заполнять список слева направо, 0 - сверху вниз
	'gridDirectionHorizontal': true,
	//1 - чтобы все элементы в одной строке были на одном уровне по горизонтали при заполнении сверху вниз
	'useRowsStyleForVerticalDirection': true,
	
	//
	//strings:
	//
	
	//текст для случая, когда выбраны элементы, берется таким образом: 
	//если есть this.allStr, то берем его, 
	//иначе если список содержит any-элемент (см. anyVal), то берем его текст,
	//иначе берем allStrDefault
	'allStrDefault': 'Все',
	//только для hideAny == 1
	'noSelectionMsg': 'Нет выбранных элементов',
	'noResultsMsg': 'Не найдено, измените, пожалуйста, параметры поиска',
	'inputPlaceholder': 'Введите название',
	'cntFmt': '{cnt} {cnt_name}',
	'cntNames': ['значение', 'значения', 'значений'],
	//если установить 2, то при выбранных 3+ значениях отображается кол-во значений, 1-2 - их список, 0 - см. this.allStr;
	//если установить -1 - всегда список
	'maxCntYoShowFullVal': 3,
	//только для showSelectedItemsBeforeSearched==1
	'maxSelectionMsg': 'Количество выбранных Вами элементов достигло максимального значения.<br>Сохраните, пожалуйста, Ваш выбор',
};
dp2ems.optionsBySelClass = {
};
dp2ems.optionsBySelId = {
};

// ------------------------ Static stuff

dp2ems._instances = {};

dp2ems.getInstance = function(selId) {
	var inst = dp2ems._instances[selId];
	if(inst === undefined)
		inst = null;
	return inst;
};

dp2ems.canInit = function($sel) {
	var selId = $sel.attr('id');
	var ok = (selId && jQuery('#'+selId).length == 1 && $sel.is('select[multiple=multiple]'));
	return ok;
};

dp2ems.isInited = function($sel) {
	var $divSel = $sel.next();
	var $divEms = $sel.next().next();
	var is = $sel.is(':hidden') && $divSel.is('.dp2ems-select') && $divEms.is('.dp2ems-popup');
	return is;
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

// ------------------------ Model - sync

/**
 * Build human string representing current selection
 */
dp2ems.prototype.selectedItemsToStr = function(arr, areAll) {
	var val = '';
	if(arr.length == 0 || areAll)
		val = (this.allStr != '' ? this.allStr : this.options.allStrDefault);
	else if(this.options.maxCntYoShowFullVal >= 0 && arr.length > this.options.maxCntYoShowFullVal)
		val = this.options.cntFmt.replace('{cnt}', arr.length).replace('{cnt_name}', dp2ems.localizeCntName(arr.length, this.options.cntNames));
	else
		val = arr.join(', ');
	return val;
};

/**
 * Load model from original <select>
 */
dp2ems.prototype.getOptsFromSelect = function() {
	var opts = [];
	var $optns = this.$sel.find("option");
	var self = this;
	var areAll = false;
	$optns.each(function(ind, el) {
		var $el = jQuery(el);
		var text = $el.text();
		var val = $el.attr('value');
		var isAny = (val == self.options.anyVal);
		var isSelected = ($el.attr('selected') == 'selected');
		if(isAny) {
			areAll = isSelected;
			isSelected = false; //не отмечать a-n-y в opts! (чтобы не попадало в this.selectedItemsInds)
		}
		var opt = [
			text,
			isSelected,
			isAny,
			-1
		];
		if(isAny && self.options.hideAny)
			self.anyOpt = opt; //храним a-n-y отдельно
		else {
			opt[3] = opts.length;
			opts.push(opt);
		}
	});
	return {'opts': opts, 'areAll': areAll};
};

/**
 * Sync model from original <select>
 */
dp2ems.prototype.syncFromSelect = function() {
	//sync items
	var tmp = this.getOptsFromSelect();
	this.opts = tmp.opts;
	this.areAllSelected = tmp.areAll;
	this.items = [];
	this.selectedItems = [];
	this.selectedItemsInds = [];
	//this.visibleItems = false; //TIP: будет сделано потом в setNoFilter()
	//this.visibleItemsInds = false;
	this.firstChars = [];
	for(var i = 0 ; i < this.opts.length ; i++) {
		var opt = this.opts[i];
		if(opt[2]) {
			this.anyItemInd = i;
			if(this.allStr == '')
				this.allStr = opt[0];
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
	
	this.valStr = this.selectedItemsToStr(this.selectedItems, this.areAllSelected);
};

/**
 * Sync model to original <select>
 *
 * lite == 1 - сверять только флаги selected, lite == 0 - сверять также все элементы и их порядок
 */
dp2ems.prototype.syncToSelect = function(lite) {
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
		var isSelected = ($el.attr('selected') == 'selected');
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
				$optns.splice(tmp[i], 1); //tmp[i] - старое место
				$optns.splice(i, 0, $opt); //i - новое место
				for(var j = 0 ; j < this.items.length ; j++) {
					//перемещение в общем виде (тут только move up):
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
};

// ------------------------ Model - filtering

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

// ------------------------ Model - changings

dp2ems.prototype.selectItem = function(ind, text, isSel) {
	var changed = false;
	var oldAreAllSelected = this.areAllSelected;
	if(ind == this.anyItemInd) {
		if(!isSel && this.selectedItems.length == 0)
			isSel = true; //если ничего не выбрано, значит выбрано все
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
	if(oldAreAllSelected != this.areAllSelected || ind == this.anyItemInd) //если кликнул на 'Все', надо вернуть отметку, т.к. убирать ее не надо
		ch_stat = 2; 
	else if(changed)
		ch_stat = 1;
	return ch_stat;
};

dp2ems.prototype.updAreAllSelected = function() {
	var tmp = true; //флаг - выбраны ли все элементы по отдельности (а не галочкой 'Все')
	var tmp2 = false; //флаг - выбран ли хоть один
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

// ------------------------ Model - getting slices

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

// ------------------------ View

dp2ems.prototype.isExtView = function() {
	return this.getTotalPages() > 1;
};
dp2ems.prototype.isCompactExtView = function() {
	return this.options.isCompact && this.isExtView();
};
dp2ems.prototype.isFullExtView = function() {
	return !this.options.isCompact && this.isExtView();
};
dp2ems.prototype.isWideView = function() {
	return this.options.isWide;
};

/**
 * Если на новой странице элементов меньше, чем на старой, то высота popup-а уменьшится, что может быть проблемой
 */
dp2ems.prototype.fixCheckboxesWrapperHeight = function() {
	var self = this;
	setTimeout(function() {
		var $divToRender = self.$divAreaPopup.find(".dp2ems-body");
		var h = parseInt($divToRender.height());
		var minh = parseInt($divToRender.css('min-height'));
		if(!minh || h > minh)
			$divToRender.css('min-height', h+'px');
	}, 1);
};

dp2ems.prototype.updHtmlAfterFilterChange = function() {
	var self = this;
	this.$divAreaPopup.find('.dp2ems-ctrl-show-selection').toggleClass('selected', this.fitlerBySel);
	this.$divAreaPopup.find(".dp2ems-index .dp2ems-char").each(function(ind, el) {
		var ch = jQuery(el).attr('fChar');
		jQuery(el).toggleClass('selected', (ch == '' ? self.isNoFilter() : self.filterFChar == ch));
	});
	if(this.$divAreaPopup.find('.dp2ems-search').val() != this.filterStr)
		this.$divAreaPopup.find('.dp2ems-search').val(this.filterStr);
};

dp2ems.prototype.updHtmlAfterAllSelectedChanged = function() {
	if(this.areAllSelected) {
		//если не выбрано ни одного элемента, поставить только 1 галку 'Все'
		this.$divAreaPopup.find(".dp2ems-body label:not(.dp2ems-label-any).checked").removeClass("checked");
		this.$divAreaPopup.find(".dp2ems-body input:not(.dp2ems-checkbox-any):checked").prop('checked', false);
		this.$divAreaPopup.find(".dp2ems-body label.dp2ems-label-any").addClass("checked");
		this.$divAreaPopup.find(".dp2ems-body input.dp2ems-checkbox-any").prop('checked', true);
	} else {
		//если выбран хоть 1 элемент, снять галку с 'Все'
		this.$divAreaPopup.find(".dp2ems-body label.dp2ems-label-any").removeClass("checked");
		this.$divAreaPopup.find(".dp2ems-body input.dp2ems-checkbox-any").prop('checked', false);
	}
};

dp2ems.prototype.updHtmlAfterUpdateItems = function() {
	var classAreaPopup = (this.isFullExtView() ? 'dp2ems-popup-ext' : (this.isCompactExtView() ? 'dp2ems-popup-comp' : 'dp2ems-popup-norm'));
	var classAreaPopup2 = (this.isWideView() ? 'dp2ems-popup-wide' : '');
	this.$divAreaPopup.removeClass('dp2ems-popup-ext');
	this.$divAreaPopup.removeClass('dp2ems-popup-comp');
	this.$divAreaPopup.removeClass('dp2ems-popup-norm');
	this.$divAreaPopup.removeClass('dp2ems-popup-wide');
	this.$divAreaPopup.addClass(classAreaPopup);
	if(classAreaPopup2)
		this.$divAreaPopup.addClass(classAreaPopup2);
}

// ------------------------ View - rendering

dp2ems.prototype.getSelHtml = function(page) {
	var divSelHtml = "<div class='dp2ems-select'><span>" + this.valStr + "</span><div class='cuselFrameRight'></div></div>";
	return divSelHtml;
};

dp2ems.prototype.getPopupHtml = function(page) {
	var classAreaPopup = (this.isFullExtView() ? 'dp2ems-popup-ext' : (this.isCompactExtView() ? 'dp2ems-popup-comp' : 'dp2ems-popup-norm'));
	var classAreaPopup2 = (this.isWideView() ? 'dp2ems-popup-wide' : '');
	var textClearAll = "Сбросить все";
	var textShowSelection = "Показать выбранные";
	var textSaveSelection = "Сохранить";
	var divAreaPopupHtml = '';
	divAreaPopupHtml += "<div class='dp2ems-popup " + classAreaPopup + " " + classAreaPopup2 + "'>";
		divAreaPopupHtml += "<div class='dp2ems-head'>";
			divAreaPopupHtml += "<input class='dp2ems-search' type='text' placeholder='" + this.options.inputPlaceholder + "'/>";
			divAreaPopupHtml += "<div class='dp2ems-btn dp2ems-btn-left'></div>";
			divAreaPopupHtml += "<div class='dp2ems-btn dp2ems-btn-right'></div>";
		divAreaPopupHtml += "</div>";
		divAreaPopupHtml += "<div class='dp2ems-msg'><span></span></div>";
		divAreaPopupHtml += "<div class='dp2ems-body " + (this.options.gridDirectionHorizontal || this.options.useRowsStyleForVerticalDirection ? 'dp2ems-body-dir-horz' : 'dp2ems-body-dir-vert') + " dp2ems-body-cols-" + this.options.gridColumns + " dp2ems-body-rows-" + this.options.gridRows + "'>";
			//... look at this.renderPage(page)
		divAreaPopupHtml += "</div>";
		divAreaPopupHtml += "<div class='dp2ems-ctrls'>";
			divAreaPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrls-pag'>";
				divAreaPopupHtml += "<div class='dp2ems-btn dp2ems-btn-left'></div>";
				divAreaPopupHtml += "<div class='dp2ems-btn dp2ems-btn-right'></div>";
				divAreaPopupHtml += "<div class='dp2ems-clr'></div>";
			divAreaPopupHtml += "</div>";
			divAreaPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-clear-all'>" + textClearAll + "</div>";
			if(!this.options.hideShowSelectionControl)
				divAreaPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-show-selection'>" + textShowSelection + "</div>";
			divAreaPopupHtml += "<div class='dp2ems-ctrl-space'></div>";
			divAreaPopupHtml += "<div class='dp2ems-ctrl dp2ems-ctrl-link dp2ems-ctrl-save-selection'>" + textSaveSelection + "<div class='cuselFrameRightUp'></div></div>";
		divAreaPopupHtml += "</div>";
		divAreaPopupHtml += "<div class='dp2ems-index'" + ">";
			//... look at this.renderFirstChars()
		divAreaPopupHtml += "</div>";
	divAreaPopupHtml += "</div>";
	return divAreaPopupHtml;
}

dp2ems.prototype.getPageHtml = function(page) {
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
			var text = opt[0];
			var checked = opt[2] ? self.areAllSelected : opt[1];
			html += "<div class='dp2ems-el'>";
				html += "<input type='checkbox' class='" + (opt[2] ? "dp2ems-checkbox-any" : "") + "' realInd='" + realInd + "' name='" + id + "' id='" + id + "' " + (checked ? " checked" : "") + ">";
				html += "<label for='" + id + "' class='" + (opt[2] ? "dp2ems-label-any" : "") + "'><span class='prettyCheckboxText'>" + text + "</span></label>";
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

dp2ems.prototype.getFirstCharsHtml = function() {
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

// ------------------------ Controller

//init
dp2ems.prototype.initOnce = function() {
	if(dp2ems.isInited(this.$sel))
		return false;
	
	this.syncFromSelect();
	
	this.prepareHtmlOnce();
	
	this.doSetNoFilter();
	this.applyFilterAndRender0();
	this.renderFirstChars();
	this.renderValStr();
};

dp2ems.prototype.prepareHtmlOnce = function() {
	if(dp2ems.isInited(this.$sel))
		return false;
	
	//replace original <select> with new sel & popup divs
	this.$sel.hide();
	this.$divSel = jQuery(this.getSelHtml());
	this.$divAreaPopup = jQuery(this.getPopupHtml());
	this.$divSel.insertAfter(this.$sel);
	this.$divAreaPopup.insertAfter(this.$divSel);
	
	//attach events
	var self = this;
	this.$divSel.mouseenter(function(){
		self.openPopup();
	});
	this.$divAreaPopup.mouseleave(function(){
		self.closePopup();
	});
	this.$divAreaPopup.find('.dp2ems-search').bind('input', function(e) {
		var text = e.target.value;
		self.doSetFilterBySearchString(text);
		self.applyFilterAndRender0();
	});
	this.$divAreaPopup.find('.dp2ems-ctrl-clear-all').click(function() {
		self.doUnselectAllItems();
		//self.doSetNoFilter(); //нет в ТЗ, но было бы логично
		self.applyFilterAndRender0();
	});
	this.$divAreaPopup.find('.dp2ems-ctrl-show-selection').click(function() {
		self.doSetFilterBySelected(! self.fitlerBySel);
		self.applyFilterAndRender0();
	});
	this.$divAreaPopup.find('.dp2ems-ctrl-save-selection').click(function() {
		self.closePopup();
	});
	this.$divAreaPopup.find('.dp2ems-btn-left').click(function() {
		if(self.canGoToPage(self.currPage - 1))
			self.renderPage(self.currPage - 1);
	});
	this.$divAreaPopup.find('.dp2ems-btn-right').click(function() {
		if(self.canGoToPage(self.currPage + 1))
			self.renderPage(self.currPage + 1);
	});
	
	return true;	
};

//sync from original <select> if has been updated
dp2ems.prototype.doUpdateItems = function() {
	this.syncFromSelect();
	
	this.updHtmlAfterUpdateItems();
	
	this.doSetNoFilter();
	this.applyFilterAndRender0();
	this.renderFirstChars();
	this.renderValStr();
};

//open, close
dp2ems.prototype.openPopup = function(page) {
	dp2ems.closeAppPopups();
	this.$divAreaPopup.css('display', 'block');
	this.fixCheckboxesWrapperHeight();
};
dp2ems.prototype.closePopup = function(page) {
	this.$divAreaPopup.css('display', 'none');
};
dp2ems.prototype.isPopupOpened = function(page) {
	return this.$divAreaPopup.is(':visible');
};
dp2ems.closeAppPopups = function(page) {
	for(var selId in dp2ems._instances) if (dp2ems._instances.hasOwnProperty(selId)) {
		var inst = dp2ems._instances[selId];
		inst.closePopup();
	}
};

//render
dp2ems.prototype.renderPage = function(page) {
	var $divToRender = this.$divAreaPopup.find(".dp2ems-body");
	var $divToRenderMsg = this.$divAreaPopup.find(".dp2ems-msg");
	var $spanToRenderMsg = this.$divAreaPopup.find(".dp2ems-msg span");
	
	this.currPage = page;
	this.$divAreaPopup.find('.dp2ems-btn-left').toggleClass('disabled', !(this.currPage != -1 && this.currPage > 0));
	this.$divAreaPopup.find('.dp2ems-btn-right').toggleClass('disabled', !(this.currPage != -1 && this.currPage < (this.getPages() - 1)));
	
	var tmp = this.getPageHtml(page);
	$divToRender.html(tmp.html);
	$spanToRenderMsg.html(tmp.msg);
	$divToRenderMsg.toggleClass('visible', tmp.msg != '');
	
	this.fixCheckboxesWrapperHeight();
	
	//attach events (& skin)
	var $checkboxes = $divToRender.find("input[type='checkbox']");
	$checkboxes.filter(':not(.hiddenCheckbox)').prettyCheckboxes();
	var self = this;
	$checkboxes.each(function(ind, el) {
		jQuery(el).change(function() {
			var text = jQuery(this).next('label').text();
			var ind = parseInt(jQuery(this).attr('realInd'));
			var isSel = jQuery(this).is(':checked');
			var isAny = jQuery(this).is('.dp2ems-checkbox-any');
			
			self.onSelectItem(ind, text, isSel);			
		});
	});
};

dp2ems.prototype.renderValStr = function() {
	var $span = this.$divSel.find('span');
	$span.text(this.valStr);
};

dp2ems.prototype.renderFirstChars = function() {
	var $divToRender = this.$divAreaPopup.find(".dp2ems-index");
	var html = '';
	
	if(this.isFullExtView()) {
		html = this.getFirstCharsHtml();
		$divToRender.html(html);
		
		//attach events
		var $fChars = $divToRender.find('.dp2ems-char');
		var self = this;
		$fChars.each(function(ind, el) {
			jQuery(el).click(function() {
				var gr = jQuery(this).attr('fChar');
				self.doSetFilterByFirstChar(gr);
				self.applyFilterAndRender0();
			});
		});
		
		this.updHtmlAfterFilterChange();
	}
};

//filters
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

dp2ems.prototype.applyFilterAndRender0 = function() {
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
	
	this.renderPage(0);
};

//selection
dp2ems.prototype.onSelectItem = function(ind, text, isSel) {
	var ch_stat = this.selectItem(ind, text, isSel);
	if(ch_stat == 2) {
		this.updHtmlAfterAllSelectedChanged();
		this.onSelectionChanged();
	} else if(ch_stat == 1) {
		this.onSelectionChanged();
	}
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
		this.renderPage(page);
	}
	
	this.valStr = this.selectedItemsToStr(this.selectedItems, this.areAllSelected);
	this.renderValStr();
	this.syncToSelect(true);
	
	if(this.getFilterMode() == 'search' && this.options.flushSearchStringAfterSelection) {
		this.doSetFilterBySearchString('');
		this.applyFilterAndRender0();
		this.$divAreaPopup.find('.dp2ems-search').focus();
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

//----------------------

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


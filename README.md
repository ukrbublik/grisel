# grisel
<!-- jQuery-based custom select control, represents options as paginated grid, features search and filter by first letter. -->

<b>grisel (GRId_SELect)</b> is a custom multi- or single-select control (over standard &lt;select&gt;).<br>
Represents options as paginated grid.<br>
Features search and filter by first letter.<br>
Customizable. Has cool animations. Useful for big list of options.

<!--
<h3>Screenshot:</h3>
<img src='http://i59.tinypic.com/v7qblx.png'  />
-->

<h3>How it looks:</h3>
<img src='http://fat.gfycat.com/DelightfulPoliteAardwolf.gif'  /><br>

<h3>Getting started:</h3>
1) Include this JS/CSS:
```
<script src="vendor/jquery-1.11.3.js"></script>
<script src="vendor/jquery.easing.1.3.2.js"></script>
<script src="src/js/grisel.js"></script>
<link type="text/css" rel="stylesheet" href="src/css/grisel.css" />
```
2) Add class "grisel" to &lt;select&gt;'s you want to convert.<br>
3) Customize options. Example:
```
<script>
grisel.defaultOptions = jQuery.extend(grisel.defaultOptions, {
	//options to override, see list below
});
grisel.optionsBySelId = {
	's_street': {
		//options to override for select '#s_street' 
	}
};
grisel.optionsBySelClass = {
	//...
};
grisel.defaultLang = 'en';
grisel.defaultStrings = jQuery.extend(grisel.defaultStrings, {
	'en': {
		//default strings in english
	}
});
grisel.stringsBySelId = {
	's_street': {
		'en': {
			//strings for '#s_street' in english
		}
	},
};
grisel.stringsBySelClass = {
	//...
};
</script>
```
Also you can override options for particular &lt;select&gt; by using 'data-*'. Example:
```
<select class="grisel" data-div-popup-width='500'>...</select>
```

<h3>Notes:</h3>
Popup can be in extended view (with search and filter by first char) or compact - see options isExt, minPagesForExt.<br>
Options list can contain special "any"-option, to be able to select all/any values by one click (and send to server), see options anyVal, hideAny.<br>

<h3>Options:</h3>
<table>
<tr><th>Key</th><th>Description</th><th>Default value</th></tr>

<tr><td colspan='3'><b>General</b></td></tr>
<tr><td>gridRows</td><td>Number of options rows in grid</td><td>5</td></tr>
<tr><td>gridColumns</td><td>Number of options columns in grid</td><td>3</td></tr>
<tr><td>minPagesForExt</td><td>If list of options has pages &gt;= this value, popup will be in extended view mode (with search and filter by first char)</td><td>3</td></tr>
<tr><td>isExt</td><td>Show popup in extended view mode?<br>-1 for auto applying extended mode (by option minPagesForExt), 1/0 to force extended mode on/off</td><td>-1</td></tr>
<tr><td>anyVal</td><td>Value attribute of special &lt;oprion&gt; "All values" (or "Any value") (if there is one in options)</td><td>'a-n-y'</td></tr>
<tr><td>hideAny</td><td>Hide special "any"-option?</td><td>false</td></tr>
<tr><td>gridDirectionHorizontal</td><td>How options should be filled in grid?<br>1 - fill items in left-to-right direction (horizontal) (in html group by rows), 0 - up-to-down direction (vertical) (in html group by cols)</td><td>false</td></tr>
<tr><td>useRowsStyleForVerticalDirection</td><td>1 - force group by rows (not cols) in html for vertical direction (to make all elements in one row having equal height)<br>1 is highly recommended (also because of animation problems with cols)</td><td>true</td></tr>
<tr><td>openOnHover</td><td>1 - open popup by hover on selector, 0 - open by click</td><td>false</td></tr>
<tr><td>areInnerCtrlsFocuable</td><td>Add tabindex attribute for all controls (options, inputs, buttons) in popup?</td><td>false</td></tr>
<tr><td>maxCntToShowListAsValStr</td><td>For example. When set to 4: for 5+ selected values selector text will be "X values", for 1-4 - "valA, valB, valC, valD", for 0 - one of allStr/anyStr/allStrDefault.<br>When set to -1: always "X values"</td><td>3</td></tr>

<tr><td colspan='3'><b>Show/hide elements</b></td></tr>
<tr><td>showPagesList</td><td></td><td>true</td></tr>
<tr><td>showSearch</td><td></td><td>true</td></tr>
<tr><td>showIndex</td><td></td><td>true</td></tr>
<tr><td>showControls</td><td></td><td>true</td></tr>
<tr><td>hidePageControlsWhenThereIsPageList</td><td></td><td>true</td></tr>
<tr><td>showCtrlSaveSelection</td><td></td><td>true</td></tr>
<tr><td>showCtrlShowSelection</td><td></td><td>true</td></tr>
<tr><td>showCtrlGotoSelection</td><td></td><td>true</td></tr>
<tr><td>showCtrlClearAll</td><td></td><td>true</td></tr>
<tr><td>showCloseCross</td><td></td><td>true</td></tr>

<tr><td colspan='3'><b>Sizes</b></td></tr>
<tr><td>divSelWidth</td><td>-2 - equal to &lt;select&gt;'s width, -1 - equal to wrapper's width, 0 - auto, &gt; 0 - concrete width</td><td>0</td></tr>
<tr><td>divSelHeight</td><td>-2 - equal to &lt;select&gt;'s height, -1 - equal to wrapper's height, 0 - auto, &gt; 0 - concrete height</td><td>0</td></tr>
<tr><td>divSelPaddingLeft</td><td>Left padding of selector's text, in px</td><td>8</td></tr>
<tr><td>divSelIsMultiline</td><td>Show selector's text as multiline?</td><td>false</td></tr>
<tr><td>divSelClasses</td><td>Optional list of classes for selector divided by ' '</td><td>''</td></tr>
<tr><td>divPopupWidth</td><td>-2 - equal to wrapper's width, -1 - equal to sel's width, 0 - auto, &gt; 0 - concrete width</td><td>0</td></tr>
<tr><td>divPopupHeight</td><td>0 - use css, &gt; 0 - concrete height</td><td>0</td></tr>
<tr><td>divPopupLabelsMinWidth</td><td>For auto popup width - set min checkbox/radio's labels width</td><td>0</td></tr>
<tr><td>divPopupClasses</td><td>Optional list of classes for popup win divided by ' '</td><td>''</td></tr>
<tr><td>divWrapperClasses</td><td>Optional list of classes for selector's wrapper divided by ' '</td><td>''</td></tr>
<tr><td>tryToKeepConstPopupHeight</td><td>When page with long labels appeared, keep new bigger popup height for all other pages</td><td>true</td></tr>
<tr><td>reserveForPopupHeight</td><td>Reserve (once) more height for popup (for case of appearing long labels at next pages), in px</td><td>0</td></tr>

<tr><td colspan='3'><b>Animation</b></td></tr>
<tr><td>animatePopupDuration</td><td>Duration in ms for open & close animations</td><td>[600, 400]</td></tr>
<tr><td>isElasticPopupAnimation</td><td>Is animation elastic for open & close? If yes, some tricks will be applied for smoother animation</td><td>[1, 0]</td></tr>
<tr><td>animatePopupEasing</td><td>Easing function names for open & close animations</td><td>['easeOutElastic', 'easeInOutBack']</td></tr>
<tr><td>animatePageDuration</td><td>Duration of animation of switching pages</td><td>150</td></tr>
<tr><td>animatePageEasing</td><td>Easing function name of animation of switching pages</td><td>'swing'</td></tr>

<tr><td colspan='3'><b>"Legacy" options (made for dom-plus.ua)</b></td></tr>
<tr><td>flushSearchStringAfterSelection</td><td>When using search, clear search string after every selection</td><td>false</td></tr>
<tr><td>showSelectedItemsWhenNoFound</td><td>When using search and no options found, show selected items anyway</td><td>false</td></tr>
<tr><td>showSelectedItemsFirst</td><td>In options list show selected items first, but after "any"-option</td><td>false</td></tr>
<tr><td>maxSelectionLimit</td><td>Only for showSelectedItemsFirst==1. If count of selected items &gt; this value, warning (see string "maxSelectionMsg") will be shown</td><td>0</td></tr>

</table>

<h3>Strings:</h3>
<table>
<tr><th>Key</th><th>Description</th><th>Default value for english</th></tr>
<tr><td>indexAll</td><td>First button in index by first char, which clears filter by first char</td><td>'All'</td></tr>
<tr><td>ctrlSaveSelection</td><td>Button that closes popup, like 'X' at bottom-right</td><td>'Save'</td></tr>
<tr><td>ctrlGotoSelection</td><td>Button to goto page with selected option (for single-select)</td><td>'Go to selected'</td></tr>
<tr><td>ctrlShowSelection</td><td>Button to show only selected options</td><td>'Show selected'</td></tr>
<tr><td>ctrlClearAll</td><td>Button to clear selection. First for multi-select, second for single-select</td><td>['Clear all', 'Clear selection']</td></tr>
<tr><td>allStr</td><td>Selector text when all options are selected, for overriding in 'stringsBySelId', 'stringsBySelClass'</td><td>''</td></tr>
<tr><td>allStrDefault</td><td>Default selector text when all options are selected. First for multi-select, second for single-select</td><td>['All', 'Any']</td></tr>
<tr><td>noSelectionMsg</td><td>Text when no option is selected. Only for option hideAny == 1</td><td>'No selected'</td></tr>
<tr><td>noResultsMsg</td><td>Text when filter gaven't any results</td><td>'Nothing found'</td></tr>
<tr><td>inputPlaceholder</td><td>Placeholder text for search input</td><td>'Enter a name'</td></tr>
<tr><td>cntFmt</td><td>Template to format selector text</td><td>'{cnt} {cnt_name}'</td></tr>
<tr><td>cntNames</td><td>Declensions of word 'value': for english - [singular, plural, plural], for russian - [ед.им., ед.род., мн.род.]</td><td>['value', 'values', 'values']</td></tr>
<tr><td>maxSelectionMsg</td><td>Only for option maxSelectionLimit &gt; 0 ("legacy").<br>Warning text when count of selected items &gt; maxSelectionLimit</td><td>'You reached max number of selected elements.&lt;br&gt;Please save your selection'</td></tr>
</table>

<h3>Examples:</h3>
See demo.html

<h3>Browsers support:</h3>
Requires browser with CSS3 support (for flex).

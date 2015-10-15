# grisel
<!-- jQuery-based custom select control, represents options as paginated grid, features search and filter by first letter. -->

grisel (GRId_SELect) is a custom multi- or single-select control (over standard &lt;select&gt;).
Represents options as paginated grid.
Features search and filter by first letter.
Customizable. Has cool animations. Useful for big list of options.

<!--
<h3>Screenshot:</h3>
<img src='http://i59.tinypic.com/v7qblx.png'  />
-->

<h3>How it looks:</h3>
<img src='http://fat.gfycat.com/DelightfulPoliteAardwolf.gif'  /><br>

<h3>Getting started:</h3>
........ what to include

<h3>Using:</h3>
........ add class 'grisel' to <select>, 'data-' attributes
... what methods are usable, how to update list of options

<h3>Options:</h3>
........ options & langs

<h3>Examples:</h3>
See demo.html

<h3>Browsers support:</h3>
Requires browser with CSS3 support (for flex).

<h3>Changelog:</h3>
<ul>
<li><b>2015-09-24 - v1.0</b></li>
<li><b>2015-09-25 - v1.1</b>
<ul>
<li>More flexible CSS (flex).</li>
<li>Added options gridDirectionHorizontal, useRowsStyleForVerticalDirection.</li>
</ul>
</li>
<li><b>2015-09-26 - v1.2</b>
<ul>
<li>Bug fixes.</li>
<li>Refactoring.</li>
<li>Added ext compact style.</li>
</ul>
</li>
<li><b>2015-10-01 - v2.0</b><br>
<ul>
<li>Now you can open popup on click on selector and close by close btn.</li>
<li>Now grisel is focusable, you can use Tab key to focus on selector, Enter
to open, Esc to close. Popup will autoclose when looses focus.</li>
<li>Added single selection option (zero selection is allowed).</li>
<li>Modified CSS. Now fully flexible popup.</li>
<li>Added animations of open/close popup.</li>
<li>Added many-many options to customize.</li>
<li>Modified demo to present different features of grisel.</li>
</ul>
</li>
<li><b>2015-10-03 - v2.1</b><br>
<ul>
<li>Added pages list (iOS-like dots).</li>
<li>Added animation of changing page.</li>
<li>True flexible popup during animations.</li>
<li>Multi-language support.</li>
<li>Added some options to customize look.</li>
<li>Refactoring: model methods has prefix 'm', view methods - 'v' or
'htmlFor', controller methods - 'do' or 'on'.</li>
</ul>
</li>
<li><b>2015-10-12 - v2.2</b><br>
<ul>
<li>Added many options to customize look. Most important are tryToKeepConstPopupHeight and reserveForPopupHeight.</li>
<li>Proper display of pages with "deficit" of rows.</li>
<li>Options can be set with 'data-*' attributes of &lt;select&gt;.</li>
</ul>
<li><b>2015-10-12 - v2.2.1</b><br>
<ul>
<li>Changed name to grisel.</li>
</ul>
</ul>

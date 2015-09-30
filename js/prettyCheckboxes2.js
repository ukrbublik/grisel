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
			
			$realLabel = $('label[for="'+_id+'"]');
			
			// Create custom labal
			$label = $("<div class='prch2-label'><span class='prch2-holderWrap'><span class='prch2-holder'></span></span><span class='prch2-text'></span></div>").insertAfter($realLabel);
			$label.find('.prch2-text').text( $realLabel.text() );
			if($realLabel.attr('_class'))
				$label.addClass($realLabel.attr('_class'));
			
			// If the checkbox is checked, display it as checked
			if($input.is(':checked'))
				$label.addClass('prch2-checked');
			// Assign the classes on the label
			$label.addClass(settings.className).addClass('prch2-type-'+_type).addClass('prch2-'+settings.display);
			
			// Assign the dimensions to the checkbox display
			$label.find('span.prch2-holderWrap').width(settings.checkboxWidth).height(settings.checkboxHeight);
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
	
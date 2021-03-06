/*jslint white: true vars: true browser: true todo: true */
/*jshint camelcase:true, plusplus:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, maxerr:100, white:false, onevar:false */
/*global jQuery:true $:true */

/* Taken from https://github.com/rootux/jquery-ui-budgetprogressbar */
(function($) {
	"use strict";
	var calculatedProgressMargin = '0em';
	var calculatedProgressWidth = 'calc(100%)';
	
	$.widget("gu.budgetprogressbar", 
	
	{
		
		options: {
			parts: [{value: 0, barClass: "", text: false, textClass: ""}]
		},


		_create: function() {
			var self = this;
			self._createOptionsFromData();
			if(!self._isAnyDataGiven()) {
				return;
			}
			self.element.addClass("budgetprogressbar");
			self.progressRoot = self._createProgressRoot();
			self.progressBottomText = self._createProgressBottomText();
			self.progressHoverBar = self._createProgressHoverBar();
			self.progressRoot.progressbar({value: 0, disabled: self.options.disabled}); // Creates one part with width 0%
			self.progressRoot.addClass("gb-budgetprogressbar");
			self.progressRoot.css('width',calculatedProgressWidth);
			
			self._createPartsFromOptions();
			// Use the part generated by jQuery UI progressbar as template for the other parts
			self._partTemplate = self._getPartElements()[0];
			self._createParts(self.options.parts);
			$.extend(self,{
				created: true
			});
		},

		// The bar will only be initialized if any data is given
		_isAnyDataGiven: function() {
			var self = this;
			return (self.options.min || self.options.max || self.options.value);
		},

		_createOptionsFromData: function() {
			var self = this;
			if(self.element.data('min') || self.element.data('max') || self.element.data('value')) {
				self.options.min = self.element.data('min');
				self.options.max = self.element.data('max');
				self.options.value = self.element.data('value');
			}
		},

		_createPartsFromOptions: function() {
			var self = this;
			self.options.parts = [];
			// Does minimum reached?
			var barClass = (self.options.value < self.options.min) ? "minBarValue" : "minCrossedBarValue";
			var value = self.options.value / self.options.max * 100;
			var firstPart = {value: value, barClass: barClass};
			self.options.parts.push(firstPart);
		},

		_createProgressRoot: function() {
			var self = this;
			var template = $("<div class='progressbar-main'></div>");
			self.element.append(template);
			return template;
		},

		_createProgressBottomText: function() {
			var self = this;
			var template = $("<div></div>").addClass('progressbar-bottomText').css('width',calculatedProgressWidth);
			self.element.append(template);
			return template;
		},

		_createProgressHoverBar: function()  {
			var self = this;
			var template = $("<div></div>").addClass('progressbar-hoverBar');
			self.element.append(template);
			return template;
		},
		
		/**
		 * @returns {Object} a jQuery object containing all part elements.
		 * @private
		 * @author julrich
		 * @since 1.0
		 */
		_getPartElements: function() {
			return this.progressRoot.children(".ui-progressbar-value");
		},
		
		/**
		 * (Re)creates the markup of the parts.
		 * @param {Array} parts - Array of part objects defining the properties of the parts to be created.
		 * @fires multiprogressbar#change when the function is called <b>after</b> the creation of the multiprogressbar
		 * (i.e. the event is not fired during the creation).
		 * @fires multiprogressbar#complete when the total progress reaches or exceeds 100%.
		 * @private
		 * @author julrich
		 * @since 1.0
		 */
		_createParts: function(parts) {
			var self = this;
			
			self._getPartElements().remove(); // Remove all existing parts and then rebuild them
			var first = true;
			var lastVisibleElement = null;
			var totalValue = 0;
			$.each(parts, function(i, part) {
				var partElement = $(self._partTemplate).appendTo(self.progressRoot);
				partElement.removeClass("ui-corner-left");
				if (part.value >= 0 && totalValue < 100) {
					first = false;
					// Check if the part would exceed the 100% and cut it at 100%
					part.value = totalValue+part.value > 100 ? 100-totalValue : part.value; 
					partElement.css('width', 'calc(' + part.value + '% + 2px)').show();
					lastVisibleElement = partElement;
					totalValue += part.value;

					var minValue = (self.options.min / self.options.max * 100);
					var minValueText = self.options.min.toString();
					if (self.options.min < 10) {
						minValueText = " " + minValueText; //so the margin would be right for 5 as it for 50
					}
					if (!minValueText || minValueText.length == 0) {
						minValueText = " "; //fill with &nbsp so margin would look good
					}
					$('<div></div>').addClass("minCrossedHoverBar").css('margin-right', 'calc(' + minValue + '% + 2px)').appendTo(self.progressBottomText);
					//$('<div></div>').addClass("minCrossedBarText").css('margin-right', 'calc(' + minValue + '% - 0.5em)').text(minValueText).appendTo(self.progressBottomText);
					$('<div></div>').addClass("minCrossedBarText").css('margin-right', 'calc(' + minValue + '% - 0.5em)').text(minValueText).appendTo(self.progressBottomText);
				}
				else {
					// Hide part if the progress is <= 0 or if we exceeded 100% already 
					part.value = 0;
					partElement.hide();
				}
				
				partElement.addClass(part.barClass);
				
				if (part.text !== undefined && part.text !== null && part.text !== false) {
					var textForPart;
					if (part.text === true) {
						textForPart = Math.round(part.value)+"%";
					}
					else if ($.trim(part.text) !== "") {
						textForPart = part.text;
					}
					$('<div></div>').addClass("gb-budgetprogressbar-valuetext").text(textForPart).addClass(part.textClass).appendTo(partElement);
				}
			});
			if (self.created === true) { // Don't trigger "change" when we are creating the progressbar for the first time 
				self._trigger("change", null, {parts: parts});
			}
			if (totalValue >= 99.9) {
				lastVisibleElement.addClass("ui-corner-right");
				// Trigger complete
				self._trigger("complete");
			}
		},
		

		destroy: function() {
			var self = this;
			self._getPartElements().remove();
			self.progressRoot.progressbar("destroy");
		},
		
		_setOption: function(option, value) {
			var self = this;
			$.Widget.prototype._setOption.apply( self, arguments );
			
			switch(option) {
			case "parts":
				self._createParts(value);
				break;
			case "dummy":
				break;
			default:
				break;
			}
		},
		
		/**
		 * @return {Numeric} the sum of the progress of all visible parts.
		 * <b>Note:</b> When the sum of the progress of the parts exceeds 100, the progress
		 * will be truncated at 100 and the value of successive parts will be set to 0. This means
		 * that this function will always return a value in the range [0,100].
		 * @public
		 * @author julrich
		 * @since 1.0
		 */
		total: function() {
			var self = this;
			var totalValue = 0;
			$.each(self.options.parts, function(i, part) {
				totalValue += part.value;
			});
			
			return totalValue;
		}
	});
}(jQuery));
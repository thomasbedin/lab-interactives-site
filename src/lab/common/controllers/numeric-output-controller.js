/*global define, $, model */

define(function () {

  var metadata  = require('common/controllers/interactive-metadata'),
      validator = require('common/validator'),
      tooltip   = require('common/views/tooltip');

  return function NumericOutputController(component, scriptingAPI, interactivesController) {
    var propertyName,
        label,
        units,
        displayValue,
        $numericOutput,
        $label,
        $number,
        $units,
        $output,
        propertyDescription,
        controller,

        renderValue = function () {
          var value = model.get(propertyName);
          if (displayValue) {
            $number.text(displayValue(value));
          } else {
            $number.text(value);
          }
        };

    //
    // Initialization.
    //
    // Validate component definition, use validated copy of the properties.
    component = validator.validateCompleteness(metadata.numericOutput, component);
    propertyName = component.property;
    label = component.label;
    units = component.units;
    displayValue = component.displayValue;

    // Setup view.
    $label  = $('<span class="label"></span>');
    $output = $('<span class="output"></span>');
    $number = $('<span class="value"></span>');
    $units  = $('<span class="units"></span>');
    if (label) { $label.html(label); }
    if (units) { $units.html(units); }
    $numericOutput = $('<div class="numeric-output">').attr('id', component.id)
        .append($label)
        .append($output
          .append($number)
          .append($units)
        );

    // Each interactive component has to have class "component".
    $numericOutput.addClass("component");

    // Add class defining component orientation - "horizontal" or "vertical".
    $numericOutput.addClass(component.orientation);

    // Custom dimensions.
    $numericOutput.css({
      width: component.width,
      height: component.height
    });

    if (displayValue) {
      displayValue = scriptingAPI.makeFunctionInScriptContext('value', displayValue);
    }

    if (component.tooltip) {
      tooltip($numericOutput, component.tooltip, component.openTooltip, interactivesController);
    }

    // Public API.
    controller = {
      // This callback should be trigger when model is loaded.
      modelLoadedCallback: function () {
        if (propertyName) {
          propertyDescription = model.getPropertyDescription(propertyName);
          if (propertyDescription) {
            if (!label) { $label.html(propertyDescription.getLabel()); }
            if (!units) { $units.html(propertyDescription.getUnitAbbreviation()); }
          }
          renderValue();
          model.addPropertiesListener([propertyName], renderValue);
        }
      },

      // Returns view container. Label tag, as it contains checkbox anyway.
      getViewContainer: function () {
        return $numericOutput;
      },

      // Returns serialized component definition.
      serialize: function () {
        // Return the initial component definition.
        // Numeric output component doesn't have any state, which can be changed.
        // It's value is defined by underlying model.
        return $.extend(true, {}, component);
      }
    };
    // Return Public API object.
    return controller;
  };
});

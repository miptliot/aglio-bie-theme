(function() {
  var deepEqual, inherit, renderSchema;

  deepEqual = require('assert').deepEqual;

  inherit = require('./inherit');

  module.exports = renderSchema = function(root, dataStructures) {
    var error, exclusive, i, item, items, j, k, key, len, len1, len2, len3, m, member, n, name, option, optionSchema, prop, properties, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, required, schema, typeAttr;
    schema = {};
    switch (root.element) {
      case 'boolean':
      case 'string':
      case 'number':
        schema.type = root.element;
        if (((ref1 = root.attributes) != null ? ref1["default"] : void 0) != null) {
          schema["default"] = root.attributes["default"];
        }
        if (root.content != null) {
          schema.example = root.content;
        }
        break;
      case 'enum':
        schema.type = 'enum';
        schema["enum"] = [];
        ref2 = root.content || [];
        for (j = 0, len = ref2.length; j < len; j++) {
          item = ref2[j];
          schema["enum"].push(item.content);
        }
        break;
      case 'array':
        schema.type = 'array';
        items = [];
        ref3 = root.content || [];
        for (k = 0, len1 = ref3.length; k < len1; k++) {
          item = ref3[k];
          items.push(renderSchema(item, dataStructures));
        }
        if (items.length === 1) {
          schema.items = items[0];
        } else if (items.length > 1) {
          try {
            schema.items = items.reduce(function(l, r) {
              return deepEqual(l, r) || r;
            });
          } catch (error) {
            schema.items = {
              'anyOf': items
            };
          }
        }
        break;
      case 'object':
      case 'option':
        schema.type = 'object';
        schema.properties = {};
        required = [];
        properties = root.content.slice(0);
        i = 0;
        while (i < properties.length) {
          member = properties[i];
          i++;
          if (member.element === 'ref') {
            ref = dataStructures[member.content.href];
            i--;
            properties.splice.apply(properties, [i, 1].concat(ref.content));
            continue;
          } else if (member.element === 'select') {
            exclusive = [];
            ref4 = member.content;
            for (m = 0, len2 = ref4.length; m < len2; m++) {
              option = ref4[m];
              optionSchema = renderSchema(option, dataStructures);
              ref5 = optionSchema.properties;
              for (key in ref5) {
                prop = ref5[key];
                exclusive.push(key);
                schema.properties[key] = prop;
              }
            }
            if (!schema.allOf) {
              schema.allOf = [];
            }
            schema.allOf.push({
              not: {
                required: exclusive
              }
            });
            continue;
          }
          key = member.content.key.content;
          schema.properties[key] = renderSchema(member.content.value, dataStructures);
          schema.properties[key].name = key;
          schema.properties[key].required = false;
          if (((ref6 = member.meta) != null ? ref6.description : void 0) != null) {
            schema.properties[key].description = member.meta.description;
          }
          if ((ref7 = member.attributes) != null ? ref7.typeAttributes : void 0) {
            typeAttr = member.attributes.typeAttributes;
            if (typeAttr.indexOf('required') !== -1) {
              if (required.indexOf(key) === -1) {
                required.push(key);
              }
            }
            if (typeAttr.indexOf('nullable') !== -1) {
              schema.properties[key].type = [schema.properties[key].type, 'null'];
            }
          }
        }
        for (n = 0, len3 = required.length; n < len3; n++) {
          name = required[n];
          schema.properties[name].required = true;
        }
        break;
      default:
        ref = dataStructures[root.element];
        if (ref) {
          schema = renderSchema(inherit(ref, root), dataStructures);
        }
    }
    if (((ref8 = root.meta) != null ? ref8.id : void 0) != null) {
      schema.name = root.meta.id;
    }
    if (((ref9 = root.meta) != null ? ref9.description : void 0) != null) {
      schema.description = root.meta.description;
    }
    if ((ref10 = root.attributes) != null ? ref10.typeAttributes : void 0) {
      typeAttr = root.attributes.typeAttributes;
      if (typeAttr.indexOf('nullable') !== -1) {
        schema.type = [schema.type, 'null'];
      }
    }
    return schema;
  };

}).call(this);
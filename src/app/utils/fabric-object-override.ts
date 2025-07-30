// src/app/utils/fabric-object-override.ts

import * as fabric  from 'fabric';

// Save original toObject
const originalToObject = fabric.FabricObject.prototype.toObject;

// Override
fabric.FabricObject.prototype.toObject = function (
  propertiesToInclude: string[] = []
) {
  // Always include 'id' and 'name' in serialization
  return originalToObject.call(this, ['id', 'name', ...propertiesToInclude]);
};

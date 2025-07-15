import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid'; // Install uuid package for unique IDs

export function assignMetadata<T extends fabric.Object>(
  object: T,
  metadata: Record<string, any>
): T {
  const id = metadata['id'] || uuidv4();
  (object as any).id = id;

  for (const key of Object.keys(metadata)) {
    (object as any)[key] = metadata[key];
  }

  // Patch toObject to include custom props
  const originalToObject = object.toObject;
  object.toObject = function (propertiesToInclude?: string[]) {
    return {
      ...originalToObject.call(this, propertiesToInclude),
      id: (this as any).id,
      ...metadata
    };
  };

  return object;
}

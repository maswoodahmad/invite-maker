import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';

export function assignMetadata<T extends fabric.Object>(
  object: T,
  metadata: Record<string, any>
): T {
  const id = metadata['id'] || uuidv4();
  (object as any).id = id;

  for (const key of Object.keys(metadata)) {
    (object as any)[key] = metadata[key];
  }

  // No need to override toObject if global patch handles 'id' and 'name'
  return object;
}

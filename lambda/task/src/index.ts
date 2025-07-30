import { AppSyncEvent } from './types';
import { TaskResolver } from './handlers/task-resolver';

export const handler = async (event: AppSyncEvent): Promise<unknown> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const resolver = new TaskResolver(event);
    const result = await resolver.resolve(event);
    console.log('Returning result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error in task resolver:', error);
    throw error;
  }
};
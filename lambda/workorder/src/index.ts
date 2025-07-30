import { AppSyncEvent } from './types';
import { WorkOrderResolver } from './handlers/workorder-resolver';

export const handler = async (event: AppSyncEvent): Promise<unknown> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const resolver = new WorkOrderResolver(event);
    const result = await resolver.resolve(event);
    
    console.log('Returning result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error in workorder resolver:', error);
    throw error;
  }
};
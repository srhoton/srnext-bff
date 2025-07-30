import { Handler } from 'aws-lambda';
import { AppSyncEvent } from './types';
import { PartResolver } from './handlers/part-resolver';

export const handler: Handler<AppSyncEvent, unknown> = async (event: AppSyncEvent): Promise<unknown> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    const resolver = new PartResolver(event);
    const result = await resolver.resolve(event);
    console.log('Resolver result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error in part resolver:', error);
    throw error;
  }
};
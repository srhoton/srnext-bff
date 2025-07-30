import { LocationResolver } from './handlers/location-resolver';
import { AppSyncEvent } from './types';

export const handler = async (event: AppSyncEvent): Promise<unknown> => {
  console.log('Location Lambda invoked with event:', JSON.stringify(event, null, 2));

  try {
    const resolver = new LocationResolver(event);
    const result = await resolver.resolve(event);
    
    console.log('Location operation completed successfully');
    return result;
  } catch (error) {
    console.error('Location Lambda error:', error);
    
    // Re-throw the error to let AppSync handle it
    throw error;
  }
};
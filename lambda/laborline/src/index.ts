import { AppSyncEvent } from './types';
import { LaborLineResolver } from './handlers/laborline-resolver';

export const handler = async (event: AppSyncEvent): Promise<unknown> => {
  console.log('Lambda function started');

  try {
    // Extract JWT token from the event
    const authToken = event.request?.headers?.['Authorization'] || 
                     event.request?.headers?.['authorization'];

    if (!authToken) {
      throw new Error('Authentication required: No authorization token found');
    }

    // Remove 'Bearer ' prefix if present
    const token = authToken.startsWith('Bearer ') 
      ? authToken.slice(7) 
      : authToken;

    const resolver = new LaborLineResolver(token);
    const result = await resolver.handleRequest(event);

    console.log('Lambda function completed successfully');
    return result;
  } catch (error) {
    console.error('Lambda function error:', error);
    throw error;
  }
};
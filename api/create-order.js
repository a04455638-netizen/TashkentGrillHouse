import { handler as netlifyHandler } from '../netlify/functions/create-order.js';
import { adaptVercelHandler } from './_adapter.js';

export default adaptVercelHandler(netlifyHandler);

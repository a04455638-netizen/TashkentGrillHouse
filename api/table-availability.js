import { handler as netlifyHandler } from '../netlify/functions/table-availability.js';
import { adaptVercelHandler } from './_adapter.js';

export default adaptVercelHandler(netlifyHandler);

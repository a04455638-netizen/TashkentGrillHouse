import { handler as netlifyHandler } from '../netlify/functions/admin-manage.js';
import { adaptVercelHandler } from './_adapter.js';

export default adaptVercelHandler(netlifyHandler);

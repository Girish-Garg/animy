import { clerkClient, getAuth } from '@clerk/express';
import User from '../schema/user.schema.js';
import logger from '../utils/logger.js';

const clerkAuthMiddleware = async (req, res, next) => {

    try {
        const authResult = getAuth(req);
        
        if (!authResult.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fast path: existing users are looked up by clerkId (indexed) without
        // an extra Clerk API call. Only provision (and fetch the email from
        // Clerk) the first time we see a user.
        let user = await User.findOne({ clerkId: authResult.userId });
        if (!user) {
            const clerkUser = await clerkClient.users.getUser(authResult.userId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) {
                return res.status(404).json({ error: 'Email not found' });
            }
            // Atomic upsert avoids duplicate users under concurrent first requests.
            user = await User.findOneAndUpdate(
                { clerkId: authResult.userId },
                { $set: { email }, $setOnInsert: { chatIds: [], albumIds: [] } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }
        req.user = user;
        next();
    } catch (err) {
        logger.error('Error in clerkAuthMiddleware:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default clerkAuthMiddleware;
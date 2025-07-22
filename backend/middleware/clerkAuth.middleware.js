import { clerkClient, getAuth } from '@clerk/express';
import User from '../schema/user.schema.js';

const clerkAuthMiddleware = async (req, res, next) => {

    try {
        const authResult = getAuth(req);
        
        console.log(`Clerk auth result: ${JSON.stringify(authResult)}`);
        console.log(`Authenticated user ID: ${authResult.userId}`);

        if (!authResult.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const clerkUser = await clerkClient.users.getUser(authResult.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }
        let user = await User.findOne({ clerkId: authResult.userId , email: email });
        if (!user) {
            user = await User.create({
                clerkId: authResult.userId,
                email: email,
                chatIds: [],
                albumIds: []
            })
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('Error in clerkAuthMiddleware:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default clerkAuthMiddleware;
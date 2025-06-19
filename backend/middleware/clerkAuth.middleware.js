import { clerkClient, getAuth } from '@clerk/express';
import User from '../schema/user.schema.js';

const clerkAuthMiddleware = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let user = await User.findOne({ clerkId: userId , email: email });
        if (!user) {
            user = await User.create({
                clerkId: userId,
                email: email,
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
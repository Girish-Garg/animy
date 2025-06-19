import User from "../schema/user.schema.js";

const dashboard = async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id)
            .populate({
                path: 'chatIds',
                select: 'title createdAt updatedAt',
                options: { sort: { updatedAt: -1 }}
            })
            .populate({
                path: 'albumIds',
                select: 'albumName thumbnailPath createdAt updatedAt',
                options: { sort: { updatedAt: -1 }}
            })
            .lean();

        if (!user) {
            return res.status(404).json({ type:'error', error: 'User not found' });
        }

        res.json({
            type: "success",
            message: "Dashboard data retrieved successfully",
            user: {
                totalCredit: user.totalCredit,
                usedCredit: user.usedCredit,
                creditRemaining: user.creditRemaining,
                costPerCredit: user.CostPerCredit,
            },
            chats: user.chatIds || [],
            albums: user.albumIds || [],
        })
    } catch (err) {
        console.error('Error in dashboard controller:', err);
        return res.status(500).json({ type:'error', error: 'Internal Server Error' });
    }
}

export default dashboard;
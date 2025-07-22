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
                select: 'albumName videos createdAt updatedAt',
                options: { sort: { updatedAt: -1 }}
            })
            .lean();

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            message: "Dashboard data retrieved successfully",
            chats: user.chatIds || [],
            albums: user.albumIds || [],
        })
    } catch (err) {
        console.error('Error in dashboard controller:', err);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export default dashboard;
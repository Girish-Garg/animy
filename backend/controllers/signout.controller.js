const signout = async (req, res) => {
  try {
    // Clear the token cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
    
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during signout",
    });
  }
};

export default signout;
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true, // Crucial: makes cookie inaccessible to client-side JS
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'lax' // CSRF protection
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}

module.exports = {
    sendTokenResponse
}
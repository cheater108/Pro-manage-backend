import jwt from "jsonwebtoken";

function isLoggedIn(req, res, next) {
    const token = req.get("Authorization");
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        req.user = data;
        return next();
    } catch (error) {
        return res.status(400).json({ error: "not logged in" });
    }
}

export default isLoggedIn;

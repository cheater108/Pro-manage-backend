// catch errors in async blocks
function catchAsync(fn) {
    return function (req, res) {
        fn(req, res).catch((err) => {
            return res.status(500).json({ error: "internal server error" });
        });
    };
}

export default catchAsync;

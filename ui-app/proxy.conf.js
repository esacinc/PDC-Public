const PROXY_CONFIG = {
    "/graphql": {
        "target": {
            "host": "localhost",
            "protocol": "http:",
            "port": 3000
        },
        "secure": false,
        "changeOrigin": false,
        "logLevel": "debug"
    }
};

module.exports = PROXY_CONFIG;

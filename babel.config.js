const presets = [
    [
        "@babel/preset-env",
        {
            targets:     {
                edge:    "17",
                firefox: "60",
                chrome:  "67",
                safari:  "11.1",
                ie: "10"
            },
            useBuiltIns: false,
        },
    ],
    // [ "minify" ]

];
const plugins = [
    // "transform-remove-console"
];

module.exports = {
    comments: false,
    presets, plugins
};
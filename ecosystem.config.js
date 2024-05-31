module.exports = {
  apps: [
    {
      name: "mediplatform_server",
      script: "./src/server-register.js",
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        // NODE_ENV: "development",
      },
    },
    // {
    //   name: "mediplatform_server_test",
    //   script: "./src/server-register_test.js",
    //   instances: 1,
    //   exec_mode: "cluster",
    //   watch: false,
    //   env: {
    //     NODE_ENV: "development",
    //   },
    // },
    {
      name: "mediplatform_prismaDB",
      script: "npm run studio",
      exec_mode: "fork",
      watch: false,
    },
  ],
};

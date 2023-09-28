module.exports = {
  apps: [
    // {
    //   name: "mediplatform_server",
    //   script: "./src/server-register.js",
    //   instances: 2,
    //   exec_mode: "cluster",
    //   watch: false,
    //   env: {
    //     NODE_ENV: "development",
    //   },
    //   env_production: {
    //     NODE_ENV: "production",
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

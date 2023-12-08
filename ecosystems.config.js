module.exports = {
    apps: [
      {
        name: 'my-city-kolkata-cms',
        script: 'npm',
        args: 'start',
        env: {
          NODE_ENV: 'production',
        },
        exp_backoff_restart_delay: 100,
      },
    ],
  };
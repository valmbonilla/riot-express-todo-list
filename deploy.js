// connect to the remote server
function sshConnect() {
    console.log('Connecting to the server...');
  
    ssh
      .connect({
        // TODO: ADD YOUR IP ADDRESS BELOW (e.g. '12.34.5.67')
        host: '00.00.00.00',
        username: 'ubuntu',
        privateKey: 'hs-key.pem'
      })
      .then(function() {
        console.log('SSH Connection established.');
        console.log('Installing PM2...');
        return installPM2();
      })
      .then(function() {
        console.log('Creating `riot-express-todo-list-temp` folder.');
        return createRemoteTempFolder();
      })
      .then(function(result) {
        const failed = [];
        const successful = [];
        if (result.stdout) {
          console.log('STDOUT: ' + result.stdout);
        }
        if (result.stderr) {
          console.log('STDERR: ' + result.stderr);
          return Promise.reject(result.stderr);
        }
        console.log('Transferring files to remote server...');
        return transferProjectToRemote(failed, successful);
      })
      .then(function(status) {
        if (status) {
          console.log('Stopping remote services.');
          return stopRemoteServices();
        } else {
          return Promise.reject(failed.join(', '));
        }
      })
      .then(function(status) {
        if (status) {
          console.log('Updating remote app.');
          return updateRemoteApp();
        } else {
          return Promise.reject(failed.join(', '));
        }
      })
      .then(function(status) {
        if (status) {
          console.log('Restarting remote services...');
          return restartRemoteServices();
        } else {
          return Promise.reject(failed.join(', '));
        }
      })
      .then(function() {
        console.log('DEPLOYMENT COMPLETE!');
        process.exit(0);
      })
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
  }
const http = require('http');
const zlib = require('zlib');
const pathFS = require('path');
const tar = require('tar');
const fs = require('fs-extra');
const ora = require('ora');
const del = require('del');

const {source, jar} = require('./config');

const download = async path => {
  const spinner = ora('Downloading Step Functions Local...').start();

  // Check if it's already downloaded
  const isDownloaded = await fs.pathExists(pathFS.join(path, jar));

  if (isDownloaded) {
    spinner.succeed('Already downloaded.');
    return;
  }

  // Create download directory if it doesn't exist
  await fs.ensureDir(path);

  return new Promise((resolve, reject) => {
    http.get(source, response => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Could not retreive Step Functions Local at ${source}`));
      }

      response
        .pipe(zlib.Unzip())
        .pipe(tar.extract({
          cwd: path
        }))
        .on('end', () => {
          spinner.succeed('Downloaded Step Functions Local.');
          return resolve();
        })
        .on('error', error => {
          return reject(new Error(`Could not retrieve Step Functions Local: ${error}`));
        });
    }).on('error', error => {
      spinner.fail('Download failed.');
      return reject(new Error(`Could not retrieve Step Functions Local: ${error}`));
    });
  });
};

const install = path => {
  return download(path);
};

const remove = async path => {
  await del(path);
};

module.exports = {install, remove};
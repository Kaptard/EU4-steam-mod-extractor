const unzipper = require('unzipper')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const mkdirp = promisify(require('mkdirp'))
const homedir = require('os').homedir()

async function unzip(archive) {
  let unzipped

  try {
    unzipped = await unzipper.Open.file(path.join(__dirname, archive))
  } catch (err) {
    console.error('Error while unzipping', archive)
    throw err
  }

  return new Promise(async (resolve, reject) => {
    for (const file of unzipped.files) {
      const name = archive.replace(/(mod_|\.zip)/gi, '')
      let target

      if (file.path.includes('descriptor.mod')) {
        target = `${name}.mod`
      } else {
        target = `${name}/${file.path}`
      }

      const targetPath = `${homedir}/Documents/Paradox Interactive/Europa Universalis IV/mod/${target}`
      const targetDir = targetPath.split('/').slice(0, targetPath.split('/').length - 1).join('/')
      await mkdirp(path.resolve(targetDir))
      console.log(`Extracting [${name}] ${file.path}   ->   /mod/${target}`)
      fs.writeFileSync(targetPath, await file.buffer())
    }
  })
}

console.log(homedir)
fs.readdirSync(__dirname).forEach(archive => {
  if (archive.endsWith('.zip')) unzip(archive).catch(err => {
    throw err
  })
})

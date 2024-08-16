require('dotenv').config()

exports.default = async function (configuration) {
  require('child_process').execSync(
    `"${process.env.SIGNTOOL_PATH}" sign /v /debug /fd SHA256 /tr "http://timestamp.acs.microsoft.com" /td SHA256 /dlib "${process.env.CODESIGNING_DLIB_PATH}" /dmdf "${process.env.METADATA_PATH}" "${configuration.path}"`,
    { stdio: 'inherit' }
  )
}

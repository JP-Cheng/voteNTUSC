const jsSHA = require("jssha");

function myHash(input) {
  const shaObj = new jsSHA("SHA3-512", "TEXT");
  shaObj.update(input);
  return shaObj.getHash('HEX');
}

export {myHash};
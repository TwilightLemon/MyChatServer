import fs from 'fs';
import crypto from 'crypto';

let pk;
function readPublicKey(){
    if(!pk)
        pk = fs.readFileSync('public_key_sign.pem', 'utf8');
    return pk;
}

function verifySign(data,sign,pk){
    const publicKey = crypto.createPublicKey(pk);
    const isValid = crypto.verify(
        'sha256',
        data,
        {
          key: publicKey,
          dsaEncoding: 'der',
        },
        sign
      );
    return isValid;
}

export function verify(sign,token){
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    const pattern=sign+formattedDate;
    const data=Buffer.from(pattern,'utf8');
    return verifySign(data,Buffer.from(token,'base64'),readPublicKey());
}
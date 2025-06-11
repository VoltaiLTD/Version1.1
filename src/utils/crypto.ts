import { box, randomBytes, secretbox } from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export const generateKeyPair = () => {
  const keyPair = box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey)
  };
};

export const signTransaction = (transaction: any, privateKey: string) => {
  const messageUint8 = decodeUTF8(JSON.stringify(transaction));
  const keyUint8 = decodeBase64(privateKey);
  const nonce = randomBytes(secretbox.nonceLength);
  const box = secretbox(messageUint8, nonce, keyUint8);
  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);
  return encodeBase64(fullMessage);
};

export const verifyTransaction = (signedMessage: string, publicKey: string) => {
  try {
    const messageWithNonceAsUint8 = decodeBase64(signedMessage);
    const nonce = messageWithNonceAsUint8.slice(0, secretbox.nonceLength);
    const message = messageWithNonceAsUint8.slice(secretbox.nonceLength);
    const decrypted = secretbox.open(message, nonce, decodeBase64(publicKey));
    if (!decrypted) {
      return null;
    }
    return JSON.parse(encodeUTF8(decrypted));
  } catch (err) {
    console.error('Failed to verify transaction:', err);
    return null;
  }
};

export const generatePaymentQR = (paymentRequest: any) => {
  return JSON.stringify({
    ...paymentRequest,
    type: 'volt-payment'
  });
};
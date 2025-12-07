//`

import { S3Client, S3Options } from "bun";


async function generateSHA256(filePath) {
  const file = await Bun.file(filePath);
  const hasher = new Bun.CryptoHasher("sha256");
  const buffer = await file.arrayBuffer();
  hasher.update(buffer);
  const hash = hasher.digest().toString('hex');
  return hash;
}

const { S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT, S3_BUCKET_NAME } = process.env;

const s3opt:S3Options={
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET_KEY,
  bucket: S3_BUCKET_NAME,
  endpoint: S3_ENDPOINT,
};

const client = new S3Client(s3opt);
async function uploadFiles() {
  const fns = ["backend/bin/xpanel-build.zip"]
  const beforeAll = new Date();
  for (const fn of fns) {
    const before = new Date();
    const fileSize = Bun.file(fn).size;
    const meta = { fileSize, deployTime: new Date(), "hash": await generateSHA256(fn) }
    console.log(meta);
    await client.write(`${fn}.meta.json`, JSON.stringify(meta));
    await client.write(fn, Bun.file(fn));
    console.log(`DONE for ${fn}`, (+(new Date()) - (+before)), 'ms');

  }
  console.log(`DONE ALL`, (+(new Date()) - (+beforeAll)), 'ms');
}
uploadFiles().then(()=>0,console.error);
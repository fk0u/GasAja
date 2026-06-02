const fs = require('fs');
const path = require('path');
const https = require('https');
const googleTTS = require('google-tts-api');

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const texts = [
  { id: 'hook', text: 'Sering bingung nyari temen nongkrong atau mau jalan kemana weekend ini?' },
  { id: 'intro', text: 'Kenalin, GasAja! Aplikasi buat nyari teman sehobi dan bikin rencana bareng.' },
  { id: 'explore', text: 'Di GasAja, kamu bisa scroll feed buat liat rencana-rencana seru di sekitarmu.' },
  { id: 'interact', text: 'Tinggal pencet Ikutan dan boom! Kamu langsung masuk ke daftarnya. Gampang banget kan?' },
  { id: 'create', text: 'Atau, kamu bisa bikin plan kamu sendiri! Tentukan tempat, waktu, dan vibesnya, lalu biarin temen-temen kamu pada join.' },
  { id: 'outro', text: 'Tunggu apa lagi? Download GasAja sekarang. GasAja! Cari teman, bikin rencana, langsung jalan!' }
];

async function run() {
  for (const item of texts) {
    try {
      const url = googleTTS.getAudioUrl(item.text, {
        lang: 'id',
        slow: false,
        host: 'https://translate.google.com',
      });
      const dest = path.join(outDir, `${item.id}.mp3`);
      await downloadFile(url, dest);
      console.log(`Downloaded ${item.id}.mp3`);
    } catch (e) {
      console.error(`Failed to generate TTS for ${item.id}:`, e);
    }
  }
  console.log('All TTS audio downloaded.');
}

run();

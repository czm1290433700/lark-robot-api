const axios = require('axios');
const fs = require('fs');
const path = require('path');

class Image {
  client;
  url = '';
  downloadPath = '';

  constructor(client, url) {
    this.client = client;
    this.url = url;
    this.downloadPath = path.resolve(__dirname, 'pic.png');
  }

  async downloadImage () {
    const response = await axios({
      method: 'get',
      url: this.url,
      responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(this.downloadPath))
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  async getImageKey () {
    await this.downloadImage();
    const res = await this.client.im.image.create({
      data: {
        image_type: 'message',
        image: fs.createReadStream(this.downloadPath),
      },
    })
    await fs.promises.unlink(this.downloadPath);
    return res.image_key;
  }
}

module.exports = Image;
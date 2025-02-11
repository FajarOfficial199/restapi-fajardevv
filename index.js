require('./settings')
var express = require("express"), cors = require("cors"), secure = require("ssl-express-www");
const path = require("path");
const fs = require("fs");
const PORT = process.env.PORT || 5000;
const axios = require("axios")
const fajar = require('./function/index') 
const { default: makeWaSocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { setTimeout: sleep } = require('timers/promises');

//seettingsjs
var creator = global.creator


// Middleware
var app = express();
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(secure);


// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/api', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/api/downloader/tiktok", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required." });

  try {
    const { tiktokdl } = require("tiktokdl");
    const data = await tiktokdl(url);
    if (!data) return res.status(404).json({ error: "No data found." });
    res.json({ status: true, creator: "Rafael", result: data });
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
});



app.get("/api/tools/translate", async (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: "Text is required." });

  try {
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/translate`, {
      params: { text: text, source: "auto", target: "id" }
    });
    res.json({ status: true, creator: "Rafael", result: response.data.translatedText });
  } catch {
    res.status(500).json({ error: "An error occurred while processing the translation." });
  }
});

app.get("/api/downloader/spotify", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Url is required." });
    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${url}`);
        const data = response.data;
        if (!data.metadata || !data.download) {
            return res.status(500).json({ error: "Invalid response from the external API." });
        }
        res.json({
            status: true,
            creator: "Rafael",
            result: {
                artis: data.metadata.artist,
                judul: data.metadata.name,
                rilis: data.metadata.releaseDate,
                thumbnail: data.metadata.cover_url,
                download_url: data.download
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data from the external API." });
    }
});

app.get("/api/downloader/ytmp3", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Url is required." });

    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/youtube?q=${url}`);
        const data = response.data;

        res.json({
            status: true,
            creator: "Rafael",
            result: {
                Judul: data.data.title,
                thumbnail: data.data.thumbnailUrl,
                durasi: data.data.duration,
                UrlDownload: data.data.sounds
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching data." });
    }
});

app.get("/api/downloader/ytmp4", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Url is required." });

    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/d/youtube?q=${url}`);
        const data = response.data;

        res.json({
            status: true,
            creator: "Rafael",
            result: {
                Judul: data.data.title,
                thumbnail: data.data.thumbnailUrl,
                durasi: data.data.duration,
                UrlDownload: data.data.video
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching data." });
    }
});

app.get("/api/downloader/spotifys", async (req, res) => {
    try {
        const { judul } = req.query;
        if (!judul) {
            return res.status(400).json({ error: "Masukkan judul lagu." });
        }
        const response = await axios.get(`https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(judul)}`);
        const resultData = response.data.data[0];
        if (!resultData) {
            return res.status(404).json({ error: "Lagu tidak ditemukan." });
        }
        res.json({
            status: true,
            creator: "Rafael",
            result: {
                judul: resultData.title,
                artis: resultData.artist.name,
                thumbnail: resultData.thumbnail,
                url: resultData.artist.external_urls.spotify
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan pada server." });
    }
});

app.get('/api/downloader/mediafire', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Masukkan URL MediaFire yang valid! Contoh: /api/downloader/mediafire?url=https://www.mediafire.com/file/qyk2na28cidzt3p/cf2.js/file"
        });
    }

    // Validasi format URL MediaFire
    const mediafireRegex = /^(https?:\/\/)?(www\.)?mediafire\.com\/.+$/i;
    if (!mediafireRegex.test(url)) {
        return res.status(400).json({
            status: false,
            message: "URL tidak valid! Pastikan itu adalah URL dari MediaFire."
        });
    }

    try {
        // Menggunakan API pihak ketiga untuk mendapatkan informasi file
        const response = await axios.post('http://kinchan.sytes.net/mediafire/download', { url });
        const result = response.data;

        // Jika terjadi kesalahan dalam pengambilan data
        if (result.error) {
            return res.status(500).json({
                status: false,
                message: result.error
            });
        }

        res.json({
            status: true,
            creator: `${creator}`,
            results: {
                filename: result.filename,
                size: result.size,
                mimetype: result.mimetype,
                downloadUrl: result.download
            }
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Terjadi kesalahan saat memproses permintaan.",
            error: error.message
        });
    }
});

app.get('/api/search/ip', async (req, res) => {
    const ipnya = req.query.ipnya;
    
    if (!ipnya) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'ipnya' tidak boleh kosong."
        });
    }

    try {
        const response = await axios.get(`https://ipwho.is/${ipnya}`);
        const data = response.data;

        if (!data.success) {
            return res.status(404).json({
                status: false,
                message: `IP ${ipnya} tidak ditemukan!`
            });
        }

        res.json({
            status: true,
            creator: `${creator}`,
            results: {
                ip: data.ip || 'N/A',
                success: data.success || 'N/A',
                type: data.type || 'N/A',
                continent: data.continent || 'N/A',
                continent_code: data.continent_code || 'N/A',
                country: data.country || 'N/A',
                country_code: data.country_code || 'N/A',
                region: data.region || 'N/A',
                region_code: data.region_code || 'N/A',
                city: data.city || 'N/A',
                latitude: data.latitude || 'N/A',
                longitude: data.longitude || 'N/A',
                is_eu: data.is_eu ? 'Yes' : 'No',
                postal: data.postal || 'N/A',
                calling_code: data.calling_code || 'N/A',
                capital: data.capital || 'N/A',
                borders: data.borders || 'N/A',
                flag: {
                    image: data.flag?.img || 'N/A',
                    emoji: data.flag?.emoji || 'N/A',
                    emoji_unicode: data.flag?.emoji_unicode || 'N/A'
                },
                connection: {
                    asn: data.connection?.asn || 'N/A',
                    organization: data.connection?.org || 'N/A',
                    isp: data.connection?.isp || 'N/A',
                    domain: data.connection?.domain || 'N/A'
                },
                timezone: {
                    id: data.timezone?.id || 'N/A',
                    abbreviation: data.timezone?.abbr || 'N/A',
                    is_dst: data.timezone?.is_dst ? 'Yes' : 'No',
                    offset: data.timezone?.offset || 'N/A',
                    utc: data.timezone?.utc || 'N/A',
                    current_time: data.timezone?.current_time || 'N/A'
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Terjadi kesalahan saat mengambil data.",
            error: error.message
        });
    }
});


app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ada kesalahan pada server');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

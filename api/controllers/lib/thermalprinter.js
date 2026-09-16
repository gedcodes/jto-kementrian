/**
 * Thermal printer (Epson ESC/POS) helper.
 *
 * Printer dihubungi langsung lewat TCP (Ethernet / WiFi print server), port
 * default 9100 (RAW / JetDirect). Semua konfigurasi diambil dari .env dan bisa
 * ditimpa per-request lewat parameter override.
 *
 * Env:
 *   PRINTER_THERMAL_IP       - IP printer, contoh 192.168.1.100 (wajib)
 *   PRINTER_THERMAL_PORT     - port RAW printer, default 9100
 *   PRINTER_THERMAL_PAPER    - lebar kertas: 80 atau 58 (mm), default 80
 *   PRINTER_THERMAL_SIZE     - ukuran huruf, default normal:
 *                                normal = 1x  (paling banyak muat)
 *                                tall   = 2x tinggi saja, layout tidak berubah
 *                                large  = 2x tinggi & lebar, kolom jadi separuh
 *                                         sehingga layout otomatis bertingkat
 *   PRINTER_THERMAL_WIDTH    - jumlah karakter per baris. Otomatis dibatasi ke
 *                              maksimum yang muat (kertas x font x ukuran).
 *                              Kosongkan untuk memakai lebar penuh kertas.
 *   PRINTER_THERMAL_FONT     - A (besar, default) atau B (kecil, +-40% lebih kecil)
 *   PRINTER_THERMAL_TIMEOUT  - timeout koneksi (ms), default 5000
 *   PRINTER_THERMAL_COPIES   - jumlah rangkap struk, default 1
 *   PRINTER_THERMAL_CUT      - 1 = potong kertas setelah cetak, default 1
 *   PRINTER_THERMAL_QR_SIZE  - ukuran modul QR 1..16, default 6
 *   PRINTER_THERMAL_FEED     - jumlah baris kosong sebelum cut, default 4
 */

const net = require('net');

/* ------------------------------------------------------------------ *
 * ESC/POS control bytes
 * ------------------------------------------------------------------ */
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CMD = {
    INIT: Buffer.from([ESC, 0x40]),                 // ESC @  - reset printer
    CODEPAGE_PC437: Buffer.from([ESC, 0x74, 0x00]), // ESC t 0
    FONT_A: Buffer.from([ESC, 0x4d, 0x00]),         // ESC M 0
    FONT_B: Buffer.from([ESC, 0x4d, 0x01]),         // ESC M 1
    ALIGN_LEFT: Buffer.from([ESC, 0x61, 0x00]),     // ESC a 0
    ALIGN_CENTER: Buffer.from([ESC, 0x61, 0x01]),   // ESC a 1
    ALIGN_RIGHT: Buffer.from([ESC, 0x61, 0x02]),    // ESC a 2
    BOLD_ON: Buffer.from([ESC, 0x45, 0x01]),        // ESC E 1
    BOLD_OFF: Buffer.from([ESC, 0x45, 0x00]),       // ESC E 0
    SIZE_NORMAL: Buffer.from([GS, 0x21, 0x00]),     // GS ! 0
    CUT_FULL: Buffer.from([GS, 0x56, 0x00]),        // GS V 0
    CUT_PARTIAL: Buffer.from([GS, 0x56, 0x01]),     // GS V 1
    LF: Buffer.from([LF]),
};

/**
 * GS ! n - pengali ukuran karakter (1..8 kali, hanya kelipatan bulat).
 * Nibble atas = pengali lebar, nibble bawah = pengali tinggi.
 */
const charSize = (w = 1, h = 1) => {
    const cw = Math.max(1, Math.min(8, w)) - 1;
    const ch = Math.max(1, Math.min(8, h)) - 1;
    return Buffer.from([GS, 0x21, (cw << 4) | ch]);
};

/* ------------------------------------------------------------------ *
 * Konfigurasi
 * ------------------------------------------------------------------ */

// Jumlah kolom maksimum pada ukuran huruf 1x, per lebar kertas dan font.
const PAPER_COLS = {
    80: { A: 48, B: 64 },
    58: { A: 32, B: 42 },
};

// Preset ukuran huruf -> pengali lebar (w) dan tinggi (h).
const SIZE_PRESETS = {
    normal: { w: 1, h: 1 },
    tall: { w: 1, h: 2 },
    large: { w: 2, h: 2 },
};

// Lebar kolom label pada layout "Label : Nilai".
const LABEL_WIDTH = 20;

// Di bawah lebar ini kolom nilai jadi terlalu sempit untuk gaya "Label : Nilai",
// sehingga layout otomatis dipindah ke bentuk bertingkat.
const MIN_VALUE_COLS = 12;
const toInt = (val, def) => {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : def;
};

const toBool = (val, def) => {
    if (val === undefined || val === null || val === '') return def;
    return !['0', 'false', 'no', 'off'].includes(String(val).trim().toLowerCase());
};

/**
 * Gabungkan konfigurasi .env dengan override dari request.
 *
 * Lebar kolom dihitung otomatis: kolom maksimum kertas dibagi pengali lebar
 * huruf. Nilai PRINTER_THERMAL_WIDTH hanya boleh mempersempit, tidak boleh
 * melebihi kapasitas kertas - kalau dilebihkan printer akan membungkus sendiri
 * dan kolomnya jadi berantakan.
 *
 * @param {object} override - { ip, port, paper, size, width, font, timeout,
 *                              copies, cut, qr_size, feed }
 */
const getPrinterConfig = (override = {}) => {
    const rawFont = String(override.font || process.env.PRINTER_THERMAL_FONT || 'A').trim().toUpperCase();
    const font = rawFont === 'B' ? 'B' : 'A';

    const paper = toInt(override.paper || process.env.PRINTER_THERMAL_PAPER, 80) === 58 ? 58 : 80;

    const sizeKey = String(override.size || process.env.PRINTER_THERMAL_SIZE || 'normal').trim().toLowerCase();
    const size = SIZE_PRESETS[sizeKey] || SIZE_PRESETS.normal;

    // Kolom penuh pada ukuran 1x, lalu dibagi pengali lebar huruf.
    const paperCols = PAPER_COLS[paper][font];
    const maxCols = Math.max(8, Math.floor(paperCols / size.w));

    const wantWidth = toInt(override.width || process.env.PRINTER_THERMAL_WIDTH, maxCols);
    const width = Math.max(8, Math.min(wantWidth, maxCols));

    return {
        ip: String(override.ip || process.env.PRINTER_THERMAL_IP || '').trim(),
        port: toInt(override.port || process.env.PRINTER_THERMAL_PORT, 9100),
        paper,
        font,
        size: SIZE_PRESETS[sizeKey] ? sizeKey : 'normal',
        scale_w: size.w,
        scale_h: size.h,
        width,
        max_width: maxCols,
        // Catatan kaki dicetak pada ukuran 1x, jadi boleh selebar kertas penuh.
        footer_width: paperCols,
        // Kolom nilai terlalu sempit -> pakai layout bertingkat.
        layout: (width - LABEL_WIDTH - 2) >= MIN_VALUE_COLS ? 'inline' : 'stacked',
        timeout: toInt(override.timeout || process.env.PRINTER_THERMAL_TIMEOUT, 5000),
        copies: Math.max(1, toInt(override.copies || process.env.PRINTER_THERMAL_COPIES, 1)),
        cut: toBool(override.cut !== undefined ? override.cut : process.env.PRINTER_THERMAL_CUT, true),
        qr_size: Math.min(16, Math.max(1, toInt(override.qr_size || process.env.PRINTER_THERMAL_QR_SIZE, 6))),
        feed: Math.max(0, toInt(override.feed !== undefined ? override.feed : process.env.PRINTER_THERMAL_FEED, 4)),
    };
};

/* ------------------------------------------------------------------ *
 * Utilitas teks
 * ------------------------------------------------------------------ */

/** Buang aksen/karakter non-ASCII supaya aman di codepage printer. */
const sanitize = (text) => String(text === null || text === undefined ? '' : text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7e]/g, '');

/** Pecah teks menjadi beberapa baris sesuai lebar kolom (word wrap). */
const wrapText = (text, width) => {
    const clean = sanitize(text).trim();
    if (!clean) return [''];
    if (width < 1) return [clean];

    const lines = [];
    let line = '';

    clean.split(/\s+/).forEach((word) => {
        // Kata tunggal lebih panjang dari kolom -> potong paksa.
        while (word.length > width) {
            if (line) { lines.push(line); line = ''; }
            lines.push(word.slice(0, width));
            word = word.slice(width);
        }
        if (!line) {
            line = word;
        } else if (line.length + 1 + word.length <= width) {
            line += ' ' + word;
        } else {
            lines.push(line);
            line = word;
        }
    });

    if (line) lines.push(line);
    return lines.length ? lines : [''];
};

/** Teks rata tengah, otomatis wrap bila kepanjangan. */
const centerText = (text, width) => wrapText(text, width)
    .map((line) => {
        const pad = Math.max(0, Math.floor((width - line.length) / 2));
        return ' '.repeat(pad) + line;
    })
    .join('\n');

/**
 * Baris "Label : Value" dengan kolom sejajar.
 * Value yang panjang di-wrap dengan indentasi menggantung.
 */
const labelRow = (label, value, width, labelWidth) => {
    const lw = Math.min(labelWidth, Math.max(1, width - 4));
    const vw = Math.max(1, width - lw - 2);
    const head = sanitize(label).slice(0, lw).padEnd(lw, ' ');
    const lines = wrapText(value, vw);

    return lines
        .map((line, i) => (i === 0 ? `${head}: ${line}` : `${' '.repeat(lw + 2)}${line}`))
        .join('\n');
};

/** Garis pemisah selebar kertas. */
const separator = (width, char = '-') => char.repeat(Math.max(1, width));

/* ------------------------------------------------------------------ *
 * Builder ESC/POS
 * ------------------------------------------------------------------ */

/** Encode teks ke buffer sesuai codepage printer (latin1/PC437). */
const encodeText = (text) => Buffer.from(sanitize(text), 'latin1');

/** Satu atau beberapa baris teks + line feed. */
const textLine = (text = '') => Buffer.concat(
    String(text).split('\n').map((line) => Buffer.concat([encodeText(line), CMD.LF]))
);

/**
 * QR Code native Epson (GS ( k, model 2).
 * Jauh lebih cepat daripada mengirim QR sebagai gambar raster.
 */
const qrCode = (data, size = 6) => {
    const payload = Buffer.from(sanitize(data), 'latin1');
    const len = payload.length + 3;
    const pL = len & 0xff;
    const pH = (len >> 8) & 0xff;

    return Buffer.concat([
        // Pilih model QR: model 2
        Buffer.from([GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]),
        // Ukuran modul (1..16)
        Buffer.from([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size]),
        // Error correction level M (48=L, 49=M, 50=Q, 51=H)
        Buffer.from([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]),
        // Simpan data ke symbol storage area
        Buffer.from([GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]),
        payload,
        // Cetak symbol
        Buffer.from([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]),
    ]);
};

/* ------------------------------------------------------------------ *
 * Struk Penimbangan
 * ------------------------------------------------------------------ */

/**
 * Baris bertingkat: label di atas, nilai menjorok di bawahnya.
 * Dipakai saat kolom terlalu sempit untuk gaya "Label : Nilai".
 */
const stackedRow = (label, value, width, indent = 2) => {
    const lines = wrapText(value, Math.max(1, width - indent));
    return [sanitize(label)].concat(lines.map((l) => ' '.repeat(indent) + l)).join('\n');
};

/**
 * Terima config lengkap atau sekadar angka lebar (dipakai di pemanggilan lama).
 */
const normalizeCfg = (cfg) => {
    if (typeof cfg !== 'number') return cfg;
    const width = cfg;
    return {
        width,
        footer_width: width,
        scale_w: 1,
        scale_h: 1,
        size: 'normal',
        layout: (width - LABEL_WIDTH - 2) >= MIN_VALUE_COLS ? 'inline' : 'stacked',
    };
};

/**
 * Susun isi struk sebagai baris-baris terstruktur.
 * Dipakai bersama oleh builder teks (preview) dan builder ESC/POS.
 */
const strukSections = (data, cfg) => {
    const { width, layout } = cfg;
    const rows = [
        ['Tanggal Jam Timbang', data.tgl_jam],
        ['Nomor Kendaraan', data.no_kendaraan],
        ['Nomor Uji', data.no_uji],
        ['Masa Berlaku Uji', data.masa_berlaku],
        ['JBI.Kendaraan', data.jbi],
        ['Berat Timbangan', data.berat_timbang],
        ['Kelebihan Berat', data.kelebihan_berat],
        ['Persentase Kelebihan', data.prosen_lebih],
        ['Asal', data.asal],
        ['Tujuan', data.tujuan],
        ['Komoditi', data.komoditi],
        ['Status Pelanggaran', data.status_pelanggaran],
    ];

    // Catatan: kode pelanggaran (DYA/DIM/PST/DOK/TCM/KLS/RLL) sengaja TIDAK
    // dicetak di kertas. Kode hanya dikembalikan pada response API sebagai
    // field data.kode_pelanggaran.

    return {
        header: [data.judul, data.sub_judul].filter(Boolean),
        rows: rows.map(([label, value]) => (layout === 'stacked'
            ? stackedRow(label, value || '-', width)
            : labelRow(label, value || '-', width, LABEL_WIDTH))),
        footer: [
            '*Struk Penimbangan Kendaraan Bermotor',
            '*Dokumen Bukti Penimbangan Kendaraan Bermotor',
        ],
    };
};

/**
 * Versi teks polos dari struk - dipakai untuk preview/debug tanpa printer.
 * Catatan: preview hanya menunjukkan susunan kolom, bukan ukuran fisik huruf.
 * @returns {string}
 */
const buildStrukText = (data, cfgOrWidth = 42) => {
    const cfg = normalizeCfg(cfgOrWidth);
    const width = cfg.width;
    const footerWidth = cfg.footer_width || width;
    const s = strukSections(data, cfg);
    const out = [];

    s.header.forEach((line) => out.push(centerText(line, width)));
    out.push(separator(width));
    s.rows.forEach((line) => out.push(line));
    out.push(separator(width));
    out.push('');
    out.push(centerText('[QR] ' + (data.qr_data || '-'), footerWidth));
    out.push('');
    s.footer.forEach((line) => out.push(centerText(line, footerWidth)));

    return out.join('\n');
};

/**
 * Bangun buffer ESC/POS struk penimbangan (mengikuti layout struk kios).
 * @param {object} data - hasil mapping data penimbangan
 * @param {object} cfg  - hasil getPrinterConfig()
 * @returns {Buffer}
 */
const buildStrukBuffer = (data, cfgInput) => {
    const cfg = normalizeCfg(cfgInput);
    const width = cfg.width;
    const footerWidth = cfg.footer_width || width;
    const s = strukSections(data, cfg);
    const chunks = [];

    chunks.push(CMD.INIT);
    chunks.push(CMD.CODEPAGE_PC437);
    chunks.push(cfg.font === 'B' ? CMD.FONT_B : CMD.FONT_A);
    // Pengali ukuran huruf untuk judul dan isi struk.
    chunks.push(charSize(cfg.scale_w, cfg.scale_h));

    // Judul
    chunks.push(CMD.ALIGN_CENTER);
    chunks.push(CMD.BOLD_ON);
    s.header.forEach((line) => chunks.push(textLine(wrapText(line, width).join('\n'))));
    chunks.push(CMD.BOLD_OFF);

    // Isi
    chunks.push(CMD.ALIGN_LEFT);
    chunks.push(textLine(separator(width)));
    s.rows.forEach((line) => chunks.push(textLine(line)));
    chunks.push(textLine(separator(width)));

    // Mulai di sini kembali ke ukuran 1x: QR dan catatan kaki tidak ikut diperbesar
    // supaya struk tidak boros kertas.
    chunks.push(CMD.SIZE_NORMAL);

    // QR
    chunks.push(CMD.LF);
    chunks.push(CMD.ALIGN_CENTER);
    if (data.qr_data) {
        chunks.push(qrCode(data.qr_data, cfg.qr_size));
        chunks.push(CMD.LF);
    }

    // Footer
    chunks.push(CMD.LF);
    s.footer.forEach((line) => chunks.push(textLine(wrapText(line, footerWidth).join('\n'))));

    chunks.push(CMD.ALIGN_LEFT);
    if (cfg.feed > 0) chunks.push(Buffer.from([ESC, 0x64, cfg.feed])); // ESC d n
    if (cfg.cut) chunks.push(CMD.CUT_PARTIAL);

    return Buffer.concat(chunks);
};

/* ------------------------------------------------------------------ *
 * Pengiriman ke printer
 * ------------------------------------------------------------------ */

/**
 * Kirim buffer mentah ke printer via TCP RAW (port 9100).
 * @returns {Promise<{success: boolean, message: string, bytes: number}>}
 */
const sendToPrinter = (buffer, cfg) => new Promise((resolve, reject) => {
    if (!cfg.ip) {
        reject(new Error('IP printer thermal belum diset (PRINTER_THERMAL_IP).'));
        return;
    }

    const socket = new net.Socket();
    let settled = false;

    const done = (err) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (err) reject(err);
        else resolve({ success: true, message: 'Data struk terkirim ke printer.', bytes: buffer.length });
    };

    socket.setTimeout(cfg.timeout);
    socket.on('timeout', () => done(new Error(`Koneksi ke printer ${cfg.ip}:${cfg.port} timeout (${cfg.timeout} ms).`)));
    socket.on('error', (err) => done(new Error(`Gagal terhubung ke printer ${cfg.ip}:${cfg.port} - ${err.message}`)));

    socket.connect(cfg.port, cfg.ip, () => {
        socket.write(buffer, (err) => {
            if (err) { done(err); return; }
            // Beri jeda singkat agar buffer benar-benar terkirim sebelum socket ditutup.
            socket.end(() => done(null));
        });
    });
});

/**
 * Cetak struk penimbangan ke printer thermal.
 * @param {object} data - hasil mapping data penimbangan
 * @param {object} override - override konfigurasi printer per-request
 */
const printStruk = async (data, override = {}) => {
    const cfg = getPrinterConfig(override);
    const buffer = buildStrukBuffer(data, cfg);

    let bytes = 0;
    for (let i = 0; i < cfg.copies; i += 1) {
        const result = await sendToPrinter(buffer, cfg);
        bytes += result.bytes;
    }

    return { success: true, copies: cfg.copies, bytes, printer: `${cfg.ip}:${cfg.port}` };
};

module.exports = {
    CMD,
    charSize,
    PAPER_COLS,
    SIZE_PRESETS,
    getPrinterConfig,
    sanitize,
    wrapText,
    centerText,
    labelRow,
    stackedRow,
    separator,
    textLine,
    qrCode,
    buildStrukText,
    buildStrukBuffer,
    sendToPrinter,
    printStruk,
};

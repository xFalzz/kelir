-- Skema DDL (Data Definition Language) Sistem Kurasi Kelir
-- Standar SQLite 3 / PostgreSQL

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sumber_rujukan (
    kode        VARCHAR(8) PRIMARY KEY,
    judul       VARCHAR(255) NOT NULL,
    lembaga     VARCHAR(255) NOT NULL,
    tahun       VARCHAR(32)  NOT NULL,
    url         VARCHAR(512) NOT NULL,
    ringkasan   TEXT         NOT NULL
);

CREATE TABLE IF NOT EXISTS lisensi_aset (
    id          VARCHAR(8) PRIMARY KEY,
    nama        VARCHAR(255) NOT NULL,
    dipakai_di  VARCHAR(128) NOT NULL,
    pembuat     VARCHAR(255) NOT NULL,
    sumber_url  VARCHAR(512) NOT NULL,
    lisensi     VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS benda_pusaka (
    id                  VARCHAR(32) PRIMARY KEY,
    nama_id             VARCHAR(128) NOT NULL,
    nama_jv             VARCHAR(128) NOT NULL,
    ejaan_aksara_nama   VARCHAR(128) NOT NULL,
    status_tinjauan_jv  VARCHAR(16)  NOT NULL CHECK (status_tinjauan_jv IN ('draf', 'ditinjau')),
    subjudul_id         VARCHAR(255) NOT NULL,
    subjudul_jv         VARCHAR(255) NOT NULL,
    kategori            VARCHAR(128) NOT NULL,
    tahun_unesco        VARCHAR(32)  NOT NULL,
    berkas_unesco       VARCHAR(32)  NOT NULL,
    ringkasan_id        TEXT         NOT NULL,
    ringkasan_jv        TEXT         NOT NULL,
    peran_panggung      TEXT         NOT NULL,
    lisensi_ref         VARCHAR(8)   NOT NULL,
    CONSTRAINT fk_benda_lisensi
        FOREIGN KEY (lisensi_ref) REFERENCES lisensi_aset(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS benda_sumber (
    benda_id    VARCHAR(32) NOT NULL,
    sumber_kode VARCHAR(8)  NOT NULL,
    PRIMARY KEY (benda_id, sumber_kode),
    CONSTRAINT fk_bs_benda
        FOREIGN KEY (benda_id) REFERENCES benda_pusaka(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_bs_sumber
        FOREIGN KEY (sumber_kode) REFERENCES sumber_rujukan(kode)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS titik_info_benda (
    id                   VARCHAR(64) PRIMARY KEY,
    benda_id             VARCHAR(32)  NOT NULL,
    urutan               INTEGER      NOT NULL CHECK (urutan >= 1),
    label_id             VARCHAR(128) NOT NULL,
    label_jv             VARCHAR(128) NOT NULL,
    ejaan_aksara_label   VARCHAR(128) NOT NULL,
    pos_x                REAL         NOT NULL,
    pos_y                REAL         NOT NULL,
    pos_z                REAL         NOT NULL,
    cam_x                REAL         NOT NULL,
    cam_y                REAL         NOT NULL,
    cam_z                REAL         NOT NULL,
    uraian_id            TEXT         NOT NULL,
    uraian_jv            TEXT         NOT NULL,
    ejaan_aksara_uraian  VARCHAR(255) NOT NULL,
    status_tinjauan_jv   VARCHAR(16)  NOT NULL CHECK (status_tinjauan_jv IN ('draf', 'ditinjau')),
    CONSTRAINT fk_titik_benda
        FOREIGN KEY (benda_id) REFERENCES benda_pusaka(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS titik_sumber (
    titik_id    VARCHAR(64) NOT NULL,
    sumber_kode VARCHAR(8)  NOT NULL,
    PRIMARY KEY (titik_id, sumber_kode),
    CONSTRAINT fk_ts_titik
        FOREIGN KEY (titik_id) REFERENCES titik_info_benda(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ts_sumber
        FOREIGN KEY (sumber_kode) REFERENCES sumber_rujukan(kode)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lakon_wayang (
    id                  VARCHAR(64) PRIMARY KEY,
    judul_id            VARCHAR(128) NOT NULL,
    judul_jv            VARCHAR(128) NOT NULL,
    ejaan_aksara_judul  VARCHAR(128) NOT NULL,
    subjudul_id         VARCHAR(255) NOT NULL,
    epos_asal           VARCHAR(128) NOT NULL,
    tokoh_kanan         VARCHAR(128) NOT NULL,
    tokoh_kiri          VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS babak_lakon (
    lakon_id            VARCHAR(64)  NOT NULL,
    nomor               INTEGER      NOT NULL CHECK (nomor BETWEEN 1 AND 10),
    judul_id            VARCHAR(128) NOT NULL,
    judul_jv            VARCHAR(128) NOT NULL,
    ejaan_aksara_judul  VARCHAR(128) NOT NULL,
    narasi_id           TEXT         NOT NULL,
    narasi_jv           TEXT         NOT NULL,
    ejaan_aksara_narasi VARCHAR(255) NOT NULL,
    petunjuk_dalang     TEXT         NOT NULL,
    posisi_awal_rama    REAL         NOT NULL,
    posisi_awal_kidang  REAL         NOT NULL,
    PRIMARY KEY (lakon_id, nomor),
    CONSTRAINT fk_babak_lakon
        FOREIGN KEY (lakon_id) REFERENCES lakon_wayang(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS babak_sumber (
    lakon_id    VARCHAR(64) NOT NULL,
    nomor_babak INTEGER     NOT NULL,
    sumber_kode VARCHAR(8)  NOT NULL,
    PRIMARY KEY (lakon_id, nomor_babak, sumber_kode),
    CONSTRAINT fk_babs_babak
        FOREIGN KEY (lakon_id, nomor_babak) REFERENCES babak_lakon(lakon_id, nomor)
        ON DELETE CASCADE,
    CONSTRAINT fk_babs_sumber
        FOREIGN KEY (sumber_kode) REFERENCES sumber_rujukan(kode)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS log_tanya_jawab (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    benda_id            VARCHAR(32)  NOT NULL,
    pertanyaan          VARCHAR(280) NOT NULL,
    jawaban             TEXT         NOT NULL,
    mode_penyedia       VARCHAR(32)  NOT NULL CHECK (mode_penyedia IN ('gemini', 'meta', 'kurasi-lokal')),
    ditemukan_di_kurasi INTEGER      NOT NULL CHECK (ditemukan_di_kurasi IN (0, 1)),
    dibuat_pada         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_benda
        FOREIGN KEY (benda_id) REFERENCES benda_pusaka(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_titik_benda ON titik_info_benda(benda_id, urutan);
CREATE INDEX IF NOT EXISTS idx_babak_lakon ON babak_lakon(lakon_id, nomor);

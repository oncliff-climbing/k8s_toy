    // server.js
    const express = require('express');
    const app = express();
    const fs = require('fs');
    const path = require('path');
    const PORT = 3001;
    const mariadb = require('mariadb');
    const cors = require('cors');

    // 여기에 데이터베이스 설정을 추가하세요. (예: MongoDB, PostgreSQL 등)
    const pool = mariadb.createPool({
        host: '211.183.3.100', 
        user: 'user1', 
        password: 'test123',
        database: 'test',
        connectionLimit: 5
    });

    app.use(cors());

    // server.js 수정 부분
    app.get('/stream/:songId', async (req, res) => {
        const songId = req.params.songId;

        try {
            const connection = await pool.getConnection();
            const rows = await connection.query('SELECT id, title, file_path FROM songs WHERE id = ?', [songId]);
            connection.release();

            if (rows.length > 0) {
                // DB에 저장된 파일명을 가져옵니다.
                const filePath = rows[0].file_path; // 예를 들어, 'song1'
                const songPath = path.join(__dirname, '..', filePath.replace('/', path.sep));
                if (fs.existsSync(songPath)) {
                    const stat = fs.statSync(songPath);
                    const fileSize = stat.size;
                    const range = req.headers.range;

                    if (range) {
                        const parts = range.replace(/bytes=/, "").split("-");
                        const start = parseInt(parts[0], 10);
                        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                        const chunksize = (end-start)+1;
                        const file = fs.createReadStream(songPath, {start, end});
                        const head = {
                            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunksize,
                            'Content-Type': 'audio/mp3',
                        };

                        res.writeHead(206, head);
                        file.pipe(res);
                    } else {
                        const head = {
                            'Content-Length': fileSize,
                            'Content-Type': 'audio/mp3',
                        };
                        res.writeHead(200, head);
                        fs.createReadStream(songPath).pipe(res);
                    }
                } else {
                    res.status(404).send('File not found');
                }
            } else {
                res.status(404).send('Song not found');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    app.get('/api/songs', async (req, res) => {
        try {
            const connection = await pool.getConnection();
            // 아티스트, 재생 횟수를 포함하여 곡 정보 조회 및 재생 횟수 기준으로 정렬
            // 여기서는 순위 계산을 직접 수행하지 않고, 클라이언트에서 처리할 수 있도록 합니다.
            const query = `SELECT id, title, artist, play_count FROM songs ORDER BY play_count DESC`;
            const rows = await connection.query(query);
            connection.release();
    
            res.json(rows); // 조회된 곡 목록을 JSON 형태로 응답
        } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

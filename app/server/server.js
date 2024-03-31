    // server.js
    const AWS = require('aws-sdk');
    const express = require('express');
    const app = express();
    const fs = require('fs');
    const path = require('path');
    const PORT = 3001;
    const mariadb = require('mariadb');
    const cors = require('cors');

    // AWS SDK를 초기화합니다.
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    const s3 = new AWS.S3();

    // 여기에 데이터베이스 설정을 추가하세요. (예: MongoDB, PostgreSQL 등)
    const pool = mariadb.createPool({
        host: process.env.DATABASE_HOST, 
        user: process.env.DATABASE_USER, 
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
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
                const s3Key = rows[0].file_path; // S3에 저장된 파일의 키
                const signedUrl = s3.getSignedUrl('getObject', {
                    Bucket: 'dzdzeqwreqwr-7',
                    Key: s3Key,
                    Expires: 60 * 5 // URL이 5분 동안 유효함
                });

                // 클라이언트에게 서명된 URL을 반환합니다.
                res.send({ url: signedUrl });
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
            const query = `
                SELECT id, title, artist, play_count, prevRank, rankChange
                FROM songs
                ORDER BY after_play_count DESC
            `;
            const rows = await connection.query(query);
            connection.release();
    
            res.json(rows); // 조회된 곡 목록을 JSON 형태로 응답
        } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
        }
    });

    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '/client/build/index.html'));
    });

    // play_count를 증가시키는 API 추가
    app.post('/api/play/:songId', async (req, res) => {
        const songId = req.params.songId;

        try {
            const connection = await pool.getConnection();
            // play_count를 1 증가시키기 위한 SQL 쿼리 실행
            await connection.query('UPDATE songs SET play_count = play_count + 1 WHERE id = ?', [songId]);
            connection.release();

            res.send({ success: true, message: 'Play count updated successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    // 차트 업데이트를 위한 API 엔드포인트
    app.post('/api/update-chart', async (req, res) => {
        try {
            const connection = await pool.getConnection();

            // 'before' 데이터를 'after'로 복사
            await connection.query('UPDATE songs SET after_play_count = play_count');

            // 현재 순위를 계산합니다.
            const currentRanks = await connection.query(`
                SELECT id, after_play_count FROM songs
                ORDER BY after_play_count DESC
            `);

            // 이전 순위(prevRank)와 비교하여 순위 변동을 계산합니다.
            // currentRank는 실제 순위가 됩니다.
            await Promise.all(currentRanks.map(async (song, index) => {
                const currentRank = index + 1; // 현재 순위
                const prevRankResult = await connection.query('SELECT prevRank FROM songs WHERE id = ?', [song.id]);
                const prevRank = prevRankResult[0].prevRank || currentRank; // 이전 순위가 없으면 현재 순위를 사용
                const rankChange = prevRank - currentRank; // 순위 변동 계산 (이전 순위에서 현재 순위를 뺌)
                await connection.query('UPDATE songs SET prevRank = ?, rankChange = ? WHERE id = ?', [currentRank, rankChange, song.id]);
            }));
            
            connection.release();
            res.send({ success: true, message: 'Chart updated successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });


    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

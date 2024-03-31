USE test;

CREATE TABLE songs (
    id INT(11) NOT NULL AUTO_INCREMENT,
    file_path VARCHAR(255) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    artist VARCHAR(255) DEFAULT NULL,
    play_count INT(11) DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO songs (file_path, title, artist, play_count) VALUES
('/public/audio/song1.mp3', '밤양갱', '비비', 10000),
('/public/audio/song2.mp3', '첫 만남은 계획대로 되지 않아', 'TWS (투어스)', 200000),
('/public/audio/song3.mp3', '예뻤어', '데이식스', 400000),
('/public/audio/song4.mp3', 'Perfect Night', '르세라핌', 800000),
('/public/audio/song5.mp3', 'AK-47', '맨스티어', 1000000);

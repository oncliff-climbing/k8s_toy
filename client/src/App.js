import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // 서버로부터 곡 목록을 받아오는 함수
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/songs'); // 서버 엔드포인트에 맞게 조정하세요
        setSongs(response.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []); // 빈 배열은 컴포넌트 마운트 시에만 fetchSongs 함수를 실행하라는 의미입니다.

  const playSong = (songId) => {
    const audio = new Audio(`http://localhost:3001/stream/${songId}`);
    audio.play()
        .then(() => console.log(`Playing song with ID: ${songId}`))
        .catch(err => console.error('Error playing song:', err));
  };

  return (
    <div>
      {songs.map((song) => (
        <div key={song.id}>
          {song.name} <button onClick={() => playSong(song.id)}>Play</button>
        </div>
      ))}
    </div>
  );
};

export default MusicPlayer;
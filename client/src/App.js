import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';
const SongList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const SongItem = styled.div`
  margin: 10px 0;
  padding: 10px;
  width: 90%;
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SongDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SongMeta = styled.span`
  margin: 2px 0;
  font-size: 0.9em;
  color: #666;
`;

const PlayPauseButton = ({ isPlaying, onClick }) => {
  return (
      <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {isPlaying ? <FaPause color="#007bff" size="20px" /> : <FaPlay color="#007bff" size="20px" />}
      </button>
  );
};

const MusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null); // 현재 재생 중인 오디오 객체를 저장
  const [currentSongId, setCurrentSongId] = useState(null); // 현재 재생 중인 곡의 ID
  const [progress, setProgress] = useState({}); // 각 곡의 재생 진행률을 저장하는 객체

  

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/songs');
        console.log(response.data); // 서버 응답 확인용
        setSongs(response.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []); // 빈 배열은 컴포넌트 마운트 시에만 fetchSongs 함수를 실행하라는 의미입니다.

  const playSong = (songId) => {
    if (currentAudio) {
        currentAudio.pause(); // 현재 재생 중인 오디오가 있으면 정지
        setProgress(prev => ({...prev, [currentSongId]: 0})); // 진행률 초기화
    }
    const audio = new Audio(`http://localhost:3001/stream/${songId}`);
    setCurrentSongId(songId); // 현재 재생 중인 곡의 ID 업데이트
    audio.play()
        .then(() => {
            console.log(`Playing song with ID: ${songId}`);
            setCurrentAudio(audio); // 현재 재생 중인 오디오로 설정

            audio.ontimeupdate = () => {
                const currentProgress = (audio.currentTime / audio.duration) * 100;
                setProgress(prev => ({...prev, [songId]: currentProgress}));
            };
        })
        .catch(err => console.error('Error playing song:', err));
  };

  const togglePlayPause = (songId) => {
    // 현재 재생 중인 오디오가 있고, 클릭한 곡이 현재 재생 중인 곡이면 일시정지
    if (currentAudio && currentSongId === songId) {
        currentAudio.paused ? currentAudio.play() : currentAudio.pause();
    } else {
        playSong(songId); // 다른 곡을 재생
    }
  };

  return (
    <SongList>
        {songs.map((song) => (
            <SongItem key={song.id}>
                <SongDetails>
                    <strong>{song.title}</strong>
                    <SongMeta>Artist: {song.artist}</SongMeta>
                    <SongMeta>Plays: {song.play_count}</SongMeta>
                    {/* 프로그레스 바 추가 */}
                    {currentSongId === song.id && 
                        <progress value={progress[song.id] || 0} max="100"></progress>
                    }
                </SongDetails>
                <PlayPauseButton
                        isPlaying={currentSongId === song.id && currentAudio && !currentAudio.paused}
                        onClick={() => togglePlayPause(song.id)}
                    />
            </SongItem>
        ))}
    </SongList>
  );
};
export default MusicPlayer;

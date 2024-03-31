  import React, { useState, useEffect, useRef } from "react";
  import axios from "axios";
  import styled from "styled-components";
  import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
  import { FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

  const SongList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  `;

  const SongItem = styled.div`
    margin: 10px 0;
    padding: 10px;
    width: 100%;
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

  const PlayerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  `;
  const PlayerControls = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: fixed;
    bottom: 0;
  `;

  const VolumeControl = styled.div`
    display: flex;
    align-items: center;
    margin-left: 20px;
  `;

  const TimeDisplay = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px; // 내부 여백 추가
  `;
  const Button = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 50%; // 동그랗게 만들기
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const StyledVolumeButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `;

  const ProgressBarContainer = styled.div`
    position: relative;
    width: 50%; // 너비 조절
    height: 8px;
  `;

  // ProgressBar 스타일 정의
  const ProgressBar = styled.input`
    -webkit-appearance: none;
    width: 100%; // 전체 너비를 사용합니다.
    height: 8px; // 높이 설정
    border-radius: 4px; // 둥근 모서리 설정
    background: #ddd; // 기본 배경색 설정
    position: relative; // 상대 위치 설정

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: #007bff;
      cursor: pointer;
    }

    &::before {
      content: ''; // 내용 없음
      position: absolute; // 절대 위치 설정
      top: 0;
      left: 0;
      height: 100%;
      width: ${props => props.buffered}%; // 버퍼링 상태에 따라 너비를 설정
      background: rgba(100, 100, 255, 0.7); // 버퍼링 바의 색상 설정
      border-radius: 4px; // 둥근 모서리 설정
      z-index: 1; // thumb 위에 표시하기 위한 z-index 설정
    }

    &::-webkit-slider-thumb {
      z-index: 2; // thumb가 버퍼링 바 위에 오도록 z-index 설정
    }
  `;

  const BufferingProgressBar = styled(ProgressBar)`
    background: rgba(100, 100, 255, 0.7); // 버퍼링 바의 색상 설정
  `;

  const VolumeBar = styled(ProgressBar)`
    background: ${(props) => (props.disabled ? "#ddd" : "#ccc")};
    &::-webkit-slider-thumb {
      background: ${(props) => (props.disabled ? "#bbb" : "#666")};
    }
  `;

  const CurrentSongInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  `;

  const PlayPauseButton = ({ isPlaying, onClick }) => {
    return (
      <Button onClick={onClick}>
        {isPlaying ? (
          <FaPause color="#007bff" size="20px" />
        ) : (
          <FaPlay color="#007bff" size="20px" />
        )}
      </Button>
    );
  };

  const RankAndChange = styled.div`
    display: flex;
    align-items: center;
    margin-right: 10px; // 제목과의 간격
  `;

  // 순위 표시 스타일
  const Rank = styled.span`
    font-weight: bold;
    margin-right: 5px; // 변동 인디케이터와의 간격
  `;

  // 순위 변동 인디케이터
  const RankChangeIndicator = styled.span`
    font-size: 0.9em;
    display: flex;
    align-items: center;
    margin-right: 4px; // 변동 수치와의 간격
  `;

  // 순위 변동 수치
  const RankChangeValue = styled.span`
    color: ${(props) =>
      props.value > 0 ? "green" : props.value < 0 ? "red" : "grey"};
  `;

  const MusicPlayer = () => {
    const [songs, setSongs] = useState([]);
    const [currentSongId, setCurrentSongId] = useState(null); // 현재 재생 중인 곡의 ID
    const audioRef = useRef(new Audio()); // 오디오 객체를 ref로 관리

    // 현재 재생 시간과 곡의 전체 길이 상태
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
      const fetchSongs = async () => {
        try {
          const response = await axios.get("/api/songs");
          console.log(response.data); // 서버 응답 확인용
          setSongs(response.data);
        } catch (error) {
          console.error("Error fetching songs:", error);
        }
      };

      fetchSongs();
    }, []); // 빈 배열은 컴포넌트 마운트 시에만 fetchSongs 함수를 실행하라는 의미입니다.

    useEffect(() => {
      const audio = audioRef.current;
      audio.onloadedmetadata = () => {
        setDuration(audio.duration); // 곡의 전체 길이 설정
      };
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime); // 현재 재생 시간 업데이트
      };
      // 컴포넌트 언마운트 시 이벤트 리스너 정리
      return () => {
        audio.onloadedmetadata = null;
        audio.ontimeupdate = null;
      };
    }, [currentSongId]); // 의존성 배열에 currentSongId 추가

    const playSong = async (songId) => {
      try {
        // 서명된 URL을 가져오기 위한 서버 요청
        const { data } = await axios.get(`/stream/${songId}`);
        const signedUrl = data.url;

        const audio = audioRef.current;
        audio.src = signedUrl; // 서명된 URL 설정
        setCurrentSongId(songId);
        await audio.play(); // 재생 시작
        // 재생이 성공적으로 시작되면 재생 횟수 업데이트
        await updatePlayCount(songId);
      } catch (error) {
        console.error("Error playing song:", error);
      }
    };

    const togglePlayPause = async (songId) => {
      // 현재 재생 중인 오디오가 있고, 그 오디오가 현재 선택한 곡이면
      if (currentSongId === songId) {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      } else {
        // 다른 곡을 재생
        await playSong(songId);
      }
    };
    const [isMuted, setIsMuted] = useState(false); // 음소거 상태
    const [prevVolume, setPrevVolume] = useState(0.5); // 이전 음량 값을 저장하는 상태
    const toggleMute = () => {
      const audio = audioRef.current;
      if (!audio.muted) {
        setPrevVolume(volume); // 음소거 전 현재 볼륨을 저장
        setVolume(0);
        audio.muted = true;
      } else {
        setVolume(prevVolume); // 음소거 해제 시 저장된 볼륨으로 복원
        audio.muted = false;
      }
      setIsMuted(audio.muted);
    };

    const handleProgressChange = (e) => {
      const audio = audioRef.current;
      const newTime = (e.target.value / 100) * duration;
      audio.currentTime = newTime;
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const [volume, setVolume] = useState(0.5); // 음량 초기값 (0 ~ 1 사이)

    useEffect(() => {
      const audio = audioRef.current;
      audio.volume = volume; // 음량 조절
    }, [volume]);

    const handleVolumeChange = (e) => {
      setVolume(e.target.value);
    };
    // 재생/일시정지 토글 버튼
    const toggle = () => {
      const audio = audioRef.current;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    };

    const updatePlayCount = async (songId) => {
      try {
        await axios.post(`/api/play/${songId}`);
        console.log(`Play count updated for song ID: ${songId}`);
        // 성공적으로 play_count를 업데이트했다면, 곡 목록을 다시 불러오거나
        // UI를 업데이트하는 로직을 추가할 수 있습니다.
        // 예를 들어, 상태를 업데이트하여 리렌더링을 유도할 수 있습니다.
      } catch (error) {
        console.error("Error updating play count:", error);
      }
    };

    // 순위 변동을 보여주는 컴포넌트
    const RankChangeIndicator = ({ rankChange }) => {
      if (rankChange > 0) {
        return <FaArrowUp style={{ color: "green" }} />;
      } else if (rankChange < 0) {
        return <FaArrowDown style={{ color: "red" }} />;
      } else {
        // 순위 변동이 없을 때는 작대기(-) 아이콘을 표시
        return <FaMinus style={{ color: "grey" }} />;
      }
    };
    
    // 버퍼링 진행 상태를 위한 상태 변수 추가
    const [bufferingProgress, setBufferingProgress] = useState(0);

    useEffect(() => {

      const audio = audioRef.current; // 오디오 요소에 대한 참조
    
      // 버퍼링 진행률을 계산하여 상태를 업데이트하는 함수
      const handleProgress = () => {
        if (audio.buffered.length > 0) {
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          const duration = audio.duration;
          setBufferingProgress((bufferedEnd / duration) * 100);
        }
      };
    
      // 오디오 요소에 'progress' 이벤트 리스너를 추가
      audio.addEventListener('progress', handleProgress);
    
      // 컴포넌트 언마운트 시 이벤트 리스너를 제거
      return () => {
        audio.removeEventListener('progress', handleProgress);
      };
    }, []); // 빈 의존성 배열을 사용하여 컴포넌트가 마운트될 때만 실행

    return (
      <PlayerContainer>
        <SongList>
          {songs.map((song, index) => (
            <SongItem key={song.id}>
              <RankAndChange>
                <Rank>#{index + 1}</Rank>
                <RankChangeIndicator rankChange={song.rankChange} />
                <RankChangeValue value={song.rankChange}>
                  {song.rankChange !== 0 ? Math.abs(song.rankChange) : ""}
                </RankChangeValue>
              </RankAndChange>
              <SongDetails>
                <strong>{song.title}</strong>
                <SongMeta>Artist: {song.artist}</SongMeta>
                <SongMeta>Plays: {song.play_count}</SongMeta>
              </SongDetails>
              <PlayPauseButton
                isPlaying={currentSongId === song.id && !audioRef.current.paused}
                onClick={() => {
                  togglePlayPause(song.id);
                }}
              />
            </SongItem>
          ))}
        </SongList>
        <PlayerControls>
          <CurrentSongInfo>
            {currentSongId && (
              <>
                <strong>
                  {songs.find((song) => song.id === currentSongId)?.title}
                </strong>
                <span>
                  {songs.find((song) => song.id === currentSongId)?.artist}
                </span>
              </>
            )}
          </CurrentSongInfo>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Button onClick={toggle}>
              {audioRef.current.paused ? (
                <FaPlay size="20px" />
              ) : (
                <FaPause size="20px" />
              )}
            </Button>
            <TimeDisplay>
              <span>{formatTime(currentTime)}</span>
              <ProgressBarContainer>
                <ProgressBar
                  type="range"
                  min="0"
                  max="100"
                  value={(currentTime / duration) * 100 || 0}
                  buffered={bufferingProgress || 0} // 버퍼링 진행률을 prop으로 전달
                  onChange={handleProgressChange}
                />
              </ProgressBarContainer>
              <span>{formatTime(duration)}</span>
            </TimeDisplay>
            <VolumeControl>
              <StyledVolumeButton onClick={toggleMute}>
                {isMuted ? (
                  <FaVolumeMute size="20px" />
                ) : (
                  <FaVolumeUp size="20px" />
                )}
              </StyledVolumeButton>
              <VolumeBar
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                disabled={isMuted}
              />
            </VolumeControl>
          </div>
        </PlayerControls>
      </PlayerContainer>
    );
  };
  export default MusicPlayer;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Sliders, PhoneOff, Volume2, Minus, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import UserAvatar from './ui/UserAvatar';

export default function VoiceChat({
  roomId,
  currentUser,
  players = [],
  onVoicePeersChange,
}) {
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activePeers, setActivePeers] = useState([]);

  // Volumes (0.0 = 0%, 1.0 = 100%, 2.0 = 200%)
  const [micVolume, setMicVolume] = useState(1.0);
  const [playerVolumes, setPlayerVolumes] = useState({});

  // Web Audio Context & Gain Nodes for real volume control
  const audioCtxRef = useRef(null);
  const micGainNodeRef = useRef(null);
  const playerGainNodesRef = useRef({}); // { [userId]: GainNode }
  const rawMicStreamRef = useRef(null);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // { [userId]: RTCPeerConnection }
  const iceCandidatesQueue = useRef({}); // { [userId]: RTCIceCandidateInit[] }
  const audioElements = useRef({}); // { [userId]: HTMLAudioElement }
  const channelRef = useRef(null);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  const userId = currentUser?.id || currentUser?.userId;

  // Notify parent of active voice peers
  useEffect(() => {
    if (onVoicePeersChange) {
      const peers = new Set(activePeers);
      if (isInVoice && userId) {
        peers.add(String(userId));
      }
      onVoicePeersChange(peers);
    }
  }, [isInVoice, activePeers, userId, onVoicePeersChange]);

  // Process queued ICE candidates
  const processIceQueue = useCallback(async (senderId) => {
    const sSenderId = String(senderId);
    const pc = peerConnections.current[sSenderId];
    const queue = iceCandidatesQueue.current[sSenderId] || [];
    if (pc && pc.remoteDescription) {
      while (queue.length > 0) {
        const candidate = queue.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn('[VoiceChat] Error draining queued ICE candidate:', e);
        }
      }
    }
  }, []);

  const closePeer = useCallback((peerId) => {
    const sPeerId = String(peerId);
    if (peerConnections.current[sPeerId]) {
      peerConnections.current[sPeerId].close();
      delete peerConnections.current[sPeerId];
    }
    if (audioElements.current[sPeerId]) {
      audioElements.current[sPeerId].pause();
      audioElements.current[sPeerId].remove();
      delete audioElements.current[sPeerId];
    }
    if (playerGainNodesRef.current[sPeerId]) {
      try {
        playerGainNodesRef.current[sPeerId].disconnect();
      } catch (_) {}
      delete playerGainNodesRef.current[sPeerId];
    }
    delete iceCandidatesQueue.current[sPeerId];
    setActivePeers((prev) => prev.filter((id) => String(id) !== sPeerId));
  }, []);

  // 1. Create Peer Connection & Route Audio Through Web Audio Gain Nodes
  const createPeerConnection = useCallback((targetUserId, isInitiator) => {
    const sTargetId = String(targetUserId);
    if (peerConnections.current[sTargetId]) return peerConnections.current[sTargetId];

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.current[sTargetId] = pc;
    iceCandidatesQueue.current[sTargetId] = [];

    // Add Processed Mic Stream Tracks
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Direct DOM Audio Tag Mounting + Web Audio GainNode routing for Volume Control
    pc.ontrack = (event) => {
      const incomingStream = event.streams[0];

      // 1. HTML Audio Tag for mobile autoplay & speaker activation
      let audio = audioElements.current[sTargetId];
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = `audio-peer-${sTargetId}`;
        audio.autoplay = true;
        audio.playsInline = true;
        document.body.appendChild(audio);
        audioElements.current[sTargetId] = audio;
      }
      audio.srcObject = incomingStream;

      // 2. Web Audio GainNode Routing for Working Volume Control
      if (audioCtxRef.current) {
        try {
          if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          }

          if (playerGainNodesRef.current[sTargetId]) {
            playerGainNodesRef.current[sTargetId].disconnect();
          }

          const remoteSource = audioCtxRef.current.createMediaStreamSource(incomingStream);
          const playerGain = audioCtxRef.current.createGain();
          const initialVol = playerVolumes[sTargetId] ?? 1.0;
          playerGain.gain.value = initialVol;

          remoteSource.connect(playerGain);
          playerGain.connect(audioCtxRef.current.destination);

          playerGainNodesRef.current[sTargetId] = playerGain;
        } catch (e) {
          console.warn('[VoiceChat] GainNode connection warning:', e);
        }
      }

      audio.play().catch((err) => console.warn('[VoiceChat] Audio play retry:', err));
      setActivePeers((prev) => [...new Set([...prev, sTargetId])]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current && userId) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'voice-signal',
          payload: {
            type: 'ice-candidate',
            senderId: userId,
            targetId: sTargetId,
            signalData: event.candidate,
          },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed' ||
        pc.connectionState === 'closed'
      ) {
        closePeer(sTargetId);
      }
    };

    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (channelRef.current && userId) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'voice-signal',
              payload: {
                type: 'offer',
                senderId: userId,
                targetId: sTargetId,
                signalData: pc.localDescription,
              },
            });
          }
        })
        .catch((err) => console.error('[VoiceChat] Offer error:', err));
    }

    return pc;
  }, [closePeer, playerVolumes, userId]);

  // 2. Signal Handler
  const handleIncomingSignal = useCallback(async (payload) => {
    if (!payload || !userId) return;
    const { type, senderId, targetId, signalData } = payload;
    const sSenderId = String(senderId);
    if (!senderId || sSenderId === String(userId)) return;

    try {
      if (type === 'user-joined') {
        createPeerConnection(sSenderId, true);
      } else if (String(targetId) === String(userId)) {
        if (type === 'offer') {
          const pc = createPeerConnection(sSenderId, false);
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          await processIceQueue(sSenderId);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          channelRef.current?.send({
            type: 'broadcast',
            event: 'voice-signal',
            payload: {
              type: 'answer',
              senderId: userId,
              targetId: sSenderId,
              signalData: answer,
            },
          });
        } else if (type === 'answer') {
          const pc = peerConnections.current[sSenderId];
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(signalData));
            await processIceQueue(sSenderId);
          }
        } else if (type === 'ice-candidate') {
          const pc = peerConnections.current[sSenderId];
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(signalData));
            } catch (e) {
              console.warn('[VoiceChat] Candidate add error:', e);
            }
          } else {
            if (!iceCandidatesQueue.current[sSenderId]) iceCandidatesQueue.current[sSenderId] = [];
            iceCandidatesQueue.current[sSenderId].push(signalData);
          }
        }
      } else if (type === 'user-left') {
        closePeer(sSenderId);
      }
    } catch (err) {
      console.error('[VoiceChat] Signal error:', err);
    }
  }, [createPeerConnection, processIceQueue, closePeer, userId]);

  // 3. Join Voice with AudioContext Setup
  async function joinVoice() {
    if (!roomId || !userId) {
      alert('يرجى التأكد من الانضمام للغرفة أولاً.');
      return;
    }

    try {
      // Initialize AudioContext on user interaction
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      // Get raw mic input
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      rawMicStreamRef.current = rawStream;

      // Connect mic stream through GainNode for adjustable volume
      const source = ctx.createMediaStreamSource(rawStream);
      const micGain = ctx.createGain();
      micGain.gain.value = micVolume;
      micGainNodeRef.current = micGain;

      const destination = ctx.createMediaStreamDestination();
      source.connect(micGain);
      micGain.connect(destination);

      localStreamRef.current = destination.stream;
      setIsInVoice(true);
      setIsMuted(false);

      const channel = supabase.channel(`voice_${roomId}`);
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'voice-signal' }, ({ payload }) => {
          handleIncomingSignal(payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.send({
              type: 'broadcast',
              event: 'voice-signal',
              payload: { type: 'user-joined', senderId: userId },
            });
          }
        });
    } catch (err) {
      console.error('[VoiceChat] Mic Error:', err);
      alert('يرجى السماح بالوصول للميكروفون لاستخدام المحادثة الصوتية.');
      setIsInVoice(false);
    }
  }

  // 4. Working Local Mic Volume Control (+ / -)
  function adjustMicVolume(delta) {
    const newVol = Math.min(2.0, Math.max(0.0, parseFloat((micVolume + delta).toFixed(1))));
    setMicVolume(newVol);

    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = isMuted ? 0 : newVol;
    }
  }

  // 5. Working Remote Player Volume Control (+ / -)
  function adjustPlayerVolume(targetId, delta) {
    const sTargetId = String(targetId);
    const currentVol = playerVolumes[sTargetId] ?? 1.0;
    const newVol = Math.min(2.0, Math.max(0.0, parseFloat((currentVol + delta).toFixed(1))));

    setPlayerVolumes((prev) => ({ ...prev, [sTargetId]: newVol }));

    // Apply volume via GainNode
    if (playerGainNodesRef.current[sTargetId]) {
      playerGainNodesRef.current[sTargetId].gain.value = newVol;
    }
    // Fallback on HTML Audio Element
    if (audioElements.current[sTargetId]) {
      audioElements.current[sTargetId].volume = Math.min(1.0, newVol);
    }
  }

  function toggleMute() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (rawMicStreamRef.current) {
      const audioTrack = rawMicStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !nextMuted;
      }
    }
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = nextMuted ? 0 : micVolume;
    }
  }

  const leaveVoice = useCallback(() => {
    if (channelRef.current && userId) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'voice-signal',
          payload: { type: 'user-left', senderId: userId },
        });
      } catch (_) { }
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (rawMicStreamRef.current) {
      rawMicStreamRef.current.getTracks().forEach((track) => track.stop());
      rawMicStreamRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    Object.keys(peerConnections.current).forEach((id) => closePeer(id));
    setActivePeers([]);
    setIsInVoice(false);
    setShowSettings(false);
  }, [closePeer, userId]);

  useEffect(() => {
    return () => leaveVoice();
  }, [leaveVoice]);

  const otherPlayers = players.filter((p) => {
    const pId = p.user_id || p.userId || p.id;
    return pId && String(pId) !== String(userId);
  });

  return (
    <div className="relative inline-flex items-center">
      {/* Control Buttons in Header */}
      {!isInVoice ? (
        <button
          onClick={joinVoice}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 hover:border-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          title="Connect Voice Comms"
        >
          <Mic className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden sm:inline">Comms Online</span>
        </button>
      ) : (
        <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-950 border border-zinc-800 px-1.5 sm:px-2 py-1 rounded-lg">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`px-2 py-1 rounded-md text-xs font-mono transition flex items-center gap-1 cursor-pointer ${
              isMuted
                ? 'bg-red-950/60 text-red-400 border border-red-900/60'
                : 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicOff className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Live'}</span>
          </button>

          {/* Volume Settings Toggle Button */}
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className={`px-2 py-1 rounded-md text-xs font-mono transition flex items-center gap-1 cursor-pointer ${
              showSettings
                ? 'bg-red-600 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
            title="Audio Levels"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Mixer</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={leaveVoice}
            className="bg-zinc-900 hover:bg-zinc-850 text-red-400 hover:text-red-300 border border-zinc-800 hover:border-red-900/60 px-2 py-1 rounded-md text-xs transition cursor-pointer"
            title="Disconnect Comms"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Volume Controls Popover */}
      {isInVoice && showSettings && (
        <div className="fixed sm:absolute top-16 sm:top-full start-2 sm:start-0 sm:mt-2 z-50 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-3.5 space-y-3 select-none text-left">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-mono font-semibold text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-red-500" />
              <span>Voice Comms Mixer</span>
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-zinc-500 hover:text-zinc-100 text-xs p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer border border-zinc-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Local Mic Volume */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-lg space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-red-500" />
                <span>My Transceiver:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => adjustMicVolume(-0.1)}
                  className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 rounded text-xs transition flex items-center justify-center cursor-pointer border border-zinc-700"
                  title="Lower mic input"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-mono font-semibold text-zinc-100 w-10 text-center">
                  {Math.round(micVolume * 100)}%
                </span>
                <button
                  onClick={() => adjustMicVolume(0.1)}
                  className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 rounded text-xs transition flex items-center justify-center cursor-pointer border border-zinc-700"
                  title="Boost mic input"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Remote Players Volume List */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-zinc-500" />
                <span>Operative Channels:</span>
              </span>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {otherPlayers.length} online
              </span>
            </div>

            {otherPlayers.length === 0 ? (
              <div className="text-center py-3 bg-zinc-900/40 rounded-lg border border-zinc-800/60 text-xs text-zinc-500">
                No active operative frequencies in sector.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {otherPlayers.map((p) => {
                  const pId = String(p.user_id || p.userId || p.id);
                  const pName = p.player_name || p.name || p.username || 'Player';
                  const vol = playerVolumes[pId] ?? 1.0;
                  const isConnected = activePeers.includes(pId);

                  return (
                    <div
                      key={pId}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition ${
                        isConnected
                          ? 'bg-zinc-900/80 border-red-900/40'
                          : 'bg-zinc-900/30 border-zinc-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                        <UserAvatar
                          username={pName}
                          avatarUrl={p.avatar_url}
                          size="xs"
                          showBadge={false}
                        />
                        <span className="font-sans font-medium text-zinc-200 truncate" title={pName}>
                          {pName}
                        </span>
                        {isConnected && (
                          <Mic className="w-3 h-3 text-red-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => adjustPlayerVolume(pId, -0.1)}
                          className="w-5 h-5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded text-xs transition flex items-center justify-center cursor-pointer"
                          title="Lower output"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-[11px] font-mono font-medium text-zinc-200 w-8 text-center">
                          {Math.round(vol * 100)}%
                        </span>
                        <button
                          onClick={() => adjustPlayerVolume(pId, 0.1)}
                          className="w-5 h-5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded text-xs transition flex items-center justify-center cursor-pointer"
                          title="Raise output"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

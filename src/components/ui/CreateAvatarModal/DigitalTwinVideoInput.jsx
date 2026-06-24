import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Mic,
  Smile,
  Square,
  Upload,
  Video,
} from 'lucide-react';
import { buildScriptParagraphs, buildFullScriptText } from './digitalTwinScript';
import { downloadDigitalTwinScriptPdf } from './digitalTwinScriptPdf';

const MIN_RECOMMENDED_SECONDS = 120;
const MAX_RECORD_SECONDS = 300;

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function DigitalTwinVideoInput({ speakerName = '', previewUrl, onVideoReady, onClear }) {
  const [inputMode, setInputMode] = useState('upload');
  const [expandedGuide, setExpandedGuide] = useState(false);
  const [scriptActionFeedback, setScriptActionFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [scriptIndex, setScriptIndex] = useState(0);

  const videoPreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const paragraphs = useMemo(() => buildScriptParagraphs(speakerName), [speakerName]);
  const currentScript = paragraphs[scriptIndex] ?? paragraphs[0];
  const hasVideo = Boolean(previewUrl);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    if (inputMode !== 'record' || hasVideo) {
      stopCamera();
    }
  }, [inputMode, hasVideo, stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.muted = true;
        await videoPreviewRef.current.play();
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setCameraError('Could not access camera or microphone. Check browser permissions.');
    }
  }, []);

  useEffect(() => {
    if (inputMode === 'record' && !hasVideo && !isRecording) {
      startCamera();
    }
  }, [inputMode, hasVideo, isRecording, startCamera]);

  const handleStartRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
    }
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const fileName = `digital-twin-${Date.now()}.webm`;
      const file = new File([blob], fileName, { type: mimeType });
      const url = URL.createObjectURL(blob);
      onVideoReady?.({ file, previewUrl: url });
      stopCamera();
      setRecordingTime(0);
    };

    recorder.start(1000);
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const next = prev + 1;
        if (next >= MAX_RECORD_SECONDS) {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsRecording(false);
        }
        return next;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please choose a video file.');
      return;
    }
    onVideoReady?.({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleClear = (event) => {
    event?.stopPropagation?.();
    stopCamera();
    setRecordingTime(0);
    onClear?.();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fullScript = useMemo(() => buildFullScriptText(speakerName), [speakerName]);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(fullScript);
      setScriptActionFeedback('Copied');
      setTimeout(() => setScriptActionFeedback(''), 2000);
    } catch {
      setScriptActionFeedback('Copy failed');
    }
  };

  const handleDownloadScriptPdf = async () => {
    try {
      await downloadDigitalTwinScriptPdf(speakerName);
      setScriptActionFeedback('PDF downloaded');
      setTimeout(() => setScriptActionFeedback(''), 2000);
    } catch (error) {
      console.error('PDF download failed:', error);
      setScriptActionFeedback('PDF failed');
    }
  };

  return (
    <div className="digital-twin-video-input">
      <div className="digital-twin-video-input__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === 'upload'}
          className={`digital-twin-video-input__tab ${inputMode === 'upload' ? 'active' : ''}`}
          onClick={() => setInputMode('upload')}
        >
          <Upload size={16} />
          Upload video
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === 'record'}
          className={`digital-twin-video-input__tab ${inputMode === 'record' ? 'active' : ''}`}
          onClick={() => setInputMode('record')}
        >
          <Video size={16} />
          Record yourself
        </button>
      </div>

      {inputMode === 'record' ? (
        <div className="digital-twin-video-input__record-layout">
          <div className="digital-twin-video-input__camera">
            {hasVideo ? (
              <div className="digital-twin-video-input__playback">
                <video src={previewUrl} className="digital-twin-video-input__video" controls playsInline />
                <button type="button" className="digital-twin-video-input__retake" onClick={handleClear}>
                  Record again
                </button>
              </div>
            ) : (
              <>
                <video ref={videoPreviewRef} className="digital-twin-video-input__video" playsInline muted />
                {cameraError ? <p className="digital-twin-video-input__error">{cameraError}</p> : null}
                <div className="digital-twin-video-input__record-bar">
                  <span className={`digital-twin-video-input__timer ${isRecording ? 'recording' : ''}`}>
                    {formatTime(recordingTime)}
                    {recordingTime > 0 && recordingTime < MIN_RECOMMENDED_SECONDS
                      ? ` · aim for ${formatTime(MIN_RECOMMENDED_SECONDS)}+`
                      : ''}
                  </span>
                  {isRecording ? (
                    <button type="button" className="digital-twin-video-input__stop" onClick={handleStopRecording}>
                      <Square size={14} fill="currentColor" />
                      Stop
                    </button>
                  ) : (
                    <button type="button" className="digital-twin-video-input__start" onClick={handleStartRecording}>
                      <span className="digital-twin-video-input__rec-dot" />
                      Start recording
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <aside className="digital-twin-video-input__prompter">
            <div className="digital-twin-video-input__prompter-head">
              <span>Script</span>
              <div className="digital-twin-video-input__prompter-actions">
                <button
                  type="button"
                  disabled={scriptIndex <= 0}
                  onClick={() => setScriptIndex((i) => Math.max(0, i - 1))}
                >
                  Prev
                </button>
                <span>
                  {scriptIndex + 1}/{paragraphs.length}
                </span>
                <button
                  type="button"
                  disabled={scriptIndex >= paragraphs.length - 1}
                  onClick={() => setScriptIndex((i) => Math.min(paragraphs.length - 1, i + 1))}
                >
                  Next
                </button>
              </div>
            </div>
            <p className="digital-twin-video-input__prompter-direction">{currentScript?.direction}</p>
            <p className="digital-twin-video-input__prompter-text">{currentScript?.text}</p>
            <div className="digital-twin-video-input__script-actions">
              <button type="button" className="digital-twin-video-input__script-btn" onClick={handleCopyScript}>
                <Copy size={12} />
                Copy script
              </button>
              <button type="button" className="digital-twin-video-input__script-btn" onClick={handleDownloadScriptPdf}>
                <Download size={12} />
                Download PDF
              </button>
            </div>
            {scriptActionFeedback && inputMode === 'record' ? (
              <span className="digital-twin-video-input__script-feedback">{scriptActionFeedback}</span>
            ) : null}
          </aside>
        </div>
      ) : (
        <>
          <div
            className={`digital-twin-video-input__upload ${hasVideo ? 'has-preview' : ''}`}
            onClick={() => !hasVideo && fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (!hasVideo && (event.key === 'Enter' || event.key === ' ')) fileInputRef.current?.click();
            }}
            role="button"
            tabIndex={0}
          >
            {hasVideo ? (
              <div className="digital-twin-video-input__playback">
                <video src={previewUrl} className="digital-twin-video-input__video" controls playsInline />
                <button type="button" className="digital-twin-video-input__retake" onClick={handleClear}>
                  Choose different file
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} />
                <strong>Click to upload training video</strong>
                <span>2–5 min · .mp4, .mov, or .webm · max 900 MB</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={handleFileChange}
            />
          </div>

          <div className="digital-twin-video-input__upload-script">
            <p className="digital-twin-video-input__upload-script-copy">
              Recording your own footage? Use our script for what to say, how to speak, and expressions.
            </p>
            <button
              type="button"
              className="digital-twin-video-input__script-btn digital-twin-video-input__script-btn--pdf"
              onClick={handleDownloadScriptPdf}
            >
              <Download size={14} />
              Download script (PDF)
            </button>
            {scriptActionFeedback && inputMode === 'upload' ? (
              <span className="digital-twin-video-input__script-feedback">{scriptActionFeedback}</span>
            ) : null}
          </div>
        </>
      )}

      <button
        type="button"
        className="digital-twin-video-input__guide-toggle"
        onClick={() => setExpandedGuide((prev) => !prev)}
        aria-expanded={expandedGuide}
      >
        <span>
          <Mic size={14} />
          Tips: how to speak & expressions
        </span>
        {expandedGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedGuide ? (
        <ul className="digital-twin-video-input__tips">
          <li>
            <CheckCircle2 size={12} />
            Natural pace, pause between sentences, vary warm and professional tone.
          </li>
          <li>
            <Smile size={12} />
            Face the camera, smile then neutral, minimal head movement, natural blinks.
          </li>
        </ul>
      ) : null}
    </div>
  );
}

export default DigitalTwinVideoInput;

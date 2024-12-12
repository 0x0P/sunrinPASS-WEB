"use client";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./qr.module.css";

export default function Home() {
  interface QrResult {
    isValid: boolean;
    status: string;
  }

  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QrResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status", {
        credentials: "include",
      });
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      if (!data.isTeacher) {
        router.push("/");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch {
      setError("카메라를 찾을 수 없습니다.");
    }
  };

  const startQrScanner = async () => {
    try {
      if (!selectedDevice) return;

      const codeReader = new BrowserQRCodeReader();
      const videoElement = videoRef.current;

      if (!videoElement) {
        setError("비디오 요소를 찾을 수 없습니다.");
        return;
      }

      const result = await codeReader.decodeOnceFromVideoDevice(
        selectedDevice,
        videoElement
      );
      handleQrCode(result.getText());
    } catch (err) {
      setError("QR 코드 스캔 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  const handleQrCode = async (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);
      const response = await fetch("http://localhost:3000/api/passes/verify", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parsed.id,
          hash: parsed.hash,
        }),
      });

      if (!response.ok) {
        setError("유효하지 않은 QR 코드입니다.");
        return;
      }

      const data = await response.json();
      setResult(data);
      setShowResult(true);
      setError(null);
    } catch (err) {
      setError("QR 코드 처리 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    getDevices();
  }, []);

  useEffect(() => {
    if (!loading && !showResult && selectedDevice) {
      startQrScanner();
    }
  }, [loading, showResult, selectedDevice]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (showResult && result) {
    console.log(result.isValid);
    if (result.isValid) {
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>승인되었습니다.</h1>
          <button
            onClick={() => {
              setShowResult(false);
              setResult(null);
              startQrScanner();
            }}
            className={styles.button}>
            다시 스캔하기
          </button>
        </div>
      </div>;
    }

    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>결과</h1>
          <div className={styles.result}>
            <p>Status: {result.status}</p>
            <p>isValid: {`${result.isValid}`}</p>
          </div>
          <button
            onClick={() => {
              setShowResult(false);
              setResult(null);
              startQrScanner();
            }}
            className={styles.button}>
            다시 스캔하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>QR 찍기</h1>
        <h2 className={styles.subText}>QR 코드를 찍어주세요</h2>
        {devices.length > 0 && (
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className={styles.select}>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        )}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>
    </div>
  );
}

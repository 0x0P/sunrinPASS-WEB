"use client";
import Image from "next/image";
import styles from "../../pass.module.css";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface PassData {
  id: string;
  type: "EARLY_LEAVE" | "OUTING";
  startTime: string;
  returnTime?: string;
  expiresAt: string;
  status: string;
  student: {
    firstName: string;
    lastName: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  qrCode: string;
}

export default function PassPage() {
  const params = useParams();
  const [passData, setPassData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    const fetchPassData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/passes/${params.id}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pass data");
        }
        const data = await response.json();
        setPassData(data);
        if (data) {
          console.log(data);
          if (data.status === "REJECTED") {
            setStatus("승인 거절됨");
          } else if (data.status === "APPROVED") {
            setStatus("승인됨");
          } else if (data.status === "PENDING") {
            setStatus("승인 대기중");
          } else {
            setStatus("유효하지 않음 / 만료됨");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchPassData();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !passData) {
    return <div>Error: {error}</div>;
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.pass}>
        <div className={styles.top}>
          <h1 className={styles.title}>
            {passData.type === "EARLY_LEAVE" ? "조퇴증" : "외출증"}
          </h1>
          <p className={styles.name}>
            {passData.student.lastName}
            {passData.student.firstName}
          </p>
          <p className={styles.description}>
            {passData.type === "EARLY_LEAVE" ? "조퇴시간" : "외출시간"}
          </p>
          <p className={styles.bold}>{formatDateTime(passData.startTime)}</p>
          <p className={styles.description}>만료시간</p>
          <p className={styles.bold}>{formatDateTime(passData.expiresAt)}</p>
        </div>
        <div className={styles.qr}>
          {passData.qrCode && (
            <Image
              className={passData.status === "EXPIRED" ? styles.qrEx : ""}
              width={120}
              height={120}
              src={passData.qrCode}
              alt="QR Code"
            />
          )}
          <h1>선린인터넷고등학교</h1>
        </div>

        <div className={styles.bottom}>
          <div className={styles.teacher}>
            <h2 className={styles.sign}>교사 승인</h2>
            <h2 className={styles.teacherName}>
              {passData.teacher.lastName}
              {passData.teacher.firstName}
            </h2>
            <h2 className={`${styles.status} ${styles[passData.status]}`}>
              {status}
            </h2>
          </div>
          <div className={styles.logo}>
            <Image src="/sunrin.png" width={50} height={50} alt="logo" />
          </div>
        </div>
      </div>
    </div>
  );
}

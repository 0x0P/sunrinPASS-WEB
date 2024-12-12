"use client";
import { useEffect, useState } from "react";
import styles from "./passes.module.css";
import Image from "next/image";

interface Pass {
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

export default function PassesPage() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/passes/my-passes",
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch passes");
        }
        const data = await response.json();
        setPasses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchPasses();
  }, []);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      {passes.map((passData: Pass) => (
        <div key={passData.id} className={styles.passContainer}>
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
              <p className={styles.bold}>
                {formatDateTime(passData.startTime)}
              </p>
              <p className={styles.description}>만료시간</p>
              <p className={styles.bold}>
                {formatDateTime(passData.expiresAt)}
              </p>
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
                  {(passData.status === "PENDING" && "대기중") ||
                    (passData.status === "APPROVED" && "승인됨") ||
                    (passData.status === "EXPIRED" && "만료됨")}
                </h2>
              </div>
              <div className={styles.logo}>
                <Image src="/sunrin.png" width={50} height={50} alt="logo" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
